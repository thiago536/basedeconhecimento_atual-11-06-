"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { PlusCircle, Search, Trash2, AlertCircle, Clock, CheckCircle2, CheckSquare, Camera, Settings2, Info } from "lucide-react"
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
import { supabase, type Pendencia, type Autor } from "@/lib/supabase"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { differenceInDays } from "date-fns"

// Screenshot function using Canvas API (no external dependency)
async function captureElementAsImage(element: HTMLElement): Promise<Blob | null> {
  try {
    // Use native browser APIs if available
    if ('ClipboardItem' in window && 'toBlob' in HTMLCanvasElement.prototype) {
      // Create a canvas and draw the element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      const rect = element.getBoundingClientRect()
      canvas.width = rect.width * 2 // 2x for better quality
      canvas.height = rect.height * 2
      ctx.scale(2, 2)

      // Draw element to canvas (simplified - for production use html2canvas)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, rect.width, rect.height)

      return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
    }
    return null
  } catch (error) {
    console.error('Screenshot error:', error)
    return null
  }
}

// Loading dots animation component
function LoadingDots() {
  return (
    <div className="flex items-center gap-1 ml-2">
      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
    </div>
  )
}

// Calculate aging status based on days since creation
function getPendenciaAgingStatus(dataCriacao: string, status: string): 'normal' | 'warning' | 'critical' {
  if (status === 'concluido') return 'normal'

  const dias = differenceInDays(new Date(), new Date(dataCriacao))

  if (dias < 3) return 'normal'
  if (dias < 5) return 'warning'
  return 'critical'
}

