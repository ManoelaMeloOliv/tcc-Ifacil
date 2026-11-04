const formatadorNumero = new Intl.NumberFormat('pt-BR')

export function PerguntasFrequentes({ perguntas, nomeMes }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-bold text-slate-900">Perguntas mais frequentes</h2><p className="mt-1 text-sm text-slate-500">Principais dúvidas recebidas em {nomeMes}</p></div>
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">Top 3</span>
      </div>
      <div className="mt-5 divide-y divide-slate-100">
        {perguntas.map((item) => (
          <div key={item.posicao} className="flex items-center gap-4 py-4 first:pt-1 last:pb-0">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${item.posicao === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.posicao}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.pergunta}</p><p className="mt-1 text-xs text-slate-400">{item.tema} · {formatadorNumero.format(item.quantidade)} {item.quantidade === 1 ? 'vez' : 'vezes'}</p></div>
          </div>
        ))}
        {perguntas.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Nenhuma pergunta registrada neste mês.</p>}
      </div>
    </article>
  )
}
