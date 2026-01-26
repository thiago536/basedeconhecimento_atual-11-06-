"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { PlusCircle, Search, Trash2, AlertCircle, Clock, CheckCircle2, CheckSquare, Camera, Download } from "lucide-react"
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
// @ts-ignore - html2canvas doesn't have perfect types
import html2canvas from "html2canvas"

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
  const [capturingScreenshot, setCapturingScreenshot] = useState(false)

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [pendenciaEmEdicao, setPendenciaEmEdicao] = useState<Partial<Pendencia> | null>(null)
  const [pendenciaParaRemover, setPendenciaParaRemover] = useState<Pendencia | null>(null)

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

  const handleStatusChange = async (pendenciaId: number, newStatus: string) => {
    setProcessingId(pendenciaId)
    try {
      await updatePendenciaStatus(pendenciaId, newStatus)

      if (newStatus === "concluido") {
        playSuccessSound()
        toast({
          title: "🎉 Parabéns!",
          description: "Pendência concluída com sucesso!",
        })
      } else {
        toast({
          title: "Status atualizado",
          description: "O status da pendência foi alterado.",
        })
      }
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

  const handleCaptureScreenshot = async () => {
    if (!tableRef.current) return

    setCapturingScreenshot(true)
    try {
      // Capture the entire pendencias table
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      })

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to create image")
        }

        // Copy to clipboard
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ])

          toast({
            title: "✓ Screenshot capturado!",
            description: "Imagem copiada para área de transferência.",
          })
        } catch (clipboardError) {
          // Fallback: download the image
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `pendencias_${new Date().toISOString().split("T")[0]}.png`
          link.click()
          URL.revokeObjectURL(url)

          toast({
            title: "✓ Screenshot salvo!",
            description: "Imagem baixada (clipboard não suportado neste navegador).",
          })
        }
      }, "image/png")
    } catch (error: any) {
      toast({
        title: "Erro ao capturar screenshot",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCapturingScreenshot(false)
    }
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
                {capturingScreenshot ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Capturando...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" strokeWidth={2} />
                    Capturar Print
                  </>
                )}
              </Button>
              <Button onClick={() => handleAbrirForm()} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="h-4 w-4" strokeWidth={2} />
                Adicionar
              </Button>
            </div>
          </div>
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

      {/* Main Content - Screenshottable Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div ref={tableRef} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[220px] font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Título</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-slate-700">Descrição</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-slate-700">Autor</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-slate-700">Data</TableHead>
                <TableHead className="text-right w-[50px] font-semibold text-slate-700">Ações</TableHead>
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
                filteredPendencias.map((pendencia) => (
                  <TableRow
                    key={pendencia.id}
                    className={`hover:bg-slate-50/50 transition-colors ${pendencia.urgente ? "bg-red-50/30" : ""}`}
                  >
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
                    <TableCell className="font-medium text-slate-900">{pendencia.titulo}</TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">{pendencia.descricao}</TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">
                      {pendencia.author || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">
                      {new Date(pendencia.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        onClick={() => setPendenciaParaRemover(pendencia)}
                        disabled={!!processingId}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
  )
}
