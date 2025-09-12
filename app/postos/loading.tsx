import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Search bar skeleton */}
      <div className="h-10 w-full bg-muted animate-pulse rounded" />

      {/* Loading spinner */}
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando postos...</span>
      </div>
    </div>
  )
}
