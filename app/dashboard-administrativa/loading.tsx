export default function DashboardLoadingPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 lg:p-6">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - ranking */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4 h-full">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                    <div className="h-2 w-full bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center column - operations */}
        <div className="lg:col-span-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 h-32">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3"></div>
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column - analytics */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4 h-80">
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
