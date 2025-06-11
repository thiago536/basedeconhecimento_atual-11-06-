// lib/store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getSupabaseClient } from "./supabase"
import type { Pendencia, Acesso } from "./supabase"

export interface ImageWithMetadata {
  src: string
  title: string
  description: string
}

export interface FAQData {
  id: number
  title: string
  category: string
  description: string
  author?: string
  images?: ImageWithMetadata[]
}

export interface Autor {
  id: number
  name: string
}

interface AppState {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  
  faqs: FAQData[]
  setFaqs: (faqs: FAQData[]) => void
  addFaq: (faq: Omit<FAQData, "id">) => Promise<void>
  deleteFaq: (id: number) => Promise<void>
  getFaqsByCategory: (category: string) => FAQData[]
  addImageToFaq: (faqId: number, image: ImageWithMetadata) => Promise<void>
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
  addPendencia: (pendencia: Omit<Pendencia, "id">) => Promise<void>
  updatePendenciaStatus: (id: number, status: string) => Promise<void>
  deletePendencia: (id: number) => Promise<void>
  subscribeToPendencias: () => () => void
}

const createAppStore = () => create<AppState>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),

      faqs: [],
      setFaqs: (faqs) => set({ faqs }),
      
      addFaq: async (faq) => {
        const supabase = getSupabaseClient()
        const imagesJson = faq.images ? JSON.stringify(faq.images) : null
        const { error } = await supabase
          .from("faqs")
          .insert({
            title: faq.title,
            category: faq.category,
            description: faq.description,
            author: faq.author || null,
            images: imagesJson,
          })
          .select()
        if (error) {
          console.error("Error adding FAQ:", error)
          throw error
        }
      },
      
      deleteFaq: async (id) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("faqs").delete().eq("id", id)
        if (error) {
          console.error("Error deleting FAQ:", error)
          throw error
        }
      },
      
      getFaqsByCategory: (category) => {
        const { faqs } = get()
        return category === "all" ? faqs : faqs.filter((faq) => faq.category === category)
      },
      
      addImageToFaq: async (faqId, image) => {
        const supabase = getSupabaseClient()
        const { faqs } = get()
        const faq = faqs.find((f) => f.id === faqId)
        if (!faq) return
        const updatedImages = [...(faq.images || []), image]
        const { error } = await supabase
          .from("faqs")
          .update({
            images: JSON.stringify(updatedImages),
          })
          .eq("id", faqId)
        if (error) {
          console.error("Error updating FAQ images:", error)
          throw error
        }
      },
      
      subscribeToFaqs: () => {
        const supabase = getSupabaseClient()
        const subscription = supabase
          .channel("faqs-changes")
          .on("postgres_changes", { event: "*", schema: "public", table: "faqs" }, async () => {
            const { data, error } = await supabase.from("faqs").select("*").order("created_at", { ascending: false })
            if (error) {
              console.error("Error fetching FAQs:", error)
              return
            }
            const transformedFaqs = data.map((faq) => ({
              id: faq.id,
              title: faq.title,
              category: faq.category,
              description: faq.description,
              author: faq.author,
              images: faq.images ? JSON.parse(faq.images) : [],
            }))
            set({ faqs: transformedFaqs })
          })
          .subscribe()
        return () => {
          supabase.removeChannel(subscription)
        }
      },

      // Continue com os outros métodos...
      autores: [],
      setAutores: (autores) => set({ autores }),
      
      addAutor: async (nome) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("authors").insert({ name: nome })
        if (error) {
          console.error("Error adding author:", error)
          throw error
        }
      },
      
      removeAutor: async (id) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("authors").delete().eq("id", id)
        if (error) {
          console.error("Error removing author:", error)
          throw error
        }
      },
      
      fetchAutores: async () => {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.from("authors").select("*").order("name", { ascending: true })
        if (error) {
          console.error("Error fetching authors:", error)
          throw error
        }
        const transformedAutores = data.map((autor) => ({
          id: autor.id,
          name: autor.name,
        }))
        set({ autores: transformedAutores })
      },
      
      subscribeToAutores: () => {
        const supabase = getSupabaseClient()
        const subscription = supabase
          .channel("authors-changes")
          .on("postgres_changes", { event: "*", schema: "public", table: "authors" }, async () => {
            const { data, error } = await supabase.from("authors").select("*").order("name", { ascending: true })
            if (error) {
              console.error("Error fetching authors:", error)
              return
            }
            const transformedAutores = data.map((autor) => ({
              id: autor.id,
              name: autor.name,
            }))
            set({ autores: transformedAutores })
          })
          .subscribe()
        return () => {
          supabase.removeChannel(subscription)
        }
      },

      // Acessos
      acessos: [],
      setAcessos: (acessos) => set({ acessos }),
      
      addAcesso: async (acesso) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("acessos").insert({
          posto: acesso.posto,
          maquina: acesso.maquina,
          usuario: acesso.usuario,
          senha: acesso.senha,
          trabalho_andamento: acesso.trabalho_andamento || "",
          status_maquininha: acesso.status_maquininha || "",
        })
        if (error) {
          console.error("Error adding acesso:", error)
          throw error
        }
      },
      
      updateAcesso: async (id, acesso) => {
        const supabase = getSupabaseClient()
        const updateData: any = {}
        if (acesso.posto) updateData.posto = acesso.posto
        if (acesso.maquina) updateData.maquina = acesso.maquina
        if (acesso.usuario) updateData.usuario = acesso.usuario
        if (acesso.senha) updateData.senha = acesso.senha
        if (acesso.trabalho_andamento !== undefined) updateData.trabalho_andamento = acesso.trabalho_andamento
        if (acesso.status_maquininha !== undefined) updateData.status_maquininha = acesso.status_maquininha
        const { error } = await supabase.from("acessos").update(updateData).eq("id", id)
        if (error) {
          console.error("Error updating acesso:", error)
          throw error
        }
      },
      
      deleteAcesso: async (id) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("acessos").delete().eq("id", id)
        if (error) {
          console.error("Error deleting acesso:", error)
          throw error
        }
      },
      
      subscribeToAcessos: () => {
        const supabase = getSupabaseClient()
        const subscription = supabase
          .channel("acessos-changes")
          .on("postgres_changes", { event: "*", schema: "public", table: "acessos" }, async () => {
            const { data, error } = await supabase.from("acessos").select("*").order("created_at", { ascending: false })
            if (error) {
              console.error("Error fetching acessos:", error)
              return
            }
            const transformedAcessos = data.map((acesso) => ({
              id: acesso.id,
              posto: acesso.posto,
              maquina: acesso.maquina,
              usuario: acesso.usuario,
              senha: acesso.senha,
              trabalho_andamento: acesso.trabalho_andamento || "",
              status_maquininha: acesso.status_maquininha || "",
              expandido: false,
            }) as Acesso)
            set({ acessos: transformedAcessos })
          })
          .subscribe()
        return () => {
          supabase.removeChannel(subscription)
        }
      },

      // Pendências
      pendencias: [],
      setPendencias: (pendencias) => set({ pendencias }),
      
      addPendencia: async (pendencia) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("pendencias").insert({
          titulo: pendencia.titulo,
          descricao: pendencia.descricao,
          status: pendencia.status,
          urgente: pendencia.urgente,
          data: pendencia.data,
          author: pendencia.author || null,
        })
        if (error) {
          console.error("Error adding pendencia:", error)
          throw error
        }
      },
      
      updatePendenciaStatus: async (id, status) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("pendencias").update({ status }).eq("id", id)
        if (error) {
          console.error("Error updating pendencia status:", error)
          throw error
        }
      },
      
      deletePendencia: async (id) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("pendencias").delete().eq("id", id)
        if (error) {
          console.error("Error deleting pendencia:", error)
          throw error
        }
      },
      
      subscribeToPendencias: () => {
        const supabase = getSupabaseClient()
        const subscription = supabase
          .channel("pendencias-changes")
          .on("postgres_changes", { event: "*", schema: "public", table: "pendencias" }, async () => {
            const { data, error } = await supabase.from("pendencias").select("*").order("data", { ascending: false })
            if (error) {
              console.error("Error fetching pendencias:", error)
              return
            }
            set({ pendencias: data as Pendencia[] })
          })
          .subscribe()
        return () => {
          supabase.removeChannel(subscription)
        }
      },
    }),
    {
      name: "e-prosys-storage",
      partialize: (state) => {
        const stateToPersist = { ...state }
        delete (stateToPersist as any).theme
        delete (stateToPersist as any).setTheme
        if (stateToPersist.faqs) {
          stateToPersist.faqs = stateToPersist.faqs.map((faq) => {
            const { images, ...restOfFaq } = faq
            return restOfFaq
          })
        }
        return stateToPersist
      },
    },
  ),
)

export const useAppStore = createAppStore()
