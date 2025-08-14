import { createClient } from "@supabase/supabase-js"

// ============================================================================
// TIPOS DO BANCO DE DADOS (DATABASE TYPES)
// Manter os tipos aqui ajuda a garantir que os dados do seu app
// estão consistentes com a estrutura do seu banco.
// ============================================================================

export type FAQ = {
  id: number
  title: string
  category: string
  description: string
  author?: string
  images?: any[]
  created_at: string
}

// Alias para compatibilidade
export type FAQData = FAQ

export type Pendencia = {
  id: number
  titulo: string
  descricao: string
  status: "nao-concluido" | "em-andamento" | "concluido"
  urgente: boolean
  data: string
  author?: string
}

export type Acesso = {
  id: number
  posto: string
  maquina: string
  usuario: string
  senha: string
  adquirente?: string
  trabalho_andamento?: string
  status_maquininha?: string
  expandido?: boolean
  created_at?: string
}

export type Author = {
  id: number
  name: string
  created_at: string
}

// Alias para compatibilidade
export type Autor = Author

// ============================================================================
// CRIAÇÃO DO CLIENTE SUPABASE (CLIENT-SIDE)
// ============================================================================

// Pega as variáveis de ambiente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verifica se as variáveis de ambiente foram definidas no seu arquivo .env.local.
// Se não, lança um erro claro, o que facilita MUITO a depuração.
if (!supabaseUrl) {
  throw new Error(
    "ERRO CRÍTICO: A variável de ambiente NEXT_PUBLIC_SUPABASE_URL não está definida. Verifique seu arquivo .env.local",
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    "ERRO CRÍTICO: A variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida. Verifique seu arquivo .env.local",
  )
}

// Cria e exporta uma ÚNICA instância do cliente Supabase para ser usada
// em todo o lado do cliente (no navegador).
// Esta é a maneira moderna e recomendada.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable auth for this app
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-my-custom-header": "e-prosys-app",
    },
  },
})

// Test database connection function
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("base_conhecimento").select("count", { count: "exact", head: true })
    if (error) {
      console.error("Database connection test failed:", error)
      return { success: false, error: error.message }
    }
    console.log("Database connection test successful")
    return { success: true, count: data }
  } catch (error) {
    console.error("Database connection test error:", error)
    return { success: false, error: "Connection failed" }
  }
}

// Função para verificar todas as tabelas disponíveis
export async function checkTables() {
  const tables = ["base_conhecimento", "acessos", "pendencias", "faqs"]
  const results = {}

  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

      if (error) {
        console.log(`Tabela ${table}: ERRO -`, error.message)
        results[table] = { exists: false, count: 0, error: error.message }
      } else {
        console.log(`Tabela ${table}: ${count} registros`)
        results[table] = { exists: true, count: count || 0 }
      }
    } catch (err) {
      console.log(`Tabela ${table}: ERRO -`, err)
      results[table] = { exists: false, count: 0, error: err.message }
    }
  }

  return results
}
