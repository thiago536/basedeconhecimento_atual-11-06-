"use client"

import FaqDetailClient from "@/components/faq-detail-client"
import type { FAQ } from "@/lib/supabase"

interface FaqDetailPageClientProps {
  faq: FAQ
}

export default function FaqDetailPageClient({ faq }: FaqDetailPageClientProps) {
  return <FaqDetailClient faq={faq} />
}
