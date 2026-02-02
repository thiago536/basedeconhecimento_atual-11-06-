import React from "react"

// Função para detectar URLs e convertê-las em links clicáveis
export function TextWithLinks({ text, className }: { text: string; className?: string }) {
  if (!text) return React.createElement("div", { className }, "")

  // Regex melhorada para detectar URLs (http, https, www, e domínios simples)
  const urlRegex =
    /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi

  // Dividir o texto em partes, separando URLs do texto normal
  const parts = text.split(urlRegex)

  return React.createElement(
    "div",
    { className },
    parts.map((part, index) => {
      // Resetar o regex para cada teste
      urlRegex.lastIndex = 0

      // Se a parte corresponde ao regex de URL, criar um link
      if (urlRegex.test(part)) {
        // Garantir que a URL tenha protocolo
        let href = part
        if (!part.startsWith("http://") && !part.startsWith("https://")) {
          href = `https://${part}`
        }

        return React.createElement(
          "a",
          {
            key: index,
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-600 hover:text-blue-800 underline break-all transition-colors",
          },
          part,
        )
      }

      // Para texto normal, preservar quebras de linha
      return React.createElement(
        "span",
        { key: index },
        part
          .split("\n")
          .flatMap((line, lineIndex, lines) =>
            lineIndex === lines.length - 1 ? line : [line, React.createElement("br", { key: lineIndex })],
          ),
      )
    }),
  )
}

// Função auxiliar para usar em outros componentes
export function convertTextWithLinks(text: string): React.ReactElement {
  return React.createElement(TextWithLinks, { text })
}

// Função para converter URLs em HTML com links clicáveis
export function convertUrlsToLinks(text: string): string {
  if (!text) return text

  // Enhanced regex to detect various URL patterns
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi

  return text.replace(urlRegex, (url) => {
    let href = url

    // Add https:// if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      href = `https://${url}`
    }

    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${url}</a>`
  })
}

// Função para testar se uma string contém URLs
export function containsUrls(text: string): boolean {
  const urlRegex =
    /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi
  return urlRegex.test(text)
}

// Função para extrair todas as URLs de um texto
export function extractUrls(text: string): string[] {
  const urlRegex =
    /(https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi
  return text.match(urlRegex) || []
}

// Função para detectar o número de URLs em um texto
export function detectUrls(text: string): boolean {
  if (!text) return false

  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi
  return urlRegex.test(text)
}

// Função para truncar texto para um comprimento máximo
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Função para remover HTML de uma string
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "")
}
