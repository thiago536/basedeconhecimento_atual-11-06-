import type React from "react"
// Utilitários para gerenciamento de imagens

export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false

  // Verificar se é URL blob
  if (url.startsWith("blob:")) {
    return true // Assumir válida, será verificada no componente
  }

  // Verificar se é URL válida
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const sanitizeImageData = (images: any[]): any[] => {
  if (!Array.isArray(images)) return []

  return images
    .filter((img) => img && typeof img === "object" && img.src && isValidImageUrl(img.src))
    .map((img) => ({
      ...img,
      src: img.src || "/placeholder.svg",
      title: img.title || "Imagem",
      description: img.description || "",
    }))
}

export const createImageErrorHandler = (fallbackSrc = "/placeholder.svg") => {
  return (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget
    if (target.src !== fallbackSrc) {
      console.warn("Erro ao carregar imagem:", target.src)
      target.src = fallbackSrc
    }
  }
}
