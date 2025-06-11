// No início do arquivo, adicione:
import { SafeHTMLImage } from '@/components/safe-image'
import { sanitizeImageData } from '@/lib/image-utils'

// Na função que processa os FAQs, substitua:
const transformedFaqs = data.map((faq) => {
  let images = []
  try {
    if (faq.images) {
      const parsedImages = JSON.parse(faq.images)
      // Usar a função de sanitização
      images = sanitizeImageData(parsedImages)
    }
  } catch (e) {
    console.warn('Erro ao processar imagens do FAQ:', faq.id, e)
    images = []
  }

  return {
    id: faq.id,
    title: faq.title || 'Título não disponível',
    category: faq.category || 'sem-categoria',
    description: faq.description || 'Descrição não disponível',
    author: faq.author || '',
    images,
  }
})

// Onde você renderiza as imagens, substitua por:
<SafeHTMLImage
  src={image.src}
  alt={image.title || `Imagem ${index + 1}`}
  className="w-full h-full object-cover"
/>
