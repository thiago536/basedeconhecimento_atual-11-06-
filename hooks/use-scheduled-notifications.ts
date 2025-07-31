"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

interface ScheduledNotification {
  time: string
  message: string
  title: string
}

const notifications: ScheduledNotification[] = [
  {
    time: "11:30",
    title: "Almoço 1",
    message: "Hora de fazer uma pausa!",
  },
  {
    time: "12:50",
    title: "Almoço 2",
    message: "Aproveite seu tempo!",
  },
  {
    time: "18:00",
    title: "Encerramento",
    message: "Hora de fechar o sistema.",
  },
]

export function useScheduledNotifications() {
  const { toast } = useToast()
  const notifiedToday = useRef<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout>()

  const playNotificationSound = () => {
    try {
      const audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0fu1am3mk2fk-timer-sfx-5-LhP27Uvg2MgncyK2TQ7sg7YgaY3UJZ.mp3")
      audio.volume = 0.5 // 50% volume for notifications
      audio.play().catch((error) => {
        console.debug("Notification audio play failed:", error)
      })
    } catch (error) {
      console.debug("Notification audio creation failed:", error)
    }
  }

  const checkScheduledNotifications = () => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const today = now.toDateString()

    // Reset notifications for a new day
    const lastResetDate = localStorage.getItem("lastNotificationReset")
    if (lastResetDate !== today) {
      notifiedToday.current.clear()
      localStorage.setItem("lastNotificationReset", today)
    }

    notifications.forEach((notification) => {
      const notificationKey = `${today}-${notification.time}`

      if (currentTime === notification.time && !notifiedToday.current.has(notificationKey)) {
        // Play notification sound
        playNotificationSound()

        // Show toast notification
        toast({
          title: notification.title,
          description: notification.message,
          duration: 10000, // Show for 10 seconds
        })

        // Mark as notified
        notifiedToday.current.add(notificationKey)
      }
    })
  }

  useEffect(() => {
    // Check immediately
    checkScheduledNotifications()

    // Set up interval to check every minute
    intervalRef.current = setInterval(checkScheduledNotifications, 60000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [toast])

  return { checkScheduledNotifications }
}
