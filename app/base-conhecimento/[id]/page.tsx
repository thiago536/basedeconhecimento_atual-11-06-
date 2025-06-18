import { supabase, type FAQ } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqDetailClient } from "@/components/faq-detail-client"; // Importa o novo componente de cliente

// Esta função de servidor busca os dados do FAQ
async function getFaqDetails(id: string): Promise<FAQ | null> {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(`Erro ao buscar detalhes do FAQ #${id}:`, error);
    return null;
  }

  return data as FAQ;
}

// A página em si agora é muito mais simples
export default async function FaqDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const faq = await getFaqDetails(params.id);

  if (!faq) {
    notFound();
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/base-conhecimento"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Base de Conhecimento
        </Link>
        
        {/* Renderiza o Componente de Cliente, passando os dados do FAQ */}
        <FaqDetailClient faq={faq} />
      </div>
    </main>
  );
}
