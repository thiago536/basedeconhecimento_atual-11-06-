"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { useAudioFeedback } from "@/hooks/use-audio-feedback"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, type FAQ } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { PlusCircle, Search, Settings, Trash2, Link, Calendar as CalendarIcon, User, Filter } from "lucide-react"
import { containsUrls, convertUrlsToLinks } from "@/lib/text-utils"
import { FaqForm } from "@/components/faq-form"
import { FAQ_CATEGORIES } from "@/lib/constants"
import Fuse from "fuse.js"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function BaseConhecimentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [artigos, setArtigos] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [faqEmEdicao, setFaqEmEdicao] = useState<Partial<FAQ> | null>(null)
  const [faqParaRemover, setFaqParaRemover] = useState<FAQ | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { toast } = useToast()
  const { playSuccessSound } = useAudioFeedback()
  const { autores, fetchAutores, subscribeToAutores } = useAppStore()

  // Filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [selectedAuthor, setSelectedAuthor] = useState("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Test database connection
  const testDatabaseConnection = useCallback(async () => {
    try {
      const { error } = await supabase.from("faqs").select("count", { count: "exact", head: true })
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

  // Initialize data on mount
  useEffect(() => {
    fetchArtigos()
    fetchAutores()
    const unsubscribe = subscribeToAutores()
    return () => {
      if (typeof unsubscribe === "function") unsubscribe()
    }
  }, [])

  // Check for editId in URL
  useEffect(() => {
    const editId = searchParams.get("editId")
    if (editId && artigos.length > 0) {
      const faqToEdit = artigos.find((a) => a.id === editId)
      if (faqToEdit) {
        handleAbrirForm(faqToEdit)
        // Clean URL
        const params = new URLSearchParams(searchParams.toString())
        params.delete("editId")
        router.replace(`${window.location.pathname}?${params.toString()}`)
      }
    }
  }, [searchParams, artigos, router])

  // Update URL when search/filter changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearchTerm) params.set("q", debouncedSearchTerm)
    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory)

    // Note: Not storing Date/Author in URL for now to keep it simple, but could be added

    const newUrl = `${window.location.pathname}?${params.toString()}`
    if (window.location.href !== window.location.origin + newUrl) {
      router.replace(newUrl)
    }
  }, [debouncedSearchTerm, selectedCategory, router])

  const handleAbrirForm = useCallback((faq?: FAQ) => {
    setFaqEmEdicao(faq ? { ...faq } : {})
    setIsFormOpen(true)
  }, [])

  const handleSalvarFaq = useCallback(
    async (faqData: Partial<FAQ>) => {
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
        const faqToSave = {
          title: faqData.title,
          category: faqData.category,
          description: faqData.description || "",
          author: faqData.author || null,
          images: faqData.images || [],
        }

        if (faqData.id) {
          const { error } = await supabase.from("faqs").update(faqToSave).eq("id", faqData.id)
          if (error) throw error
          toast({ title: "Sucesso", description: "Artigo atualizado com sucesso." })
        } else {
          const { error } = await supabase.from("faqs").insert([faqToSave])
          if (error) throw error
          toast({ title: "Sucesso", description: "Novo artigo adicionado." })
        }

        playSuccessSound()
        setIsFormOpen(false)
        fetchArtigos()
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
    },
    [toast, playSuccessSound, fetchArtigos],
  )

  const handleConfirmarRemocao = useCallback(async () => {
    if (!faqParaRemover) return

    setProcessing(true)
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", faqParaRemover.id)
      if (error) throw error
      toast({ title: "Artigo removido", description: "O artigo foi removido com sucesso." })
      fetchArtigos()
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
  }, [faqParaRemover, toast, fetchArtigos])

  // Configuração do Fuse.js para busca Fuzzy
  const fuse = useMemo(() => {
    return new Fuse(artigos, {
      keys: ['title', 'description', 'category'],
      threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
      includeScore: true
    })
  }, [artigos])

  const filteredFaqs = useMemo(() => {
    let results = artigos

    // 1. Busca Fuzzy (se houver termo)
    if (debouncedSearchTerm) {
      const fuseResults = fuse.search(debouncedSearchTerm)
      results = fuseResults.map(result => result.item)
    }

    // 2. Filtros
    return results.filter((faq) => {
      // Categoria
      if (selectedCategory !== "all" && faq.category !== selectedCategory) return false

      // Autor
      if (selectedAuthor !== "all" && faq.author !== selectedAuthor) return false

      // Data
      if (dateRange.from) {
        const faqDate = new Date(faq.created_at)
        faqDate.setHours(0, 0, 0, 0)
        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)

        if (faqDate < fromDate) return false
      }
      if (dateRange.to) {
        const faqDate = new Date(faq.created_at)
        faqDate.setHours(0, 0, 0, 0)
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999)

        if (faqDate > toDate) return false
      }

      return true
    })
  }, [artigos, debouncedSearchTerm, selectedCategory, selectedAuthor, dateRange, fuse])

  const getCategoryName = useCallback((categoryId: string) => {
    const category = FAQ_CATEGORIES.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }, [])

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
              {/* Error Icon */}
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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

        {/* --- Toolbar de Busca e Filtros --- */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                className="pl-10 h-11"
                placeholder="Pesquisar artigos (Busca inteligente)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button className="w-full md:w-auto shadow-sm h-11" onClick={() => handleAbrirForm()}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Novo Artigo
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtros:</span>
            </div>

            {/* Filtro: Categoria */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {FAQ_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro: Data */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal h-9",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Filtrar por data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range: any) => setDateRange(range || {})}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {/* Filtro: Autor */}
            <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
              <SelectTrigger className="w-[180px] h-9">
                <User className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Autor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Autores</SelectItem>
                {autores.map((autor) => (
                  <SelectItem key={autor.id} value={autor.name}>
                    {autor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Limpar Filtros */}
            {(selectedCategory !== "all" || selectedAuthor !== "all" || dateRange.from || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 ml-auto text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSelectedCategory("all")
                  setSelectedAuthor("all")
                  setDateRange({})
                  setSearchTerm("")
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
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

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-48 w-full rounded-lg" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((artigo) => {
                const hasUrls = artigo.description ? containsUrls(artigo.description) : false

                return (
                  <Card
                    key={artigo.id}
                    className="flex flex-col h-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-gray-200/80 dark:border-gray-800/80"
                  >
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="w-fit">
                          {getCategoryName(artigo.category)}
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
                <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium">Nenhum artigo encontrado.</p>
                <p className="mt-1 text-sm text-gray-400">
                  Tente ajustar os termos de pesquisa ou remover alguns filtros.
                </p>
                {(selectedCategory !== "all" || selectedAuthor !== "all" || dateRange.from || searchTerm) && (
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => {
                      setSelectedCategory("all")
                      setSelectedAuthor("all")
                      setDateRange({})
                      setSearchTerm("")
                    }}
                  >
                    Limpar todos os filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
