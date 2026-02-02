"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { useAppStore } from "@/lib/store"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme: setNextTheme, theme: nextTheme } = useTheme()
  const { theme: storeTheme, setTheme: setStoreTheme } = useAppStore()

  // Keep themes in sync
  useEffect(() => {
    if (nextTheme && nextTheme !== storeTheme) {
      setStoreTheme(nextTheme as "light" | "dark" | "system")
    }
  }, [nextTheme, storeTheme, setStoreTheme])

  // Handle theme change
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setNextTheme(newTheme)
    setStoreTheme(newTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>Claro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>Escuro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>Sistema</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
