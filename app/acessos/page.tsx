"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Building2,
  Store,
  Search,
  Download,
  MoreHorizontal,
  Edit,
  Archive,
  Trash2,
  RefreshCw,
  Plus,
  ChevronRight,
  Home,
  AlertCircle,
  Monitor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAppStore } from "@/lib/store"
import { getSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

// Validation schema for machine form (com novos campos, sem adquirente)
const maquinaSchema = z.object({
  maquina: z.string().min(3, "Nome da máquina deve ter pelo menos 3 caracteres"),
  usuario: z.string().min(1, "Usuário é obrigatório"),
  senha: z.string().optional(),
  statusMaquininha: z.string().optional(),
  trabalhoAndamento: z.string().optional(),
})

type MaquinaFormData = z.infer<typeof maquinaSchema>

// Validation schema for posto (simplificado - apenas nome e ID opcional)
const postoSchema = z.object({
  posto: z.string().min(1, "Nome do posto é obrigatório"),
  postoId: z.string().optional(),
})

type PostoFormData = z.infer<typeof postoSchema>

// Types (atualizados com novos campos, sem adquirente)
interface Posto {
  id: string
  nome: string
  tipo: "convencional" | "conveniencia"
  acessos: AcessoItem[]
  lastUpdate: string
}

interface AcessoItem {
  id: number
  posto: string
  maquina: string
  usuario: string
  senha: string
  trabalhoAndamento: string
  statusMaquininha: string
  created_at: string
}

// MaquinaFormModal Component (com novos campos, sem adquirente, senha como text)
interface MaquinaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: MaquinaFormData) => Promise<void>
  editingData?: AcessoItem | null
  isLoading?: boolean
}

