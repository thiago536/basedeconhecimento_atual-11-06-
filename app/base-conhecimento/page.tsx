"use client"

import { useEffect, useState, useTransition, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { useAudioFeedback } from "@/hooks/use-audio-feedback"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, type FAQ, type Author } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import { ImageUpload, type ImageWithMetadata } from "@/components/image-upload"
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
} from "@/components/ui/alert-dialog"
import { PlusCircle, Search, Settings, Trash2, Link, Info } from "lucide-react"
import { containsUrls, extractUrls, convertUrlsToLinks } from "@/lib/text-utils"

// --- Componente de Formulário Reutilizável ---
function FaqForm({
  faq,
  onSave,
  onCancel,
  isLoading,
  autores,
}: {
  faq: Partial<FAQ>
  onSave: (faqData: Partial<FAQ>) => void
  onCancel: () => void
  isLoading: boolean
  autores: Author[]
}) {
  const [formData, setFormData] = useState<Partial<FAQ>>({
    ...faq,
    images: Array.isArray(faq.images) ? faq.images : [],
  })

  const handleImagesSelected = useCallback((images: ImageWithMetadata[]) => {
    setFormData((prev) => ({ ...prev, images }))
  }, [])

  const handleChange = (field: keyof Omit<FAQ, "id" | "created_at">, value: string | ImageWithMetadata[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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

  // Detectar URLs na descrição
  const hasUrls = formData.description ? containsUrls(formData.description) : false
  const urlCount = formData.description ? extractUrls(formData.description).length : 0

  return (
    <>
      <DialogHeader>
        <DialogTitle>{formData.id ? "Editar Artigo" : "Adicionar Novo Artigo"}</DialogTitle>
        <DialogDescription>Preencha os detalhes para gerir o artigo na base de conhecimento.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Título do artigo"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Descrição / Conteúdo</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Escreva o conteúdo do artigo aqui... URLs serão automaticamente convertidas em links clicáveis.

Exemplos de URLs que funcionam:
• https://www.exemplo.com
• http://site.com.br
• www.documentacao.com
• github.com/usuario/projeto"
            rows={8}
          />

          {/* Indicador de URLs detectadas */}
          {hasUrls && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Link className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {urlCount} {urlCount === 1 ? "URL detectada" : "URLs detectadas"} -
                {urlCount === 1 ? " será convertida" : " serão convertidas"} em link{urlCount === 1 ? "" : "s"} clicável
                {urlCount === 1 ? "" : "is"} automaticamente
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-1">💡 Dica sobre URLs:</p>
              <p>URLs adicionadas na descrição ficam automaticamente clicáveis na visualização. Suporte para:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>https://exemplo.com</li>
                <li>http://site.com.br</li>
                <li>www.documentacao.com</li>
                <li>github.com/projeto</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="author">Autor</Label>
          <Select value={formData.author || ""} onValueChange={(value) => handleChange("author", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o autor" />
            </SelectTrigger>
            <SelectContent>
              {autores.length > 0 ? (
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
          <Label>Imagens</Label>
          <ImageUpload onImagesSelected={handleImagesSelected} initialImages={formData.images as ImageWithMetadata[]} />
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

// --- Componente Principal da Página ---
export default function BaseConhecimentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [artigos, setArtigos] = useState<FAQ[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [faqEmEdicao, setFaqEmEdicao] = useState<Partial<FAQ> | null>(null)
  const [faqParaRemover, setFaqParaRemover] = useState<FAQ | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { toast } = useToast()
  const { playSuccessSound } = useAudioFeedback()
  const { autores, fetchAutores, subscribeToAutores } = useAppStore()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Test database connection
  const testDatabaseConnection = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("faqs").select("count", { count: "exact", head: true })
      if (error) {
        console.error("Database connection error:", error)
        setConnectionError(`Erro de conexão: ${error.message}`)
        return false
      }
      setConnectionError(null)
      return true
    } catch (error) {
      console.error("Database connection test failed:", error)
      setConnectionError("Falha na conexão com a base de dados")
      return false
    }
  }, [])

  const fetchArtigos = useCallback(async () => {
    setLoading(true)
    setConnectionError(null)

    try {
      // Test connection first
      const isConnected = await testDatabaseConnection()
      if (!isConnected) {
        setLoading(false)
        return
      }

      console.log("Fetching FAQs from database...")
      const { data, error } = await supabase.from("faqs").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching FAQs:", error)
        throw error
      }

      console.log("FAQs fetched successfully:", data?.length || 0, "items")
      setArtigos(data || [])

      // Extract unique categories
      const uniqueCategorias = [...new Set(data?.map((item) => item.category).filter(Boolean))]
      setCategorias(uniqueCategorias as string[])
    } catch (error) {
      console.error("Failed to fetch articles:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      setConnectionError(`Erro ao carregar artigos: ${errorMessage}`)
      toast({
        title: "Erro ao carregar artigos",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, testDatabaseConnection])

  useEffect(() => {
    fetchArtigos()
    fetchAutores()
    const unsubscribe = subscribeToAutores()
    return () => {
      if (typeof unsubscribe === "function") unsubscribe()
    }
  }, [fetchArtigos, fetchAutores, subscribeToAutores])

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearchTerm) {
      params.set("q", debouncedSearchTerm)
    }
    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory)
    }
    startTransition(() => {
      router.replace(`${window.location.pathname}?${params.toString()}`)
    })
  }, [debouncedSearchTerm, selectedCategory, router])

  const handleAbrirForm = (faq?: FAQ) => {
    setFaqEmEdicao(faq ? { ...faq } : {})
    setIsFormOpen(true)
  }

  const handleSalvarFaq = async (faqData: Partial<FAQ>) => {
    if (!faqData.title || !faqData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e Categoria são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      console.log("Saving FAQ:", faqData)

      const faqToSave = {
        title: faqData.title,
        category: faqData.category,
        description: faqData.description || "",
        author: faqData.author || null,
        images: faqData.images || [],
      }

      if (faqData.id) {
        console.log("Updating existing FAQ with ID:", faqData.id)
        const { data, error } = await supabase.from("faqs").update(faqToSave).eq("id", faqData.id).select()

        if (error) {
          console.error("Error updating FAQ:", error)
          throw error
        }

        console.log("FAQ updated successfully:", data)
        toast({ title: "Sucesso", description: "Artigo atualizado com sucesso." })
      } else {
        console.log("Creating new FAQ")
        const { data, error } = await supabase.from("faqs").insert([faqToSave]).select()

        if (error) {
          console.error("Error creating FAQ:", error)
          throw error
        }

        console.log("FAQ created successfully:", data)
        toast({ title: "Sucesso", description: "Novo artigo adicionado." })
      }

      // Play success sound after successful save
      playSuccessSound()

      setIsFormOpen(false)
      fetchArtigos() // Refresh the list
    } catch (error) {
      console.error("Failed to save FAQ:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast({
        title: "Erro ao guardar artigo",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirmarRemocao = async () => {
    if (!faqParaRemover) return

    setProcessing(true)
    try {
      console.log("Deleting FAQ with ID:", faqParaRemover.id)
      const { error } = await supabase.from("faqs").delete().eq("id", faqParaRemover.id)

      if (error) {
        console.error("Error deleting FAQ:", error)
        throw error
      }

      console.log("FAQ deleted successfully")
      toast({ title: "Artigo removido", description: "O artigo foi removido com sucesso." })
      fetchArtigos() // Refresh the list
    } catch (error) {
      console.error("Failed to delete FAQ:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast({
        title: "Erro ao remover",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
      setFaqParaRemover(null)
    }
  }

  const filteredFaqs = useMemo(
    () =>
      artigos.filter((faq) => {
        const matchesSearch =
          (faq.title?.toLowerCase() || "").includes(debouncedSearchTerm.toLowerCase()) ||
          (faq.description?.toLowerCase() || "").includes(debouncedSearchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
        return matchesSearch && matchesCategory
      }),
    [artigos, debouncedSearchTerm, selectedCategory],
  )

  // Show connection error if exists
  if (connectionError) {
    return (
      <main className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Base de Conhecimento</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Encontre artigos, tutoriais e soluções para as suas dúvidas.
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erro de Conexão com a Base de Dados
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{connectionError}</p>
                  <p className="mt-2">Verifique:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Se as variáveis de ambiente estão configuradas corretamente</li>
                    <li>Se a base de dados Supabase está acessível</li>
                    <li>Se a tabela 'faqs' existe na base de dados</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <Button onClick={fetchArtigos} variant="outline" size="sm">
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Base de Conhecimento</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Encontre artigos, tutoriais e soluções para as suas dúvidas.
          </p>
        </div>
        <div className="mb-8 flex flex-col items-center gap-4 md:flex-row">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              className="pl-10 h-11"
              placeholder="Pesquisar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[220px] h-11">
              <SelectValue placeholder="Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="w-full md:w-auto shadow-sm h-11" onClick={() => handleAbrirForm()}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Novo Artigo
          </Button>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-2xl">
            {faqEmEdicao && (
              <FaqForm
                key={faqEmEdicao.id || "new-faq"}
                onSave={handleSalvarFaq}
                onCancel={() => setIsFormOpen(false)}
                isLoading={processing}
                autores={autores}
                faq={faqEmEdicao}
              />
            )}
          </DialogContent>
        </Dialog>
        <AlertDialog open={!!faqParaRemover} onOpenChange={(open) => !open && setFaqParaRemover(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza de que deseja remover o artigo "{faqParaRemover?.title}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleConfirmarRemocao}
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {loading || isPending ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-48 w-full rounded-lg" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((artigo) => {
                // Detectar se o artigo tem URLs na descrição
                const hasUrls = artigo.description ? containsUrls(artigo.description) : false

                return (
                  <Card
                    key={artigo.id}
                    className="flex flex-col h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200/80 dark:border-gray-800/80"
                  >
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="w-fit">
                          {artigo.category}
                        </Badge>
                        {hasUrls && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            Links
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-gray-100">
                        {artigo.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow p-6 pt-0">
                      <div
                        className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400"
                        dangerouslySetInnerHTML={{
                          __html: convertUrlsToLinks(artigo.description || ""),
                        }}
                      />
                    </CardContent>
                    <CardFooter className="p-4 pt-4 bg-gray-50 dark:bg-gray-800/50 mt-auto flex justify-between items-center">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => router.push(`/base-conhecimento/${artigo.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                      <div className="flex">
                        <Button variant="ghost" size="icon" onClick={() => handleAbrirForm(artigo)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setFaqParaRemover(artigo)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full py-16 text-center text-gray-500">
                <p className="text-lg">Nenhum artigo encontrado.</p>
                <p className="mt-1 text-sm">Tente ajustar os seus termos de pesquisa ou filtros.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
