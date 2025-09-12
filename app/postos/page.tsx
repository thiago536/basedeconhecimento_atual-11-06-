"use client"

import { useState, useEffect, useMemo } from "react"
import { PlusCircle, Settings, Trash2, Loader2, ExternalLink, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { supabase, type Posto, isSupabaseConfigured } from "@/lib/supabase"

export default function AppPostoPage() {
  // Estados principais
  const [postos, setPostos] = useState<Posto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Estados para diálogos
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPosto, setCurrentPosto] = useState<Partial<Posto> | null>(null)
  const [postoToDelete, setPostoToDelete] = useState<Posto | null>(null)

  // Estados para formulário
  const [formData, setFormData] = useState({ nome: "", url: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()

  // Mock data for demo purposes when Supabase is not configured
  const mockPostos: Posto[] = [
    {
      id: "1",
      nome: "Posto Central",
      url: "https://sistema.postocentral.com.br",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      nome: "Posto Norte",
      url: "https://app.postonorte.com.br",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      nome: "Posto Sul",
      url: "https://portal.postosul.com.br",
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      nome: "Posto Leste",
      url: "https://sistema.postoleste.com.br",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "5",
      nome: "Posto Oeste",
      url: "https://app.postooeste.com.br",
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ]

  // Função para buscar todos os postos
  const fetchPostos = async () => {
    try {
      setIsLoading(true)
      setConnectionError(null)

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.log("Supabase não configurado, usando dados de demonstração")
        setPostos(mockPostos)
        setConnectionError(
          "Supabase não configurado. Configure as variáveis de ambiente para conectar ao banco de dados.",
        )
        return
      }

      console.log("Buscando postos...")

      const { data, error } = await supabase.from("postos").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar postos:", error)
        setConnectionError(`Erro ao conectar com o banco: ${error.message}`)
        // Use mock data as fallback
        setPostos(mockPostos)
        return
      }

      console.log("Postos carregados:", data)
      setPostos(data || [])
    } catch (error) {
      console.error("Erro inesperado:", error)
      setConnectionError("Erro inesperado ao conectar com o banco de dados")
      // Use mock data as fallback
      setPostos(mockPostos)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar dados na montagem do componente
  useEffect(() => {
    fetchPostos()
  }, [])

  // Filtrar postos com base no termo de busca (otimizado com useMemo)
  const filteredPostos = useMemo(() => {
    if (!searchTerm.trim()) return postos

    const term = searchTerm.toLowerCase()
    return postos.filter((posto) => posto.nome.toLowerCase().includes(term) || posto.url.toLowerCase().includes(term))
  }, [postos, searchTerm])

  // Função para abrir diálogo de adição
  const handleAdd = () => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Funcionalidade indisponível",
        description: "Configure o Supabase para adicionar novos postos.",
        variant: "destructive",
      })
      return
    }
    setCurrentPosto(null)
    setFormData({ nome: "", url: "" })
    setIsAddEditDialogOpen(true)
  }

  // Função para abrir diálogo de edição
  const handleEdit = (posto: Posto) => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Funcionalidade indisponível",
        description: "Configure o Supabase para editar postos.",
        variant: "destructive",
      })
      return
    }
    setCurrentPosto(posto)
    setFormData({ nome: posto.nome, url: posto.url })
    setIsAddEditDialogOpen(true)
  }

  // Função para abrir diálogo de exclusão
  const handleDeleteClick = (posto: Posto) => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Funcionalidade indisponível",
        description: "Configure o Supabase para excluir postos.",
        variant: "destructive",
      })
      return
    }
    setPostoToDelete(posto)
    setIsDeleteDialogOpen(true)
  }

  // Função para salvar (adicionar ou editar)
  const handleSave = async () => {
    // Validação básica
    if (!formData.nome.trim() || !formData.url.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e URL são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Validação de URL
    try {
      new URL(formData.url)
    } catch {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      if (currentPosto?.id) {
        // Modo edição
        console.log("Atualizando posto:", currentPosto.id)

        const { error } = await supabase
          .from("postos")
          .update({
            nome: formData.nome.trim(),
            url: formData.url.trim(),
          })
          .eq("id", currentPosto.id)

        if (error) {
          console.error("Erro ao atualizar posto:", error)
          toast({
            title: "Erro ao atualizar",
            description: error.message,
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Posto atualizado",
          description: "O posto foi atualizado com sucesso.",
        })
      } else {
        // Modo adição
        console.log("Criando novo posto...")

        const { error } = await supabase.from("postos").insert([
          {
            nome: formData.nome.trim(),
            url: formData.url.trim(),
          },
        ])

        if (error) {
          console.error("Erro ao criar posto:", error)
          toast({
            title: "Erro ao criar",
            description: error.message,
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Posto criado",
          description: "O novo posto foi criado com sucesso.",
        })
      }

      // Fechar diálogo e recarregar dados
      setIsAddEditDialogOpen(false)
      setCurrentPosto(null)
      setFormData({ nome: "", url: "" })
      await fetchPostos()
    } catch (error) {
      console.error("Erro inesperado ao salvar:", error)
      toast({
        title: "Erro inesperado",
        description: "Não foi possível salvar o posto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para excluir
  const handleDelete = async () => {
    if (!postoToDelete) return

    try {
      setIsDeleting(true)
      console.log("Excluindo posto:", postoToDelete.id)

      const { error } = await supabase.from("postos").delete().eq("id", postoToDelete.id)

      if (error) {
        console.error("Erro ao excluir posto:", error)
        toast({
          title: "Erro ao excluir",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Posto excluído",
        description: "O posto foi excluído com sucesso.",
      })

      // Fechar diálogo e recarregar dados
      setIsDeleteDialogOpen(false)
      setPostoToDelete(null)
      await fetchPostos()
    } catch (error) {
      console.error("Erro inesperado ao excluir:", error)
      toast({
        title: "Erro inesperado",
        description: "Não foi possível excluir o posto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Função para validar e formatar URL
  const formatUrl = (url: string) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`
    }
    return url
  }

  // Função para truncar URL longa
  const truncateUrl = (url: string, maxLength = 40) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + "..."
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciador de Acessos - Postos</h1>
          <p className="text-muted-foreground">Gerencie URLs e links de acesso aos postos</p>
        </div>

        <Button onClick={handleAdd} className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar URL
        </Button>
      </div>

      {/* Alerta de configuração */}
      {connectionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração necessária</AlertTitle>
          <AlertDescription>
            {connectionError}
            {!isSupabaseConfigured() && (
              <div className="mt-2">
                <p>Para conectar ao banco de dados, configure as seguintes variáveis de ambiente:</p>
                <ul className="list-disc list-inside mt-1 text-sm">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                </ul>
                <p className="mt-1 text-sm">Enquanto isso, você pode visualizar dados de demonstração.</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Conteúdo principal */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Postos</CardTitle>
          <CardDescription>
            {filteredPostos.length} posto{filteredPostos.length !== 1 ? "s" : ""} encontrado
            {filteredPostos.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando postos...</span>
            </div>
          ) : filteredPostos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <ExternalLink className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "Nenhum posto encontrado" : "Nenhum posto cadastrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Tente ajustar os termos de busca."
                  : "Comece adicionando um novo posto com URL de acesso."}
              </p>
              {!searchTerm && (
                <Button onClick={handleAdd}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Posto
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nome</TableHead>
                    <TableHead>URL de Acesso</TableHead>
                    <TableHead className="w-[120px]">Data de Criação</TableHead>
                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPostos.map((posto) => (
                    <TableRow key={posto.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{posto.nome}</TableCell>
                      <TableCell>
                        <a
                          href={formatUrl(posto.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          title={posto.url}
                        >
                          {truncateUrl(posto.url)}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(posto.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(posto)}
                            className="h-8 w-8 p-0"
                            title="Editar posto"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(posto)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                            title="Excluir posto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Adição/Edição */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{currentPosto?.id ? "Editar Posto" : "Adicionar Novo Posto"}</DialogTitle>
            <DialogDescription>
              {currentPosto?.id ? "Atualize as informações do posto." : "Preencha os dados para criar um novo posto."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Posto</Label>
              <Input
                id="nome"
                placeholder="Ex: Posto Central"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL de Acesso</Label>
              <Input
                id="url"
                placeholder="Ex: https://sistema.posto.com.br"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditDialogOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentPosto?.id ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o posto "{postoToDelete?.nome}"?
              <br />
              <strong>Esta ação não pode ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
