"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Clock, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"
import Link from "next/link"

interface PendenciesStats {
  totalPendencias: number
  pendenciasEmAndamento: number
  pendenciasConcluidas: number
  resolvidasPorDiaUltimaSemana: Array<{ dia: string; quantidade: number }>
  _isMockData?: boolean
}

export default function HomePage() {
  const [dailyPassword, setDailyPassword] = useState("")
  const [pendStats, setPendStats] = useState<PendenciesStats | null>(null)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, "0")
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const dateNumber = Number.parseInt(`${day}${month}`)
    const password = (Math.floor((dateNumber / 8369) * 10000) % 10000).toString()
    setDailyPassword(password)

    // Atualizar horário
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
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

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex items-center justify-center px-4 py-12 md:py-20 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
          {/* Saudação e data */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm md:text-base uppercase tracking-wider">{today}</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              Bem-vindo ao <span className="text-primary">E-PROSYS</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Sistema integrado de gestão empresarial
            </p>
          </div>

          {/* Senha do dia - Destaque máximo */}
          <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg backdrop-blur">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  <h2 className="text-xl md:text-2xl font-semibold text-foreground">Senha do Dia</h2>
                </div>
                <div className="text-7xl md:text-8xl lg:text-9xl font-bold text-primary tracking-wider tabular-nums">
                  {dailyPassword || "----"}
                </div>
                <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Atualizado às {currentTime}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ações rápidas */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/base-conhecimento">
              <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-2 hover:border-primary/50">
                <CardContent className="p-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold">Base de Conhecimento</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/pendencias">
              <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-2 hover:border-primary/50">
                <CardContent className="p-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold">Ver Pendências</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl md:text-2xl font-bold mb-6 text-center md:text-left">Resumo de Pendências</h3>

          {pendStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-3xl font-bold">{pendStats.totalPendencias}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Em Andamento */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                      <p className="text-3xl font-bold">{pendStats.pendenciasEmAndamento}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-3 badge-warning">
                    Requer atenção
                  </Badge>
                </CardContent>
              </Card>

              {/* Concluídas */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                      <p className="text-3xl font-bold">{pendStats.pendenciasConcluidas}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-3 badge-success">
                    Finalizadas
                  </Badge>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Carregando dados...</div>
          )}
        </div>
      </section>
    </div>
  )
}
