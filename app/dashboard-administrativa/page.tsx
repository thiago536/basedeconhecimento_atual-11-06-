"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Activity, Clock, User, CheckCircle2, XCircle, Calendar, AlertTriangle, ArrowRightLeft, CalendarDays, RotateCcw, Search, X } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Legend
} from "recharts"

// --- CONFIGURAÇÃO DO SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos
interface Atendimento {
  id: string
  id_atendente: string
  nome_cliente: string
  telefone: string
  status: string
  motivo: string | null // NOVO CAMPO
  created_at: string
  updated_at: string | null
  duration_minutes: number
  status_visual: "Em andamento" | "Sucesso" | "Falha" | "Transferido"
}

// Cores Básicas do Sistema
const COLORS = {
  success: "#10b981", // Emerald 500
  failure: "#ef4444", // Red 500
  warning: "#f59e0b", // Amber 500
  primary: "#3b82f6", // Blue 500
  neutral: "#94a3b8", // Slate 400
}

// Paleta de Cores para os Motivos (Inspirado no Kiro)
const MOTIVE_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c',
  '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
  '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
];

export default function DashboardAdministrativaPage() {
  const [data, setData] = useState<Atendimento[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  
  // --- ESTADOS PARA HISTÓRICO ---
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"Diário" | "Mensal">("Diário")

  // --- ESTADO DO MODAL (NOVO) ---
  const [showModal, setShowModal] = useState(false)

  // --- LÓGICA DE DADOS ---

  const calculateDuration = (startStr: string, endStr?: string | null) => {
    const start = new Date(startStr)
    const end = endStr ? new Date(endStr) : new Date()
    const diffMs = end.getTime() - start.getTime()
    return Math.floor(diffMs / 60000)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      let query = supabase.from("atendimentos").select("*").order("created_at", { ascending: false })

      if (viewMode === "Diário") {
        query = query
          .gte("created_at", `${dateFilter}T00:00:00`)
          .lte("created_at", `${dateFilter}T23:59:59`)
      } else {
        const [year, month] = dateFilter.split("-")
        const startDate = `${year}-${month}-01T00:00:00`
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        const endDate = `${year}-${month}-${lastDay}T23:59:59`
        
        query = query
          .gte("created_at", startDate)
          .lte("created_at", endDate)
      }

      const { data: dbData, error } = await query

      if (error) throw error

      if (dbData) {
        const processedData: Atendimento[] = dbData.map((item) => {
          let statusVisual: Atendimento["status_visual"] = "Em andamento"
          const s = item.status?.toLowerCase() || ""
          
          if (s.includes("transferido")) statusVisual = "Transferido"
          else if (s.includes("sem sucesso") || s.includes("falha") || s.includes("não")) statusVisual = "Falha"
          else if (s.includes("sucesso") || s.includes("resolvido")) statusVisual = "Sucesso"
          
          return {
            ...item,
            status_visual: statusVisual,
            duration_minutes: calculateDuration(item.created_at, statusVisual === "Em andamento" ? undefined : (item.updated_at || new Date().toISOString()))
          }
        })
        setData(processedData)
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)
    
    const hoje = new Date().toISOString().split("T")[0]
    const isLive = dateFilter === hoje && viewMode === "Diário"
    
    let dataInterval: NodeJS.Timeout | null = null
    if (isLive) {
      dataInterval = setInterval(fetchData, 5000)
    }

    return () => {
      clearInterval(clockInterval)
      if (dataInterval) clearInterval(dataInterval)
    }
  }, [dateFilter, viewMode])

  // --- CÁLCULOS ESTATÍSTICOS ---

  const activeTickets = data.filter((d) => d.status_visual === "Em andamento")
  const completedToday = data.filter((d) => d.status_visual !== "Em andamento")
  
  const successCount = data.filter((d) => d.status_visual === "Sucesso").length
  const failureCount = data.filter((d) => d.status_visual === "Falha").length
  const transferredCount = data.filter((d) => d.status_visual === "Transferido").length
  
  const totalProductive = successCount + failureCount

  const avgResolutionTime = completedToday.length > 0
      ? Math.round(completedToday.reduce((acc, t) => acc + t.duration_minutes, 0) / completedToday.length)
      : 0

  const resolvableTickets = successCount + failureCount
  const successRate = resolvableTickets > 0 
    ? Math.round((successCount / resolvableTickets) * 100) 
    : 0

  const ticketsByHour = Array.from({ length: 9 }, (_, i) => {
    const d = new Date()
    d.setHours(d.getHours() - (8 - i))
    return { hour: d.getHours(), count: 0, label: `${d.getHours()}:00` }
  })

  if (data.length > 0) {
      ticketsByHour.forEach(t => t.count = 0);
      data.forEach(t => {
        const h = new Date(t.created_at).getHours()
        const bucket = ticketsByHour.find(b => b.hour === h)
        if (bucket) bucket.count++
      })
  }

  const uniqueAgents = Array.from(new Set(data.map((d) => d.id_atendente || "Desconhecido")))
  const agentStats = uniqueAgents.map((agent) => {
      const tickets = data.filter((t) => t.id_atendente === agent)
      const success = tickets.filter((t) => t.status_visual === "Sucesso").length
      const failure = tickets.filter((t) => t.status_visual === "Falha").length
      const productiveTotal = success + failure
      const rate = productiveTotal > 0 ? (success / productiveTotal) * 100 : 0
      
      return { 
        name: agent, 
        rate, 
        total: productiveTotal,
        initials: agent.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
      }
    })
    .filter(a => a.total > 0)
    .sort((a, b) => b.total - a.total)

  const pieData = [
    { name: "Sucesso", value: successCount, color: COLORS.success },
    { name: "Falha", value: failureCount, color: COLORS.failure },
    { name: "Transferido", value: transferredCount, color: COLORS.neutral },
  ]

  // --- CÁLCULOS NOVOS: MOTIVOS DE CONTATO ---
  
  const motivesData = useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach(d => {
      const motivo = d.motivo || "Não Informado"
      counts[motivo] = (counts[motivo] || 0) + 1
    })
    
    return Object.entries(counts)
      .map(([name, value], index) => ({
        name,
        value,
        color: MOTIVE_COLORS[index % MOTIVE_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  // --- CÁLCULOS PARA O MODAL (MATRIZ CRUZADA) ---
  const crossMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {}
    const allMotives = new Set<string>()

    uniqueAgents.forEach(agent => {
      matrix[agent] = {}
      data.filter(d => d.id_atendente === agent).forEach(d => {
        const motivo = d.motivo || "Não Informado"
        matrix[agent][motivo] = (matrix[agent][motivo] || 0) + 1
        allMotives.add(motivo)
      })
    })

    return {
      matrix,
      motives: Array.from(allMotives).sort()
    }
  }, [data, uniqueAgents])

  const hojeStr = new Date().toISOString().split("T")[0]
  const isToday = dateFilter === hojeStr && viewMode === "Diário"

  // --- INTERFACE ---

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 lg:p-6 font-sans text-slate-900 relative">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Monitor de Operações</h1>
          
          <div className="flex items-center gap-2 mt-1">
            {isToday ? (
                <>
                    <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <p className="text-sm text-slate-500 font-medium">Ao Vivo • Atualização em tempo real</p>
                </>
            ) : (
                <>
                    <span className="relative flex h-2.5 w-2.5">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
                    </span>
                    <p className="text-sm text-slate-500 font-medium">Arquivo / Histórico • {viewMode}</p>
                </>
            )}
          </div>
        </div>

        {/* CONTROLES DE DATA */}
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
            
            <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setViewMode("Diário")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "Diário" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                >
                    Dia
                </button>
                <button 
                    onClick={() => setViewMode("Mensal")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "Mensal" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                >
                    Mês
                </button>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <CalendarDays className="h-4 w-4 text-slate-400 ml-1" />
                <input 
                    type="date" 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="text-sm font-medium text-slate-700 outline-none bg-transparent cursor-pointer"
                />
            </div>

            {!isToday && (
                <button 
                    onClick={() => {
                        setDateFilter(hojeStr)
                        setViewMode("Diário")
                    }}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                    <RotateCcw className="h-3 w-3" />
                    Voltar para Hoje
                </button>
            )}

            <div className="hidden md:block text-right ml-2">
                <div className="text-xl font-mono font-bold text-slate-800">
                    {currentTime.toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA 1: RANKING */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Produtividade {viewMode === "Mensal" ? "(Mensal)" : ""}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {agentStats.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum dado encontrado.</p>
              ) : agentStats.map((agent) => (
                <div key={agent.name} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-slate-100 border border-slate-200">
                        <AvatarFallback className="text-xs font-bold text-slate-600">{agent.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{agent.name}</p>
                        <p className="text-xs text-slate-400">{agent.total} resolvidos</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{agent.rate.toFixed(0)}%</span>
                  </div>
                  <Progress value={agent.rate} className="h-1.5" indicatorClassName={
                    agent.rate > 80 ? "bg-emerald-500" : agent.rate > 50 ? "bg-blue-500" : "bg-amber-500"
                  } />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA 2: OPERAÇÕES */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-slate-400 uppercase">Total Resolvido</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalProductive}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <p className="text-xs font-medium text-slate-400 uppercase">Tempo Médio</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{avgResolutionTime}m</p>
              </CardContent>
            </Card>
            
            {isToday ? (
                <Card className="border-blue-100 bg-blue-50/50 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-xs font-medium text-blue-600 uppercase">Ativos Agora</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1 animate-pulse">{activeTickets.length}</p>
                </CardContent>
                </Card>
            ) : (
                <Card className="border-slate-200 bg-slate-50 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                    <p className="text-xs font-medium text-slate-500 uppercase">Transferidos</p>
                    <p className="text-2xl font-bold text-slate-600 mt-1">{transferredCount}</p>
                </CardContent>
                </Card>
            )}
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  {isToday ? "Sala de Operações" : "Atendimentos do Período"}
                </h2>
                {isToday && activeTickets.length > 0 && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Ao Vivo</Badge>}
             </div>

             {viewMode === "Mensal" ? (
                 <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <Calendar className="h-10 w-10 text-blue-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">Modo de Visão Mensal</p>
                    <p className="text-slate-400 text-sm">Utilize os gráficos para análise macro.</p>
                 </div>
             ) : (
                 <>
                    {(isToday ? activeTickets : data).length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 text-center">
                        <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Nenhum registro encontrado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                        {(isToday ? activeTickets : data.slice(0, 20)).map((ticket) => {
                            const isCritical = ticket.duration_minutes > 15
                            const isWarning = ticket.duration_minutes > 10 && !isCritical
                            const isFinished = ticket.status_visual !== "Em andamento"
                            let cardClass = "bg-white border-slate-200"
                            if (!isFinished) cardClass += " hover:border-blue-300"
                            if (!isFinished && isToday) {
                                if (isCritical) cardClass = "bg-red-50 border-red-200 shadow-sm"
                                else if (isWarning) cardClass = "bg-amber-50 border-amber-200"
                            }

                            return (
                            <Card key={ticket.id} className={`transition-all duration-300 ${cardClass} shadow-sm`}>
                                <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide">
                                        <User className="h-3 w-3" />
                                        {ticket.id_atendente || "Desconhecido"}
                                    </div>
                                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-0">
                                        {ticket.duration_minutes} min
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Cliente</p>
                                    <h3 className="text-lg font-bold text-slate-900 truncate" title={ticket.nome_cliente}>
                                    {ticket.nome_cliente || "Sem nome"}
                                    </h3>
                                    <p className="text-xs text-slate-400 truncate mt-1">{ticket.telefone || "-"}</p>
                                    
                                    {/* Exibir Motivo se existir */}
                                    {ticket.motivo && (
                                      <Badge variant="secondary" className="mt-2 text-[10px] bg-slate-100 text-slate-600 font-normal">
                                        🏷️ {ticket.motivo}
                                      </Badge>
                                    )}
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center">
                                    <span className="text-xs text-slate-400">
                                        {new Date(ticket.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {isFinished ? (
                                        <Badge variant="outline" className="text-xs">
                                            {ticket.status_visual}
                                        </Badge>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-xs font-bold text-slate-600 uppercase">On-line</span>
                                        </div>
                                    )}
                                </div>
                                </CardContent>
                            </Card>
                            )
                        })}
                        </div>
                    )}
                 </>
             )}
          </div>
        </div>

        {/* COLUNA 3: ANALYTICS (COM NOVO GRÁFICO DE MOTIVOS) */}
        <div className="lg:col-span-3 space-y-6">
           {/* GRÁFICO DE VOLUME */}
           <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Volume</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={ticketsByHour}>
                          <defs>
                             <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="label" hide />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="count" stroke={COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </CardContent>
           </Card>

           {/* NOVO: GRÁFICO DE MOTIVOS DE CONTATO (ESTILO KIRO) */}
           <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
              <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Motivos</CardTitle>
                <button 
                  onClick={() => setShowModal(true)}
                  className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold"
                >
                  <Search className="h-3 w-3" /> Ver Raio-X
                </button>
              </CardHeader>
              <CardContent className="p-4">
                {motivesData.length > 0 ? (
                  <div className="h-[200px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                              data={motivesData}
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {motivesData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: number) => [`${value} atendimentos`, 'Quantidade']}
                            />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Centro do Donut */}
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-xl font-bold text-slate-800">{motivesData.length}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Tipos</span>
                      </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 text-xs">
                    Sem dados de motivo
                  </div>
                )}
                
                {/* Legenda Compacta */}
                <div className="mt-2 space-y-1 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                  {motivesData.map((m) => (
                    <div key={m.name} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}></div>
                        <span className="text-slate-600 truncate max-w-[120px]" title={m.name}>{m.name}</span>
                      </div>
                      <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{m.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
           </Card>

           {/* GRÁFICO DE RESOLUÇÃO */}
           <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Resolução</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="h-[150px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={pieData}
                             innerRadius={40}
                             outerRadius={60}
                             paddingAngle={5}
                             dataKey="value"
                          >
                             {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                       <span className="text-xl font-bold text-slate-800">{successRate}%</span>
                       <span className="text-[10px] text-slate-400">Eficiência</span>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

      </div>

      {/* RODAPÉ: TABELA HISTÓRICO */}
      <Card className="mt-6 border-slate-200 shadow-sm bg-white">
         <CardHeader className="border-b border-slate-100 py-4">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
               <Clock className="h-4 w-4 text-slate-400" />
               {isToday ? "Últimas Finalizações" : "Histórico Detalhado"}
            </CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            <Table>
               <TableHeader>
                  <TableRow className="hover:bg-transparent">
                     <TableHead className="w-[100px]">Status</TableHead>
                     <TableHead>Cliente</TableHead>
                     <TableHead>Atendente</TableHead>
                     <TableHead>Motivo</TableHead>
                     <TableHead className="text-center">Início</TableHead>
                     <TableHead className="text-center">Fim</TableHead>
                     <TableHead className="text-right">Duração</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {completedToday.slice(0, isToday ? 10 : 50).map((ticket) => (
                     <TableRow key={ticket.id} className="hover:bg-slate-50">
                        <TableCell>
                           {ticket.status_visual === "Sucesso" && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1">
                                 <CheckCircle2 className="h-3 w-3" /> Sucesso
                              </Badge>
                           )}
                           {ticket.status_visual === "Falha" && (
                              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 gap-1">
                                 <XCircle className="h-3 w-3" /> Falha
                              </Badge>
                           )}
                           {ticket.status_visual === "Transferido" && (
                              <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-300 gap-1">
                                 <ArrowRightLeft className="h-3 w-3" /> Transferido
                              </Badge>
                           )}
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{ticket.nome_cliente || "Desconhecido"}</TableCell>
                        <TableCell className="text-slate-500">{ticket.id_atendente || "-"}</TableCell>
                        
                        {/* COLUNA MOTIVO NA TABELA */}
                        <TableCell>
                          {ticket.motivo ? (
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-0 font-normal">
                              {ticket.motivo}
                            </Badge>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-center text-slate-600 font-mono text-xs">
                           {ticket.created_at ? new Date(ticket.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : "-"}
                        </TableCell>
                        <TableCell className="text-center text-slate-600 font-mono text-xs">
                           {ticket.updated_at ? new Date(ticket.updated_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : "-"}
                        </TableCell>

                        <TableCell className="text-right font-mono text-slate-600">{ticket.duration_minutes} min</TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </CardContent>
      </Card>

      {/* --- MODAL DE ANÁLISE DETALHADA ("SALA DE GUERRA") --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="text-emerald-400" />
                  Sala de Guerra: Motivos
                </h2>
                <p className="text-slate-400 text-sm mt-1">Análise detalhada de classificação de chamados</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Matriz Cruzada (Atendente x Motivo) */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-slate-700 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Quem atendeu o quê?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-bold text-slate-900">Atendente</TableHead>
                          {crossMatrix.motives.map(m => (
                            <TableHead key={m} className="text-center text-xs font-semibold whitespace-nowrap">{m}</TableHead>
                          ))}
                          <TableHead className="text-center font-bold bg-blue-50 text-blue-900">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uniqueAgents.map(agent => {
                           const totalAgent = crossMatrix.motives.reduce((acc, m) => acc + (crossMatrix.matrix[agent][m] || 0), 0)
                           if (totalAgent === 0) return null
                           return (
                             <TableRow key={agent}>
                               <TableCell className="font-medium text-slate-700 whitespace-nowrap">{agent}</TableCell>
                               {crossMatrix.motives.map(m => {
                                 const val = crossMatrix.matrix[agent][m] || 0
                                 return (
                                   <TableCell key={m} className="text-center p-2">
                                     {val > 0 ? (
                                       <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded text-xs">
                                         {val}
                                       </span>
                                     ) : <span className="text-slate-200">-</span>}
                                   </TableCell>
                                 )
                               })}
                               <TableCell className="text-center bg-blue-50/50 font-bold text-blue-700">{totalAgent}</TableCell>
                             </TableRow>
                           )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* 2. Lista de Últimos Atendimentos com Motivos */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-slate-700 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-500" />
                      Últimos Classificados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-y-auto">
                      {data.slice(0, 20).map((ticket) => (
                        <div key={ticket.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-800">{ticket.nome_cliente || "Desconhecido"}</span>
                              <Badge variant="outline" className="text-[10px] text-slate-400 font-normal">
                                {new Date(ticket.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {ticket.motivo ? (
                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0">
                                  {ticket.motivo}
                                </Badge>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Sem motivo</span>
                              )}
                              <span className="text-xs text-slate-500">• {ticket.id_atendente}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              ticket.status_visual === 'Sucesso' ? 'bg-emerald-100 text-emerald-700' :
                              ticket.status_visual === 'Falha' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {ticket.status_visual}
                            </span>
                            <p className="text-xs text-slate-400 mt-1">{ticket.duration_minutes} min</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
