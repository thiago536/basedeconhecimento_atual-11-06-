"use client"

import { useCallback, useRef } from "react"

export function useAudioFeedback() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playSuccessSound = useCallback(() => {
    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/level-up-191997-0Qb24ovamJQ2Sc9ZkAHuapxZb1POY5.mp3")
        audioRef.current.volume = 0.3 // Set volume to 30% to be non-intrusive
        audioRef.current.preload = "auto"
      }

      // Reset audio to beginning and play
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        // Silently handle audio play errors (e.g., user hasn't interacted with page yet)
        console.debug("Audio feedback could not be played:", error)
      })
    } catch (error) {
      // Silently handle any audio-related errors
      console.debug("Audio feedback error:", error)
    }
  }, [])

  return { playSuccessSound }
}
