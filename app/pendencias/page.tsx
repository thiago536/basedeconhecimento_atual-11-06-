"use client"

import { useState, useEffect } from "react"
import { CheckSquare, Download, PlusCircle, Search, Clock, CheckCircle2, Trash2, AlertCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { getSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
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

export default function Pendencias() {
  const {
    pendencias = [], 
    setPendencias,
    addPendencia,
    updatePendenciaStatus,
    subscribeToPendencias,
    autores = [], 
    fetchAutores,
    subscribeToAutores,
  } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [dailyPassword, setDailyPassword] = useState("")
  const [novaPendencia, setNovaPendencia] = useState({
    titulo: "",
    descricao: "",
    urgente: false,
    author: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [pendenciaToDelete, setPendenciaToDelete] = useState<number | null>(null)
  const [showAddPendenciaDialog, setShowAddPendenciaDialog] = useState(false); // Estado para controlar o diálogo

  const { toast } = useToast()

  // Calcular a senha diária
  useEffect(() => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, "0")
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const dateNumber = Number.parseInt(`${day}${month}`)

    const division = dateNumber / 8369
    const decimalPart = division.toString().split(".")[1] || "0000"
    const password = decimalPart.substring(0, 4).replace(/^0+/, "") || "0"

    setDailyPassword(password)
  }, [])

  // Fetch initial data and subscribe to real-time updates
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      const supabase = getSupabaseClient()
      console.log("Pendencias: Buscando pendências iniciais...")

      const { data, error } = await supabase.from("pendencias").select("*").order("data", { ascending: false })

      if (error) {
        console.error("Pendencias: Erro ao buscar pendências:", error)
        toast({
          title: "Erro ao carregar pendências",
          description: `Não foi possível carregar as pendências. Detalhes: ${error.message}. Tente novamente mais tarde.`,
          variant: "destructive",
        })
        setPendencias([]); 
      } else {
        setPendencias(data)
      }

      setIsLoading(false)
    }

    const fetchAuthors = async () => {
      setIsLoadingAuthors(true)
      try {
        await fetchAutores()
      } catch (error) {
        console.error("Pendencias: Error fetching authors:", error)
        toast({
          title: "Erro ao carregar autores",
          description: `Não foi possível carregar a lista de autores. Detalhes: ${error instanceof Error ? error.message : String(error)}. Tente novamente mais tarde.`,
          variant: "destructive",
        })
      }
      setIsLoadingAuthors(false)
    }

    fetchInitialData()
    fetchAuthors()

    const unsubscribePendencias = subscribeToPendencias()
    const unsubscribeAuthors = subscribeToAutores()

    return () => {
      unsubscribePendencias()
      unsubscribeAuthors()
    }
  }, [setPendencias, subscribeToPendencias, toast, fetchAutores, subscribeToAutores])

  const filteredPendencias = pendencias
    .filter(
      (pendencia) =>
        pendencia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pendencia.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (a.urgente !== b.urgente) return a.urgente ? -1 : 1
      return new Date(a.data).getTime() - new Date(b.data).getTime()
    })

  const atualizarStatus = async (id: number, novoStatus: string) => { 
    try {
      await updatePendenciaStatus(id, novoStatus)
      toast({
        title: "Status atualizado",
        description: "O status da pendência foi atualizado com sucesso.",
      })
    } catch (error) {
      console.error("Pendencias: Error updating status:", error)
      toast({
        title: "Erro ao atualizar status",
        description: `Não foi possível atualizar o status da pendência. Detalhes: ${error instanceof Error ? error.message : String(error)}. Tente novamente.`,
        variant: "destructive",
      })
    }
  }

  const removerPendencia = async (id: number) => { 
    setIsDeleting(id)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("pendencias").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Pendência removida",
        description: "A pendência foi removida com sucesso.",
      })
    } catch (error) {
      console.error("Pendencias: Error removing pendencia:", error)
      toast({
        title: "Erro ao remover pendência",
        description: `Não foi possível remover a pendência. Detalhes: ${error instanceof Error ? error.message : String(error)}. Tente novamente.`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setPendenciaToDelete(null)
    }
  }

  const exportarPendencias = () => {
    const headers = ["ID", "Título", "Descrição", "Status", "Urgência", "Data", "Autor"]

    const formatarStatus = (status: string) => { 
      switch (status) {
        case "nao-concluido":
          return "Não Concluído"
        case "em-andamento":
          return "Em Andamento"
        case "concluido":
          return "Concluído"
        default:
          return status
      }
    }

    const csvContent = [
      headers.join(","),
      ...pendencias.map((p) =>
        [
          p.id,
          `"${p.titulo.replace(/"/g, '""')}"`,
          `"${p.descricao.replace(/"/g, '""')}"`,
          `"${formatarStatus(p.status)}"`,
          p.urgente ? "Urgente" : "Normal",
          new Date(p.data).toLocaleString("pt-BR"),
          `"${p.author || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `pendencias_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: "Exportado",
      description: "As pendências foram exportadas para um ficheiro CSV.",
    });
  }

  const handleSubmit = async () => {
    console.log("Pendencias: Dados do formulário sendo enviados:", novaPendencia);
    if (!novaPendencia.titulo) {
      toast({
        title: "Campo obrigatório",
        description: "O Título da pendência é obrigatório.",
        variant: "destructive",
      });
      console.error("Pendencias: Tentativa de envio com título vazio.");
      return; 
    }

    try {
      await addPendencia({
        titulo: novaPendencia.titulo, 
        descricao: novaPendencia.descricao || "Sem descrição", 
        status: "nao-concluido", 
        urgente: novaPendencia.urgente,
        data: new Date().toISOString(), 
        author: novaPendencia.author || null, 
      })
      console.log("Pendencias: Pendência adicionada com sucesso ao Supabase.");

      setNovaPendencia({
        titulo: "",
        descricao: "",
        urgente: false,
        author: "",
      })

      setShowAddPendenciaDialog(false); 
      console.log("Pendencias: Diálogo de pendência fechado após sucesso.");


      toast({
        title: "Pendência adicionada",
        description: "A pendência foi adicionada com sucesso.",
      })
    } catch (error) {
      console.error("Pendencias: Erro ao adicionar pendência:", error)
      toast({
        title: "Erro ao adicionar pendência",
        description: `Não foi possível adicionar a pendência. Detalhes: ${error instanceof Error ? error.message : String(error)}. Tente novamente.`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pendências</h1>
          <p className="text-muted-foreground">
            Senha diária: <span className="font-bold">{dailyPassword}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar pendências..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* O Dialog agora encapsula o DialogTrigger e o Button, SEM o 'asChild' no DialogTrigger */}
          <Dialog open={showAddPendenciaDialog} onOpenChange={(open) => {
            console.log("Pendencias: Dialog onOpenChange chamado. Novo estado:", open);
            setShowAddPendenciaDialog(open);
          }}>
            <DialogTrigger> {/* Removido asChild */}
              <Button onClick={() => {
                console.log("Pendencias: Botão 'Adicionar' (pendência) clicado. Definindo showAddPendenciaDialog como true.");
                setShowAddPendenciaDialog(true);
              }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Adicionar Pendência</DialogTitle>
                <DialogDescription>Preencha os campos abaixo para adicionar uma nova pendência.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    placeholder="Digite o título da pendência"
                    value={novaPendencia.titulo}
                    onChange={(e) => setNovaPendencia({ ...novaPendencia, titulo: e.target.value })}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva a pendência"
                    value={novaPendencia.descricao}
                    onChange={(e) => setNovaPendencia({ ...novaPendencia, descricao: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="urgencia">Urgência</Label>
                  <Select
                    value={novaPendencia.urgente ? "urgente" : "normal"}
                    onValueChange={(value) => setNovaPendencia({ ...novaPendencia, urgente: value === "urgente" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="author">Autor</Label>
                  <Select
                    value={novaPendencia.author}
                    onValueChange={(value) => setNovaPendencia({ ...novaPendencia, author: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o autor" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingAuthors ? (
                        <SelectItem value="loading" disabled>
                          Carregando autores...
                        </SelectItem>
                      ) : autores.length > 0 ? (
                        autores.map((autor) => (
                          <SelectItem key={autor.id} value={autor.name}>
                            {autor.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Nenhum autor cadastrado
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>
                  Salvar Pendência
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportarPendencias}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Pendências</CardTitle>
          <CardDescription>
            Gerencie as pendências do dia. As pendências são ordenadas por urgência e data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <span className="ml-2">Carregando pendências...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="hidden md:table-cell">Autor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPendencias.map((pendencia) => (
                  <TableRow key={pendencia.id}>
                    <TableCell>
                      {pendencia.urgente && (
                        <Badge variant="destructive" className="mb-1">
                          Urgente
                        </Badge>
                      )}
                      <div>
                        {pendencia.status === "nao-concluido" && <Badge variant="outline">Não concluído</Badge>}
                        {pendencia.status === "em-andamento" && (
                          <Badge variant="secondary" className="animate-pulse">
                            Em andamento...
                          </Badge>
                        )}
                        {pendencia.status === "concluido" && <Badge variant="success">Concluído</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{pendencia.titulo}</TableCell>
                    <TableCell className="hidden md:table-cell">{pendencia.descricao}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(pendencia.data).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {pendencia.author ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{pendencia.author}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não especificado</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Select
                          value={pendencia.status}
                          onValueChange={(value) => atualizarStatus(pendencia.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Alterar status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nao-concluido">
                              <div className="flex items-center">
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Não concluído
                              </div>
                            </SelectItem>
                            <SelectItem value="em-andamento">
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                Em andamento
                              </div>
                            </SelectItem>
                            <SelectItem value="concluido">
                              <div className="flex items-center">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Concluído
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <AlertDialog
                          open={pendenciaToDelete === pendencia.id}
                          onOpenChange={(open) => !open && setPendenciaToDelete(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                              onClick={() => setPendenciaToDelete(pendencia.id)}
                              disabled={isDeleting === pendencia.id}
                            >
                              {isDeleting === pendencia.id ? (
                                <div className="w-4 h-4 border-2 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover pendência</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover esta pendência? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => removerPendencia(pendencia.id)}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredPendencias.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p>Nenhuma pendência encontrada.</p>
                        {searchTerm && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Tente ajustar sua pesquisa ou adicione uma nova pendência.
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
