"use client"

import { useCallback } from "react"

export function useAudioFeedback() {
  const playSuccessSound = useCallback(() => {
    try {
      const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/level-up-191997-0Qb24ovamJQ2Sc9ZkAHuapxZb1POY5.mp3")
      audio.volume = 0.3 // 30% volume for non-intrusive feedback
      audio.play().catch((error) => {
        // Silently handle audio play errors (e.g., user hasn't interacted with page yet)
        console.debug("Audio play failed:", error)
      })
    } catch (error) {
      // Silently handle audio creation errors
      console.debug("Audio creation failed:", error)
    }
  }, [])

  return { playSuccessSound }
}
