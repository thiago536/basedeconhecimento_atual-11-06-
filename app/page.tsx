import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase, type Pendencia } from "@/lib/supabase"
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
} from "lucide-react"

// Função que busca as estatísticas corretas do banco de dados
async function getStats() {
  try {
    // Buscar FAQs da tabela base_conhecimento
    const { count: faqs, error: faqsError } = await supabase
      .from("base_conhecimento")
      .select("*", { count: "exact", head: true })

    if (faqsError) {
      console.error("Erro ao buscar FAQs:", faqsError)
    }

    // Buscar acessos da tabela acessos
    const { count: acessos, error: acessosError } = await supabase
      .from("acessos")
      .select("*", { count: "exact", head: true })

    if (acessosError) {
      console.error("Erro ao buscar acessos:", acessosError)
    }

    // Buscar pendências com todos os status
    const { data: pendenciasData, error: pendenciasError } = await supabase.from("pendencias").select("status")

    if (pendenciasError) {
      console.error("Erro ao buscar pendências:", pendenciasError)
      return {
        faqs: faqs ?? 0,
        acessos: acessos ?? 0,
        totalPendencias: 0,
        naoConcluidas: 0,
        emAndamento: 0,
        concluidas: 0,
      }
    }

    const pendencias = pendenciasData as Pendencia[]
    const totalPendencias = pendencias?.length ?? 0
    const naoConcluidas = pendencias?.filter((p) => p.status === "nao-concluido").length ?? 0
    const emAndamento = pendencias?.filter((p) => p.status === "em-andamento").length ?? 0
    const concluidas = pendencias?.filter((p) => p.status === "concluido").length ?? 0

    return {
      faqs: faqs ?? 0,
      acessos: acessos ?? 0,
      totalPendencias,
      naoConcluidas,
      emAndamento,
      concluidas,
    }
  } catch (error) {
    console.error("Erro geral ao buscar estatísticas:", error)
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

export default async function Dashboard() {
  const { faqs, acessos, totalPendencias, naoConcluidas, emAndamento, concluidas } = await getStats()

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden sticky top-0 z-50 bg-white dark:bg-gray-950 border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Image src="/images/eprosys-logo.png" alt="E-PROSYS Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-lg">E-PROSYS</span>
          </div>
          <Link href="/configuracao">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 max-w-7xl mx-auto pb-20 md:pb-6">
          {/* Desktop Header */}
          <div className="hidden md:block mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/eprosys-logo.png"
                alt="E-PROSYS Logo"
                width={48}
                height={48}
                className="rounded-lg shadow-sm"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">E-PROSYS Dashboard</h1>
                <p className="text-base text-muted-foreground">Sistema integrado de gerenciamento empresarial</p>
              </div>
            </div>
          </div>

          {/* Mobile Welcome */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Sistema integrado de gerenciamento empresarial</p>
          </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 md:block md:text-center">
                  <BookOpen className="h-5 w-5 text-blue-600 md:mx-auto md:mb-2" />
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Artigos</p>
                    <p className="text-lg md:text-2xl font-bold text-blue-600">{faqs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 md:block md:text-center">
                  <Key className="h-5 w-5 text-purple-600 md:mx-auto md:mb-2" />
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Acessos</p>
                    <p className="text-lg md:text-2xl font-bold text-purple-600">{acessos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 md:block md:text-center">
                  <Clock className="h-5 w-5 text-yellow-600 md:mx-auto md:mb-2" />
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Pendências</p>
                    <p className="text-lg md:text-2xl font-bold text-yellow-600">{totalPendencias}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 md:block md:text-center">
                  <TrendingUp className="h-5 w-5 text-green-600 md:mx-auto md:mb-2" />
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Concluídas</p>
                    <p className="text-lg md:text-2xl font-bold text-green-600">{concluidas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Quick Actions */}
          <div className="md:hidden mb-6">
            <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/base-conhecimento">
                <Button className="w-full h-20 bg-blue-500 hover:bg-blue-600 text-white flex flex-col gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm">Novo Artigo</span>
                </Button>
              </Link>
              <Link href="/pendencias">
                <Button className="w-full h-20 bg-green-500 hover:bg-green-600 text-white flex flex-col gap-2">
                  <CheckSquare className="h-5 w-5" />
                  <span className="text-sm">Nova Tarefa</span>
                </Button>
              </Link>
              <Link href="/acessos">
                <Button className="w-full h-20 bg-purple-500 hover:bg-purple-600 text-white flex flex-col gap-2">
                  <Key className="h-5 w-5" />
                  <span className="text-sm">Novo Acesso</span>
                </Button>
              </Link>
              <a href="https://eprosyssped.vercel.app/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-20 bg-orange-500 hover:bg-orange-600 text-white flex flex-col gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <span className="text-sm">Abrir SPED</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Navegação Rápida</h2>
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

          {/* Status Overview */}
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
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t shadow-lg z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          <Link href="/" className="flex flex-col items-center p-2 text-blue-600">
            <ArrowRight className="h-5 w-5" />
            <span className="text-xs mt-1">Início</span>
          </Link>
          <Link href="/base-conhecimento" className="flex flex-col items-center p-2 text-gray-600">
            <BookOpen className="h-5 w-5" />
            <span className="text-xs mt-1">Artigos</span>
          </Link>
          <Link href="/pendencias" className="flex flex-col items-center p-2 text-gray-600">
            <CheckSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Tarefas</span>
          </Link>
          <Link href="/acessos" className="flex flex-col items-center p-2 text-gray-600">
            <Key className="h-5 w-5" />
            <span className="text-xs mt-1">Acessos</span>
          </Link>
          <Link href="/configuracao" className="flex flex-col items-center p-2 text-gray-600">
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">Config</span>
          </Link>
        </div>
      </div>
    </>
  )
}
