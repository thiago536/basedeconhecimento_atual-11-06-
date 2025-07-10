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

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0fu1am3mk2fk-timer-sfx-5-LhP27Uvg2MgncyK2TQ7sg7YgaY3UJZ.mp3")
      audio.volume = 0.5 // 50% volume for notifications
      audio.play().catch((error) => {
        console.debug("Notification audio play failed:", error)
      })
    } catch (error) {
      console.debug("Notification audio creation failed:", error)
    }
  }, [])

  return {
    playSuccessSound,
    playNotificationSound,
  }
}
