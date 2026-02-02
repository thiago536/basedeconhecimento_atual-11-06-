"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ImageUpload, type ImageWithMetadata } from "@/components/image-upload"
import { Link, Info } from "lucide-react"
import { containsUrls, extractUrls } from "@/lib/text-utils"
import type { FAQ, Author } from "@/lib/supabase"
import { FAQ_CATEGORIES } from "@/lib/constants"

interface FaqFormProps {
    faq: Partial<FAQ>
    onSave: (faqData: Partial<FAQ>) => void
    onCancel: () => void
    isLoading: boolean
    autores: Author[]
}

export function FaqForm({ faq, onSave, onCancel, isLoading, autores }: FaqFormProps) {
    const [formData, setFormData] = useState<Partial<FAQ>>({
        ...faq,
        images: Array.isArray(faq.images) ? faq.images : [],
    })

    const handleImagesSelected = useCallback((images: ImageWithMetadata[]) => {
        setFormData((prev) => ({ ...prev, images }))
    }, [])

    const handleChange = (field: keyof Omit<FAQ, "id" | "created_at">, value: string | ImageWithMetadata[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Detectar URLs na descrição
    const hasUrls = formData.description ? containsUrls(formData.description) : false
    const urlCount = formData.description ? extractUrls(formData.description).length : 0

    return (
        <>
            <DialogHeader>
                <DialogTitle>{formData.id ? "Editar Artigo" : "Adicionar Novo Artigo"}</DialogTitle>
                <DialogDescription>Preencha os detalhes para gerir o artigo na base de conhecimento.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                        id="title"
                        value={formData.title || ""}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="Título do artigo"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {FAQ_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Descrição / Conteúdo</Label>
                    <Textarea
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Escreva o conteúdo do artigo aqui... URLs serão automaticamente convertidas em links clicáveis.

Exemplos de URLs que funcionam:
• https://www.exemplo.com
• http://site.com.br
• www.documentacao.com
• github.com/usuario/projeto"
                        rows={8}
                    />

                    {/* Indicador de URLs detectadas */}
                    {hasUrls && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Link className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                {urlCount} {urlCount === 1 ? "URL detectada" : "URLs detectadas"} -
                                {urlCount === 1 ? " será convertida" : " serão convertidas"} em link{urlCount === 1 ? "" : "s"} clicável
                                {urlCount === 1 ? "" : "is"} automaticamente
                            </span>
                        </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                            <p className="font-medium mb-1">💡 Dica sobre URLs:</p>
                            <p>URLs adicionadas na descrição ficam automaticamente clicáveis na visualização. Suporte para:</p>
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                                <li>https://exemplo.com</li>
                                <li>http://site.com.br</li>
                                <li>www.documentacao.com</li>
                                <li>github.com/projeto</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="author">Autor</Label>
                    <Select value={formData.author || ""} onValueChange={(value) => handleChange("author", value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o autor" />
                        </SelectTrigger>
                        <SelectContent>
                            {autores.length > 0 ? (
                                autores.map((autor) => (
                                    <SelectItem key={autor.id} value={autor.name}>
                                        {autor.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>
                                    Nenhum autor
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Imagens</Label>
                    <ImageUpload onImagesSelected={handleImagesSelected} initialImages={formData.images as ImageWithMetadata[]} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button onClick={() => onSave(formData)} disabled={isLoading}>
                    {isLoading ? "A guardar..." : "Guardar"}
                </Button>
            </DialogFooter>
        </>
    )
}
