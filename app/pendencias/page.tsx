"use client"

import { useState, useEffect, useMemo } from "react"
import { PlusCircle, Search, Trash2, AlertCircle, Clock, CheckCircle2, CheckSquare } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/lib/store"
import { supabase, type Pendencia, type Author } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useAudioFeedback } from "@/hooks/use-audio-feedback"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

function PendenciaForm({
  pendencia,
  autores,
  onSave,
  onCancel,
  isLoading,
  isLoadingAuthors,
}: {
  pendencia: Partial<Omit<Pendencia, "id" | "status">>
  autores: Author[]
  onSave: (pendencia: Partial<Pendencia>) => void
  onCancel: () => void
  isLoading: boolean
  isLoadingAuthors: boolean
}) {
  const [formData, setFormData] = useState(pendencia)

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{(formData as Pendencia).id ? "Editar Pendência" : "Adicionar Nova Pendência"}</DialogTitle>
        <DialogDescription>Preencha os dados da tarefa abaixo.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            value={formData.titulo || ""}
            onChange={(e) => handleChange("titulo", e.target.value)}
            placeholder="O que precisa ser feito?"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao || ""}
            onChange={(e) => handleChange("descricao", e.target.value)}
            placeholder="Adicione mais detalhes..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="author">Autor</Label>
            <Select value={formData.author || ""} onValueChange={(value) => handleChange("author", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um autor" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingAuthors ? (
                  <SelectItem value="loading" disabled>
                    A carregar...
                  </SelectItem>
                ) : autores.length > 0 ? (
                  autores.map((autor) => (
                    <SelectItem key={autor.id} value={autor.name}>
                      {autor.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Nenhum autor
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="urgencia">Urgência</Label>
            <Select
              value={formData.urgente ? "sim" : "nao"}
              onValueChange={(value) => handleChange("urgente", value === "sim")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao">Normal</SelectItem>
                <SelectItem value="sim">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(formData)} disabled={isLoading}>
          {isLoading ? "A guardar..." : "Guardar"}
        </Button>
      </DialogFooter>
    </>
  )
}

export default function PendenciasPage() {
  const {
    pendencias = [],
    setPendencias,
    addPendencia,
    updatePendenciaStatus,
    deletePendencia,
    subscribeToPendencias,
    autores = [],
    fetchAutores,
    subscribeToAutores,
  } = useAppStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [pendenciaEmEdicao, setPendenciaEmEdicao] = useState<Partial<Pendencia> | null>(null)
  const [pendenciaParaRemover, setPendenciaParaRemover] = useState<Pendencia | null>(null)

  const { toast } = useToast()
  const { playSuccessSound } = useAudioFeedback()

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("pendencias").select("*").order("data", { ascending: false })
        if (error) throw error
        setPendencias(data || [])
      } catch (error) {
        toast({ title: "Erro ao carregar pendências", description: (error as Error).message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    const fetchAuthorsData = async () => {
      setIsLoadingAuthors(true)
      try {
        await fetchAutores()
      } catch (error) {
        toast({ title: "Erro ao buscar autores", description: (error as Error).message, variant: "destructive" })
      } finally {
        setIsLoadingAuthors(false)
      }
    }

    fetchInitialData()
    fetchAuthorsData()

    const unsubscribePendencias = subscribeToPendencias()
    const unsubscribeAutores = subscribeToAutores()

    return () => {
      if (typeof unsubscribePendencias === "function") unsubscribePendencias()
      if (typeof unsubscribeAutores === "function") unsubscribeAutores()
    }
  }, [setPendencias, subscribeToPendencias, fetchAutores, subscribeToAutores, toast])

  const handleAbrirForm = (pendencia?: Pendencia) => {
    setPendenciaEmEdicao(pendencia || { titulo: "", descricao: "", urgente: false, author: "" })
    setShowFormDialog(true)
  }

  const handleSalvarPendencia = async (formData: Partial<Pendencia>) => {
    if (!formData.titulo) {
      toast({ title: "Campo obrigatório", description: "O Título da pendência é obrigatório.", variant: "destructive" })
      return
    }

    setProcessingId(formData.id || -1)
    try {
      const pendenciaData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        urgente: formData.urgente,
        author: formData.author,
      }

      if (formData.id) {
        await updatePendenciaStatus(formData.id, formData.status || "nao-concluido")
        toast({ title: "Pendência atualizada" })
      } else {
        await addPendencia(pendenciaData as Omit<Pendencia, "id" | "status">)
        toast({ title: "Pendência adicionada" })
      }

      // Play success sound after successful save
      playSuccessSound()

      setShowFormDialog(false)
    } catch (error: any) {
      toast({ title: "Erro ao guardar", description: error.message, variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleConfirmarRemocao = async () => {
    if (!pendenciaParaRemover) return

    setProcessingId(pendenciaParaRemover.id)
    try {
      await deletePendencia(pendenciaParaRemover.id)
      toast({ title: "Pendência removida" })
    } catch (error: any) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" })
    } finally {
      setProcessingId(null)
      setPendenciaParaRemover(null)
    }
  }

  const filteredPendencias = useMemo(
    () =>
      pendencias
        .filter(
          (p) =>
            (p.titulo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (p.descricao?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
        )
        .sort((a, b) =>
          a.urgente === b.urgente ? new Date(b.data).getTime() - new Date(a.data).getTime() : a.urgente ? -1 : 1,
        ),
    [pendencias, searchTerm],
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pendências</h1>
          <p className="text-muted-foreground">Acompanhe e gerencie as tarefas do dia.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => handleAbrirForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Pendência
          </Button>
        </div>
      </div>

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent>
          {pendenciaEmEdicao && (
            <PendenciaForm
              pendencia={pendenciaEmEdicao}
              autores={autores}
              onSave={handleSalvarPendencia}
              onCancel={() => setShowFormDialog(false)}
              isLoading={processingId !== null}
              isLoadingAuthors={isLoadingAuthors}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendenciaParaRemover} onOpenChange={(open) => !open && setPendenciaParaRemover(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a pendência "{pendenciaParaRemover?.titulo}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={handleConfirmarRemocao}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead>Título</TableHead>
                {/* COLUNA ADICIONADA AQUI */}
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="hidden md:table-cell">Autor</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="text-right w-[50px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredPendencias.length > 0 ? (
                filteredPendencias.map((pendencia) => (
                  <TableRow key={pendencia.id} className={pendencia.urgente ? "bg-destructive/10" : ""}>
                    <TableCell>
                      <Select
                        value={pendencia.status}
                        onValueChange={(value) => updatePendenciaStatus(pendencia.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nao-concluido">
                            <div className="flex items-center gap-2">
                              <CheckSquare />
                              Não concluído
                            </div>
                          </SelectItem>
                          <SelectItem value="em-andamento">
                            <div className="flex items-center gap-2">
                              <Clock />
                              Em andamento
                            </div>
                          </SelectItem>
                          <SelectItem value="concluido">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 />
                              Concluído
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-medium">{pendencia.titulo}</TableCell>
                    {/* CÉLULA ADICIONADA AQUI */}
                    <TableCell className="hidden md:table-cell text-muted-foreground">{pendencia.descricao}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {pendencia.author || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {new Date(pendencia.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setPendenciaParaRemover(pendencia)}
                        disabled={!!processingId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Nenhuma pendência encontrada.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
