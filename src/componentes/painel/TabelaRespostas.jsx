import { EtiquetaCategoria } from './EtiquetaCategoria'
import { IconeSetaBaixo, IconeSetaCima, IconeLapis, IconeBusca, IconeLixeira } from './IconesPainel'

export function TabelaRespostas({
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
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <IconeBusca className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busca}
            onChange={(evento) => aoBuscar(evento.target.value)}
            placeholder="Buscar pergunta ou resposta..."
            aria-label="Buscar pergunta"
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => aoFiltrar('todas')} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${filtroCategoria === 'todas' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todas</button>
          {categorias.map((categoria) => (
            <button key={categoria.id} type="button" onClick={() => aoFiltrar(categoria.id)} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${filtroCategoria === categoria.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {categoria.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-5 py-3.5">Pergunta</th>
              <th scope="col" className="px-5 py-3.5">Resposta</th>
              <th scope="col" className="px-5 py-3.5">Assunto</th>
              <th scope="col" className="px-5 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {respostasVisiveis.map((item, indice) => (
              <tr key={item.id} className="align-top transition hover:bg-slate-50/60">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-800">{item.pergunta}</p>
                  {!item.ativa && <span className="mt-1.5 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Inativa</span>}
                </td>
                <td className="max-w-md px-5 py-4"><p className="line-clamp-2 text-sm leading-6 text-slate-500">{item.resposta}</p></td>
                <td className="px-5 py-4"><EtiquetaCategoria categoria={buscarCategoria(item.categoriaId)} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5">
                    {podeOrdenar && (
                      <>
                        <button type="button" onClick={() => aoMover(indice, -1)} disabled={salvando || indice === 0} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label={`Subir ${item.pergunta}`}><IconeSetaCima className="h-4 w-4" /></button>
                        <button type="button" onClick={() => aoMover(indice, 1)} disabled={salvando || indice === respostasVisiveis.length - 1} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label={`Descer ${item.pergunta}`}><IconeSetaBaixo className="h-4 w-4" /></button>
                      </>
                    )}
                    <button type="button" onClick={() => aoEditar(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700" aria-label={`Editar ${item.pergunta}`}><IconeLapis className="h-4 w-4" /></button>
                    <button type="button" onClick={() => aoApagar(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Excluir ${item.pergunta}`}><IconeLixeira className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {respostasVisiveis.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-slate-400">Nenhuma resposta encontrada para esse filtro.</p>
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 px-5 py-3.5 text-xs text-slate-400">
        <span>{respostasVisiveis.length} de {respostas.length} respostas cadastradas</span>
        <span>{podeOrdenar ? 'As setas definem a ordem das perguntas no submenu.' : 'Escolha um assunto, sem busca, para ordenar as perguntas.'}</span>
      </div>
    </section>
  )
}
