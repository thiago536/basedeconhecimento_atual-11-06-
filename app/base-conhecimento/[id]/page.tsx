import { supabase } from "@/lib/supabase"
import FaqDetailClient from "@/components/faq-detail-client"
import { notFound } from "next/navigation"

export const revalidate = 60

// Gera os parâmetros estáticos para as páginas de FAQ
export async function generateStaticParams() {
  try {
    const { data: faqs } = await supabase.from("faqs").select("id")
    return faqs?.map(({ id }) => ({ id: id.toString() })) || []
  } catch (error) {
    console.error("Failed to generate static params:", error)
    return []
  }
}

// Componente da Página de Detalhes do FAQ (Componente de Servidor)
export default async function FaqDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: faq, error } = await supabase.from("faqs").select("*").eq("id", params.id).single()

  // Se houver um erro ou o faq não for encontrado, mostra a página 404
  if (error || !faq) {
    notFound()
  }

  // Renderiza o componente de cliente, passando os dados do servidor
  return <FaqDetailClient faq={faq} />
}
