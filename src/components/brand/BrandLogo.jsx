export function BrandLogo({ light = false }) {
  const textColor = light ? 'text-white' : 'text-slate-900'

  return (
    <div className="inline-flex items-center gap-3" aria-label="iFácil">
      <div className="grid grid-cols-2 gap-1" aria-hidden="true">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500" />
      </div>

      <div className={`text-2xl font-extrabold tracking-tight ${textColor}`}>
        i<span className="text-emerald-500">Fácil</span>
      </div>
    </div>
  )
}
