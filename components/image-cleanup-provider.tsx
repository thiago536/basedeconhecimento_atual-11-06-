"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export const ImageCleanupProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  useEffect(() => {
    // Função para limpar URLs blob órfãs
    const cleanupBlobUrls = () => {
      // Encontrar todas as imagens com URLs blob
      const images = document.querySelectorAll('img[src^="blob:"]')

      images.forEach((img) => {
        const imgElement = img as HTMLImageElement
        const blobUrl = imgElement.src

        // Verificar se a URL blob ainda é válida
        fetch(blobUrl, { method: "HEAD" }).catch(() => {
          // Se falhar, substituir por placeholder
          console.warn("URL blob inválida detectada:", blobUrl)
          imgElement.src = "/placeholder.svg"
        })
      })
    }

    // Executar limpeza após navegação
    const timeoutId = setTimeout(cleanupBlobUrls, 100)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return <>{children}</>
}

export default ImageCleanupProvider
