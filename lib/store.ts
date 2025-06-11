import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getSupabaseClient } from "./supabase"
import type { Pendencia, Acesso } from "./supabase"

// Definição dos tipos
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

// Interface AppState LIMPA (sem SPED)
interface AppState {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
  
  // FAQs
  faqs: FAQData[]
  setFaqs: (faqs: FAQData[]) => void
  addFaq: (faq: Omit<FAQData, "id">) => Promise<void>
  updateFaq: (id: number, faq: Partial<FAQData>) => Promise<void>
  deleteFaq: (id: number) => Promise<void>
  getFaqById: (id: number) => FAQData | undefined
  getFaqsByCategory: (category: string) => FAQData[]
  addImageToFaq: (faqId: number, image: ImageWithMetadata) => Promise<void>
  subscribeToFaqs: () => () => void
  
  // Autores
  autores: Autor[]
  setAutores: (autores: Autor[]) => void
  addAutor: (nome: string) => Promise<void>
  removeAutor: (id: number) => Promise<void>
  fetchAutores: () => Promise<void>
  subscribeToAutores: () => () => void
  
  // Acessos
  acessos: Acesso[]
  setAcessos: (acessos: Acesso[]) => void
  addAcesso: (acesso: Omit<Acesso, "id" | "expandido" | "created_at">) => Promise<void>
  updateAcesso: (id: number, acesso: Partial<Acesso>) => Promise<void>
  deleteAcesso: (id: number) => Promise<void>
  subscribeToAcessos: () => () => void
  
