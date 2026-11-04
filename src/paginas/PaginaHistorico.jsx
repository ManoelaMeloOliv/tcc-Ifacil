import { useMemo, useState } from 'react'
import { AvisoConsulta } from '../componentes/interface/AvisoConsulta'
import { useConsulta } from '../componentes/interface/useConsulta'
import { IconeCalendario, IconeConversa, IconeSetaDireita, IconeBusca, IconeWhatsApp } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { PainelConversa } from '../componentes/painel/PainelConversa'
import { formatarDataAtendimento, buscarHistoricoAtendimentos, statusAtendimento } from '../servicos/historico'

const coresAvatar = [
  'bg-emerald-100 text-emerald-700',
  'bg-red-100 text-red-600',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
]

const filtrosStatus = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'encaminhada', rotulo: 'Aguardando atendente' },
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'resolvida', rotulo: 'Respondidos pelo bot' },
  { valor: 'finalizada', rotulo: 'Finalizados' },
]

export function PaginaHistorico() {
  const { dados: historico, carregando, erro, recarregar } = useConsulta(buscarHistoricoAtendimentos, [])
  const [busca, definirBusca] = useState('')
  const [filtroStatus, definirFiltroStatus] = useState('todos')
  const [idSelecionado, definirIdSelecionado] = useState(null)
  const atendimentoSelecionado = historico.find((item) => item.id === idSelecionado)

  const atendimentosVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return historico.filter((item) => {
      const combinaStatus = filtroStatus === 'todos' || item.status === filtroStatus
      const combinaBusca = !termo
        || item.nome.toLowerCase().includes(termo)
        || item.telefone.toLowerCase().includes(termo)
        || item.ultimaMensagem.toLowerCase().includes(termo)
      return combinaStatus && combinaBusca
    })
  }, [historico, busca, filtroStatus])

  const totalEncaminhados = historico.filter((item) => item.status === 'encaminhada').length

  return (
    <LayoutPainel>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">ATENDIMENTOS</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Histórico de atendimentos</h1>
          <p className="mt-2 text-sm text-slate-500">Conversas realizadas pelo assistente via WhatsApp.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => definirFiltroStatus('encaminhada')} className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-left transition hover:bg-red-100" title="Mostrar só quem aguarda atendente">
            <p className="text-xs text-red-500">Aguardando atendente</p>
            <p className="text-sm font-bold text-red-700">{totalEncaminhados} {totalEncaminhados === 1 ? 'atendimento' : 'atendimentos'}</p>
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            <IconeCalendario className="h-4 w-4" />Filtrar por data
          </button>
        </div>
      </div>

      <AvisoConsulta carregando={carregando} erro={erro} aoTentarNovamente={recarregar}>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <IconeBusca className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busca}
              onChange={(evento) => definirBusca(evento.target.value)}
              placeholder="Buscar por número ou palavra-chave..."
              aria-label="Buscar atendimento"
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filtrosStatus.map((filtro) => (
              <button key={filtro.valor} type="button" onClick={() => definirFiltroStatus(filtro.valor)} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${filtroStatus === filtro.valor ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {filtro.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-3.5">Usuário</th>
                <th scope="col" className="px-5 py-3.5">Última mensagem</th>
                <th scope="col" className="px-5 py-3.5">Tema</th>
                <th scope="col" className="px-5 py-3.5">Data</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {atendimentosVisiveis.map((item, indice) => (
                <tr key={item.id} onClick={() => definirIdSelecionado(item.id)} className={`cursor-pointer transition ${item.status === 'encaminhada' ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50/60'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${coresAvatar[indice % coresAvatar.length]}`}>{item.iniciais}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.nome}</p>
                        <p className="text-xs text-slate-400">{item.telefone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-sm px-5 py-4"><p className="truncate text-sm text-slate-600">{item.ultimaMensagem}</p><p className="mt-1 text-xs text-slate-400">{item.totalMensagens} mensagens · {item.tempoResposta.toFixed(1).replace('.', ',')}s de resposta</p></td>
                  <td className="px-5 py-4"><span className="text-sm text-slate-500">{item.tema}</span></td>
                  <td className="whitespace-nowrap px-5 py-4"><span className="text-sm text-slate-500">{formatarDataAtendimento(item.iniciadaEm)}</span></td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusAtendimento[item.status].classes}`}>{statusAtendimento[item.status].rotulo}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {item.linkWhatsapp && (
                        <a href={item.linkWhatsapp} target="_blank" rel="noreferrer" onClick={(evento) => evento.stopPropagation()} className={`rounded-lg p-2 transition ${item.status === 'encaminhada' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-700'}`} aria-label={`Abrir conversa com ${item.nome} no WhatsApp`} title="Abrir no WhatsApp">
                          <IconeWhatsApp className="h-4 w-4" />
                        </a>
                      )}
                      <button type="button" onClick={(evento) => { evento.stopPropagation(); definirIdSelecionado(item.id) }} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label={`Ver conversa com ${item.nome}`} title="Ver conversa">
                        <IconeSetaDireita className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {atendimentosVisiveis.length === 0 && (
            <div className="px-5 py-12 text-center">
              <IconeConversa className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">Nenhum atendimento encontrado para esse filtro.</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-3.5 text-xs text-slate-400">
          {atendimentosVisiveis.length} de {historico.length} atendimentos
        </div>
      </section>
      </AvisoConsulta>

      {atendimentoSelecionado && (
        <PainelConversa
          key={atendimentoSelecionado.id}
          atendimento={atendimentoSelecionado}
          aoFechar={() => definirIdSelecionado(null)}
          aoFinalizar={recarregar}
        />
      )}
    </LayoutPainel>
  )
}