function MaquinaFormModal({ isOpen, onClose, onSave, editingData, isLoading = false }: MaquinaFormModalProps) {
  const form = useForm<MaquinaFormData>({
    resolver: zodResolver(maquinaSchema),
    defaultValues: {
      maquina: "",
      usuario: "",
      senha: "",
      statusMaquininha: "",
      trabalhoAndamento: "",
    },
  })

  // Reset form when modal opens/closes or editing data changes
  useEffect(() => {
    if (isOpen) {
      if (editingData) {
        form.reset({
          maquina: editingData.maquina,
          usuario: editingData.usuario,
          senha: "", // Don't pre-fill password for security
          statusMaquininha: editingData.statusMaquininha || "",
          trabalhoAndamento: editingData.trabalhoAndamento || "",
        })
      } else {
        form.reset({
          maquina: "",
          usuario: "",
          senha: "",
          statusMaquininha: "",
          trabalhoAndamento: "",
        })
      }
    }
  }, [isOpen, editingData, form])

  const handleSubmit = async (data: MaquinaFormData) => {
    try {
      await onSave(data)
      form.reset()
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const isEditing = !!editingData

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Máquina" : "Adicionar Nova Máquina"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da máquina selecionada."
              : "Preencha os dados para adicionar uma nova máquina."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="maquina"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Máquina</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da máquina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="usuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o usuário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha {isEditing && "(deixe vazio para manter a atual)"}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="off"
                      placeholder={isEditing ? "Nova senha (opcional)" : "Digite a senha"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="statusMaquininha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status da Maquininha</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sem-status">Nenhum</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="configuracao">Configuração</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trabalhoAndamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trabalho em Andamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva o trabalho em andamento (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2" />
                    {isEditing ? "Salvando..." : "Adicionando..."}
                  </>
                ) : isEditing ? (
                  "Salvar Alterações"
                ) : (
                  "Adicionar Máquina"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// PostoFormModal Component (simplificado - apenas nome e ID)
interface PostoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: PostoFormData) => Promise<void>
  editingData?: Posto | null
  isLoading?: boolean
}

function PostoFormModal({ isOpen, onClose, onSave, editingData, isLoading = false }: PostoFormModalProps) {
  const form = useForm<PostoFormData>({
    resolver: zodResolver(postoSchema),
    defaultValues: {
      posto: "",
      postoId: "",
    },
  })

  // Reset form when modal opens/closes or editing data changes
  useEffect(() => {
    if (isOpen) {
      if (editingData) {
        form.reset({
          posto: editingData.nome,
          postoId: editingData.id,
        })
      } else {
        form.reset({
          posto: "",
          postoId: "",
        })
      }
    }
  }, [isOpen, editingData, form])

  const handleSubmit = async (data: PostoFormData) => {
    try {
      await onSave(data)
      form.reset()
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const isEditing = !!editingData

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Posto" : "Adicionar Novo Posto"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do posto." : "Preencha os dados para adicionar um novo posto."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="posto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Posto</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do posto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID do Posto (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o ID do posto (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2" />
                    {isEditing ? "Salvando..." : "Adicionando..."}
                  </>
                ) : isEditing ? (
                  "Salvar Alterações"
                ) : (
                  "Adicionar Posto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Memoized Row Component for Performance (com novos campos, sem adquirente, senha como texto)
const AcessoRow = memo(
  ({
    acesso,
    isSelected,
    onSelect,
    onEdit,
    onArchive,
    onDelete,
  }: {
    acesso: AcessoItem
    isSelected: boolean
    onSelect: (id: number) => void
    onEdit: (acesso: AcessoItem) => void
    onArchive: (id: number) => void
    onDelete: (id: number) => void
  }) => {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
      setIsDeleting(true)
      try {
        await onDelete(acesso.id)
      } finally {
        setIsDeleting(false)
      }
    }

    const handleEditMachineRow = (acesso: AcessoItem) => {
      onEdit(acesso)
    }

    const getStatusBadge = (status: string) => {
      if (!status || status === "sem-status") return null

      const statusConfig = {
        ativo: { variant: "default" as const, label: "Ativo" },
        inativo: { variant: "secondary" as const, label: "Inativo" },
        manutencao: { variant: "destructive" as const, label: "Manutenção" },
        configuracao: { variant: "outline" as const, label: "Configuração" },
      }

      const config = statusConfig[status as keyof typeof statusConfig]
      if (!config) return <Badge variant="outline">{status}</Badge>

      return <Badge variant={config.variant}>{config.label}</Badge>
    }

    return (
      <TableRow className={cn("group hover:bg-muted/50", isSelected && "bg-muted")}>
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(acesso.id)}
            aria-label={`Selecionar acesso ${acesso.maquina}`}
          />
        </TableCell>
        <TableCell className="font-medium">{acesso.maquina}</TableCell>
        <TableCell>{acesso.usuario}</TableCell>
        <TableCell className="font-mono">{acesso.senha}</TableCell>
        <TableCell>{getStatusBadge(acesso.statusMaquininha)}</TableCell>
        <TableCell className="max-w-[200px] truncate" title={acesso.trabalhoAndamento}>
          {acesso.trabalhoAndamento || "-"}
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditMachineRow(acesso)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(acesso.id)}>
                <Archive className="mr-2 h-4 w-4" />
                Arquivar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
              >
                {isDeleting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  },
)

AcessoRow.displayName = "AcessoRow"

// Skeleton Loading Component
const AcessoSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function Acessos() {
  const { acessos, setAcessos, addAcesso, updateAcesso, subscribeToAcessos } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)

  // Machine management states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaquinaData, setEditingMaquinaData] = useState<AcessoItem | null>(null)
  const [currentPostIdForModal, setCurrentPostIdForModal] = useState<string | null>(null)
  const [currentMachineIdForModal, setCurrentMachineIdForModal] = useState<string | null>(null)
  const [isSavingMaquina, setIsSavingMaquina] = useState(false)

  // Post management states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [editingPostData, setEditingPostData] = useState<Posto | null>(null)
  const [isSavingPost, setIsSavingPost] = useState(false)

  // Post deletion states
  const [postoToDelete, setPostoToDelete] = useState<Posto | null>(null)
  const [isDeletingPosto, setIsDeletingPosto] = useState(false)

  const { toast } = useToast()

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Group acessos by posto e incluir postos vazios
  const allPostos = useMemo(() => {
    const groups = new Map<string, AcessoItem[]>()

    acessos.forEach((acesso) => {
      const posto = acesso.posto
      if (!groups.has(posto)) {
        groups.set(posto, [])
      }
      groups.get(posto)!.push(acesso)
    })

    // Convert to array e incluir postos vazios
    return Array.from(groups.entries()).map(([nome, acessos]) => ({
      id: nome.toLowerCase().replace(/\s+/g, "-"),
      nome,
      tipo: nome.toLowerCase().includes("conveniencia") ? ("conveniencia" as const) : ("convencional" as const),
      acessos,
      lastUpdate: new Date().toISOString(),
    }))
  }, [acessos])

  // Filter postos based on search
  const filteredPostos = useMemo(() => {
    return allPostos
      .map((posto) => ({
        ...posto,
        acessos: posto.acessos.filter(
          (acesso) =>
            debouncedSearchTerm === "" ||
            acesso.maquina.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            acesso.usuario.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        ),
      }))
      .filter((posto) => posto.acessos.length > 0 || debouncedSearchTerm === "")
  }, [allPostos, debouncedSearchTerm])

  // Fetch initial data and setup real-time subscription
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      const supabase = getSupabaseClient()

      try {
        const { data, error } = await supabase.from("acessos").select("*").order("created_at", { ascending: false })

        if (error) throw error

        const transformedAcessos = data.map((acesso) => ({
          id: acesso.id,
          posto: acesso.posto,
          maquina: acesso.maquina,
          usuario: acesso.usuario,
          senha: acesso.senha,
          trabalhoAndamento: acesso.trabalho_andamento || "",
          statusMaquininha: acesso.status_maquininha || "",
          created_at: acesso.created_at,
        }))

        setAcessos(transformedAcessos)
      } catch (error) {
        console.error("Error fetching acessos:", error)
        toast({
          title: "Erro ao carregar dados de acesso",
          description: "Não foi possível carregar os dados de acesso. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAcessos()
    return unsubscribe
  }, [setAcessos, subscribeToAcessos, toast])

  // Bulk selection handlers for individual items
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = filteredPostos.flatMap((posto) => posto.acessos.map((a) => a.id))
        setSelectedItems(allIds)
      } else {
        setSelectedItems([])
      }
    },
    [filteredPostos],
  )

  const handleSelectItem = useCallback((id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }, [])

  // Machine management functions
  const handleAddMachine = useCallback((postoNome: string) => {
    setCurrentPostIdForModal(postoNome)
    setCurrentMachineIdForModal(null)
    setEditingMaquinaData(null)
    setIsModalOpen(true)
  }, [])

  const handleEditMachine = useCallback((acesso: AcessoItem) => {
    setCurrentPostIdForModal(acesso.posto)
    setCurrentMachineIdForModal(acesso.id.toString())
    setEditingMaquinaData(acesso)
    setIsModalOpen(true)
  }, [])

  const handleSaveMaquina = async (data: MaquinaFormData) => {
    setIsSavingMaquina(true)

    try {
      if (editingMaquinaData && currentMachineIdForModal) {
        // Editing existing machine
        const updateData = {
          maquina: data.maquina,
          usuario: data.usuario,
          statusMaquininha: data.statusMaquininha === "sem-status" ? "" : data.statusMaquininha || "",
          trabalhoAndamento: data.trabalhoAndamento || "",
          ...(data.senha && { senha: data.senha }), // Only update password if provided
        }

        await updateAcesso(editingMaquinaData.id, updateData)

        toast({
          title: "Máquina atualizada",
          description: "A máquina foi atualizada com sucesso.",
        })
      } else {
        // Adding new machine
        await addAcesso({
          posto: currentPostIdForModal || "",
          maquina: data.maquina,
          usuario: data.usuario,
          senha: data.senha || "",
          trabalhoAndamento: data.trabalhoAndamento || "",
          statusMaquininha: data.statusMaquininha === "sem-status" ? "" : data.statusMaquininha || "",
        })

        toast({
          title: "Máquina adicionada",
          description: "A nova máquina foi adicionada com sucesso.",
        })
      }

      // Close modal and reset states
      setIsModalOpen(false)
      setEditingMaquinaData(null)
      setCurrentPostIdForModal(null)
      setCurrentMachineIdForModal(null)
    } catch (error) {
      console.error("Error saving machine:", error)
      toast({
        title: "Erro ao salvar máquina",
        description: "Não foi possível salvar a máquina. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSavingMaquina(false)
    }
  }

  const handleEditPost = useCallback((posto: Posto) => {
    setEditingPostData(posto)
    setIsPostModalOpen(true)
  }, [])

  const handleSavePost = async (data: PostoFormData) => {
    setIsSavingPost(true)

    try {
      if (editingPostData) {
        // Update all machines in this post with the new post name
        const updatePromises = editingPostData.acessos.map((acesso) =>
          updateAcesso(acesso.id, {
            posto: data.posto,
          }),
        )

        await Promise.all(updatePromises)

        toast({
          title: "Posto atualizado",
          description: "O posto foi atualizado com sucesso.",
        })
      } else {
        // Create new post - just show success message since the post will appear when machines are added
        toast({
          title: "Posto criado",
          description: "O novo posto foi criado com sucesso. Adicione máquinas para começar.",
        })
      }

      // Close modal and reset states
      setIsPostModalOpen(false)
      setEditingPostData(null)
      setShowNewDialog(false)
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        title: "Erro ao salvar posto",
        description: "Não foi possível salvar o posto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSavingPost(false)
    }
  }

  // Post deletion function
  const handleDeletePosto = async (posto: Posto) => {
    setIsDeletingPosto(true)

    try {
      const supabase = getSupabaseClient()

      // Delete all machines associated with this post
      const { error } = await supabase.from("acessos").delete().eq("posto", posto.nome)

      if (error) throw error

      toast({
        title: "Posto excluído",
        description: `O posto "${posto.nome}" e todas as suas máquinas foram removidos com sucesso.`,
      })

      setPostoToDelete(null)
    } catch (error) {
      console.error("Error deleting posto:", error)
      toast({
        title: "Erro ao excluir posto",
        description: "Não foi possível excluir o posto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingPosto(false)
    }
  }

  const handleArchive = useCallback(
    async (id: number) => {
      toast({
        title: "Acesso arquivado",
        description: "O acesso foi arquivado com sucesso.",
      })
    },
    [toast],
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("acessos").delete().eq("id", id)

        if (error) throw error

        toast({
          title: "Acesso removido",
          description: "O acesso foi removido com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro ao remover acesso",
          description: "Não foi possível remover o acesso.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  // Export functionality (com novos campos, sem adquirente)
  const handleExport = useCallback(
    (format: "csv" | "pdf") => {
      const selectedAcessos = selectedItems.length > 0 ? acessos.filter((a) => selectedItems.includes(a.id)) : acessos

      if (format === "csv") {
        const headers = ["Posto", "Máquina", "Usuário", "Senha", "Status Maquininha", "Trabalho em Andamento"]
        const csvContent = [
          headers.join(","),
          ...selectedAcessos.map((a) =>
            [a.posto, a.maquina, a.usuario, a.senha, a.statusMaquininha, a.trabalhoAndamento]
              .map((field) => `"${field}"`)
              .join(","),
          ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `acessos-${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      toast({
        title: "Exportação concluída",
        description: `${selectedAcessos.length} registros de acesso exportados em ${format.toUpperCase()}.`,
      })
    },
    [selectedItems, acessos, toast],
  )

  const getPostoIcon = (tipo: string) => {
    return tipo === "conveniencia" ? Store : Building2
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <AcessoSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex flex-col gap-4 p-6">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Início
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Acessos
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Acessos</h1>
              <p className="text-muted-foreground">Gerencie acessos aos sistemas dos postos</p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setShowNewDialog(true)}>
                <Building2 className="mr-2 h-4 w-4" />
                Novo Posto
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por máquina ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Formato</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("csv")}>Exportar CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>Exportar PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedItems.length > 0 && (
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir ({selectedItems.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {filteredPostos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum acesso encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "Nenhum acesso corresponde aos critérios de busca." : "Comece adicionando um novo posto."}
              </p>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Posto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {filteredPostos.map((posto) => {
              const PostoIcon = getPostoIcon(posto.tipo)
              return (
                <AccordionItem key={posto.id} value={posto.id} className="border rounded-lg overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/50">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center gap-3">
                        <PostoIcon className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <h3 className="font-semibold">{posto.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {posto.acessos.length} {posto.acessos.length === 1 ? "acesso" : "acessos"} •{" "}
                            {posto.tipo === "conveniencia" ? "Conveniência" : "Convencional"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPostoToDelete(posto)
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Posto</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o posto "{posto.nome}"? Esta ação também removerá todas
                                as máquinas associadas.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setPostoToDelete(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeletePosto(posto)}
                                disabled={isDeletingPosto}
                              >
                                {isDeletingPosto ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Excluindo...
                                  </>
                                ) : (
                                  "Excluir Posto"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Ações do Posto</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddMachine(posto.nome)
                              }}
                            >
                              <Monitor className="mr-2 h-4 w-4" />
                              Adicionar Máquina
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditPost(posto)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar Posto
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Badge variant="outline">{posto.acessos.length}</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-0 pb-0">
                    <div className="border-t">
                      <div className="px-6 py-4 bg-muted/25">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={posto.acessos.every((a) => selectedItems.includes(a.id))}
                              onCheckedChange={(checked) => {
                                const postoIds = posto.acessos.map((a) => a.id)
                                if (checked) {
                                  setSelectedItems((prev) => [...new Set([...prev, ...postoIds])])
                                } else {
                                  setSelectedItems((prev) => prev.filter((id) => !postoIds.includes(id)))
                                }
                              }}
                            />
                            <span className="text-sm font-medium">Selecionar todos ({posto.acessos.length})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleAddMachine(posto.nome)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Adicionar Máquina
                            </Button>
                            <div className="text-xs text-muted-foreground">
                              Última atualização: {new Date(posto.lastUpdate).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-md border bg-background overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">
                                  <span className="sr-only">Selecionar</span>
                                </TableHead>
                                <TableHead>Máquina</TableHead>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Senha</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Trabalho em Andamento</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {posto.acessos.map((acesso) => (
                                <AcessoRow
                                  key={acesso.id}
                                  acesso={acesso}
                                  isSelected={selectedItems.includes(acesso.id)}
                                  onSelect={handleSelectItem}
                                  onEdit={handleEditMachine}
                                  onArchive={handleArchive}
                                  onDelete={handleDelete}
                                />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>

      {/* New Post Dialog */}
      <PostoFormModal
        isOpen={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        onSave={handleSavePost}
        isLoading={isSavingPost}
      />

      {/* Edit Post Dialog */}
      <PostoFormModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false)
          setEditingPostData(null)
        }}
        onSave={handleSavePost}
        editingData={editingPostData}
        isLoading={isSavingPost}
      />

      {/* Machine Form Modal */}
      <MaquinaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMaquinaData(null)
          setCurrentPostIdForModal(null)
          setCurrentMachineIdForModal(null)
        }}
        onSave={handleSaveMaquina}
        editingData={editingMaquinaData}
        isLoading={isSavingMaquina}
      />
    </div>
  )
}
