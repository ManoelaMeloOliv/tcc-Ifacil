import { createElement } from 'react'

// diferenca: quanto mudou em relação ao período anterior, já formatada (ex.: "+3", "-9,4 s").
// sinal: número usado só para decidir a cor (positivo, negativo ou zero).
export function CartaoMetrica({ titulo, valor, unidade, selo, diferenca, sinal = 0, legenda, detalhe, icone, menorEMelhor = false }) {
  const neutra = !sinal
  const boa = menorEMelhor ? sinal < 0 : sinal > 0
  const cor = neutra ? 'bg-superficie text-slate-600' : boa ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'

  return (
    <article className="cartao cartao-verde p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-ink">
          {createElement(icone, { className: 'h-[18px] w-[18px]' })}
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{titulo}</p>
        {selo && <span className="rounded-md bg-superficie px-2 py-1 text-xs font-medium text-slate-500">{selo}</span>}
      </div>

      <p className="numero-display mt-6 text-[2rem] text-slate-900">
        {valor}
        {unidade && <span className="ml-1.5 text-base font-medium tracking-normal text-slate-500">{unidade}</span>}
      </p>

      <div className="mt-3 flex min-h-12 flex-col gap-1 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {diferenca && <span className={`rounded-md px-1.5 py-0.5 font-semibold ${cor}`}>{diferenca}</span>}
          {legenda && <span>{legenda}</span>}
        </div>
        {detalhe && <span className="text-slate-500">{detalhe}</span>}
      </div>
    </article>
  )
}
