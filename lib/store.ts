import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase, type Pendencia, type Acesso, type FAQData, type Autor } from "./supabase"

export interface ImageWithMetadata {
  src: string
  title: string
  description: string
}

interface AppState {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  faqs: FAQData[]
  setFaqs: (faqs: FAQData[]) => void
  addFaq: (faq: Omit<FAQData, "id" | "created_at">) => Promise<void>
  updateFaq: (id: number, faq: Partial<FAQData>) => Promise<void>
  deleteFaq: (id: number) => Promise<void>
  subscribeToFaqs: () => () => void
  autores: Autor[]
  setAutores: (autores: Autor[]) => void
  addAutor: (nome: string) => Promise<void>
  removeAutor: (id: number) => Promise<void>
  fetchAutores: () => Promise<void>
  subscribeToAutores: () => () => void
  acessos: Acesso[]
  setAcessos: (acessos: Acesso[]) => void
  addAcesso: (acesso: Omit<Acesso, "id" | "expandido" | "created_at">) => Promise<void>
  updateAcesso: (id: number, acesso: Partial<Acesso>) => Promise<void>
  deleteAcesso: (id: number) => Promise<void>
  subscribeToAcessos: () => () => void
  pendencias: Pendencia[]
  setPendencias: (pendencias: Pendencia[]) => void
  addPendencia: (pendencia: Omit<Pendencia, "id" | "status">) => Promise<void>
  updatePendenciaStatus: (id: number, status: string) => Promise<void>
  deletePendencia: (id: number) => Promise<void>
  subscribeToPendencias: () => () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // FAQs
      faqs: [],
      setFaqs: (faqs) => set({ faqs }),
      addFaq: async (faq) => {
        const { error } = await supabase.from("faqs").insert({
          ...faq,
          images: faq.images ? JSON.stringify(faq.images) : null,
        })
        if (error) throw error
      },
      updateFaq: async (id, faq) => {
        const updateData: any = { ...faq }
        if (faq.images !== undefined) {
          updateData.images = faq.images ? JSON.stringify(faq.images) : null
        }
        const { error } = await supabase.from("faqs").update(updateData).eq("id", id)
        if (error) throw error
      },
      deleteFaq: async (id) => {
        const { error } = await supabase.from("faqs").delete().eq("id", id)
        if (error) throw error
        set((state) => ({ faqs: state.faqs.filter((f) => f.id !== id) }))
      },
      subscribeToFaqs: () => {
        try {
          const channel = supabase
            .channel("faqs-public-subscription")
            .on("postgres_changes", { event: "*", schema: "public", table: "faqs" }, async () => {
              const { data, error } = await supabase.from("faqs").select("*").order("created_at", { ascending: false })
              if (!error && data) {
                const transformed = data.map((faq) => ({
                  ...faq,
                  images: faq.images && typeof faq.images === "string" ? JSON.parse(faq.images) : faq.images || [],
                }))
                set({ faqs: transformed })
              }
            })
            .subscribe()
          return () => {
            supabase.removeChannel(channel)
          }
        } catch (error) {
          console.error("Error setting up faqs subscription:", error)
          return () => {}
        }
      },

      // Autores
      autores: [],
      setAutores: (autores) => set({ autores }),
      fetchAutores: async () => {
        const { data, error } = await supabase.from("authors").select("*").order("name")
        if (error) throw error
        set({ autores: data || [] })
      },
      addAutor: async (nome) => {
        const { error } = await supabase.from("authors").insert({ name: nome })
        if (error) throw error
      },
      removeAutor: async (id) => {
        const { error } = await supabase.from("authors").delete().eq("id", id)
        if (error) throw error
        set((state) => ({ autores: state.autores.filter((a) => a.id !== id) }))
      },
      subscribeToAutores: () => {
        try {
          const channel = supabase
            .channel("authors-public-subscription")
            .on("postgres_changes", { event: "*", schema: "public", table: "authors" }, () => get().fetchAutores())
            .subscribe()
          return () => {
            supabase.removeChannel(channel)
          }
        } catch (error) {
          console.error("Error setting up authors subscription:", error)
          return () => {}
        }
      },

      // Acessos
      acessos: [],
      setAcessos: (acessos) => set({ acessos }),
      addAcesso: async (acesso) => {
        const { error } = await supabase.from("acessos").insert(acesso)
        if (error) throw error
      },
      updateAcesso: async (id, acesso) => {
        const { error } = await supabase.from("acessos").update(acesso).eq("id", id)
        if (error) throw error
      },
      deleteAcesso: async (id) => {
        const { error } = await supabase.from("acessos").delete().eq("id", id)
        if (error) throw error
        set((state) => ({
          acessos: state.acessos.filter((acesso) => acesso.id !== id),
        }))
      },
      subscribeToAcessos: () => {
        try {
          const channel = supabase
            .channel("acessos-public-subscription")
            .on("postgres_changes", { event: "*", schema: "public", table: "acessos" }, async () => {
              const { data, error } = await supabase
                .from("acessos")
                .select("*")
                .order("created_at", { ascending: false })
              if (!error) set({ acessos: data.map((a) => ({ ...a, expandido: false })) })
            })
            .subscribe()
          return () => {
            supabase.removeChannel(channel)
          }
        } catch (error) {
          console.error("Error setting up acessos subscription:", error)
          return () => {}
        }
      },

      // Pendências
      pendencias: [],
      setPendencias: (pendencias) => set({ pendencias }),
      addPendencia: async (pendencia) => {
        const { error } = await supabase.from("pendencias").insert({ ...pendencia, status: "nao-concluido" })
        if (error) throw error
      },
      updatePendenciaStatus: async (id, status) => {
        const { error } = await supabase.from("pendencias").update({ status }).eq("id", id)
        if (error) throw error
      },
      deletePendencia: async (id) => {
        const { error } = await supabase.from("pendencias").delete().eq("id", id)
        if (error) throw error
        set((state) => ({ pendencias: state.pendencias.filter((p) => p.id !== id) }))
      },
      subscribeToPendencias: () => {
        try {
          const channel = supabase
            .channel("pendencias-public-subscription")
            .on("postgres_changes", { event: "*", schema: "public", table: "pendencias" }, async () => {
              const { data, error } = await supabase.from("pendencias").select("*").order("data", { ascending: false })
              if (!error) {
                set({ pendencias: data || [] })
              }
            })
            .subscribe()
          return () => {
            supabase.removeChannel(channel)
          }
        } catch (error) {
          console.error("Error setting up pendencias subscription:", error)
          return () => {}
        }
      },
    }),
    {
      name: "e-prosys-storage",
      partialize: (state) => ({
        theme: state.theme,
      }),
    },
  ),
)
