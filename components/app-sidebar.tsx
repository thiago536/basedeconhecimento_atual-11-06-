"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  BookOpen,
  CheckSquare,
  Key,
  FileSpreadsheet,
  Settings,
  Home,
  MapPin,
  Monitor,
  LogOut,
  Lock,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

// --- Itens de Navegação ---
const navItems = [
  { title: "Início", href: "/", icon: Home },
  { title: "Base de Conhecimento", href: "/base-conhecimento", icon: BookOpen },
  { title: "Pendências", href: "/pendencias", icon: CheckSquare },
  { title: "Acessos", href: "/acessos", icon: Key },
  { title: "Postos", href: "/postos", icon: MapPin },
  { title: "Monitor Atendimento", href: "/dashboard-administrativa", icon: Monitor },
  {
    title: "SPEDs",
    href: "https://portalsped.vercel.app/",
    icon: FileSpreadsheet,
    external: true,
  },
  { title: "Configuração", href: "/configuracao", icon: Settings },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  // Don't render sidebar on login page
  if (pathname === "/login") return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Image src="/images/eprosys-logo.png" alt="Logo" width={32} height={32} className="rounded-md" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-gray-800 dark:text-gray-200">E-PROSYS</span>
                  <span className="truncate text-xs text-gray-500">v2.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                >
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  ) : (
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <DailyPassword />
          <SidebarMenu className="mt-2">
            <SidebarMenuItem>
              <div className="flex items-center gap-2 pl-2">
                <ModeToggle />
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SignOutButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

// --- Footer Components ---

function DailyPassword() {
  // Generate daily password logic
  const [dailyPassword, setDailyPassword] = React.useState("")
  const { state, isMobile } = useSidebar()

  React.useEffect(() => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, "0")
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const dateNumber = Number.parseInt(`${day}${month}`)
    const password = (Math.floor((dateNumber / 8369) * 10000) % 10000).toString()
    setDailyPassword(password)
  }, [])

  if (state === "collapsed" && !isMobile) {
    return (
      <div className="flex justify-center py-2" title={`Senha Diária: ${dailyPassword}`}>
        <Lock className="h-4 w-4 text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg mb-2 overflow-hidden">
      <Lock className="h-5 w-5 text-blue-600 shrink-0" />
      <div>
        <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Senha diária</div>
        <div className="text-lg font-bold text-blue-800 dark:text-blue-200">{dailyPassword}</div>
      </div>
    </div>
  )
}

// Separate component to handle logout click
function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <SidebarMenuButton
      variant="outline"
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
      onClick={handleSignOut}
    >
      <LogOut />
      <span>Sair</span>
    </SidebarMenuButton>
  )
}
