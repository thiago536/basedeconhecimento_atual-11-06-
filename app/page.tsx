"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, Copy, Check, Clock, TrendingUp, BookOpen, CheckCircle2, Users, MapPin, LayoutDashboard, Settings, AlertCircle } from "lucide-react"
import Link from "next/link"
import { HeroAnimation } from "@/components/HeroAnimation"

interface PendenciesStats {
  totalPendencias: number
  pendenciasEmAndamento: number
  pendenciasConcluidas: number
  resolvidasPorDiaUltimaSemana: Array<{ dia: string; quantidade: number }>
  _isMockData?: boolean
}

export default function HomePage() {
  const [passwords, setPasswords] = useState({ suporte: "", eprosys: "" })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [pendStats, setPendStats] = useState<PendenciesStats | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
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
    setIsLoaded(true)

    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }))
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        calculatePasswords()
      }
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadPendencies = async () => {
      try {
        const response = await fetch("/api/dashboard/pendencies-stats")
        const data = await response.json()
        setPendStats(data)
      } catch (error) {
        console.error("Erro ao carregar pendências:", error)
      }
    }
    loadPendencies()
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const modules = [
    { title: "Base de Conhecimento", href: "/base-conhecimento", icon: BookOpen },
    { title: "Central de Pendências", href: "/pendencias", icon: CheckCircle2 },
    { title: "Gestão de Acessos", href: "/acessos", icon: Users },
    { title: "Gestão de Postos", href: "/postos", icon: MapPin },
    { title: "Dashboard Admin", href: "/dashboard-administrativa", icon: LayoutDashboard },
    { title: "Configurações", href: "/configuracao", icon: Settings },
  ]

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle Top Bar with Time */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-end">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{currentTime}</span>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Header - Clean and Centered */}
        <header className="px-6 py-16 text-center border-b border-slate-100">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-medium">{today}</p>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-3">
            <span className="text-blue-600">E-</span>
            <span className="text-slate-900">PROSYS</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Sistema integrado de gestão empresarial
          </p>
        </header>

        {/* Password Card - Single, Centered, Premium */}
        <section className="px-6 py-16 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-blue-50">
                <Lock className="w-5 h-5 text-blue-600" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Senha do Dia</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Senha Suporte */}
              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/30">
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">Acesso Suporte</p>
                <div className="text-7xl font-bold font-mono text-slate-900 mb-4 tabular-nums tracking-wider">
                  {passwords.suporte || "----"}
                </div>
                <Button
                  onClick={() => copyToClipboard(passwords.suporte, "suporte")}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                >
                  {copiedField === "suporte" ? (
                    <>
                      <Check className="w-4 h-4 mr-2" strokeWidth={2} />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" strokeWidth={2} />
                      Copiar
                    </>
                  )}
                </Button>
              </div>

              {/* Senha E-PROSYS */}
              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/30">
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">Acesso E-PROSYS</p>
                <div className="text-7xl font-bold font-mono text-slate-900 mb-4 tabular-nums tracking-wider">
                  {passwords.eprosys || "----"}
                </div>
                <Button
                  onClick={() => copyToClipboard(passwords.eprosys, "eprosys")}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                >
                  {copiedField === "eprosys" ? (
                    <>
                      <Check className="w-4 h-4 mr-2" strokeWidth={2} />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" strokeWidth={2} />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="text-center text-sm text-slate-400">
              <Clock className="w-3.5 h-3.5 inline mr-1.5" strokeWidth={2} />
              Atualizado às {currentTime}
            </p>
          </div>
        </section>

        {/* Quick Access Buttons - Minimal */}
        <section className="px-6 py-8 max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/base-conhecimento">
              <Button variant="outline" className="gap-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <BookOpen className="w-4 h-4" strokeWidth={2} />
                Base de Conhecimento
              </Button>
            </Link>
            <Link href="/pendencias">
              <Button variant="outline" className="gap-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                Ver Pendências
              </Button>
            </Link>
          </div>
        </section>

        {/* Resumo de Pendências */}
        <section className="px-6 py-12 border-t border-slate-100 bg-slate-50/30">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center">Resumo de Pendências</h3>

            {pendStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center transition-all duration-300 hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
                    <AlertCircle className="w-6 h-6 text-blue-600" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Total</p>
                  <p className="text-4xl font-bold text-slate-900">{pendStats.totalPendencias}</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center transition-all duration-300 hover:shadow-lg hover:border-amber-200 hover:-translate-y-0.5">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 mb-4">
                    <Clock className="w-6 h-6 text-amber-600" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Em Andamento</p>
                  <p className="text-4xl font-bold text-slate-900">{pendStats.pendenciasEmAndamento}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-full border border-amber-100">
                    Requer atenção
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center transition-all duration-300 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-2">Concluídas</p>
                  <p className="text-4xl font-bold text-slate-900">{pendStats.pendenciasConcluidas}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
                    Finalizado
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Carregando dados...</div>
            )}
          </div>
        </section>

        {/* Modules Grid - Clean and Spacious */}
        <section className="px-6 py-16 max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 mb-10 text-center">Módulos do Sistema</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Link
                href={module.href}
                key={module.title}
                className="group bg-white rounded-xl border border-slate-200 p-8 transition-all duration-300 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                    <module.icon className="w-6 h-6 text-blue-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                      {module.title}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-slate-400 group-hover:text-slate-600 group-hover:gap-2 transition-all duration-300">
                      <span>Acessar</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <HeroAnimation />
    </div>
  )
}
