"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, ImageIcon, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export interface ImageWithMetadata {
  src: string
  title: string
  description: string
}

interface ImageUploadProps {
  onImagesSelected: (images: ImageWithMetadata[]) => void
  maxImages?: number
  initialImages?: ImageWithMetadata[] | string
}

// A exportação continua nomeada para corresponder à forma como é importada na sua página.
export function ImageUpload({ onImagesSelected, maxImages = 5, initialImages = [] }: ImageUploadProps) {
  // Função segura para inicializar o estado, tratando tanto arrays como strings JSON
  const getInitialState = useCallback(() => {
    // Se initialImages for uma string (vindo do banco de dados ao editar), tenta fazer o parse.
    if (typeof initialImages === "string") {
      try {
        const parsed = JSON.parse(initialImages)
        // Garante que o resultado do parse é um array antes de o usar.
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error("Falha ao fazer parse do JSON de imagens:", e)
        return [] // Retorna um array vazio em caso de erro para não quebrar a aplicação.
      }
    }
    // Se já for um array (ao adicionar um novo item) ou qualquer outro tipo, garante que retorna um array.
    return Array.isArray(initialImages) ? initialImages : []
  }, [initialImages])

  const [previewImages, setPreviewImages] = useState<ImageWithMetadata[]>(getInitialState)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincroniza o estado se a prop `initialImages` mudar (crucial para o modo de edição)
  useEffect(() => {
    setPreviewImages(getInitialState())
  }, [getInitialState])

  // Notifica o componente pai sempre que a lista de imagens for alterada
  useEffect(() => {
    // Garante que onImagesSelected é uma função antes de a chamar
    if (typeof onImagesSelected === "function") {
      onImagesSelected(previewImages)
    }
  }, [previewImages, onImagesSelected])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = maxImages - previewImages.length
    if (remainingSlots <= 0) return

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const newImage = { src: event.target.result as string, title: "", description: "" }
          setPreviewImages((prev) => [...prev, newImage])
        }
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const updateImageMetadata = (index: number, field: keyof ImageWithMetadata, value: string) => {
    setPreviewImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={previewImages.length >= maxImages}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Imagem
        </Button>
        <span className="text-sm text-muted-foreground">
          {previewImages.length}/{maxImages} imagens
        </span>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

      {previewImages.length > 0 && (
        <div className="space-y-4">
          {previewImages.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={image.src || "/placeholder.svg"}
                      alt={image.title || `Imagem ${index + 1}`}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor={`image-title-${index}`} className="text-sm font-medium">
                        Título da imagem
                      </Label>
                      <Input
                        id={`image-title-${index}`}
                        placeholder="Adicione um título"
                        value={image.title}
                        onChange={(e) => updateImageMetadata(index, "title", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`image-description-${index}`} className="text-sm font-medium">
                        Descrição da imagem
                      </Label>
                      <Textarea
                        id={`image-description-${index}`}
                        placeholder="Adicione uma descrição"
                        value={image.description}
                        onChange={(e) => updateImageMetadata(index, "description", e.target.value)}
                        className="mt-1 resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {previewImages.length === 0 && (
        <div className="border border-dashed rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 mb-2" />
            <p>Nenhuma imagem selecionada</p>
            <p className="text-sm">Clique em "Adicionar" para selecionar imagens</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Exportação default para compatibilidade
export default ImageUpload
