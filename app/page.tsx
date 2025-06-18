import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// A importação do SpedChart foi removida daqui.
import { supabase, type Pendencia } from "@/lib/supabase";

// A função que busca as estatísticas permanece, pois os outros cards continuam.
async function getStats() {
  const { count: faqs } = await supabase
    .from("base_conhecimento")
    .select("*", { count: "exact", head: true });

  const { count: acessos } = await supabase
    .from("acessos")
    .select("*", { count: "exact", head: true });

  const { data: pendenciasData, error } = await supabase
    .from("pendencias")
    .select("status");

  if (error) {
    console.error("Erro ao buscar pendências:", error);
    // Retorna um valor padrão em caso de erro para não quebrar a página.
    return { faqs: faqs ?? 0, acessos: acessos ?? 0, naoConcluidas: 0 };
  }

  const pendencias = pendenciasData as Pendencia[];
  const naoConcluidas =
    pendencias?.filter((p) => p.status === "nao-concluido").length ?? 0;

  return {
    faqs: faqs ?? 0,
    acessos: acessos ?? 0,
    naoConcluidas,
  };
}

export default async function Home() {
  const { faqs, acessos, naoConcluidas } = await getStats();

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu sistema de gerenciamento.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Artigos na Base</CardTitle>
            <CardDescription>Total de artigos de conhecimento.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{faqs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Acessos Gerenciados</CardTitle>
            <CardDescription>Total de credenciais salvas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{acessos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pendências</CardTitle>
            <CardDescription>Tarefas não concluídas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{naoConcluidas}</p>
          </CardContent>
        </Card>
      </div>
      {/* A seção do card do Gráfico SPED foi completamente removida daqui. */}
    </main>
  );
}
