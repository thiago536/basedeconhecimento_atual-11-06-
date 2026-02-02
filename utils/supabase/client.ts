import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern to prevent multiple GoTrueClient instances
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
    if (client) return client

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    )

    return client
}
