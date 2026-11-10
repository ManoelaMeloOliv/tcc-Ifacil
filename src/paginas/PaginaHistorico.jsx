import { useCallback, useMemo, useState } from 'react'
import { AvisoConsulta } from '../componentes/interface/AvisoConsulta'
import { CabecalhoPagina, FiltroPilula } from '../componentes/painel/CabecalhoPagina'
import { useConsulta } from '../componentes/interface/useConsulta'
import { IconeConversa, IconeSetaDireita, IconeBusca, IconeWhatsApp, IconeLixeira, IconeCalendario } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { PainelConversa } from '../componentes/painel/PainelConversa'
import { formatarDataAtendimento, buscarHistoricoAtendimentos, excluirConversas, intervaloDoFiltro, statusAtendimento } from '../servicos/historico'

const filtrosStatus = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'encaminhada', rotulo: 'Aguardando atendente' },
  { valor: 'em_andamento', rotulo: 'Em andamento' },
  { valor: 'resolvida', rotulo: 'Respondidos pelo bot' },
  { valor: 'finalizada', rotulo: 'Finalizados' },
]

function diaLocal(deslocamentoDias = 0) {
  const data = new Date()
  data.setDate(data.getDate() + deslocamentoDias)
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

const classeCampo = 'rounded-lg border border-slate-200 bg-superficie px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
const classeAtalho = (ativo) => `rounded-lg px-3 py-2 text-xs font-semibold transition ${ativo ? 'bg-emerald-400 text-ink' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`

export function PaginaHistorico() {
  const [dia, definirDia] = useState('')
  const [horaInicio, definirHoraInicio] = useState('')
  const [horaFim, definirHoraFim] = useState('')
  const intervalo = intervaloDoFiltro({ dia, horaInicio, horaFim })
  const inicioFiltro = intervalo?.inicio
  const fimFiltro = intervalo?.fim
  const consultaHistorico = useCallback(
    () => buscarHistoricoAtendimentos(inicioFiltro ? { inicio: inicioFiltro, fim: fimFiltro } : null),
    [inicioFiltro, fimFiltro],
  )
  const { dados: historico, carregando, erro, recarregar } = useConsulta(consultaHistorico, [])
  const [excluindo, definirExcluindo] = useState(false)
  const [erroExclusao, definirErroExclusao] = useState(null)
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

  async function excluir(ids, descricao) {
    if (!ids.length) return
    if (!window.confirm(`Excluir ${descricao}? As mensagens são apagadas de vez e não dá para desfazer.`)) return
    definirExcluindo(true)
    definirErroExclusao(null)
    try {
      await excluirConversas(ids)
      if (ids.includes(idSelecionado)) definirIdSelecionado(null)
      recarregar()
    } catch (falha) {
      definirErroExclusao(falha.message ?? 'Erro desconhecido')
    } finally {
      definirExcluindo(false)
    }
  }

  function limparFiltroData() {
    definirDia('')
    definirHoraInicio('')
    definirHoraFim('')
  }

  const contagem = (valor) => (valor === 'todos' ? historico.length : historico.filter((item) => item.status === valor).length)

  const cabecalho = (
    <CabecalhoPagina
      titulo="Histórico de atendimentos"
      descricao="Conversas realizadas pelo assistente via WhatsApp. As que aguardam uma pessoa aparecem em destaque."
      filtros={filtrosStatus.map((filtro) => (
        <FiltroPilula key={filtro.valor} ativo={filtroStatus === filtro.valor} onClick={() => definirFiltroStatus(filtro.valor)} contagem={contagem(filtro.valor)}>
          {filtro.rotulo}
        </FiltroPilula>
      ))}
    />
  )

  return (
    <LayoutPainel cabecalho={cabecalho}>
      <AvisoConsulta carregando={carregando} erro={erro} aoTentarNovamente={recarregar}>
      <section className="overflow-hidden cartao">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4">
          <div className="relative flex-1">
            <IconeBusca className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busca}
              onChange={(evento) => definirBusca(evento.target.value)}
              placeholder="Buscar por número ou palavra-chave..."
              aria-label="Buscar atendimento"
              className="w-full rounded-lg border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <IconeCalendario className="h-4 w-4 text-slate-400" />
              <button type="button" onClick={() => definirDia(diaLocal(0))} className={classeAtalho(dia === diaLocal(0))}>Hoje</button>
              <button type="button" onClick={() => definirDia(diaLocal(-1))} className={classeAtalho(dia === diaLocal(-1))}>Ontem</button>
              <button type="button" onClick={limparFiltroData} className={classeAtalho(!dia)}>Todos os dias</button>
            </div>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Dia
              <input type="date" value={dia} onChange={(evento) => definirDia(evento.target.value)} className={classeCampo} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Das
              <input type="time" value={horaInicio} onChange={(evento) => definirHoraInicio(evento.target.value)} disabled={!dia} className={`${classeCampo} disabled:opacity-50`} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Até
              <input type="time" value={horaFim} onChange={(evento) => definirHoraFim(evento.target.value)} disabled={!dia} className={`${classeCampo} disabled:opacity-50`} />
            </label>
            <button
              type="button"
              onClick={() => excluir(atendimentosVisiveis.map((item) => item.id), `${atendimentosVisiveis.length} conversa(s) listada(s)`)}
              disabled={excluindo || atendimentosVisiveis.length === 0}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconeLixeira className="h-4 w-4" />
              {excluindo ? 'Excluindo...' : `Excluir ${atendimentosVisiveis.length} listada(s)`}
            </button>
          </div>
          {erroExclusao && <p role="alert" className="text-xs text-red-600">Não foi possível excluir: {erroExclusao}</p>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="bg-emerald-50 text-xs font-medium text-emerald-800">
                <th scope="col" className="px-4 py-3.5">Usuário</th>
                <th scope="col" className="px-4 py-3.5">Última mensagem</th>
                <th scope="col" className="px-4 py-3.5">Tema</th>
                <th scope="col" className="px-4 py-3.5">Data</th>
                <th scope="col" className="px-4 py-3.5">Status</th>
                <th scope="col" className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {atendimentosVisiveis.map((item) => (
                <tr key={item.id} onClick={() => definirIdSelecionado(item.id)} className={`cursor-pointer transition ${item.status === 'encaminhada' ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-slate-50/60'}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold bg-slate-100 text-slate-600`}>{item.iniciais}</span>
                      <div>
                        <p className="whitespace-nowrap text-sm font-semibold text-slate-800">{item.nome}</p>
                        <p className="whitespace-nowrap font-mono text-xs text-slate-500">{item.telefone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[16rem] px-4 py-4"><p className="truncate text-sm text-slate-600">{item.ultimaMensagem}</p><p className="mt-1 text-xs text-slate-400">{item.totalMensagens} mensagens · {item.tempoResposta.toFixed(1).replace('.', ',')}s de resposta</p></td>
                  <td className="px-4 py-4"><span className="text-sm text-slate-500">{item.tema}</span></td>
                  <td className="whitespace-nowrap px-4 py-4"><span className="font-mono text-xs text-slate-600">{formatarDataAtendimento(item.iniciadaEm)}</span></td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${statusAtendimento[item.status].classes}`}>{statusAtendimento[item.status].rotulo}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {item.linkWhatsapp && (
                        <a href={item.linkWhatsapp} target="_blank" rel="noreferrer" onClick={(evento) => evento.stopPropagation()} className={`rounded-lg p-2 transition ${item.status === 'encaminhada' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-700'}`} aria-label={`Abrir conversa com ${item.nome} no WhatsApp`} title="Abrir no WhatsApp">
                          <IconeWhatsApp className="h-4 w-4" />
                        </a>
                      )}
                      <button type="button" onClick={(evento) => { evento.stopPropagation(); excluir([item.id], `a conversa com ${item.nome}`) }} disabled={excluindo} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label={`Excluir conversa com ${item.nome}`} title="Excluir conversa">
                        <IconeLixeira className="h-4 w-4" />
                      </button>
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

        <div className="border-t border-slate-100 px-4 py-3.5 text-xs text-slate-400">
          {atendimentosVisiveis.length} de {historico.length} atendimentos{dia ? ' no período filtrado' : ''}
        </div>
      </section>
      </AvisoConsulta>

      {atendimentoSelecionado && (
        <PainelConversa
          key={atendimentoSelecionado.id}
          atendimento={atendimentoSelecionado}
          aoFechar={() => definirIdSelecionado(null)}
          aoFinalizar={recarregar}
          aoExcluir={() => excluir([atendimentoSelecionado.id], `a conversa com ${atendimentoSelecionado.nome}`)}
          excluindo={excluindo}
        />
      )}
    </LayoutPainel>
  )
}
