"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
}

export const SafeImage = ({ src, alt, width, height, className, fill }: SafeImageProps) => {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Reset error state when src changes
    setHasError(false)
    setImageSrc(src)

    // Se for uma URL blob, verificar se ainda é válida
    if (src.startsWith('blob:')) {
      fetch(src, { method: 'HEAD' })
        .catch(() => {
          console.warn('URL blob inválida:', src)
          setImageSrc('/placeholder.svg')
          setHasError(true)
        })
    }
  }, [src])

  const handleError = () => {
    console.warn('Erro ao carregar imagem:', imageSrc)
    setImageSrc('/placeholder.svg')
    setHasError(true)
  }

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={hasError ? 'Imagem não disponível' : alt}
        fill
        className={className}
        onError={handleError}
      />
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={hasError ? 'Imagem não disponível' : alt}
      width={width || 100}
      height={height || 100}
      className={className}
      onError={handleError}
    />
  )
}
