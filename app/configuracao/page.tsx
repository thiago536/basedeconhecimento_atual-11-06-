"use client"

import { useState, useEffect } from "react"
import { Settings, User, Moon, Sun, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
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
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/lib/store"
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

export default function Configuracao() {
  const { autores, addAutor, removeAutor, fetchAutores, subscribeToAutores } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [authorToDelete, setAuthorToDelete] = useState<number | null>(null)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Fetch authors on component mount
  useEffect(() => {
    const loadAuthors = async () => {
      setIsLoading(true)
      try {
        await fetchAutores()
      } catch (error) {
        console.error("Error fetching authors:", error)
        toast({
          title: "Erro ao carregar autores",
          description: "Não foi possível carregar a lista de autores. Tente novamente mais tarde.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }

    loadAuthors()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAutores()

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [fetchAutores, subscribeToAutores, toast])

  // Função para alternar o tema
  const toggleTheme = (checked) => {
    if (checked) {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  // Função para usar o tema do sistema
  const useSystemTheme = (checked) => {
    if (checked) {
      setTheme("system")
    } else {
      // Se desativar o tema do sistema, usar o tema claro ou escuro dependendo da preferência atual
      setTheme(theme === "dark" ? "dark" : "light")
    }
  }

  // Adicionar novo autor
  const handleAddAutor = async (nome) => {
    if (!nome) {
      toast({
        title: "Nome inválido",
        description: "Por favor, digite um nome para o autor.",
        variant: "destructive",
      })
      return
    }

    try {
      await addAutor(nome)
      toast({
        title: "Autor adicionado",
        description: "O autor foi adicionado com sucesso.",
      })
    } catch (error) {
      console.error("Error adding author:", error)
      toast({
        title: "Erro ao adicionar autor",
        description: "Não foi possível adicionar o autor. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Remover autor
  const handleRemoveAutor = async (id) => {
    setIsDeleting(id)
    try {
      await removeAutor(id)
      toast({
        title: "Autor removido",
        description: "O autor foi removido com sucesso.",
      })
    } catch (error) {
      console.error("Error removing author:", error)
      toast({
        title: "Erro ao remover autor",
        description: "Não foi possível remover o autor. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setAuthorToDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuração</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema E-PROSYS</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              <Sun className="h-5 w-5" />
              Tema
            </CardTitle>
            <CardDescription>Configure o tema da aplicação entre claro e escuro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-mode">Modo Escuro</Label>
              <Switch id="theme-mode" checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-system">Usar tema do sistema</Label>
              <Switch id="theme-system" checked={theme === "system"} onCheckedChange={useSystemTheme} />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              O tema escuro reduz o cansaço visual em ambientes com pouca luz.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Autores
            </CardTitle>
            <CardDescription>Gerencie os autores que podem criar e editar FAQs e pendências</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <span className="ml-2">Carregando autores...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {autores.map((autor) => (
                    <TableRow key={autor.id}>
                      <TableCell className="font-medium">{autor.name}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog
                          open={authorToDelete === autor.id}
                          onOpenChange={(open) => !open && setAuthorToDelete(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                              onClick={() => setAuthorToDelete(autor.id)}
                              disabled={isDeleting === autor.id}
                            >
                              {isDeleting === autor.id ? (
                                <div className="w-4 h-4 border-2 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Remover
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover autor</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover este autor? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleRemoveAutor(autor.id)}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {autores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <User className="h-8 w-8 text-muted-foreground mb-2" />
                          <p>Nenhum autor cadastrado.</p>
                          <p className="text-sm text-muted-foreground mt-1">Adicione autores para FAQs e pendências.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Autor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Autor</DialogTitle>
                  <DialogDescription>Digite o nome do novo autor.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" placeholder="Digite o nome do autor" />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={() => {
                      const nomeInput = document.getElementById("nome") as HTMLInputElement
                      handleAddAutor(nomeInput?.value)

                      // Fechar o diálogo
                      document
                        .querySelector('[data-state="open"]')
                        ?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
                    }}
                  >
                    Salvar Autor
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Avançadas
          </CardTitle>
          <CardDescription>Configurações avançadas do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh">Auto-refresh de pendências</Label>
            <Switch id="auto-refresh" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sync-intranet">Sincronização via intranet</Label>
            <Switch id="sync-intranet" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="real-time-updates">Atualizações em tempo real</Label>
            <Switch id="real-time-updates" defaultChecked />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Salvar Configurações
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
