export function CabecalhoPagina({ titulo, descricao, acoes, filtros }) {
  return (
    <div className="max-w-full">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="text-[1.65rem] font-semibold leading-8 tracking-[-0.04em] text-white">{titulo}</h1>
          {descricao && <p className="mt-1.5 max-w-xl text-sm leading-5 text-white/60">{descricao}</p>}
        </div>
        {acoes && <div className="flex flex-wrap items-center gap-2.5">{acoes}</div>}
      </div>
      {filtros && <div className="mt-6 flex flex-wrap items-center gap-2">{filtros}</div>}
    </div>
  )
}

export function FiltroPilula({ ativo, onClick, children, contagem }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium transition ${ativo ? 'bg-white text-ink' : 'bg-hero-ctrl text-white/80 hover:bg-hero-hover hover:text-white'}`}
    >
      {children}
      {contagem !== undefined && <span className={`text-xs ${ativo ? 'text-ink/60' : 'text-white/50'}`}>{contagem}</span>}
    </button>
  )
}

export function AbasPagina({ abas, ativa, aoMudar }) {
  return (
    <div role="tablist" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-white/10 p-1">
      {abas.map((aba) => (
        <button
          key={aba.id}
          id={`aba-${aba.id}`}
          type="button"
          role="tab"
          aria-selected={ativa === aba.id}
          aria-controls={`painel-${aba.id}`}
          onClick={() => aoMudar(aba.id)}
          className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-1.5 text-[0.82rem] font-medium transition ${ativa === aba.id ? 'bg-white text-ink' : 'text-white/70 hover:text-white'}`}
        >
          {aba.rotulo}
          {aba.contagem !== undefined && <span className={`ml-2 text-xs ${ativa === aba.id ? 'text-ink/60' : 'text-white/50'}`}>{aba.contagem}</span>}
        </button>
      ))}
    </div>
  )
}
