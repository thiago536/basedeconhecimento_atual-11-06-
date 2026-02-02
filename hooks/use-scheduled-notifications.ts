"use client"

import { useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

interface ScheduledNotification {
  time: string
  message: string
  title: string
}

const notifications: ScheduledNotification[] = [
  {
    time: "11:30",
    title: "Pausa para Almoço",
    message: "Almoço 1 - Hora de fazer uma pausa!",
  },
  {
    time: "12:50",
    title: "Pausa para Almoço",
    message: "Almoço 2 - Aproveite seu tempo!",
  },
  {
    time: "18:00",
    title: "Encerramento",
    message: "Encerramento - Hora de fechar o sistema.",
  },
]

export function useScheduledNotifications() {
  const { toast } = useToast()

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0fu1am3mk2fk-timer-sfx-5-LhP27Uvg2MgncyK2TQ7sg7YgaY3UJZ.mp3")
      audio.volume = 0.5 // 50% volume for notifications
      audio.play().catch((error) => {
        console.debug("Notification sound play failed:", error)
      })
    } catch (error) {
      console.debug("Notification sound creation failed:", error)
    }
  }, [])

  const checkScheduledNotifications = useCallback(() => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const today = now.toDateString()

    notifications.forEach((notification) => {
      if (currentTime === notification.time) {
        const storageKey = `notification-${notification.time}-${today}`

        // Check if we've already shown this notification today
        if (!localStorage.getItem(storageKey)) {
          // Mark as shown for today
          localStorage.setItem(storageKey, "true")

          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            duration: 10000, // Show for 10 seconds
          })

          // Play notification sound
          playNotificationSound()
        }
      }
    })

    // Clean up old notification flags (keep only today's)
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("notification-") && !key.includes(today)) {
        localStorage.removeItem(key)
      }
    })
  }, [toast, playNotificationSound])

  useEffect(() => {
    // Check immediately
    checkScheduledNotifications()

    // Set up interval to check every minute
    const interval = setInterval(checkScheduledNotifications, 60000)

    return () => clearInterval(interval)
  }, [checkScheduledNotifications])

  return { checkScheduledNotifications }
}
