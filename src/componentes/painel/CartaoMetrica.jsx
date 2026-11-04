import { createElement } from 'react'

export function CartaoMetrica({ titulo, valor, detalhe, icone, destaque = 'verde' }) {
  const destaques = {
    verde: 'bg-emerald-50 text-emerald-700',
    vermelho: 'bg-red-50 text-red-600',
    cinza: 'bg-slate-100 text-slate-600',
  }

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{valor}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${destaques[destaque]}`}>
          {createElement(icone, { className: 'h-5 w-5' })}
        </span>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{detalhe}</p>
    </article>
  )
}
