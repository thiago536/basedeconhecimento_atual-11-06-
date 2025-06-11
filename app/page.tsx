"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, PlusCircle, CheckSquare, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { ImageUpload, type ImageWithMetadata } from "@/components/image-upload"
import { categoryIcons } from "@/components/app-sidebar"
import { useToast } from "@/components/ui/use-toast"

// Dados de exemplo para as categorias
const categories = [
  { id: "gerente", name: "Gerente" },
  { id: "pdv", name: "PDV" },
  { id: "pdv-movel", name: "PDV Móvel" },
  { id: "instalacao", name: "Instalação" },
  { id: "automacao", name: "Automação" },
  { id: "integracao", name: "Integração" },
  { id: "impressoras", name: "Impressoras" },
  { id: "pinpad", name: "PINPAD" },
]

export default function Dashboard() {
  // ❌ REMOVIDO: speds, getDailySummary, fetchSpeds, subscribeToSpeds
  const { faqs, addFaq, autores, pendencias, setTheme } = useAppStore()
  const [dailyPassword, setDailyPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  // ❌ REMOVIDO: isLoadingSpeds
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    author: "",
    images: [] as ImageWithMetadata[],
  })

  // ❌ REMOVIDO: Todo o useEffect que carregava dados do SPED

  // Calcular a senha diária: data (DDMM) ÷ 8369 → pega 4 primeiros dígitos após vírgula, ignora zeros à esquerda
  useEffect(() => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, "0")
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const dateNumber = Number.parseInt(`${day}${month}`)

    const division = dateNumber / 8369
    const decimalPart = division.toString().split(".")[1] || "0000"
    const password = decimalPart.substring(0, 4).replace(/^0+/, "") || "0"

    setDailyPassword(password)

    // Verificar se é noite (após 18h ou antes das 6h) e ativar o modo escuro automaticamente
    const hour = today.getHours()
    if (hour >= 18 || hour < 6) {
      setTheme("dark")
    }
  }, [setTheme])

  const handleRefresh = () => {
    setIsLoading(true)
    // ❌ REMOVIDO: Refresh SPED data
    // Simular refresh dos dados
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Dados atualizados",
        description: "Os dados foram atualizados com sucesso.",
      })
    }, 1000)
  }

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  // Use useCallback to memoize the function
  const handleImagesSelected = useCallback((images: ImageWithMetadata[]) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }))
  }, [])

  const handleSubmit = () => {
    // Adicionar o novo FAQ
    addFaq({
      title: formData.title || "Novo FAQ",
      category: formData.category,
      description: formData.description || "Descrição do novo FAQ",
      author: formData.author,
      images: formData.images,
    })

    // Resetar o formulário
    setFormData({
      title: "",
      category: "",
      description: "",
      author: "",
      images: [],
    })

    // Fechar o diálogo
    document.querySelector('[data-state="open"]')?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
  }

  // Pegar os FAQs mais recentes (até 5)
  const recentFaqs = [...faqs].sort((a, b) => b.id - a.id).slice(0, 5)

  // Contar pendências em andamento
  const pendenciasEmAndamento = pendencias.filter((p) => p.status === "em-andamento").length

  // Contar pendências concluídas hoje
  const today = new Date().toISOString().split("T")[0]
  const pendenciasConcluidas = pendencias.filter(
    (p) => p.status === "concluido" && new Date(p.data).toISOString().split("T")[0] === today,
  ).length

  // ❌ REMOVIDO: Get SPED data for today
  // ❌ REMOVIDO: Prepare data for the chart
  // ❌ REMOVIDO: Check if we have any data to display in the chart

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo ao E-PROSYS</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="estatisticas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="faqs-recentes">FAQs Recentes</TabsTrigger>
          {/* ❌ REMOVIDO: Tab SPEDs */}
        </TabsList>

        <TabsContent value="estatisticas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pendências</CardTitle>
                <CheckSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendencias.length}</div>
                <p className="text-xs text-muted-foreground">Pendências ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-blue-600"
                >
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendenciasEmAndamento}</div>
                <p className="text-xs text-muted-foreground">Pendências em andamento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas Hoje</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-blue-600"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendenciasConcluidas}</div>
                <p className="text-xs text-muted-foreground">Concluídas hoje</p>
              </CardContent>
            </Card>

            {/* ❌ REMOVIDO: Card SPEDs Gerados Hoje */}
          </div>

          {/* Adicionar card com senha diária */}
          <Card>
            <CardHeader>
              <CardTitle>Senha Diária</CardTitle>
              <CardDescription>Senha calculada para hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{dailyPassword}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Senha gerada automaticamente para {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs-recentes">
          <Card>
            <CardHeader>
              <CardTitle>FAQs Recentes</CardTitle>
              <CardDescription>Últimos artigos adicionados à base de conhecimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentFaqs.length > 0 ? (
                recentFaqs.map((faq, index) => {
                  const category = categories.find((c) => c.id === faq.category) || {
                    id: faq.category,
                    name: faq.category,
                  }
                  const IconComponent = categoryIcons[category.id] || BookOpen

                  return (
                    <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                      <IconComponent className="mt-1 h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-medium">{faq.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Categoria: {category.name}
                          {faq.images && faq.images.length > 0 && (
                            <span className="ml-2">
                              • {faq.images.length} {faq.images.length === 1 ? "imagem" : "imagens"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">Nenhum FAQ cadastrado ainda.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar FAQ
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle>Adicionar FAQ</DialogTitle>
                    <DialogDescription>
                      Preencha os campos abaixo para adicionar um novo FAQ à base de conhecimento.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto pr-1 my-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Título</Label>
                        <Input
                          id="title"
                          placeholder="Digite o título do FAQ"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => {
                              const IconComponent = categoryIcons[category.id] || BookOpen
                              return (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4 text-blue-600" />
                                    <span>{category.name}</span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Descreva o problema e a solução"
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                        />
                      </div>

                      <ImageUpload onImagesSelected={handleImagesSelected} initialImages={formData.images} />

                      <div className="grid gap-2">
                        <Label htmlFor="author">Autor</Label>
                        <Select value={formData.author} onValueChange={(value) => handleInputChange("author", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o autor" />
                          </SelectTrigger>
                          <SelectContent>
                            {autores.map((autor) => (
                              <SelectItem key={autor.id} value={autor.name}>
                                {autor.name}
                              </SelectItem>
                            ))}
                            {autores.length === 0 && (
                              <SelectItem value="default" disabled>
                                Nenhum autor cadastrado
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="pt-2 border-t">
                    <Button type="submit" onClick={handleSubmit} disabled={!formData.title || !formData.category}>
                      Salvar FAQ
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ❌ REMOVIDO: TabsContent value="speds" */}
      </Tabs>
    </div>
  )
}
