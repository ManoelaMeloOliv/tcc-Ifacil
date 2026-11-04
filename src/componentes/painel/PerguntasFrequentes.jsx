const formatadorNumero = new Intl.NumberFormat('pt-BR')

export function PerguntasFrequentes({ perguntas, nomeMes }) {
  return (
    <article className="cartao cartao-verde p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="titulo-display text-base text-slate-900">Perguntas mais frequentes</h2>
          <p className="mt-1 text-sm text-slate-500">Principais dúvidas recebidas em {nomeMes}</p>
        </div>
        <span className="rounded-md bg-superficie px-2 py-1 text-xs font-medium text-emerald-700">Top 3</span>
      </div>

      <ol className="mt-4 divide-y divide-emerald-100">
        {perguntas.map((item) => (
          <li key={item.posicao} className="flex items-center gap-4 py-3.5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${item.posicao === 1 ? 'bg-emerald-400 text-ink' : 'bg-superficie text-slate-600'}`}>{item.posicao}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{item.pergunta}</p>
              <p className="mt-0.5 text-xs text-slate-500">{item.tema}</p>
            </div>
            <p className="shrink-0 text-right text-sm font-medium text-slate-900">
              {formatadorNumero.format(item.quantidade)}
              <span className="ml-1 text-xs font-normal text-slate-500">{item.quantidade === 1 ? 'vez' : 'vezes'}</span>
            </p>
          </li>
        ))}
        {perguntas.length === 0 && <li className="py-8 text-center text-sm text-slate-500">Nenhuma pergunta registrada neste mês.</li>}
      </ol>
    </article>
  )
}
