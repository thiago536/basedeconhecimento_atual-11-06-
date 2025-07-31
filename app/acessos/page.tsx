"use client"

import { useState, useEffect, useMemo } from "react"
import { PlusCircle, Search, Settings, Trash2, AlertCircle } from "lucide-react"
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
import { supabase, type Acesso } from "@/lib/supabase"
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

function AcessoForm({
  acesso,
  onSave,
  onCancel,
  isLoading,
}: {
  acesso: Partial<Acesso>
  onSave: (acesso: Partial<Acesso>) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState(acesso)

  const handleChange = (field: keyof Omit<Acesso, "id" | "created_at" | "expandido">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{formData.id ? "Editar Acesso" : "Adicionar Novo Acesso"}</DialogTitle>
        <DialogDescription>Preencha os dados de acesso para o posto.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="posto">Posto</Label>
          <Input
            id="posto"
            value={formData.posto || ""}
            onChange={(e) => handleChange("posto", e.target.value)}
            placeholder="Nome do Posto"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="maquina">Máquina</Label>
          <Input
            id="maquina"
            value={formData.maquina || ""}
            onChange={(e) => handleChange("maquina", e.target.value)}
            placeholder="Ex: Servidor, PDV 01"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="usuario">Usuário</Label>
          <Input
            id="usuario"
            value={formData.usuario || ""}
            onChange={(e) => handleChange("usuario", e.target.value)}
            placeholder="Nome de utilizador"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            value={formData.senha || ""}
            onChange={(e) => handleChange("senha", e.target.value)}
            placeholder="Senha de acesso"
          />
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

export default function AcessosPage() {
  const [acessos, setAcessos] = useState<Acesso[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [acessoEmEdicao, setAcessoEmEdicao] = useState<Partial<Acesso> | null>(null)
  const [acessoParaRemover, setAcessoParaRemover] = useState<Acesso | null>(null)

  const { toast } = useToast()
  const { playSuccessSound } = useAudioFeedback()

  const fetchAcessos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("acessos").select("*").order("posto", { ascending: true })
      if (error) throw error
      setAcessos(data || [])
    } catch (error) {
      toast({ title: "Erro ao carregar acessos", description: (error as Error).message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAcessos()
  }, [])

  const handleAbrirForm = (acesso?: Acesso) => {
    setAcessoEmEdicao(acesso || {})
    setShowFormDialog(true)
  }

  const handleSalvarAcesso = async (formData: Partial<Acesso>) => {
    if (!formData.posto || !formData.maquina || !formData.usuario || !formData.senha) {
      toast({ title: "Campos obrigatórios", description: "Todos os campos são obrigatórios.", variant: "destructive" })
      return
    }

    setProcessing(true)
    try {
      if (formData.id) {
        const { error } = await supabase.from("acessos").update(formData).eq("id", formData.id)
        if (error) throw error
        toast({ title: "Acesso atualizado" })
      } else {
        const { error } = await supabase.from("acessos").insert(formData)
        if (error) throw error
        toast({ title: "Acesso adicionado" })
      }

      // Play success sound after successful save
      playSuccessSound()
      setShowFormDialog(false)
      fetchAcessos()
    } catch (error: any) {
      if (error.code === "23505") {
        toast({
          title: "Erro de Duplicidade",
          description: "Já existe um registo com estes dados.",
          variant: "destructive",
        })
      } else {
        toast({ title: "Erro ao guardar", description: error.message, variant: "destructive" })
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirmarRemocao = async () => {
    if (!acessoParaRemover) return
    setProcessing(true)
    try {
      const { error } = await supabase.from("acessos").delete().eq("id", acessoParaRemover.id)
      if (error) throw error
      toast({ title: "Acesso removido" })
      fetchAcessos()
    } catch (error: any) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" })
    } finally {
      setProcessing(false)
      setAcessoParaRemover(null)
    }
  }

  const filteredAcessos = useMemo(
    () =>
      acessos.filter(
        (acesso) =>
          (acesso.posto?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (acesso.maquina?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (acesso.usuario?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
      ),
    [acessos, searchTerm],
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciador de Acessos</h1>
          <p className="text-muted-foreground">Registe e consulte os acessos dos postos.</p>
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
            Registar Acesso
          </Button>
        </div>
      </div>

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent>
          {acessoEmEdicao !== null && (
            <AcessoForm
              acesso={acessoEmEdicao}
              onSave={handleSalvarAcesso}
              onCancel={() => setShowFormDialog(false)}
              isLoading={processing}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!acessoParaRemover} onOpenChange={(open) => !open && setAcessoParaRemover(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza de que deseja remover o acesso para "{acessoParaRemover?.posto}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={handleConfirmarRemocao}
              disabled={processing}
            >
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
                <TableHead>Posto</TableHead>
                <TableHead>Máquina</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Senha</TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredAcessos.length > 0 ? (
                filteredAcessos.map((acesso) => (
                  <TableRow key={acesso.id}>
                    <TableCell className="font-medium">{acesso.posto}</TableCell>
                    <TableCell className="text-muted-foreground">{acesso.maquina}</TableCell>
                    <TableCell className="text-muted-foreground">{acesso.usuario}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{acesso.senha}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAbrirForm(acesso)}
                          disabled={processing}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setAcessoParaRemover(acesso)}
                          disabled={processing}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Nenhum acesso encontrado.</p>
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
