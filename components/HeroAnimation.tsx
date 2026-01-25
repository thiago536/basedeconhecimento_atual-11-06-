"use client"

import { useEffect, useState, useRef } from "react"

const TOTAL_FRAMES = 59
const FPS = 15 // Reduzido (era 30) para ficar mais natural e menos acelerado
const FRAME_DURATION = 1000 / FPS
const BASE_PATH = "https://oemducjiqvqacfokjzip.supabase.co/storage/v1/object/public/assets/hero-animation/frame_"

export function HeroAnimation() {
    const [currentFrame, setCurrentFrame] = useState(0)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const frameRef = useRef<number>(0)

    // Preload images
    useEffect(() => {
        let loadedCount = 0
        const images: HTMLImageElement[] = []

        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image()
            const frameNumber = i.toString().padStart(3, "0")
            img.src = `${BASE_PATH}${frameNumber}.png`
            img.onload = () => {
                loadedCount++
                if (loadedCount === TOTAL_FRAMES) {
                    setImagesLoaded(true)
                }
            }
            images.push(img)
        }
    }, [])

    // Animation loop
    useEffect(() => {
        if (!imagesLoaded) return

        const interval = setInterval(() => {
            frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES
            setCurrentFrame(frameRef.current)
        }, FRAME_DURATION)

        return () => clearInterval(interval)
    }, [imagesLoaded])

    if (!imagesLoaded) return null

    const frameNumber = currentFrame.toString().padStart(3, "0")
    const src = `${BASE_PATH}${frameNumber}.png`

    return (
        // Ajustado tamanhos: w-[180px] mobile, md:w-[240px] tablet, lg:w-[300px] desktop
        <div className="fixed bottom-0 right-[-10px] z-50 pointer-events-none w-[180px] md:w-[240px] lg:w-[300px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt="Hero Animation"
                className="w-full h-auto drop-shadow-2xl"
                style={{
                    // DICA: Se realmente não conseguir remover o fundo, descomente a linha abaixo para testar
                    // mixBlendMode: "multiply", 
                    maskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 90%, transparent 100%)"
                }}
            />
        </div>
    )
}
