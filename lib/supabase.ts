import { createClient as createBrowserClient } from '@/utils/supabase/client'

// --- Deprecated default export (Migration Layer) ---
// This ensures existing code using "import { supabase } from '@/lib/supabase'" continues to work
// but now uses the proper Browser Client with auth support.
export const supabase = createBrowserClient()

// --- Utility function ---
export function isSupabaseConfigured(): boolean {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== "" && supabaseAnonKey !== "")
}

// --- Types (Preserved) ---
export interface FAQ {
    id: string
    title: string
    description: string
    category: string
    tags?: string[]
    author?: string | null
    images?: any[]
    created_at: string
    updated_at?: string
    // Legacy fields (optional)
    pergunta?: string
    resposta?: string
    image_url?: string
    image_path?: string
}

export interface Author {
    id: string
    name: string
    email?: string
    avatar_url?: string
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
