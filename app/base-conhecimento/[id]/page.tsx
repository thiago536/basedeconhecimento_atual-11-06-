"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, ZoomIn, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageZoomModal } from "@/components/image-zoom-modal"
import { useAppStore } from "@/lib/store"
import { toast } from "@/hooks/use-toast"

export default function FaqDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const faqId = parseInt(id)
  
  const { faqs, updateFaq } = useAppStore()
  const [faq, setFaq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    description: "",
    author: ""
  })
  const [zoomImage, setZoomImage] = useState(null)

  useEffect(() => {
    const foundFaq = faqs.find(f => f.id === faqId)
    if (foundFaq) {
      setFaq(foundFaq)
      setEditForm({
        title: foundFaq.title,
        category: foundFaq.category,
        description: foundFaq.description,
        author: foundFaq.author || ""
      })
    }
    setLoading(false)
  }, [faqId, faqs])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await updateFaq(faqId, editForm)
      setIsEditing(false)
      toast({
        title: "FAQ atualizada",
        description: "As alterações foram salvas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao atualizar FAQ:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    if (faq) {
      setEditForm({
        title: faq.title,
        category: faq.category,
        description: faq.description,
        author: faq.author || ""
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Carregando FAQ...</h1>
        </div>
      </div>
    )
  }

  if (!faq) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">FAQ não encontrada</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Editando FAQ" : faq.title}
          </h1>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Card className="flex flex-col max-h-[calc(100vh-150px)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <CardTitle>
              {isEditing ? (
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Título da FAQ"
                />
              ) : (
                faq.title
              )}
            </CardTitle>
          </div>
          <CardDescription>
            {isEditing ? (
              <Select
                value={editForm.category}
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="pdv">PDV</SelectItem>
                  <SelectItem value="pdv-movel">PDV Móvel</SelectItem>
                  <SelectItem value="instalacao">Instalação</SelectItem>
                  <SelectItem value="automacao">Automação</SelectItem>
                  <SelectItem value="integracao">Integração</SelectItem>
                  <SelectItem value="impressoras">Impressoras</SelectItem>
                  <SelectItem value="pinpad">PINPAD</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              `Categoria: ${faq.category}`
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Descrição</h3>
            {isEditing ? (
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Descrição da FAQ"
                rows={10}
              />
            ) : (
              <p className="whitespace-pre-line">{faq.description}</p>
            )}
          </div>

          {faq.images && faq.images.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-4">Imagens</h3>
              <div className="space-y-6">
                {faq.images.map((image, index) => (
                  <div key={index} className="space-y-3">
                    {/* Container da imagem com título e descrição */}
                    <div className="flex items-start gap-4">
                      {/* Thumbnail da imagem */}
                      <div className="relative group cursor-pointer flex-shrink-0">
                        <img
                          src={image.src || "/placeholder.svg"}
                          alt={image.title || `Imagem ${index + 1} para ${faq.title}`}
                          className="w-24 h-24 object-cover rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                          onClick={() => setZoomImage(image)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-md transition-colors flex items-center justify-center">
                          <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      
                      {/* Título e descrição ao lado da imagem */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Título</span>
                          <p className="text-sm text-gray-900 mt-1 break-words">
                            {image.title || `Imagem ${index + 1}`}
                          </p>
                        </div>
                        
                        {image.description && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Descrição</span>
                            <p className="text-sm text-gray-600 mt-1 break-words">
                              {image.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Linha separadora entre imagens (exceto na última) */}
                    {index < faq.images.length - 1 && (
                      <hr className="border-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-2">Autor</h3>
            {isEditing ? (
              <Input
                value={editForm.author}
                onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                placeholder="Nome do autor"
              />
            ) : (
              <p>{faq.author || "Não informado"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de zoom */}
      <ImageZoomModal
        isOpen={!!zoomImage}
        onClose={() => setZoomImage(null)}
        imageSrc={zoomImage?.src || ""}
        imageTitle={zoomImage?.title}
        imageDescription={zoomImage?.description}
      />
    </div>
  )
}
