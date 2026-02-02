"use client"

import type React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageZoomModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageTitle?: string
  imageDescription?: string
  imageSrc?: string // Para compatibilidade com versões antigas
}

export function ImageZoomModal({
  isOpen,
  onClose,
  imageUrl,
  imageSrc,
  imageTitle,
  imageDescription,
}: ImageZoomModalProps) {
  // Usar imageUrl ou imageSrc para compatibilidade
  const src = imageUrl || imageSrc || ""

  if (!isOpen || !src) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
        {/* Botão de fechar */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </Button>

        {/* Imagem */}
        <div className="relative max-w-full max-h-full">
          <img
            src={src || "/placeholder.svg"}
            alt={imageTitle || "Imagem ampliada"}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onError={(e) => {
              console.error("Erro ao carregar imagem no modal:", src)
              e.currentTarget.src = "/placeholder.svg"
            }}
          />

          {/* Informações da imagem */}
          {(imageTitle || imageDescription) && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 rounded-b-lg">
              {imageTitle && <h3 className="text-lg font-semibold mb-1">{imageTitle}</h3>}
              {imageDescription && <p className="text-sm text-gray-200">{imageDescription}</p>}
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-white/80 bg-black/40 px-3 py-1 rounded-full">
          Pressione ESC ou clique fora para fechar
        </div>
      </div>
    </div>
  )
}

export default ImageZoomModal
