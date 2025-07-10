"use client"

import type React from "react"

import { useScheduledNotifications } from "@/hooks/use-scheduled-notifications"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Initialize scheduled notifications
  useScheduledNotifications()

  return <>{children}</>
}
