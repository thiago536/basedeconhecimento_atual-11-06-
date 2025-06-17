import { createClient } from "@supabase/supabase-js"

// Types for our database tables
export type FAQ = {
  id: number
  title: string
  category: string
  description: string
  author?: string
  images?: any[]
  created_at: string
}

export type Pendencia = {
  id: number
  titulo: string
  descricao: string
  status: "nao-concluido" | "em-andamento" | "concluido"
  urgente: boolean
  data: string
  author?: string
}

// Atualizar a interface Acesso para remover adquirente
export type Acesso = {
  id: number
  posto: string
  maquina: string
  usuario: string
  senha: string
  adquirente?: string; // Adicionado de volta, pois é usado no componente e no banco
  trabalho_andamento?: string; // Alterado para opcional
  status_maquininha?: string; // Alterado para opcional
  expandido?: boolean; // Adicionado para o controle de expansão da linha na tabela
  created_at?: string; // Adicionado para consistência se necessário para ordenação
}

export type Author = {
  id: number
  name: string
  created_at: string
}

// Create a single supabase client for the browser
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

// Create a server-side Supabase client
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  return createClient(supabaseUrl, supabaseServiceKey)
}
