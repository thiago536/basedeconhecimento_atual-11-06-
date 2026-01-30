"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { FAQ } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ZoomIn, BookOpen, Plus, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageZoomModal } from "./image-zoom-modal"
import { SafeImage } from "./safe-image"
import { TextWithLinks } from "@/lib/text-utils"

// Interface para compatibilidade com o formato de imagens usado no ImageUpload
interface ImageWithMetadata {
  src: string
  title: string
  description: string
}

export default function FaqDetailClient({ faq }: { faq: FAQ }) {
  const router = useRouter()
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(2)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const zoomContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Função para processar as imagens de forma segura
  const processImages = () => {
    if (!faq.images) return []

    // Se for uma string JSON, faz o parse
    if (typeof faq.images === "string") {
      try {
        const parsed = JSON.parse(faq.images)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error("Erro ao fazer parse das imagens:", e)
        return []
      }
    }

    // Se já for um array, retorna diretamente
    if (Array.isArray(faq.images)) {
      return faq.images
    }

    return []
  }

  const images = processImages()

  // Função para lidar com o clique no zoom
  const handleZoomClick = (imageUrl: string) => {
    console.log("URL da imagem para zoom:", imageUrl) // Debug
    setZoomImage(imageUrl)
    // Reset zoom level when opening a new image
    setZoomLevel(2)
    // Reset cursor position to center
    if (zoomContainerRef.current) {
      const rect = zoomContainerRef.current.getBoundingClientRect()
      setMousePosition({
        x: rect.width / 2,
        y: rect.height / 2,
      })
    }
  }

  // Track mouse position over the zoomed image
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomContainerRef.current) return

    const rect = zoomContainerRef.current.getBoundingClientRect()
    // Calculate mouse position relative to container
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePosition({ x, y })
  }

  // Adjust zoom in/out with buttons or scroll wheel
  const adjustZoom = (amount: number) => {
    setZoomLevel((prev) => {
      const newZoom = prev + amount
      // Limit zoom range between 1 and 8
      return Math.min(Math.max(newZoom, 1), 8)
    })
  }

  // Handle wheel event for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.5 : 0.5
    adjustZoom(delta)
  }

  // Calculate transform values for the zoomed image
  const getImageTransform = () => {
    if (!zoomContainerRef.current || !imageRef.current) {
      return { transform: "translate(0, 0) scale(1)" }
    }
    const containerRect = zoomContainerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height

    // Calculate the percentage of cursor position within the container
    const xPercent = mousePosition.x / containerWidth
    const yPercent = mousePosition.y / containerHeight

    // Calculate translation based on cursor position and zoom level
    // As zoom increases, we need more translation to keep the point under cursor
    const translateX = ((0.5 - xPercent) * containerWidth * (zoomLevel - 1)) / zoomLevel
    const translateY = ((0.5 - yPercent) * containerHeight * (zoomLevel - 1)) / zoomLevel

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`,
      transition: "transform 0.05s ease-out",
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={() => router.push(`/base-conhecimento?editId=${faq.id}`)}>
          <span className="mr-2">Editar</span>
        </Button>
      </div>

      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl font-bold">{faq.title || "Título não disponível"}</CardTitle>
          </div>
          <CardDescription>
            <Badge variant="secondary" className="text-sm">
              {faq.category || "Categoria não definida"}
            </Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Descrição</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <TextWithLinks
                text={faq.description || "Descrição não disponível."}
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
              />
            </div>
          </div>

          {/* Seção de imagens com layout moderno */}
          {images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Imagens Anexadas ({images.length})
              </h3>
              <div className="space-y-4">
                {images.map((image, index) => {
                  // Suporte para diferentes formatos de imagem
                  let imageUrl: string
                  let imageTitle: string
                  let imageDescription: string

                  if (typeof image === "string") {
                    // Formato antigo: apenas URL
                    imageUrl = image
                    imageTitle = `Imagem ${index + 1}`
                    imageDescription = ""
                  } else if (image && typeof image === "object") {
                    // Formato novo: objeto com metadados
                    const imgObj = image as ImageWithMetadata
                    imageUrl = imgObj.src || (image as any).url || ""
                    imageTitle = imgObj.title || `Imagem ${index + 1}`
                    imageDescription = imgObj.description || ""
                  } else {
                    return null
                  }

                  if (!imageUrl) {
                    console.warn(`Imagem ${index} não possui URL válida:`, image)
                    return null
                  }

                  console.log(`Imagem ${index} processada:`, { imageUrl, imageTitle, imageDescription }) // Debug

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4 p-4">
                        {/* Imagem com botão de zoom */}
                        <div className="relative flex-shrink-0">
                          <SafeImage
                            src={imageUrl}
                            alt={imageTitle}
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                            onClick={() => handleZoomClick(imageUrl)}
                          >
                            <ZoomIn className="h-4 w-4" />
                            <span className="sr-only">Ampliar imagem: {imageTitle}</span>
                          </Button>
                        </div>

                        {/* Informações da imagem */}
                        <div className="flex-1 min-w-0">
                          <div className="space-y-2">
                            <div>
                              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">Título</h4>
                              <p className="text-gray-700 dark:text-gray-300 break-words">{imageTitle}</p>
                            </div>

                            {imageDescription && (
                              <div>
                                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">Descrição</h4>
                                <p className="text-gray-700 dark:text-gray-300 break-words leading-relaxed">
                                  {imageDescription}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Autor</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-gray-700 dark:text-gray-300 font-medium">{faq.author || "Autor não informado"}</p>
            </div>
          </div>

          {/* Informações adicionais */}
          {faq.created_at && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Data de Criação</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-gray-700 dark:text-gray-300">
                  {new Date(faq.created_at).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de zoom avançado com seguimento do cursor */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setZoomImage(null)}
        >
          <div
            ref={zoomContainerRef}
            className="relative max-w-4xl max-h-[90vh] w-full h-full overflow-hidden cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside container
            onWheel={handleWheel}
          >
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <img
                ref={imageRef}
                src={zoomImage || "/placeholder.svg"}
                alt="Imagem ampliada"
                className="max-w-full max-h-full object-contain"
                style={getImageTransform()}
                onLoad={() => console.log("Imagem carregada com sucesso no zoom:", zoomImage)}
                onError={(e) => console.error("Erro ao carregar imagem no zoom:", zoomImage, e)}
              />
            </div>

            <div className="absolute top-4 right-4 flex flex-col bg-black/40 rounded-lg p-1 space-y-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-8 w-8 flex items-center justify-center bg-white/20 hover:bg-white/30"
                onClick={() => adjustZoom(0.5)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Aumentar zoom</span>
              </Button>

              <div className="text-white text-center text-xs bg-black/60 px-2 py-1 rounded">{zoomLevel * 50}%</div>

              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-8 w-8 flex items-center justify-center bg-white/20 hover:bg-white/30"
                onClick={() => adjustZoom(-0.5)}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Diminuir zoom</span>
              </Button>
            </div>

            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 left-4 rounded-full bg-white/20 hover:bg-white/30"
              onClick={() => setZoomImage(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Fechar zoom</span>
            </Button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-white/80 bg-black/40 px-3 py-1 rounded-full">
              Utilize a roda do mouse para ajustar o zoom ou os botões + e -
            </div>
          </div>
        </div>
      )}

      {/* Fallback para o modal original caso exista */}
      <ImageZoomModal
        isOpen={false} // Desabilitado permanentemente, usando o modal customizado
        onClose={() => setZoomImage(null)}
        imageUrl={zoomImage || ""}
      />
    </>
  )
}
