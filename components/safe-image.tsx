"use client"

import React, { useState, useCallback } from "react"

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallbackSrc?: string
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  onError,
  className,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (!hasError && currentSrc !== fallbackSrc) {
        console.warn("Erro ao carregar imagem:", currentSrc)
        setCurrentSrc(fallbackSrc)
        setHasError(true)
      }

      // Chama o handler personalizado se fornecido
      if (onError) {
        onError(event)
      }
    },
    [currentSrc, fallbackSrc, hasError, onError],
  )

  // Atualiza a imagem quando a prop src muda
  React.useEffect(() => {
    if (src !== currentSrc && !hasError) {
      setCurrentSrc(src)
    }
  }, [src, currentSrc, hasError])

  return (
    <img
      {...props}
      src={currentSrc || "/placeholder.svg"}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  )
}

export default SafeImage
