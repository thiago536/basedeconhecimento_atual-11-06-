"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAudioFeedback } from "./use-audio-feedback"

interface ScheduledNotification {
  time: string // Format: "HH:MM"
  message: string
  triggered: boolean
}

export function useScheduledNotifications() {
  const { toast } = useToast()
  const { playNotificationSound } = useAudioFeedback()
  const notificationsRef = useRef<ScheduledNotification[]>([
    { time: "11:30", message: "Almoço 1 - Hora de fazer uma pausa!", triggered: false },
    { time: "12:50", message: "Almoço 2 - Aproveite seu tempo!", triggered: false },
    { time: "18:00", message: "Encerramento - Hora de fechar o sistema.", triggered: false },
  ])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastDateRef = useRef<string>("")

  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      const currentDate = now.toDateString()

      // Reset notifications for a new day
      if (lastDateRef.current !== currentDate) {
        notificationsRef.current = notificationsRef.current.map((notification) => ({
          ...notification,
          triggered: false,
        }))
        lastDateRef.current = currentDate
      }

      // Check each notification
      notificationsRef.current.forEach((notification, index) => {
        if (currentTime === notification.time && !notification.triggered) {
          // Mark as triggered
          notificationsRef.current[index].triggered = true

          // Show toast notification
          toast({
            title: "🔔 Notificação Programada",
            description: notification.message,
            duration: 8000, // Show for 8 seconds
          })

          // Play notification sound
          playNotificationSound()
        }
      })
    }

    // Check immediately
    checkNotifications()

    // Set up interval to check every minute
    intervalRef.current = setInterval(checkNotifications, 60000) // 60 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [toast, playNotificationSound])

  return {
    notifications: notificationsRef.current,
  }
}
