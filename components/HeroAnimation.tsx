"use client"

import { useEffect, useState, useRef } from "react"

const TOTAL_FRAMES = 59
const FPS = 15
const FRAME_DURATION = 1000 / FPS
const BASE_PATH = "https://oemducjiqvqacfokjzip.supabase.co/storage/v1/object/public/assets/hero-animation/frame_"

export function HeroAnimation() {
    const [currentFrame, setCurrentFrame] = useState(0)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const frameRef = useRef<number>(0)

    useEffect(() => {
        let loadedCount = 0
        const images: HTMLImageElement[] = []

        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image()
            const frameNumber = i.toString().padStart(3, "0")
            // 🔥 ATENÇÃO: O '?v=3' aqui obriga a baixar a versão nova (sem fundo)
            img.src = `${BASE_PATH}${frameNumber}.png?v=3`
            img.onload = () => {
                loadedCount++
                if (loadedCount === TOTAL_FRAMES) setImagesLoaded(true)
            }
            img.onerror = () => console.warn(`Erro frame: ${frameNumber}`)
            images.push(img)
        }
    }, [])

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
    // 🔥 Cache buster aqui também
    const src = `${BASE_PATH}${frameNumber}.png?v=3`

    return (
        // ✅ Tamanhos Extra-Miniatura (60px - 90px)
        <div className="fixed bottom-0 right-2 z-50 pointer-events-none w-[60px] md:w-[80px] lg:w-[90px]">
            <img
                src={src}
                alt="Hero Animation"
                className="w-full h-auto drop-shadow-2xl"
                style={{
                    maskImage: "linear-gradient(to bottom, black 90%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 90%, transparent 100%)"
                }}
            />
        </div>
    )
}
