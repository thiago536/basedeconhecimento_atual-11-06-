import { createClient } from "@supabase/supabase-js"

// Função para verificar se o Supabase está configurado
export function isSupabaseConfigured(): boolean {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== "" && supabaseAnonKey !== "")
}

// Configuração do Supabase com valores padrão para evitar erros
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// ✅ Configuração com auth para prevenir AbortError
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,    // Desabilita persistência de sessão
        autoRefreshToken: false,  // Desabilita auto-refresh
        detectSessionInUrl: false // Desabilita detecção de sessão na URL
    }
})

// Tipos para as tabelas
export interface FAQ {
    id: string
    pergunta: string
    resposta: string
    categoria: string
    tags: string[]
    created_at: string
    updated_at: string
    image_url?: string
    image_path?: string
}

export interface Posto {
    id: string
    nome: string
    url: string
    created_at: string
}

export interface AccessRecord {
    id: string
    user_name: string
    access_type: string
    timestamp: string
    details?: string
}

export interface PendingItem {
    id: string
    title: string
    description: string
    priority: "low" | "medium" | "high"
    status: "pending" | "in_progress" | "completed"
    created_at: string
    due_date?: string
}
