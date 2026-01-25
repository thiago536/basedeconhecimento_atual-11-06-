"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Clock, AlertCircle, CheckCircle2, TrendingUp, Shield, Users, MapPin, LayoutDashboard, Settings, BookOpen } from "lucide-react"
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
  const [pendStats, setPendStats] = useState<PendenciesStats | null>(null)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    // Calculadoras de Senha
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

    // Relógio e Atualização Diária
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
      // Recalcular senhas se virar o dia
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

  const modules = [
    {
      title: "Base de Conhecimento",
      icon: BookOpen,
      href: "/base-conhecimento",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "Manuais e Procedimentos"
    },
    {
      title: "Central de Pendências",
      icon: CheckCircle2,
      href: "/pendencias",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      desc: "Gestão de Tarefas"
    },
    {
      title: "Gestão de Acessos",
      icon: Users,
      href: "/acessos",
      color: "text-green-500",
      bg: "bg-green-500/10",
      desc: "Controle de Usuários"
    },
    {
      title: "Gestão de Postos",
      icon: MapPin,
      href: "/postos",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      desc: "Unidades e Locais"
    },
    {
      title: "Dashboard Admin",
      icon: LayoutDashboard,
      href: "/dashboard-administrativa",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      desc: "Métricas Gerais"
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/configuracao",
      color: "text-slate-500",
      bg: "bg-slate-500/10",
      desc: "Ajustes do Sistema"
    }
  ]

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20 overflow-x-hidden">

      {/* Header Section */}
      <header className="px-6 py-8 md:py-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <p className="text-muted-foreground uppercase tracking-widest text-xs font-medium mb-2">{today}</p>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-foreground">
              E-PROSYS <span className="text-primary/40">.OS</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-md">
              Sistema Integrado de Gestão Empresarial e Segurança
            </p>
          </div>
          <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm">
            <Clock className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-mono font-medium">{currentTime}</span>
          </div>
        </div>

        {/* Security Command Center (Hero) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">

          {/* Main Security Panel */}
          <div className="md:col-span-8 lg:col-span-9">
            <Card className="h-full border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
              {/* Glass Effect Overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] group-hover:bg-white/10 transition-colors duration-500" />

              <CardContent className="relative z-10 p-8 md:p-12 flex flex-col justify-between h-full min-h-[300px]">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-white border-white/20 bg-white/10 hover:bg-white/20 px-3 py-1">
                      <Shield className="w-3 h-3 mr-2" />
                      Security Center
                    </Badge>
                    <h2 className="text-2xl font-light opacity-90">Senhas do Dia</h2>
                  </div>
                  <Lock className="w-12 h-12 text-white/20" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                  {/* Suporte Pass */}
                  <div className="relative group/pass">
                    <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover/pass:opacity-100 transition-opacity" />
                    <p className="text-sm uppercase tracking-widest text-blue-200 font-medium mb-1">Acesso Suporte</p>
                    <div className="text-6xl md:text-7xl font-bold tracking-tighter font-mono text-white group-hover/pass:text-blue-200 transition-colors">
                      {passwords.suporte || "----"}
                    </div>
                    <p className="text-xs text-white/40 font-mono mt-2">ID: 8369 • AUTH_LVL_1</p>
                  </div>

                  {/* Eprosys Pass */}
                  <div className="relative group/pass">
                    <div className="absolute -inset-4 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover/pass:opacity-100 transition-opacity" />
                    <p className="text-sm uppercase tracking-widest text-purple-200 font-medium mb-1">Acesso E-PROSYS</p>
                    <div className="text-6xl md:text-7xl font-bold tracking-tighter font-mono text-white group-hover/pass:text-purple-200 transition-colors">
                      {passwords.eprosys || "----"}
                    </div>
                    <p className="text-xs text-white/40 font-mono mt-2">ID: 8597 • AUTH_LVL_ADMIN</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats (Pendency Summary) */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
            <Card className="flex-1 bg-background/60 backdrop-blur-md border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendências Em Aberto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">
                  {pendStats ? pendStats.pendenciasEmAndamento : "--"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Requerem atenção imediata</p>
              </CardContent>
            </Card>

            <Card className="flex-1 bg-background/60 backdrop-blur-md border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Finalizadas Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">
                  {pendStats ? pendStats.pendenciasConcluidas : "--"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Produtividade da equipe</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Modules Grid */}
      <main className="px-6 pb-20 max-w-7xl mx-auto w-full">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          Módulos do Sistema
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link href={module.href} key={module.href} legacyBehavior>
              <a className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${module.bg} ${module.color} group-hover:scale-110 transition-transform`}>
                      <module.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {module.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {module.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </main>

      <HeroAnimation />
    </div>
  )
}
