import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase, type Pendencia, checkTables } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import {
  BookOpen,
  CheckSquare,
  Key,
  FileSpreadsheet,
  Settings,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  AlertCircle,
} from "lucide-react"

// Função que busca as estatísticas corretas do banco de dados
async function getStats() {
  console.log("🔍 Iniciando busca de estatísticas...")

  try {
    // Primeiro, vamos verificar quais tabelas existem
    const tableCheck = await checkTables()
    console.log("📊 Verificação de tabelas:", tableCheck)

    let faqs = 0
    let acessos = 0
    let totalPendencias = 0
    let naoConcluidas = 0
    let emAndamento = 0
    let concluidas = 0

    // Tentar buscar FAQs de diferentes tabelas possíveis
    const possibleFaqTables = ["base_conhecimento", "faqs"]
    for (const tableName of possibleFaqTables) {
      try {
        const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

        if (!error && count !== null) {
          faqs = count
          console.log(`✅ FAQs encontrados na tabela ${tableName}: ${count}`)
          break
        } else if (error) {
          console.log(`❌ Erro na tabela ${tableName}:`, error.message)
        }
      } catch (err) {
        console.log(`❌ Erro ao acessar tabela ${tableName}:`, err)
      }
    }

    // Buscar acessos
    try {
      const { count, error } = await supabase.from("acessos").select("*", { count: "exact", head: true })

      if (!error && count !== null) {
        acessos = count
        console.log(`✅ Acessos encontrados: ${count}`)
      } else if (error) {
        console.log("❌ Erro ao buscar acessos:", error.message)

        // Tentar buscar os dados reais para debug
        const { data: acessosData, error: dataError } = await supabase.from("acessos").select("*")

        if (!dataError && acessosData) {
          acessos = acessosData.length
          console.log(`✅ Acessos contados manualmente: ${acessos}`)
          console.log("📋 Primeiros 3 registros de acessos:", acessosData.slice(0, 3))
        }
      }
    } catch (err) {
      console.log("❌ Erro geral ao buscar acessos:", err)
    }

    // Buscar pendências
    try {
      const { data: pendenciasData, error } = await supabase.from("pendencias").select("status")

      if (!error && pendenciasData) {
        const pendencias = pendenciasData as Pendencia[]
        totalPendencias = pendencias.length
        naoConcluidas = pendencias.filter((p) => p.status === "nao-concluido").length
        emAndamento = pendencias.filter((p) => p.status === "em-andamento").length
        concluidas = pendencias.filter((p) => p.status === "concluido").length

        console.log(`✅ Pendências encontradas: ${totalPendencias}`)
        console.log(
          `📊 Breakdown: Não concluídas: ${naoConcluidas}, Em andamento: ${emAndamento}, Concluídas: ${concluidas}`,
        )
      } else if (error) {
        console.log("❌ Erro ao buscar pendências:", error.message)
      }
    } catch (err) {
      console.log("❌ Erro geral ao buscar pendências:", err)
    }

    const finalStats = {
      faqs,
      acessos,
      totalPendencias,
      naoConcluidas,
      emAndamento,
      concluidas,
    }

    console.log("📈 Estatísticas finais:", finalStats)
    return finalStats
  } catch (error) {
    console.error("❌ Erro geral ao buscar estatísticas:", error)
    return {
      faqs: 0,
      acessos: 0,
      totalPendencias: 0,
      naoConcluidas: 0,
      emAndamento: 0,
      concluidas: 0,
    }
  }
}

// Dados de navegação
const navigationItems = [
  {
    title: "Base de Conhecimento",
    description: "Gerencie artigos e documentos",
    href: "/base-conhecimento",
    icon: BookOpen,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50",
  },
  {
    title: "Pendências",
    description: "Acompanhe tarefas e projetos",
    href: "/pendencias",
    icon: CheckSquare,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    textColor: "text-green-600",
    bgLight: "bg-green-50",
  },
  {
    title: "Acessos",
    description: "Controle credenciais e senhas",
    href: "/acessos",
    icon: Key,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    textColor: "text-purple-600",
    bgLight: "bg-purple-50",
  },
  {
    title: "SPEDs",
    description: "Sistema de arquivos fiscais",
    href: "https://eprosyssped.vercel.app/",
    icon: FileSpreadsheet,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    textColor: "text-orange-600",
    bgLight: "bg-orange-50",
    external: true,
  },
  {
    title: "Configuração",
    description: "Ajustes e preferências",
    href: "/configuracao",
    icon: Settings,
    color: "bg-gray-500",
    hoverColor: "hover:bg-gray-600",
    textColor: "text-gray-600",
    bgLight: "bg-gray-50",
  },
]

