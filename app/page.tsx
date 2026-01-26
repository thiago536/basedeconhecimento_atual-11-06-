"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, Copy, Check } from "lucide-react"
import Link from "next/link"
import { HeroAnimation } from "@/components/HeroAnimation"

export default function HomePage() {
  const [passwords, setPasswords] = useState({ suporte: "", eprosys: "" })
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    // Calculadora de Senhas
    const calculatePasswords = () => {
      const today = new Date()
      const day = String(today.getDate()).padStart(2, "0")
      const month = String(today.getMonth() + 1).padStart(2, "0")
      const dateNumber = Number.parseInt(`${day}${month}`)

      const passSuporte = (Math.floor((dateNumber / 8369) * 10000) % 10000).toString().padStart(4, "0")
      const passEprosys = (Math.floor((dateNumber / 8597) * 10000) % 10000).toString().padStart(4, "0")

      setPasswords({ suporte: passSuporte, eprosys: passEprosys })
    }

    calculatePasswords()

    // Recalcular senhas se virar o dia
    const interval = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        calculatePasswords()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const modules = [
    {
      title: "Base de Conhecimento",
      href: "/base-conhecimento",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Central de Pendências",
      href: "/pendencias",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      title: "Gestão de Acessos",
      href: "/acessos",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Gestão de Postos",
      href: "/postos",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Dashboard Admin",
      href: "/dashboard-administrativa",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Configurações",
      href: "/configuracao",
      color: "bg-slate-500 hover:bg-slate-600",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-8 md:py-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-slate-900 mb-2">
            E-PROSYS
          </h1>
          <p className="text-lg text-slate-600">
            Sistema Integrado de Gestão Empresarial
          </p>
        </div>

        {/* Senhas Centralizadas */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-slate-200">
          <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
            <Lock className="w-6 h-6 text-slate-900" />
            <h2 className="text-2xl font-bold text-slate-900">Senhas do Dia</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Senha Suporte */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 transition-transform hover:scale-[1.01]">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">Acesso Suporte</p>
              <div className="text-6xl md:text-7xl font-bold font-mono text-blue-900 mb-4 tracking-wider">
                {passwords.suporte || "----"}
              </div>
              <Button
                onClick={() => copyToClipboard(passwords.suporte, "suporte")}
                variant="outline"
                className="w-full gap-2 border-blue-300 text-blue-700 hover:bg-blue-200 bg-white/50"
              >
                {copiedField === "suporte" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>

            {/* Senha E-PROSYS */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 transition-transform hover:scale-[1.01]">
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-4">Acesso E-PROSYS</p>
              <div className="text-6xl md:text-7xl font-bold font-mono text-purple-900 mb-4 tracking-wider">
                {passwords.eprosys || "----"}
              </div>
              <Button
                onClick={() => copyToClipboard(passwords.eprosys, "eprosys")}
                variant="outline"
                className="w-full gap-2 border-purple-300 text-purple-700 hover:bg-purple-200 bg-white/50"
              >
                {copiedField === "eprosys" ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegação com Botões */}
      <main className="px-6 pb-20 max-w-7xl mx-auto w-full relative z-10">
        <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center md:text-left">Módulos do Sistema</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <Button
              key={module.title}
              asChild
              className={`h-24 text-lg font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-1 ${module.color}`}
            >
              <Link href={module.href}>
                {module.title}
              </Link>
            </Button>
          ))}
        </div>
      </main>

      {/* Zé da Eprosys (Hero Animation) */}
      <HeroAnimation />
    </div>
  )
}
