"use client";

import { useState } from 'react';
import { type FAQ } from "@/lib/supabase"; // Importa o tipo FAQ
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, ZoomIn } from "lucide-react";
import { ImageZoomModal } from "@/components/image-zoom-modal"; // Importa o modal de zoom

interface FaqDetailClientProps {
  faq: FAQ;
}

// Este componente cuida de toda a parte interativa da página
export function FaqDetailClient({ faq }: FaqDetailClientProps) {
  // Estado para controlar qual imagem está selecionada para o zoom
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  // Parse das imagens (a mesma lógica de antes)
  let images: any[] = [];
  try {
    if (faq.images && typeof faq.images === 'string') {
      images = JSON.parse(faq.images);
    } else if (Array.isArray(faq.images)) {
      images = faq.images;
    }
  } catch (e) {
    console.error("Erro ao fazer parse das imagens do FAQ:", e);
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit">{faq.category}</Badge>
          <CardTitle className="text-3xl font-bold">{faq.title}</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {faq.author && (
              <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{faq.author}</span></div>
            )}
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{new Date(faq.created_at).toLocaleDateString('pt-BR')}</span></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: faq.description.replace(/\n/g, '<br />') }} />

          {images.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold">Imagens Anexadas</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {images.map((img, index) => (
                  // Ao clicar na imagem, o modal de zoom é aberto
                  <div key={index} className="group relative cursor-pointer overflow-hidden rounded-lg border" onClick={() => setSelectedImage(img)}>
                    <img
                      src={img.src}
                      alt={img.title || `Imagem ${index + 1}`}
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/eee/ccc?text=Imagem+Inválida'; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                     {img.title && <p className="p-2 text-xs font-medium truncate">{img.title}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renderiza o Modal de Zoom, que fica visível quando uma imagem é selecionada */}
      <ImageZoomModal 
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage?.src}
        imageTitle={selectedImage?.title}
        imageDescription={selectedImage?.description}
      />
    </>
  );
}
