"use client"

import type React from "react"

import { useScheduledNotifications } from "@/hooks/use-scheduled-notifications"

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Initialize scheduled notifications
  useScheduledNotifications()

  return <>{children}</>
}
