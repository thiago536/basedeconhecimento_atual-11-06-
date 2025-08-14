import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: "public",
  },
})

// Tipos para as tabelas
export interface FAQ {
  id: number
  title: string
  category: string
  description: string
  created_at: string
  updated_at: string
  image_url?: string
}

export interface Acesso {
  id: number
  sistema: string
  usuario: string
  senha: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface Pendencia {
  id: number
  titulo: string
  descricao?: string
  status: "nao-concluido" | "em-andamento" | "concluido"
  created_at: string
  updated_at: string
}

// Função para verificar tabelas existentes
export async function checkTables() {
  try {
    const tables = ["base_conhecimento", "acessos", "pendencias"]
    const results: Record<string, boolean> = {}

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1)
        results[table] = !error
      } catch {
        results[table] = false
      }
    }

    return results
  } catch (error) {
    console.error("Erro ao verificar tabelas:", error)
    return {}
  }
}

// Função para testar conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("base_conhecimento").select("count").limit(1)
    return { success: !error, error: error?.message }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