function PendenciaForm({
  pendencia,
  autores,
  onSave,
  onCancel,
  isLoading,
  isLoadingAuthors,
}: {
  pendencia: Partial<Omit<Pendencia, "id" | "status">>
  autores: Autor[]
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
            <Label htmlFor="author">Responsável</Label>
            <Select value={formData.author || ""} onValueChange={(value) => handleChange("author", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
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
                    Nenhum responsável
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
  const [capturingScreenshot, setCapturingScreenshot] = useState(false)

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [pendenciaEmEdicao, setPendenciaEmEdicao] = useState<Partial<Pendencia> | null>(null)
  const [pendenciaParaRemover, setPendenciaParaRemover] = useState<Pendencia | null>(null)
  const [pendenciaParaConcluir, setPendenciaParaConcluir] = useState<Pendencia | null>(null)

  const tableRef = useRef<HTMLDivElement>(null)

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
        toast({ title: "Erro ao buscar responsáveis", description: (error as Error).message, variant: "destructive" })
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
        // Edit existing
        const { error } = await supabase
          .from('pendencias')
          .update(pendenciaData)
          .eq('id', formData.id)

        if (error) throw error

        // Update local state
        const { data, error: fetchError } = await supabase
          .from("pendencias")
          .select("*")
          .order("data", { ascending: false })
        if (!fetchError) setPendencias(data || [])

        toast({ title: "✓ Pendência atualizada" })
      } else {
        // Create new
        await addPendencia(pendenciaData as Omit<Pendencia, "id" | "status">)
        toast({ title: "✓ Pendência adicionada" })
      }

      playSuccessSound()
      setShowFormDialog(false)
      setPendenciaEmEdicao(null)
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
      toast({ title: "✓ Pendência removida" })
    } catch (error: any) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" })
    } finally {
      setProcessingId(null)
      setPendenciaParaRemover(null)
    }
  }

  const handleStatusChange = async (pendenciaId: number, newStatus: string) => {
    // If changing to "concluido", show confirmation dialog
    if (newStatus === "concluido") {
      const pendencia = pendencias.find(p => p.id === pendenciaId)
      if (pendencia) {
        setPendenciaParaConcluir(pendencia)
        return
      }
    }

    // For other status changes, proceed normally
    setProcessingId(pendenciaId)
    try {
      await updatePendenciaStatus(pendenciaId, newStatus)
      toast({
        title: "✓ Status atualizado",
        description: "O status da pendência foi alterado.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleConfirmarConclusao = async () => {
    if (!pendenciaParaConcluir) return

    setProcessingId(pendenciaParaConcluir.id)
    try {
      await updatePendenciaStatus(pendenciaParaConcluir.id, "concluido")
      playSuccessSound()
      toast({
        title: "🎉 Parabéns!",
        description: "Pendência concluída com sucesso!",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao concluir",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
      setPendenciaParaConcluir(null)
    }
  }

  const handleCaptureScreenshot = async () => {
    if (!tableRef.current) return

    setCapturingScreenshot(true)

    // Simple fallback: just notify user to use Print Screen
    toast({
      title: "📸 Captura de Screenshot",
      description: "Use Print Screen ou Snipping Tool para capturar a tela.",
      duration: 5000,
    })

    setCapturingScreenshot(false)
  }

  const getStatusDisplay = (status: string, isProcessing: boolean) => {
    const baseStyle =
      "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[160px] border"

    let statusStyle = ""
    let icon = null
    let text = ""
    let extra = null

    switch (status) {
      case "nao-concluido":
        statusStyle = "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
        icon = <CheckSquare className="h-4 w-4" strokeWidth={2} />
        text = "Não concluído"
        break
      case "em-andamento":
        statusStyle = "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
        icon = <Clock className="h-4 w-4" strokeWidth={2} />
        text = "Em andamento"
        extra = <LoadingDots />
        break
      case "concluido":
        statusStyle = "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
        icon = <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
        text = "Concluído"
        break
      default:
        statusStyle = "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
        icon = <CheckSquare className="h-4 w-4" strokeWidth={2} />
        text = status
    }

    return (
      <div className={`${baseStyle} ${statusStyle}`}>
        {icon}
        <span>{text}</span>
        {extra}
        {isProcessing && (
          <div className="ml-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    )
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
    <TooltipProvider>
      <div className="min-h-screen bg-white">
        {/* Header with subtle bottom border */}
        <div className="border-b border-slate-100 bg-slate-50/30 sticky top-0 z-30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pendências</h1>
                <p className="text-slate-500 mt-1">Acompanhe e gerencie as tarefas do dia</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={2} />
                  <Input
                    type="search"
                    placeholder="Pesquisar..."
                    className="pl-9 border-slate-200 focus:border-blue-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleCaptureScreenshot}
                  disabled={capturingScreenshot}
                  className="gap-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                >
                  <Camera className="h-4 w-4" strokeWidth={2} />
                  Capturar Print
                </Button>
                <Button onClick={() => handleAbrirForm()} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <PlusCircle className="h-4 w-4" strokeWidth={2} />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Dialog */}
        <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
          <DialogContent>
            {pendenciaEmEdicao && (
              <PendenciaForm
                pendencia={pendenciaEmEdicao}
                autores={autores}
                onSave={handleSalvarPendencia}
                onCancel={() => {
                  setShowFormDialog(false)
                  setPendenciaEmEdicao(null)
                }}
                isLoading={processingId !== null}
                isLoadingAuthors={isLoadingAuthors}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog for Completion */}
        <AlertDialog open={!!pendenciaParaConcluir} onOpenChange={(open) => !open && setPendenciaParaConcluir(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>🎉 Confirmar Conclusão</AlertDialogTitle>
              <AlertDialogDescription>
                A pendência "{pendenciaParaConcluir?.titulo}" foi realmente concluída?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleConfirmarConclusao}
              >
                ✓ Sim, Concluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
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

        {/* Main Content - Screenshottable Area */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div ref={tableRef} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[220px] font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Título</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-slate-700">Descrição</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-slate-700">Responsável</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-slate-700">Data</TableHead>
                  <TableHead className="text-right w-[100px] font-semibold text-slate-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredPendencias.length > 0 ? (
                  filteredPendencias.map((pendencia) => {
                    const agingStatus = getPendenciaAgingStatus(pendencia.data, pendencia.status)
                    const diasDesde = differenceInDays(new Date(), new Date(pendencia.data))

                    let rowClasses = "hover:bg-slate-50/50 transition-colors"

                    // Apply aging indicators only for non-completed pendencias
                    if (pendencia.status !== 'concluido') {
                      if (agingStatus === 'warning') {
                        rowClasses += " bg-amber-50/30 border-l-4 border-l-amber-400"
                      } else if (agingStatus === 'critical') {
                        rowClasses += " bg-red-50/40 border-l-4 border-l-red-500"
                      }
                    }

                    if (pendencia.urgente) {
                      rowClasses += " ring-2 ring-orange-200"
                    }

                    return (
                      <TableRow key={pendencia.id} className={rowClasses}>
                        <TableCell>
                          <Select
                            value={pendencia.status}
                            onValueChange={(value) => handleStatusChange(pendencia.id, value)}
                            disabled={processingId === pendencia.id}
                          >
                            <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 shadow-none">
                              {getStatusDisplay(pendencia.status, processingId === pendencia.id)}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nao-concluido" className="p-1">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 min-w-[160px] border border-red-200">
                                  <CheckSquare className="h-4 w-4" strokeWidth={2} />
                                  <span>Não concluído</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="em-andamento" className="p-1">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 min-w-[160px] border border-amber-200">
                                  <Clock className="h-4 w-4" strokeWidth={2} />
                                  <span>Em andamento</span>
                                  <LoadingDots />
                                </div>
                              </SelectItem>
                              <SelectItem value="concluido" className="p-1">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 min-w-[160px] border border-emerald-200">
                                  <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                                  <span>Concluído</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            {pendencia.titulo}
                            {agingStatus !== 'normal' && pendencia.status !== 'concluido' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className={`h-3.5 w-3.5 ${agingStatus === 'critical' ? 'text-red-500' : 'text-amber-500'}`} strokeWidth={2} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {diasDesde} {diasDesde === 1 ? 'dia' : 'dias'} desde a criação
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-600">{pendencia.descricao}</TableCell>
                        <TableCell className="hidden md:table-cell text-slate-600">
                          {pendencia.author || "N/A"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-600">
                          {new Date(pendencia.data).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                  onClick={() => handleAbrirForm(pendencia)}
                                  disabled={!!processingId}
                                >
                                  <Settings2 className="h-4 w-4" strokeWidth={2} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Editar pendência</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                  onClick={() => setPendenciaParaRemover(pendencia)}
                                  disabled={!!processingId}
                                >
                                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Remover pendência</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-3 rounded-full bg-slate-100">
                          <AlertCircle className="h-6 w-6 text-slate-400" strokeWidth={2} />
                        </div>
                        <p className="text-slate-500">Nenhuma pendência encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
