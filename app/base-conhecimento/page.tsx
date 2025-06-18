"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// CORREÇÃO: Importa o cliente 'supabase' e o tipo 'FAQ'.
import { supabase, type FAQ } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// A função para parsear as tags continua útil.
const parseTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === 'string') {
    const cleanedTags = tags.replace(/[{}]/g, "");
    if (cleanedTags === "") return [];
    return cleanedTags.split(',').map(tag => tag.trim());
  }
  return [];
};

export default function BaseConhecimentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // O estado agora armazena os artigos do tipo FAQ.
  const [artigos, setArtigos] = useState<FAQ[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchArtigosECategorias = async () => {
      setLoading(true);

      // CORREÇÃO: Altera o nome da tabela para "faqs".
      let query = supabase.from("faqs").select("*");

      if (debouncedSearchTerm) {
        // CORREÇÃO: Busca nos campos corretos 'title' e 'description'.
        query = query.or(
          `title.fts.${debouncedSearchTerm},description.fts.${debouncedSearchTerm}`
        );
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data: artigosData, error: artigosError } = await query.order(
        "created_at",
        { ascending: false }
      );

      // CORREÇÃO: Altera o nome da tabela para "faqs" para buscar categorias.
      const { data: categoriasData, error: categoriasError } = await supabase
        .from("faqs")
        .select("category");

      if (artigosError) {
        console.error("Erro ao buscar artigos:", artigosError);
      } else if (artigosData) {
        // Assume que a coluna 'tags' pode existir e faz o parse dela.
        const parsedArtigos = artigosData.map((artigo) => ({
          ...artigo,
          tags: parseTags((artigo as any).tags), 
        }));
        setArtigos(parsedArtigos);
      }

      if (categoriasError) {
        console.error("Erro ao buscar categorias:", categoriasError);
      } else if (categoriasData) {
        const uniqueCategorias = [
          ...new Set(categoriasData.map((item) => item.category)),
        ];
        setCategorias(uniqueCategorias as string[]);
      }

      setLoading(false);
    };

    fetchArtigosECategorias();
  }, [debouncedSearchTerm, selectedCategory]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedSearchTerm) {
      params.set("q", debouncedSearchTerm);
    } else {
      params.delete("q");
    }

    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    startTransition(() => {
      router.replace(`${window.location.pathname}?${params.toString()}`);
    });
  }, [debouncedSearchTerm, selectedCategory, router]);

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Base de Conhecimento</h1>
        <p className="text-muted-foreground">
          Encontre artigos, tutoriais e soluções para suas dúvidas.
        </p>
      </div>

      <div className="mb-6 flex flex-col items-center gap-4 md:flex-row">
        <Input
          className="flex-1"
          placeholder="Pesquisar artigos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
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
        <Button className="w-full md:w-auto">Novo Artigo</Button>
      </div>

      {loading || isPending ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="mt-2 h-4 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="mt-2 h-4 w-5/6" /></CardContent>
              <CardFooter><Skeleton className="h-6 w-1/4" /></CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {artigos.length > 0 ? (
            artigos.map((artigo) => (
              <Card
                key={artigo.id}
                className="flex cursor-pointer flex-col transition-all hover:shadow-lg"
                onClick={() => router.push(`/base-conhecimento/${artigo.id}`)}
              >
                <CardHeader>
                  {/* CORREÇÃO: Usa os campos corretos do tipo FAQ */}
                  <CardTitle>{artigo.title}</CardTitle>
                  <CardDescription>{artigo.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {artigo.description}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-4">
                  {(artigo as any).tags && (artigo as any).tags.filter((tag: string) => tag).map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p>Nenhum artigo encontrado para os filtros selecionados.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
