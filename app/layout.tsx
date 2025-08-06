import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { ImageCleanupProvider } from "@/components/image-cleanup-provider"
import { NotificationProvider } from "@/components/notification-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
title: "E-PROSYS",
description: "Base de conhecimento multiplataforma, gestão de pendências, lista de acessos e controle de SPEDs",
generator: "v0.dev",
icons: {
  icon: "/images/eprosys-logo.png",
  shortcut: "/images/eprosys-logo.png",
  apple: "/images/eprosys-logo.png",
},
}

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode
}>) {
return (
  <html lang="pt-BR" suppressHydrationWarning>
    <head>
      <link rel="icon" href="/images/eprosys-logo.png" type="image/png" />
      <link rel="shortcut icon" href="/images/eprosys-logo.png" type="image/png" />
      <link rel="apple-touch-icon" href="/images/eprosys-logo.png" />
    </head>
    <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <NotificationProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <ImageCleanupProvider>{children}</ImageCleanupProvider>
            </SidebarInset>
            <Toaster />
          </SidebarProvider>
        </NotificationProvider>
      </ThemeProvider>
    </body>
  </html>
)
}
