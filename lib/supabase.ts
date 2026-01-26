"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Clock, AlertCircle, CheckCircle2, TrendingUp, Shield, Users, MapPin, LayoutDashboard, Settings, BookOpen, ExternalLink, Activity, AlertTriangle, Copy, Check } from "lucide-react"
import Link from "next/link"
import { HeroAnimation } from "@/components/HeroAnimation"
// Se der erro no useToast, verifique se instalou o componente de toast (shadcn)
// Se não, remova essas 3 linhas abaixo e a função copyToClipboard simplificada
import { useToast } from "@/components/ui/use-toast"

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const { toast } = useToast()

  // Simulação de Dados em Tempo Real (Baseado nas tabelas do sistema)
  const activeAlerts = [
    { id: 1, type: "critical", msg: "Falha de sync no Posto Central", time: "10min" },
    { id: 2, type: "warning", msg: "Lentidão detectada no módulo Admin", time: "32min" },
  ]
  const onlineAgents = 3 // Baseado na tabela monitor_atendentes

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast({
      title: "Senha Copiada",
      description: `${key === 'suporte' ? 'Suporte' : 'E-PROSYS'} password transferida.`,
    })
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const modules = [
    { title: "Base de Conhecimento", icon: BookOpen, href: "/base-conhecimento", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { title: "Central de Pendências", icon: CheckCircle2, href: "/pendencias", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { title: "Gestão de Acessos", icon: Users, href: "/acessos", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { title: "Gestão de Postos", icon: MapPin, href: "/postos", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { title: "Dashboard Admin", icon: LayoutDashboard, href: "/dashboard-administrativa", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { title: "Configurações", icon: Settings, href: "/configuracao", color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" }
  ]

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "long" })

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#0A0A0A] overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight">E-PROSYS<span className="text-primary">.OS</span></span>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Password Widgets (Compact) */}
            <div 
                onClick={() => copyToClipboard(passwords.suporte, 'suporte')}
                className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-md border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                title="Clique para copiar senha de Suporte"
            >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suporte</span>
                <code className="text-sm font-bold font-mono text-foreground">{passwords.suporte || "----"}</code>
                {copiedKey === 'suporte' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>

            <div 
                onClick={() => copyToClipboard(passwords.eprosys, 'eprosys')}
                className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-md border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                title="Clique para copiar senha Admin"
            >
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin</span>
                <code className="text-sm font-bold font-mono text-foreground">{passwords.eprosys || "----"}</code>
                {copiedKey === 'eprosys' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>

            <div className="h-6 w-px bg-border mx-2" />
            
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {currentTime}
            </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Navigation Matrix */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
            <div className="space-y-2 mb-4">
                <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium">{today}</p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Mission Control</h1>
                <p className="text-muted-foreground text-lg">Selecione um módulo para iniciar.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modules.map((module) => (
                    <Link href={module.href} key={module.href} className="group">
                        <div className={`h-full p-5 rounded-xl border bg-card hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden`}>
                            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${module.color}`}>
                                <module.icon className="w-16 h-16" />
                            </div>
                            <div className="relative z-10 flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${module.bg} ${module.color} border ${module.border}`}>
                                    <module.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{module.title}</h3>
                                    <div className="flex items-center text-xs text-muted-foreground mt-1 group-hover:translate-x-1 transition-transform">
                                        Acessar <ExternalLink className="w-3 h-3 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* Right Column: Live Data Feed (Widgets) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Widget: System Alerts */}
            <Card className="border-l-4 border-l-red-500 shadow-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Alertas do Sistema
                        </CardTitle>
                        <Badge variant="outline" className="text-red-500 bg-red-500/10 border-red-200">2 Ativos</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activeAlerts.map(alert => (
                            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                                <div className={`w-2 h-2 mt-1.5 rounded-full ${alert.type === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{alert.msg}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{alert.time} atrás</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Widget: Live Operations Layer */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Agentes Online
                        </div>
                        <div className="text-3xl font-bold text-foreground">{onlineAgents}</div>
                        <div className="text-xs text-emerald-600 font-medium mt-1">● Sistema Operacional</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Pendências
                        </div>
                        <div className="text-3xl font-bold text-foreground">{pendStats ? pendStats.pendenciasEmAndamento : "--"}</div>
                        <div className="text-xs text-muted-foreground mt-1">Em aberto</div>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile-only Passwords (Visible if desktop nav hidden) */}
            <div className="md:hidden space-y-3 mt-4">
                <div onClick={() => copyToClipboard(passwords.suporte, 'suporte')} className="flex items-center justify-between p-4 rounded-lg bg-card border hover:bg-accent active:scale-95 transition-all">
                    <span className="text-sm font-medium text-muted-foreground">Senha Suporte</span>
                    <span className="font-mono font-bold">{passwords.suporte}</span>
                </div>
                <div onClick={() => copyToClipboard(passwords.eprosys, 'eprosys')} className="flex items-center justify-between p-4 rounded-lg bg-card border hover:bg-accent active:scale-95 transition-all">
                    <span className="text-sm font-medium text-muted-foreground">Senha Admin</span>
                    <span className="font-mono font-bold text-purple-600">{passwords.eprosys}</span>
                </div>
            </div>
            
        </div>
      </div>
      
      {/* Footer Info */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t mt-auto bg-background/50">
        <p>E-PROSYS v2.4 • Base Conectada: Supabase • Ambiente Seguro</p>
      </footer>

      {/* Hero Animation (Zé) - Fixed Bottom Right */}
      <HeroAnimation />
    </div>
  )
}
