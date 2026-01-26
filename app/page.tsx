"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Lock, Copy, Check, Sparkles, Shield, Clock,
  TrendingUp, Users, MapPin, LayoutDashboard,
  Settings, BookOpen, CheckCircle2, Zap, Star,
  Database, Activity
} from "lucide-react"
import Link from "next/link"
import { HeroAnimation } from "@/components/HeroAnimation"

export default function HomePage() {
  const [passwords, setPasswords] = useState({ suporte: "", eprosys: "" })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

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
    setIsLoaded(true)

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
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-500",
      badge: "12 novos",
      description: "Central de documentação"
    },
    {
      title: "Central de Pendências",
      href: "/pendencias",
      icon: CheckCircle2,
      gradient: "from-amber-500 to-orange-500",
      badge: "5 ativas",
      description: "Gestão de tarefas"
    },
    {
      title: "Gestão de Acessos",
      href: "/acessos",
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
      badge: null,
      description: "Controle de usuários"
    },
    {
      title: "Gestão de Postos",
      href: "/postos",
      icon: MapPin,
      gradient: "from-purple-500 to-pink-500",
      badge: "8 ativos",
      description: "Unidades operacionais"
    },
    {
      title: "Dashboard Admin",
      href: "/dashboard-administrativa",
      icon: LayoutDashboard,
      gradient: "from-indigo-500 to-blue-500",
      badge: null,
      description: "Métricas e análises"
    },
    {
      title: "Configurações",
      href: "/configuracao",
      icon: Settings,
      gradient: "from-slate-500 to-gray-600",
      badge: null,
      description: "Preferências do sistema"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      <div className="relative z-10">
        {/* Hero Header */}
        <header className={`px-6 py-12 md:py-20 max-w-7xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm mb-4">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-blue-200 font-medium">Sistema Integrado v2.4</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent animate-gradient">
                E-PROSYS
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-light">
              Plataforma empresarial completa para gestão, segurança e análise operacional em tempo real
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Seguro</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Alta Performance</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Tempo Real</span>
              </div>
            </div>
          </div>

          {/* Premium Password Cards */}
          <div className="relative max-w-6xl mx-auto">
            {/* Glow Effect Behind Cards */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-3xl -z-10" />

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
              <div className="flex items-center justify-center gap-3 mb-10">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                  <Lock className="w-6 h-6 text-blue-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">Senhas do Dia</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-300 font-medium">Válido até 00h</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Senha Suporte - Premium 3D Card */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                  <div className="relative p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-sm rounded-2xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-bold text-blue-300 uppercase tracking-widest">Suporte</span>
                      </div>
                      <div className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-400/30">
                        <span className="text-xs text-blue-300 font-mono">ID: 8369</span>
                      </div>
                    </div>

                    <div className="relative mb-6">
                      <div className="text-7xl md:text-8xl font-black text-white font-mono tracking-wider text-center py-6 relative group-hover:scale-105 transition-transform duration-300">
                        {passwords.suporte || "----"}
                        {/* Shimmer Effect on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    </div>

                    <Button
                      onClick={() => copyToClipboard(passwords.suporte, "suporte")}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 font-semibold"
                    >
                      {copiedField === "suporte" ? (
                        <>
                          <Check className="w-4 h-4 mr-2 animate-bounce" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Senha
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Senha E-PROSYS - Premium 3D Card */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                  <div className="relative p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/10 backdrop-blur-sm rounded-2xl border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400 animate-pulse" />
                        <span className="text-sm font-bold text-purple-300 uppercase tracking-widest">E-PROSYS</span>
                      </div>
                      <div className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-400/30">
                        <span className="text-xs text-purple-300 font-mono">ID: 8597</span>
                      </div>
                    </div>

                    <div className="relative mb-6">
                      <div className="text-7xl md:text-8xl font-black text-white font-mono tracking-wider text-center py-6 relative group-hover:scale-105 transition-transform duration-300">
                        {passwords.eprosys || "----"}
                        {/* Shimmer Effect on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    </div>

                    <Button
                      onClick={() => copyToClipboard(passwords.eprosys, "eprosys")}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 font-semibold"
                    >
                      {copiedField === "eprosys" ? (
                        <>
                          <Check className="w-4 h-4 mr-2 animate-bounce" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Senha
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Module Grid */}
        <main className="px-6 pb-32 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-3">Módulos do Sistema</h3>
            <p className="text-slate-400">Acesse as ferramentas essenciais da plataforma</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <Link
                href={module.href}
                key={module.title}
                className={`group relative transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Glow on Hover */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${module.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`} />

                <div className="relative h-full p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
                  {/* Icon Container */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${module.gradient} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <module.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Badge */}
                  {module.badge && (
                    <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                      <span className="text-xs text-amber-300 font-medium">{module.badge}</span>
                    </div>
                  )}

                  {/* Content */}
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                    {module.title}
                  </h4>
                  <p className="text-sm text-slate-400 mb-4 group-hover:text-slate-300 transition-colors duration-300">
                    {module.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="flex items-center gap-2 text-sm text-slate-500 group-hover:text-white group-hover:gap-3 transition-all duration-300">
                    <span className="font-medium">Acessar</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>

      {/* Zé da Eprosys (Hero Animation) */}
      <HeroAnimation />

      {/* Custom Animations CSS */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
