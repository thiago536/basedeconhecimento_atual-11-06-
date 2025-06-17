"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, ChevronDown, ChevronRight, CreditCard, Settings, AlertCircle, Building2 } from "lucide-react" // Removido Trash2
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
// Removidos todos os componentes do AlertDialog
/*
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
*/
import type { Acesso } from "@/lib/supabase" 

export default function Acessos() {
  const { acessos = [], setAcessos, addAcesso, updateAcesso, subscribeToAcessos } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  // Removido isDeleting e acessoParaRemover
  // const [isDeleting, setIsDeleting] = useState<number | null>(null)
  // const [acessoParaRemover, setAcessoParaRemover] = useState<Acesso | null>(null); 
  const { toast } = useToast()

  const [showNovoPostoDialog, setShowNovoPostoDialog] = useState(false)
  const [showCadastrarAcessoDialog, setShowCadastrarAcessoDialog] = useState(false)

  const [novoAcesso, setNovoAcesso] = useState<Omit<Acesso, "id" | "expandido" | "created_at">>({
    posto: "",
    maquina: "",
    usuario: "",
    senha: "",
    adquirente: "",
    trabalho_andamento: "", 
    status_maquininha: "", 
  })

  const [novoPosto, setNovoPosto] = useState({
    nome: "",
    endereco: "",
    responsavel: "",
    telefone: "",
    observacoes: "",
  })

  const [editandoAcesso, setEditandoAcesso] = useState<Acesso | null>(null)

  useEffect(() => {
    console.log("Componente Acessos montado ou re-renderizado.");
    // Comentado/Removido: setAcessoParaRemover(null);
    // console.log("acessoParaRemover resetado para null no useEffect de montagem.");

    const fetchInitialData = async () => {
      setIsLoading(true)
      const supabase = getSupabaseClient()

      try {
        const { data, error } = await supabase
          .from("acessos")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Erro ao buscar acessos:", error)
          toast({
            title: "Erro ao carregar acessos",
            description: `Detalhes: ${error.message}`,
            variant: "destructive",
          })
        } else {
          // Garante que 'data' é um array antes de mapear
          const transformedAcessos: Acesso[] = Array.isArray(data) ? data.map((acesso) => ({
            id: acesso.id,
            posto: acesso.posto,
            maquina: acesso.maquina,
            usuario: acesso.usuario,
            senha: acesso.senha,
            adquirente: acesso.adquirente || "",
            trabalho_andamento: acesso.trabalho_andamento || "",
            status_maquininha: acesso.status_maquininha || "",
            expandido: false, 
          })) : []; // Se não for array, usa array vazio
          setAcessos(transformedAcessos)
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar dados:", error)
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao carregar os dados. Verifique a conexão.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        console.log("fetchInitialData concluído. isLoading = false.");
      }
    }

    fetchInitialData()

    const unsubscribe = subscribeToAcessos()

    return () => {
      unsubscribe();
      console.log("Componente Acessos desmontado. Limpeza realizada.");
    };
  }, [setAcessos, subscribeToAcessos, toast]); 

  const filteredAcessos = acessos.filter(
    (acesso) =>
      acesso.posto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acesso.maquina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acesso.usuario.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleExpansao = (id: number) => {
    setAcessos(acessos.map((acesso) => (acesso.id === id ? { ...acesso, expandido: !acesso.expandido } : acesso)))
  }

  // Função removerAcesso (REMOVIDA TEMPORARIAMENTE)
  /*
  const removerAcesso = async (id: number) => {
    console.log(`Iniciando remoção do acesso com ID: ${id}. Tipo do ID: ${typeof id}`);
    if (typeof id !== 'number' || isNaN(id)) {
      console.error("Erro: ID de acesso inválido para remoção. ID recebido:", id);
      toast({
        title: "Erro de remoção",
        description: "Não foi possível remover o acesso. ID inválido.",
        variant: "destructive",
      });
      setIsDeleting(null);
      setAcessoParaRemover(null);
      return;
    }

    setIsDeleting(id); 
    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from("acessos")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao tentar remover acesso do Supabase:", error);
        setAcessos(prevAcessos => Array.isArray(prevAcessos) ? prevAcessos.filter(acesso => acesso.id !== id) : []);
        toast({
          title: "Aviso",
          description: "O acesso foi removido localmente. Pode haver um problema de sincronização com o banco de dados.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Acesso removido",
          description: "O acesso foi removido com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Erro inesperado ao remover acesso:", error);
      setAcessos(prevAcessos => Array.isArray(prevAcessos) ? prevAcessos.filter(acesso => acesso.id !== id) : []);
      toast({
        title: "Erro ao remover",
        description: `Não foi possível remover o acesso. Detalhes: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null); 
      setAcessoParaRemover(null); 
      console.log(`Remoção finalizada para ID: ${id}. acessoParaRemover resetado para null.`);
    }
  };
  */

  const handleAdicionarPosto = async () => {
    try {
      const supabase = getSupabaseClient()
      
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
    } catch (error: any) {
      console.error("Erro ao adicionar posto:", error)
      toast({
        title: "Erro ao adicionar posto",
        description: `Não foi possível adicionar o posto. Detalhes: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    console.log("Tentando salvar novo acesso:", novoAcesso);
    try {
      await addAcesso({
        posto: novoAcesso.posto || "Novo Posto",
        maquina: novoAcesso.maquina || "Nova Máquina",
        usuario: novoAcesso.usuario || "novo_usuario",
        senha: novoAcesso.senha || "senha123",
        adquirente: novoAcesso.adquirente || "Novo Adquirente",
        trabalho_andamento: novoAcesso.trabalho_andamento || "Nenhum", 
        status_maquininha: novoAcesso.status_maquininha || "Não configurada", 
      })
      console.log("Acesso adicionado com sucesso ao Supabase.");

      setNovoAcesso({
        posto: "",
        maquina: "",
        usuario: "",
        senha: "",
        adquirente: "",
        trabalho_andamento: "",
        status_maquininha: "",
      });
      setShowCadastrarAcessoDialog(false); 
      // Comentado/Removido: setAcessoParaRemover(null); 
      // console.log("acessoParaRemover resetado para null após adição bem-sucedida.");

      toast({
        title: "Acesso adicionado",
        description: "O acesso foi adicionado com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao adicionar acesso:", error);
      toast({
        title: "Erro ao adicionar acesso",
        description: `Não foi possível adicionar o acesso. Detalhes: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      })
    }
  }

  const handleUpdateAcesso = async () => {
    try {
      if (!editandoAcesso) return 

      const updatedData: Partial<Acesso> = {
        posto: editandoAcesso.posto,
        maquina: editandoAcesso.maquina,
        usuario: editandoAcesso.usuario,
        senha: editandoAcesso.senha,
        adquirente: editandoAcesso.adquirente,
        trabalho_andamento: editandoAcesso.trabalho_andamento, 
        status_maquininha: editandoAcesso.status_maquininha, 
      }

      await updateAcesso(editandoAcesso.id, updatedData)

      setEditandoAcesso(null) 

      toast({
        title: "Acesso atualizado",
        description: "O acesso foi atualizado com sucesso.",
      })
    } catch (error: any) {
      console.error("Erro ao atualizar acesso:", error)
      toast({
        title: "Erro ao atualizar acesso",
        description: `Não foi possível atualizar o acesso. Detalhes: ${error.message || "Erro desconhecido"}`,
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

          {/* Botão Cadastrar Acesso - Este diálogo abre o formulário para adicionar um novo acesso */}
          <Dialog open={showCadastrarAcessoDialog} onOpenChange={setShowCadastrarAcessoDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                console.log("Botão 'Cadastrar Acesso' clicado. Abrindo diálogo...");
                setShowCadastrarAcessoDialog(true);
              }}>
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
                    value={novoAcesso.adquirente || ""}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, adquirente: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="trabalho">Trabalho em Andamento</Label>
                  <Input
                    id="trabalho"
                    placeholder="Digite o trabalho em andamento"
                    value={novoAcesso.trabalho_andamento || ""}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, trabalho_andamento: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="statusMaquininha">Status da Maquininha</Label>
                  <Input
                    id="statusMaquininha"
                    placeholder="Digite o status da maquininha"
                    value={novoAcesso.status_maquininha || ""}
                    onChange={(e) => setNovoAcesso({ ...novoAcesso, status_maquininha: e.target.value })}
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
              <TableBody>{
                filteredAcessos.map((acesso) => (
                  <React.Fragment key={`row-frag-${acesso.id}`}>
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
                              e.stopPropagation(); // Impede a propagação do clique para a linha da tabela
                              setEditandoAcesso({ ...acesso });
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>

                          {/* O botão de lixeira e o AlertDialog de remoção foram removidos temporariamente. */}
                          {/* Eles serão adicionados novamente do zero em uma próxima etapa para garantir a estabilidade. */}
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(`Botão de remover clicado para acesso ID: ${acesso.id}. Definindo acessoParaRemover.`);
                              setAcessoParaRemover(acesso);
                            }}
                            disabled={isDeleting === acesso.id}
                          >
                            {isDeleting === acesso.id ? (
                              <div className="w-4 h-4 border-2 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button> */}
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
                                <p className="text-sm">{acesso.trabalho_andamento}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Status da Maquininha</h4>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-blue-600" />
                                  <Badge
                                    variant={
                                      acesso.status_maquininha === "Configurada"
                                        ? "success"
                                        : acesso.status_maquininha === "Pendente"
                                          ? "warning"
                                          : "destructive"
                                    }
                                  >
                                    {acesso.status_maquininha}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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

      {/* O AlertDialog de confirmação de exclusão foi removido temporariamente. */}
      {/* Será adicionado novamente do zero em uma próxima etapa para garantir a estabilidade. */}
      {/*
      <AlertDialog 
        open={!!acessoParaRemover} 
        onOpenChange={(open) => {
          if (!open) {
            setAcessoParaRemover(null);
            console.log("AlertDialog fechado via onOpenChange. acessoParaRemover resetado para null.");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acesso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o acesso para o posto "
              <span className="font-semibold">{acessoParaRemover?.posto}</span>"
              (Máquina: <span className="font-semibold">{acessoParaRemover?.maquina}</span>)?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setAcessoParaRemover(null); 
              console.log("Remoção cancelada. acessoParaRemover resetado para null.");
            }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (acessoParaRemover) {
                  removerAcesso(acessoParaRemover.id); 
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      */}

      {/* Diálogo de edição de acesso */}
      <Dialog open={!!editandoAcesso} onOpenChange={(open) => !open && setEditandoAceso(null)}>
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
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso!, posto: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-maquina">Nome da Máquina</Label>
              <Input
                id="edit-maquina"
                value={editandoAcesso?.maquina || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso!, maquina: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-usuario">Usuário</Label>
              <Input
                id="edit-usuario"
                value={editandoAcesso?.usuario || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso!, usuario: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-senha">Senha</Label>
              <Input
                id="edit-senha"
                type="text"
                value={editandoAcesso?.senha || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso!, senha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-adquirente">Adquirente</Label>
              <Input
                id="edit-adquirente"
                value={editandoAcesso?.adquirente || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso!, adquirente: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-trabalho">Trabalho em Andamento</Label>
              <Input
                id="edit-trabalho"
                value={editandoAcesso?.trabalho_andamento || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso!, trabalho_andamento: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-statusMaquininha">Status da Maquininha</Label>
              <Input
                id="edit-statusMaquininha"
                value={editandoAcesso?.status_maquininha || ""}
                onChange={(e) => setEditandoAcesso({ ...editandoAcesso!, status_maquininha: e.target.value })}
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