export default async function Home() {
  const { faqs, acessos, totalPendencias, naoConcluidas, emAndamento, concluidas } = await getStats()

  return (
    <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
          <Image
            src="/images/eprosys-logo.png"
            alt="E-PROSYS Logo"
            width={48}
            height={48}
            className="rounded-lg shadow-sm"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">E-PROSYS Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Sistema integrado de gerenciamento empresarial</p>
          </div>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Debug Info:</span>
        </div>
        <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
          Artigos: {faqs} | Acessos: {acessos} | Pendências: {totalPendencias} | Concluídas: {concluidas}
        </div>
        <div className="text-xs text-yellow-600 dark:text-yellow-400">
          Verifique o console do navegador (F12) para logs detalhados da conexão com o banco
        </div>
      </div>

      {/* Quick Stats Overview - Com dados reais e debug */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Artigos</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">{faqs}</p>
                {faqs === 0 && <p className="text-xs text-red-500">Verificar tabela</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Acessos</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600">{acessos}</p>
                {acessos !== 24 && <p className="text-xs text-orange-500">Esperado: 24</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pendências</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-600">{totalPendencias}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Concluídas</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">{concluidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center md:text-left">Navegação Rápida</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {navigationItems.map((item) => {
            const IconComponent = item.icon

            if (item.external) {
              return (
                <a key={item.title} href={item.href} target="_blank" rel="noopener noreferrer" className="group">
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${item.bgLight} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <IconComponent className={`h-6 w-6 ${item.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                          <div className="flex items-center text-sm text-orange-600 font-medium">
                            Abrir sistema
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              )
            }

            return (
              <Link key={item.title} href={item.href} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${item.bgLight} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className={`h-6 w-6 ${item.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        <div className="flex items-center text-sm text-blue-600 font-medium">
                          Acessar
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions for Mobile */}
      <div className="md:hidden mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/base-conhecimento">
            <Button className="w-full h-16 bg-blue-500 hover:bg-blue-600 text-white flex flex-col gap-1">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Novo Artigo</span>
            </Button>
          </Link>
          <Link href="/pendencias">
            <Button className="w-full h-16 bg-green-500 hover:bg-green-600 text-white flex flex-col gap-1">
              <CheckSquare className="h-5 w-5" />
              <span className="text-xs">Nova Tarefa</span>
            </Button>
          </Link>
          <Link href="/acessos">
            <Button className="w-full h-16 bg-purple-500 hover:bg-purple-600 text-white flex flex-col gap-1">
              <Key className="h-5 w-5" />
              <span className="text-xs">Novo Acesso</span>
            </Button>
          </Link>
          <a href="https://eprosyssped.vercel.app/" target="_blank" rel="noopener noreferrer">
            <Button className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white flex flex-col gap-1">
              <FileSpreadsheet className="h-5 w-5" />
              <span className="text-xs">Abrir SPED</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Status Overview - Com dados reais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Produtividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tarefas Concluídas</span>
                <span className="font-semibold text-green-600">{concluidas}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Em Andamento</span>
                <span className="font-semibold text-yellow-600">{emAndamento}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Não Concluídas</span>
                <span className="font-semibold text-red-600">{naoConcluidas}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-medium">Total</span>
                <span className="font-bold">{totalPendencias}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Base de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Artigos Salvos</span>
                <span className="font-semibold text-blue-600">{faqs}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Credenciais</span>
                <span className="font-semibold text-purple-600">{acessos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status</span>
                <span className="font-semibold text-green-600">Online</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="font-medium">Total Registros</span>
                <span className="font-bold">{faqs + acessos + totalPendencias}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Resumo do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Taxa de Conclusão</span>
                <span className="font-semibold text-green-600">
                  {totalPendencias > 0 ? Math.round((concluidas / totalPendencias) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tarefas Ativas</span>
                <span className="font-semibold text-yellow-600">{emAndamento}</span>
              </div>
              <div className="flex justify-between">
                <span>Aguardando</span>
                <span className="font-semibold text-red-600">{naoConcluidas}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Versão</span>
                <span className="font-semibold">v2.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
