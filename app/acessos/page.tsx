"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, ChevronDown, ChevronRight, CreditCard, Settings, Trash2, AlertCircle, Building2 } from "lucide-react"
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

export default function Acessos() {
  const { acessos, setAcessos, addAcesso, updateAcesso, subscribeToAcessos } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [acessoToDelete, setAcessoToDelete] = useState<number | null>(null)
  const { toast } = useToast()

  // Estados para os diálogos
  const [showNovoPostoDialog, setShowNovoPostoDialog] = useState(false)
  const [showCadastrarAcessoDialog, setShowCadastrarAcessoDialog] = useState(false)

  const [novoAcesso, setNovoAcesso] = useState({
    posto: "",
    maquina: "",
    usuario: "",
    senha: "",
    adquirente: "",
    trabalhoAndamento: "",
    statusMaquininha: "",
  })

  // Estado para novo posto
  const [novoPosto, setNovoPosto] = useState({
    nome: "",
    endereco: "",
    responsavel: "",
    telefone: "",
    observacoes: "",
  })

  const [editandoAcesso, setEditandoAcesso] = useState(null)

  // Fetch initial data and subscribe to real-time updates
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      const supabase = getSupabaseClient()

      try {
        // Fetch acessos
        const { data, error } = await supabase
          .from("acessos")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching acessos:", error)
          toast({
            title: "Erro ao carregar acessos",
            description: `Erro: ${error.message}`,
            variant: "destructive",
          })
        } else {
          // Transform data to match our app's format
          const transformedAcessos = data.map((acesso) => ({
            id: acesso.id,
            posto: acesso.posto,
            maquina: acesso.maquina,
            usuario: acesso.usuario,
            senha: acesso.senha,
            adquirente: acesso.adquirente || "",
            trabalhoAndamento: acesso.trabalho_andamento || "",
            statusMaquininha: acesso.status_maquininha || "",
            expandido: false,
          }))

          setAcessos(transformedAcessos)
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao carregar os dados.",
          variant: "destructive",
        })
      }

      setIsLoading(false)
    }

    fetchInitialData()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAcessos()

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [setAcessos, subscribeToAcessos, toast])

  // Filtrar acessos com base na pesquisa
  const filteredAcessos = acessos.filter(
    (acesso) =>
      acesso.posto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acesso.maquina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acesso.usuario.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Alternar a expansão de um acesso
  const toggleExpansao = (id) => {
    setAcessos(acessos.map((acesso) => (acesso.id === id ? { ...acesso, expandido: !acesso.expandido } : acesso)))
  }

  // Remover acesso com melhor tratamento de erro
  const removerAcesso = async (id) => {
    setIsDeleting(id)
    try {
      const supabase = getSupabaseClient()
      
      // Primeira tentativa - delete simples
      const { error } = await supabase
        .from("acessos")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Delete error:", error)
        
        // Se falhar, tentar atualizar localmente
        setAcessos(prevAcessos => prevAcessos.filter(acesso => acesso.id !== id))
        
        toast({
          title: "Aviso",
          description: "O acesso foi removido localmente. Pode haver um problema de sincronização.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Acesso removido",
          description: "O acesso foi removido com sucesso.",
        })
      }
    } catch (error) {
      console.error("Error removing acesso:", error)
      
      // Fallback: remover localmente
      setAcessos(prevAcessos => prevAcessos.filter(acesso => acesso.id !== id))
      
      toast({
        title: "Removido localmente",
        description: "O acesso foi removido da interface. Verifique a configuração do banco.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setAcessoToDelete(null)
    }
  }

  // Função para adicionar novo posto
  const handleAdicionarPosto = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Inserir o posto na tabela postos
      const { data: postoData, error: postoError } = await supabase
        .from("postos")
        .insert([
          {
            nome: novoPosto.nome || "Novo Posto",
            endereco: novoPosto.endereco || "",
            responsavel: novoPosto.responsavel || "",
            telefone: novoPosto.telefone || "",
            observacoes: novoPosto.observacoes || "",
          }
        ])
        .select()

      if (postoError) {
        console.error("Erro ao inserir posto:", postoError)
        throw postoError
      }

      // Resetar formulário
      setNovoPosto({
        nome: "",
        endereco: "",
        responsavel: "",
        telefone: "",
        observacoes: "",
      })

      setShowNovoPostoDialog(false)

      toast({
        title: "Posto adicionado",
        description: "O posto foi adicionado com sucesso.",
      })
    } catch (error) {
      console.error("Error adding posto:", error)
      toast({
        title: "Erro ao adicionar posto",
        description: `Erro: ${error.message || "Não foi possível adicionar o posto"}`,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    try {
      // Adicionar novo acesso
      await addAcesso({
        posto: novoAcesso.posto || "Novo Posto",
        maquina: novoAcesso.maquina || "Nova Máquina",
        usuario: novoAcesso.usuario || "novo_usuario",
        senha: novoAcesso.senha || "senha123",
        adquirente: novoAcesso.adquirente || "Novo Adquirente",
        trabalhoAndamento: novoAcesso.trabalhoAndamento || "Nenhum",
        statusMaquininha: novoAcesso.statusMaquininha || "Não configurada",
      })

      // Resetar formulário
      setNovoAcesso({
        posto: "",
        maquina: "",
        usuario: "",
        senha: "",
        adquirente: "",
        trabalhoAndamento: "",
        statusMaquininha: "",
      })

      setShowCadastrarAcessoDialog(false)

      toast({
        title: "Acesso adicionado",
        description: "O acesso foi adicionado com sucesso.",
      })
    } catch (error) {
      console.error("Error adding acesso:", error)
      toast({
        title: "Erro ao adicionar acesso",
        description: `Erro: ${error.message || "Não foi possível adicionar o acesso"}`,
        variant: "destructive",
      })
    }
  }

  const handleUpdateAcesso = async () => {
    try {
      if (!editandoAcesso) return

      await updateAcesso(editandoAcesso.id, {
        posto: editandoAcesso.posto,
        maquina: editandoAcesso.maquina,
        usuario: editandoAcesso.usuario,
        senha: editandoAcesso.senha,
        adquirente: editandoAcesso.adquirente,
        trabalhoAndamento: editandoAcesso.trabalhoAndamento,
        statusMaquininha: editandoAcesso.statusMaquininha,
      })

      setEditandoAcesso(null)

      toast({
        title: "Acesso atualizado",
        description: "O acesso foi atualizado com sucesso.",
      })
    } catch (error) {
      console.error("Error updating acesso:", error)
      toast({
        title: "Erro ao atualizar acesso",
        description: `Erro: ${error.message || "Não foi possível atualizar o acesso"}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acessos</h1>
          <p className="text-muted-foreground">Gerencie os acessos aos sistemas dos postos</p>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar acessos..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Botão Novo Posto */}
          <Dialog open={showNovoPostoDialog} onOpenChange={setShowNovoPostoDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Novo Posto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Posto</DialogTitle>
                <DialogDescription>Preencha os campos abaixo para cadastrar um novo posto.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="posto-nome">Nome do Posto *</Label>
                  <Input
                    id="posto-nome"
                    placeholder="Digite o nome do posto"
                    value={novoPosto.nome}
                    onChange={(e) => setNovoPosto({ ...novoPosto, nome: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="posto-endereco">Endereço</Label>
                  <Input
                    id="posto-endereco"
                    placeholder="Digite o endereço do posto"
                    value={novoPosto.endereco}
                    onChange={(e) => setNovoPosto({ ...novoPosto, endereco: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="posto-responsavel">Responsável</Label>
                  <Input
                    id="posto-responsavel"
                    placeholder="Digite o nome do responsável"
                    value={novoPosto.responsavel}
                    onChange={(e) => setNovoPosto({ ...novoPosto, responsavel: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="posto-telefone">Telefone</Label>
                  <Input
                    id="posto-telefone"
                    placeholder="Digite o telefone de contato"
                    value={novoPosto.telefone}
                    onChange={(e) => setNovoPosto({ ...novoPosto, telefone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="posto-observacoes">Observações</Label>
                  <Input
                    id="posto-observacoes"
                    placeholder="Digite observações adicionais"
                    value={novoPosto.observacoes}
                    onChange={(e) => setNovoPosto({ ...novoPosto, observacoes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNovoPostoDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" onClick={handleAdicionarPosto}>
                  Salvar Posto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Botão Cadastrar Acesso */}
          <Dialog open={showCadastrarAcessoDialog} onOpenChange={setShowCadastrarAcessoDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Cadastrar Acesso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Acesso</DialogTitle>
                <DialogDescription>Preencha os campos abaixo para cadastrar um novo acesso.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="posto">Nome do Posto</Label>
                  <Input
                    id="posto"
                    placeholder="Digite o nome do posto"
                    value={novoAcesso.posto}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, posto: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maquina">Nome da Máquina</Label>
                  <Input
                    id="maquina"
                    placeholder="Digite o nome da máquina"
                    value={novoAcesso.maquina}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, maquina: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="usuario">Usuário</Label>
                  <Input
                    id="usuario"
                    placeholder="Digite o usuário"
                    value={novoAcesso.usuario}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, usuario: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="text"
                    placeholder="Digite a senha"
                    value={novoAcesso.senha}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, senha: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adquirente">Adquirente</Label>
                  <Input
                    id="adquirente"
                    placeholder="Digite o adquirente do posto"
                    value={novoAcesso.adquirente}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, adquirente: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="trabalho">Trabalho em Andamento</Label>
                  <Input
                    id="trabalho"
                    placeholder="Digite o trabalho em andamento"
                    value={novoAcesso.trabalhoAndamento}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, trabalhoAndamento: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="statusMaquininha">Status da Maquininha</Label>
                  <Input
                    id="statusMaquininha"
                    placeholder="Digite o status da maquininha"
                    value={novoAcesso.statusMaquininha}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, statusMaquininha: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCadastrarAcessoDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" onClick={handleSubmit}>
                  Salvar Acesso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Acessos</CardTitle>
          <CardDescription>
            Gerencie os acessos aos sistemas dos postos. Clique em uma linha para ver mais detalhes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <span className="ml-2">Carregando acessos...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead>Posto</TableHead>
                  <TableHead>Máquina</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Senha</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAcessos.map((acesso) => (
                  <>
                    <TableRow
                      key={`row-${acesso.id}`}
                      className="cursor-pointer"
                      onClick={() => toggleExpansao(acesso.id)}
                    >
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          {acesso.expandido ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{acesso.posto}</TableCell>
                      <TableCell>{acesso.maquina}</TableCell>
                      <TableCell>{acesso.usuario}</TableCell>
                      <TableCell>{acesso.senha}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditandoAcesso({ ...acesso })
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>

                          <AlertDialog
                            open={acessoToDelete === acesso.id}
                            onOpenChange={(open) => !open && setAcessoToDelete(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAcessoToDelete(acesso.id)
                                }}
                                disabled={isDeleting === acesso.id}
                              >
                                {isDeleting === acesso.id ? (
                                  <div className="w-4 h-4 border-2 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover acesso</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover este acesso? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => removerAcesso(acesso.id)}
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>

                    {acesso.expandido && (
                      <TableRow key={`expanded-${acesso.id}`} className="bg-muted/50">
                        <TableCell colSpan={6}>
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Adquirente</h4>
                                <p className="text-sm">{acesso.adquirente}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Trabalho em Andamento</h4>
                                <p className="text-sm">{acesso.trabalhoAndamento}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Status da Maquininha</h4>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-blue-600" />
                                  <Badge
                                    variant={
                                      acesso.statusMaquininha === "Configurada"
                                        ? "success"
                                        : acesso.statusMaquininha === "Pendente"
                                          ? "warning"
                                          : "destructive"
                                    }
                                  >
                                    {acesso.statusMaquininha}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}

                {filteredAcessos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p>Nenhum acesso encontrado.</p>
                        {searchTerm && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Tente ajustar sua pesquisa ou cadastre um novo acesso.
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

      {/* Diálogo de edição */}
      <Dialog open={!!editandoAcesso} onOpenChange={(open) => !open && setEditandoAcesso(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Editar Acesso</DialogTitle>
            <DialogDescription>Edite os campos do acesso selecionado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-posto">Nome do Posto</Label>
              <Input
                id="edit-posto"
                value={editandoAcesso?.posto || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso, posto: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-maquina">Nome da Máquina</Label>
              <Input
                id="edit-maquina"
                value={editandoAcesso?.maquina || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso, maquina: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-usuario">Usuário</Label>
              <Input
                id="edit-usuario"
                value={editandoAcesso?.usuario || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso, usuario: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-senha">Senha</Label>
              <Input
                id="edit-senha"
                type="text"
                value={editandoAcesso?.senha || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso, senha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-adquirente">Adquirente</Label>
              <Input
                id="edit-adquirente"
                value={editandoAcesso?.adquirente || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso, adquirente: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-trabalho">Trabalho em Andamento</Label>
              <Input
                id="edit-trabalho"
                value={editandoAcesso?.trabalhoAndamento || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso, trabalhoAndamento: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-statusMaquininha">Status da Maquininha</Label>
              <Input
                id="edit-statusMaquininha"
                value={editandoAcesso?.statusMaquininha || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso, statusMaquininha: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateAcesso}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
