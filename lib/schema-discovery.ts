import { createClient } from "@supabase/supabase-js"

let schemaConfigCache: SchemaConfig | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export interface SchemaConfig {
  artigosTable: string | null
  pendenciasTable: string | null
  postosTable: string | null
  artigosTitleColumn: string | null
  artigosCreatedAtColumn: string | null
  artigosUpdatedAtColumn: string | null
  artigosIdColumn: string | null
  pendenciasStatusColumn: string | null
  pendenciasCreatedAtColumn: string | null
  pendenciasUpdatedAtColumn: string | null
  pendenciasIdColumn: string | null
}

async function silentFetch(fn: () => Promise<any>): Promise<any> {
  try {
    // Temporariamente sobrescrever console.error para silenciar erros de fetch
    const originalError = console.error
    console.error = () => {}

    const result = await fn()

    // Restaurar console.error
    console.error = originalError

    return result
  } catch (error) {
    // Silenciar completamente qualquer erro
    return { data: null, error: true }
  }
}

/**
 * Verifica se uma tabela existe no Supabase
 * Completamente seguro - NUNCA lança erro ou mostra no console
 */
async function tableExists(supabase: any, tableName: string): Promise<boolean> {
  try {
    const result = await silentFetch(async () => {
      return await supabase.from(tableName).select("id").limit(1).maybeSingle()
    })

    if (!result.error && result.data !== undefined) {
      return true
    }

    return false
  } catch (error) {
    // Captura QUALQUER erro e retorna false silenciosamente
    return false
  }
}

/**
 * Obtém as colunas de uma tabela
 * Retorna array vazio se houver erro
 */
async function getTableColumns(supabase: any, tableName: string): Promise<string[]> {
  try {
    const result = await silentFetch(async () => {
      return await supabase.from(tableName).select("*").limit(1).maybeSingle()
    })

    if (!result.error && result.data) {
      return Object.keys(result.data)
    }

    return []
  } catch (error) {
    return []
  }
}

/**
 * Encontra uma coluna usando nomes possíveis
 */
function findColumn(columns: string[], possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    if (columns.includes(name)) {
      return name
    }
  }
  return columns[0] || null
}

/**
 * Cria configuração vazia
 */
function createEmptyConfig(): SchemaConfig {
  return {
    artigosTable: null,
    pendenciasTable: null,
    postosTable: null,
    artigosTitleColumn: null,
    artigosCreatedAtColumn: null,
    artigosUpdatedAtColumn: null,
    artigosIdColumn: null,
    pendenciasStatusColumn: null,
    pendenciasCreatedAtColumn: null,
    pendenciasUpdatedAtColumn: null,
    pendenciasIdColumn: null,
  }
}

/**
 * Descobre o schema do banco de dados
 * NUNCA lança exceção - sempre retorna configuração válida
 */
export async function getSchemaConfig(): Promise<SchemaConfig> {
  const now = Date.now()

  // Verificar cache
  if (schemaConfigCache && now - cacheTimestamp < CACHE_DURATION) {
    return schemaConfigCache
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl === "your-project-url") {
    const emptyConfig = createEmptyConfig()
    schemaConfigCache = emptyConfig
    cacheTimestamp = now
    return emptyConfig
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const config = createEmptyConfig()

    // Procurar tabela de artigos
    const artigosTables = ["base_conhecimento", "artigos", "faqs", "knowledge_base", "articles"]

    for (const tableName of artigosTables) {
      const exists = await tableExists(supabase, tableName)

      if (exists) {
        config.artigosTable = tableName

        const columns = await getTableColumns(supabase, tableName)
        if (columns.length > 0) {
          config.artigosTitleColumn = findColumn(columns, ["titulo", "title", "pergunta", "question", "nome", "name"])
          config.artigosCreatedAtColumn = findColumn(columns, ["created_at", "criado_em", "data_criacao", "created"])
          config.artigosUpdatedAtColumn = findColumn(columns, [
            "updated_at",
            "atualizado_em",
            "data_atualizacao",
            "updated",
          ])
          config.artigosIdColumn = findColumn(columns, ["id", "uuid", "codigo", "code"])
        }
        break
      }
    }

    // Procurar tabela de pendências
    const pendenciasTables = ["pendencias", "tarefas", "tasks", "todos", "issues"]

    for (const tableName of pendenciasTables) {
      const exists = await tableExists(supabase, tableName)

      if (exists) {
        config.pendenciasTable = tableName

        const columns = await getTableColumns(supabase, tableName)
        if (columns.length > 0) {
          config.pendenciasStatusColumn = findColumn(columns, ["status", "estado", "state", "situacao"])
          config.pendenciasCreatedAtColumn = findColumn(columns, ["created_at", "criado_em", "data_criacao", "created"])
          config.pendenciasUpdatedAtColumn = findColumn(columns, [
            "updated_at",
            "atualizado_em",
            "data_atualizacao",
            "updated",
          ])
          config.pendenciasIdColumn = findColumn(columns, ["id", "uuid", "codigo", "code"])
        }
        break
      }
    }

    // Procurar tabela de postos
    const postosTables = ["postos", "stations", "locations", "sites"]

    for (const tableName of postosTables) {
      const exists = await tableExists(supabase, tableName)

      if (exists) {
        config.postosTable = tableName
        break
      }
    }

    schemaConfigCache = config
    cacheTimestamp = now
    return config
  } catch (error) {
    const emptyConfig = createEmptyConfig()
    schemaConfigCache = emptyConfig
    cacheTimestamp = now
    return emptyConfig
  }
}

export function invalidateSchemaCache(): void {
  schemaConfigCache = null
  cacheTimestamp = 0
  console.log("🔄 [Schema] Cache invalidado")
}