  // Pendências
  pendencias: Pendencia[]
  setPendencias: (pendencias: Pendencia[]) => void
  addPendencia: (pendencia: Omit<Pendencia, "id">) => Promise<void>
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
        try {
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
          if (error) throw error
        } catch (error) {
          console.error("Error in addFaq:", error)
          throw error
        }
      },

      updateFaq: async (id, faq) => {
        try {
          const supabase = getSupabaseClient()
          const updateData: any = {}
          
          if (faq.title !== undefined) updateData.title = faq.title
          if (faq.category !== undefined) updateData.category = faq.category
          if (faq.description !== undefined) updateData.description = faq.description
          if (faq.author !== undefined) updateData.author = faq.author
          if (faq.images !== undefined) updateData.images = JSON.stringify(faq.images)
          
          const { error } = await supabase
            .from("faqs")
            .update(updateData)
            .eq("id", id)
            
          if (error) throw error
        } catch (error) {
          console.error("Error in updateFaq:", error)
          throw error
        }
      },
      
      deleteFaq: async (id) => {
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase.from("faqs").delete().eq("id", id)
          if (error) throw error
        } catch (error) {
          console.error("Error in deleteFaq:", error)
          throw error
        }
      },

      getFaqById: (id) => {
        const { faqs } = get()
        return faqs.find((faq) => faq.id === id)
      },
      
      getFaqsByCategory: (category) => {
        const { faqs } = get()
        return category === "all" ? faqs : faqs.filter((faq) => faq.category === category)
      },
      
      addImageToFaq: async (faqId, image) => {
        try {
          const supabase = getSupabaseClient()
          const { faqs } = get()
          const faq = faqs.find((f) => f.id === faqId)
          if (!faq) return
          
          const updatedImages = [...(faq.images || []), image]
          const { error } = await supabase
            .from("faqs")
            .update({ images: JSON.stringify(updatedImages) })
            .eq("id", faqId)
            
          if (error) throw error
        } catch (error) {
          console.error("Error in addImageToFaq:", error)
          throw error
        }
      },
      
      subscribeToFaqs: () => {
        try {
          const supabase = getSupabaseClient()
          const subscription = supabase
            .channel("faqs-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "faqs" }, async () => {
              try {
                const { data, error } = await supabase
                  .from("faqs")
                  .select("*")
                  .order("created_at", { ascending: false })
                  
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
              } catch (err) {
                console.error("Error in FAQ subscription callback:", err)
              }
            })
            .subscribe()
            
          return () => {
            try {
              supabase.removeChannel(subscription)
            } catch (err) {
              console.error("Error removing FAQ subscription:", err)
            }
          }
        } catch (error) {
          console.error("Error setting up FAQ subscription:", error)
          return () => {}
        }
      },

      // Autores
      autores: [],
      setAutores: (autores) => set({ autores }),
      
      addAutor: async (nome) => {
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase.from("authors").insert({ name: nome })
          if (error) throw error
        } catch (error) {
          console.error("Error in addAutor:", error)
          throw error
        }
      },
      
      removeAutor: async (id) => {
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase.from("authors").delete().eq("id", id)
          if (error) throw error
        } catch (error) {
          console.error("Error in removeAutor:", error)
          throw error
        }
      },
      
      fetchAutores: async () => {
        try {
          const supabase = getSupabaseClient()
          const { data, error } = await supabase
            .from("authors")
            .select("*")
            .order("name", { ascending: true })
            
          if (error) throw error
          
          const transformedAutores = data.map((autor) => ({
            id: autor.id,
            name: autor.name,
          }))
          
          set({ autores: transformedAutores })
        } catch (error) {
          console.error("Error in fetchAutores:", error)
          throw error
        }
      },
      
      subscribeToAutores: () => {
        try {
          const supabase = getSupabaseClient()
          const subscription = supabase
            .channel("authors-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "authors" }, async () => {
              try {
                const { data, error } = await supabase
                  .from("authors")
                  .select("*")
                  .order("name", { ascending: true })
                  
                if (error) {
                  console.error("Error fetching authors:", error)
                  return
                }
                
                const transformedAutores = data.map((autor) => ({
                  id: autor.id,
                  name: autor.name,
                }))
                
                set({ autores: transformedAutores })
              } catch (err) {
                console.error("Error in authors subscription callback:", err)
              }
            })
            .subscribe()
            
          return () => {
            try {
              supabase.removeChannel(subscription)
            } catch (err) {
              console.error("Error removing authors subscription:", err)
            }
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
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase.from("acessos").insert({
            posto: acesso.posto,
            maquina: acesso.maquina,
            usuario: acesso.usuario,
            senha: acesso.senha,
            adquirente: acesso.adquirente || null,
            trabalho_andamento: (acesso as any).trabalhoAndamento || null,
            status_maquininha: (acesso as any).statusMaquininha || null,
          })
          if (error) throw error
        } catch (error) {
          console.error("Error in addAcesso:", error)
          throw error
        }
      },
      
      updateAcesso: async (id, acesso) => {
        try {
          const supabase = getSupabaseClient()
          const updateData: any = {}
          
          if (acesso.posto) updateData.posto = acesso.posto
          if (acesso.maquina) updateData.maquina = acesso.maquina
          if (acesso.usuario) updateData.usuario = acesso.usuario
          if (acesso.senha) updateData.senha = acesso.senha
          if (acesso.adquirente) updateData.adquirente = acesso.adquirente
          if ((acesso as any).trabalhoAndamento) updateData.trabalho_andamento = (acesso as any).trabalhoAndamento
          if ((acesso as any).statusMaquininha) updateData.status_maquininha = (acesso as any).statusMaquininha
          
          const { error } = await supabase.from("acessos").update(updateData).eq("id", id)
          if (error) throw error
        } catch (error) {
          console.error("Error in updateAcesso:", error)
          throw error
        }
      },
      
      deleteAcesso: async (id) => {
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase.from("acessos").delete().eq("id", id)
          if (error) throw error
        } catch (error) {
          console.error("Error in deleteAcesso:", error)
          throw error
        }
      },
      
      subscribeToAcessos: () => {
        try {
          const supabase = getSupabaseClient()
          const subscription = supabase
            .channel("acessos-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "acessos" }, async () => {
              try {
                const { data, error } = await supabase
                  .from("acessos")
                  .select("*")
                  .order("created_at", { ascending: false })
                  
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
                  adquirente: acesso.adquirente || "",
                  trabalhoAndamento: acesso.trabalho_andamento || "",
                  statusMaquininha: acesso.status_maquininha || "",
                  expandido: false,
                }) as Acesso)
                
                set({ acessos: transformedAcessos })
              } catch (err) {
                console.error("Error in acessos subscription callback:", err)
              }
            })
            .subscribe()
            
          return () => {
            try {
              supabase.removeChannel(subscription)
            } catch (err) {
              console.error("Error removing acessos subscription:", err)
            }
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
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase.from("pendencias").insert({
            titulo: pendencia.titulo,
            descricao: pendencia.descricao,
            status: pendencia.status,
            urgente: pendencia.urgente,
            data: pendencia.data,
            author: pendencia.author || null,
          })
          if (error) throw error
        } catch (error) {
          console.error("Error in addPendencia:", error)
          throw error
        }
      },
      
      updatePendenciaStatus: async (id, status) => {
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase.from("pendencias").update({ status }).eq("id", id)
          if (error) throw error
        } catch (error) {
          console.error("Error in updatePendenciaStatus:", error)
          throw error
        }
      },
      
      deletePendencia: async (id) => {
        try {
          const supabase = getSupabaseClient()
          const { error } = await supabase.from("pendencias").delete().eq("id", id)
          if (error) throw error
        } catch (error) {
          console.error("Error in deletePendencia:", error)
          throw error
        }
      },
      
      subscribeToPendencias: () => {
        try {
          const supabase = getSupabaseClient()
          const subscription = supabase
            .channel("pendencias-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "pendencias" }, async () => {
              try {
                const { data, error } = await supabase
                  .from("pendencias")
                  .select("*")
                  .order("data", { ascending: false })
                  
                if (error) {
                  console.error("Error fetching pendencias:", error)
                  return
                }
                
                set({ pendencias: data as Pendencia[] })
              } catch (err) {
                console.error("Error in pendencias subscription callback:", err)
              }
            })
            .subscribe()
            
          return () => {
            try {
              supabase.removeChannel(subscription)
            } catch (err) {
              console.error("Error removing pendencias subscription:", err)
            }
          }
        } catch (error) {
          console.error("Error setting up pendencias subscription:", error)
          return () => {}
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

// Hooks individuais para compatibilidade
export const useAutores = () => useAppStore((state) => state.autores)
export const useFaqs = () => useAppStore((state) => state.faqs)
export const useAcessos = () => useAppStore((state) => state.acessos)
export const usePendencias = () => useAppStore((state) => state.pendencias)

// Hook para ações de FAQ (caso seja necessário)
export const useFaqActions = () => useAppStore((state) => ({
  addFaq: state.addFaq,
  updateFaq: state.updateFaq,
  deleteFaq: state.deleteFaq,
  getFaqById: state.getFaqById,
  getFaqsByCategory: state.getFaqsByCategory,
  addImageToFaq: state.addImageToFaq,
}))
