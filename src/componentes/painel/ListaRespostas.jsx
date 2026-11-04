import { EtiquetaCategoria } from './EtiquetaCategoria'
import { IconeBusca, IconeLapis, IconeLixeira, IconeSetaBaixo, IconeSetaCima } from './IconesPainel'

function Chip({ ativo, onClick, children, contagem }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${ativo ? 'bg-emerald-400 text-ink' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
    >
      {children}
      <span className={ativo ? 'text-ink/60' : 'text-slate-400'}>{contagem}</span>
    </button>
  )
}

export function ListaRespostas({
  respostas,
  respostasVisiveis,
  categorias,
  busca,
  aoBuscar,
  filtroCategoria,
  aoFiltrar,
  podeOrdenar,
  salvando,
  buscarCategoria,
  aoMover,
  aoEditar,
  aoApagar,
}) {
  return (
    <section className="cartao overflow-hidden" id="painel-respostas" role="tabpanel" aria-labelledby="aba-respostas">
      <div className="space-y-3 border-b border-slate-200 p-4">
        <div className="relative">
          <IconeBusca className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busca}
            onChange={(evento) => aoBuscar(evento.target.value)}
            placeholder="Buscar pergunta ou resposta..."
            aria-label="Buscar pergunta"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0" aria-label="Filtrar por assunto">
          <Chip ativo={filtroCategoria === 'todas'} onClick={() => aoFiltrar('todas')} contagem={respostas.length}>Todas</Chip>
          {categorias.map((categoria) => (
            <Chip
              key={categoria.id}
              ativo={filtroCategoria === categoria.id}
              onClick={() => aoFiltrar(categoria.id)}
              contagem={respostas.filter((item) => item.categoriaId === categoria.id).length}
            >
              {categoria.nome}
            </Chip>
          ))}
        </div>
      </div>

      {respostasVisiveis.length === 0 ? (
        <p className="px-5 py-14 text-center text-sm text-slate-500">Nenhuma resposta encontrada para esse filtro.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {respostasVisiveis.map((item, indice) => (
            <li key={item.id} className="flex flex-col gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-start sm:gap-4 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.pergunta}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{item.resposta}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <EtiquetaCategoria categoria={buscarCategoria(item.categoriaId)} />
                  {!item.ativa && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Inativa</span>}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
                {podeOrdenar && (
                  <>
                    <button type="button" onClick={() => aoMover(indice, -1)} disabled={salvando || indice === 0} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label={`Subir ${item.pergunta}`}><IconeSetaCima className="h-4 w-4" /></button>
                    <button type="button" onClick={() => aoMover(indice, 1)} disabled={salvando || indice === respostasVisiveis.length - 1} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label={`Descer ${item.pergunta}`}><IconeSetaBaixo className="h-4 w-4" /></button>
                  </>
                )}
                <button type="button" onClick={() => aoEditar(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700" aria-label={`Editar ${item.pergunta}`}><IconeLapis className="h-4 w-4" /></button>
                <button type="button" onClick={() => aoApagar(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Excluir ${item.pergunta}`}><IconeLixeira className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-1 border-t border-emerald-100 bg-emerald-50 px-5 py-3 text-xs text-emerald-800 sm:flex-row sm:justify-between">
        <span>{respostasVisiveis.length} de {respostas.length} respostas</span>
        <span>{podeOrdenar ? 'Use as setas para definir a ordem no submenu.' : 'Escolha um assunto, sem busca, para ordenar.'}</span>
      </div>
    </section>
  )
}
