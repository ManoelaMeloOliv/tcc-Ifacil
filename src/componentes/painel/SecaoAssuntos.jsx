import { useState } from 'react'
import { IconeSetaBaixo, IconeSetaCima, IconeMais, IconeLixeira } from './IconesPainel'
import { criarAssunto, excluirAssunto, ordenarAssuntos, renomearAssunto } from '../../servicos/perguntas'

function LinhaAssunto({ categoria, posicao, numeroMenu, total, perguntas, ocupado, aoRenomear, aoMover, aoExcluir }) {
  const [nome, setNome] = useState(categoria.nome)
  const alterado = nome.trim() !== categoria.nome
  const podeExcluir = !categoria.nativa && perguntas === 0
  const motivoBloqueio = categoria.nativa ? 'Assunto padrão do sistema: pode ser renomeado, mas não excluído' : 'Mova ou exclua as perguntas antes de excluir o assunto'

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-5">
      <span className="w-6 text-sm font-bold text-slate-400">{numeroMenu ?? '–'}</span>
      <label htmlFor={`assunto-${categoria.id}`} className="sr-only">Nome do assunto</label>
      <input
        id={`assunto-${categoria.id}`}
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        maxLength={40}
        className="min-w-[10rem] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      <span className="text-xs text-slate-400">{perguntas === 0 ? 'Fora do menu: sem perguntas ativas' : `${perguntas} ${perguntas === 1 ? 'pergunta ativa' : 'perguntas ativas'}`}</span>
      {alterado && (
        <button type="button" onClick={() => aoRenomear(categoria, nome.trim())} disabled={ocupado || !nome.trim()} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-emerald-300 disabled:opacity-50">Salvar</button>
      )}
      <div className="flex gap-1">
        <button type="button" onClick={() => aoMover(posicao - 1, -1)} disabled={ocupado || posicao === 1} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label={`Subir ${categoria.nome}`}><IconeSetaCima className="h-4 w-4" /></button>
        <button type="button" onClick={() => aoMover(posicao - 1, 1)} disabled={ocupado || posicao === total} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label={`Descer ${categoria.nome}`}><IconeSetaBaixo className="h-4 w-4" /></button>
        <button type="button" onClick={() => aoExcluir(categoria)} disabled={ocupado || !podeExcluir} title={podeExcluir ? undefined : motivoBloqueio} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30" aria-label={`Excluir ${categoria.nome}`}><IconeLixeira className="h-4 w-4" /></button>
      </div>
    </li>
  )
}

export function SecaoAssuntos({ categorias, respostas, aoAlterar }) {
  const [novo, setNovo] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState(null)
  const perguntasAtivas = (id) => respostas.filter((item) => item.categoriaId === id && item.ativa).length
  const noMenu = categorias.filter((categoria) => perguntasAtivas(categoria.id) > 0)

  async function executar(acao) {
    setOcupado(true)
    setErro(null)
    try {
      await acao()
      aoAlterar()
    } catch (falha) {
      setErro(falha.message ?? 'Erro desconhecido')
    } finally {
      setOcupado(false)
    }
  }

  function moverAssunto(indice, direcao) {
    const ids = categorias.map((categoria) => categoria.id)
    const destino = indice + direcao
    ;[ids[indice], ids[destino]] = [ids[destino], ids[indice]]
    executar(() => ordenarAssuntos(ids))
  }

  function excluirComConfirmacao(categoria) {
    if (window.confirm(`Excluir o assunto "${categoria.nome}"?`)) executar(() => excluirAssunto(categoria.id))
  }

  function criarNovoAssunto(evento) {
    evento.preventDefault()
    const proximaOrdem = Math.max(0, ...categorias.map((categoria) => categoria.ordem ?? 0)) + 1
    executar(async () => {
      await criarAssunto(novo.trim(), proximaOrdem)
      setNovo('')
    })
  }

  return (
    <section id="painel-assuntos" role="tabpanel" aria-labelledby="aba-assuntos">
      <div className="mb-4">
        <h2 id="titulo-assuntos" className="titulo-display text-lg text-slate-900">Assuntos do menu</h2>
        <p className="mt-1 text-sm text-slate-500">Os assuntos aparecem no WhatsApp nesta ordem. Assunto sem pergunta ativa fica fora do menu, e a numeração é ajustada sozinha.</p>
      </div>

      <div className="overflow-hidden cartao">
        <ol className="divide-y divide-slate-100">
          {categorias.map((categoria, indice) => (
            <LinhaAssunto
              key={`${categoria.id}-${categoria.nome}`}
              categoria={categoria}
              posicao={indice + 1}
              numeroMenu={noMenu.includes(categoria) ? noMenu.indexOf(categoria) + 1 : null}
              total={categorias.length}
              perguntas={perguntasAtivas(categoria.id)}
              ocupado={ocupado}
              aoRenomear={(alvo, nome) => executar(() => renomearAssunto(alvo.id, nome))}
              aoMover={moverAssunto}
              aoExcluir={excluirComConfirmacao}
            />
          ))}
        </ol>

        <form onSubmit={criarNovoAssunto} className="flex flex-wrap gap-3 border-t border-emerald-100 bg-emerald-50 px-4 py-4 sm:px-5">
          <label htmlFor="novo-assunto" className="sr-only">Novo assunto</label>
          <input
            id="novo-assunto"
            value={novo}
            onChange={(evento) => setNovo(evento.target.value)}
            maxLength={40}
            placeholder="Nome do novo assunto"
            className="min-w-[10rem] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <button type="submit" disabled={ocupado || !novo.trim()} className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-ink transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">
            <IconeMais className="h-4 w-4" />Adicionar assunto
          </button>
        </form>
      </div>
      {erro && <p role="alert" className="mt-2 text-xs text-red-600">Não foi possível salvar: {erro}</p>}
    </section>
  )
}
