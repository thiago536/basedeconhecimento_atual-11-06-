import { createClient } from "@supabase/supabase-js";

// ============================================================================
// TIPOS DO BANCO DE DADOS (DATABASE TYPES)
// Manter os tipos aqui ajuda a garantir que os dados do seu app
// estão consistentes com a estrutura do seu banco.
// ============================================================================

export type FAQ = {
  id: number;
  title: string;
  category: string;
  description: string;
  author?: string;
  images?: any[];
  created_at: string;
};

export type Pendencia = {
  id: number;
  titulo: string;
  descricao: string;
  status: "nao-concluido" | "em-andamento" | "concluido";
  urgente: boolean;
  data: string;
  author?: string;
};

export type Acesso = {
  id: number;
  posto: string;
  maquina: string;
  usuario: string;
  senha: string;
  adquirente?: string;
  trabalho_andamento?: string;
  status_maquininha?: string;
  expandido?: boolean;
  created_at?: string;
};

export type Author = {
  id: number;
  name: string;
  created_at: string;
};

// ============================================================================
// CRIAÇÃO DO CLIENTE SUPABASE (CLIENT-SIDE)
// ============================================================================

// Pega as variáveis de ambiente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica se as variáveis de ambiente foram definidas no seu arquivo .env.local.
// Se não, lança um erro claro, o que facilita MUITO a depuração.
if (!supabaseUrl) {
  throw new Error(
    "ERRO CRÍTICO: A variável de ambiente NEXT_PUBLIC_SUPABASE_URL não está definida. Verifique seu arquivo .env.local"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "ERRO CRÍTICO: A variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida. Verifique seu arquivo .env.local"
  );
}

// Cria e exporta uma ÚNICA instância do cliente Supabase para ser usada
// em todo o lado do cliente (no navegador).
// Esta é a maneira moderna e recomendada.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// NOTA: O seu código anterior tinha uma versão para o servidor (createServerSupabaseClient).
// Isso é útil para Server Actions ou API Routes, mas não é a causa do seu erro atual
// no lado do cliente. Mantive o arquivo focado em resolver o problema do navegador.
