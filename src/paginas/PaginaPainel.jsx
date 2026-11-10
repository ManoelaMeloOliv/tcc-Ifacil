import { useCallback, useState } from 'react'
import { AvisoConsulta } from '../componentes/interface/AvisoConsulta'
import { useConsulta } from '../componentes/interface/useConsulta'
import { CabecalhoPagina } from '../componentes/painel/CabecalhoPagina'
import { CartaoMetrica } from '../componentes/painel/CartaoMetrica'
import { DistribuicaoTemas } from '../componentes/painel/DistribuicaoTemas'
import { FiltroPeriodo } from '../componentes/painel/FiltroPeriodo'
import { descreverPeriodo, periodoVazio } from '../componentes/painel/periodo'
import { GraficoContatos } from '../componentes/painel/GraficoContatos'
import { IconeConfirmado, IconeConversa, IconePergunta, IconeRelogio } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { ListaAguardando } from '../componentes/painel/ListaAguardando'
import { PerguntasFrequentes } from '../componentes/painel/PerguntasFrequentes'
import { buscarAguardandoAtendente, intervaloDoFiltro } from '../servicos/historico'
import { buscarDistribuicaoTemas, buscarEstatisticasMensais, buscarPerguntasFrequentes, buscarResumoPeriodo } from '../servicos/painel'

const formatadorNumero = new Intl.NumberFormat('pt-BR')

function variacaoPercentual(atual, anterior) {
  if (!anterior) return null
  return ((atual - anterior) / anterior) * 100
}

function taxaResolucaoDoMes(mes) {
  return mes.atendimentos ? (mes.resolvidos / mes.atendimentos) * 100 : 0
}

function virgula(numero, casas = 1) {
  return numero.toFixed(casas).replace('.', ',')
}

const UM_DIA_MS = 24 * 60 * 60 * 1000

function diaAnterior(intervalo) {
  if (!intervalo) return null
  const voltar = (iso) => new Date(new Date(iso).getTime() - UM_DIA_MS).toISOString()
  return { inicio: voltar(intervalo.inicio), fim: voltar(intervalo.fim) }
}

export function PaginaPainel() {
  const estatisticas = useConsulta(buscarEstatisticasMensais, [])
  const meses = estatisticas.dados
  const [chaveSelecionada, definirChaveSelecionada] = useState(null)
  const indice = chaveSelecionada ? meses.findIndex((item) => item.anoMes === chaveSelecionada) : meses.length - 1
  const mesSelecionado = meses[indice] ?? meses.at(-1)
  const [periodo, definirPeriodo] = useState(periodoVazio)
  const intervalo = intervaloDoFiltro(periodo)
  const inicioFiltro = intervalo?.inicio
  const fimFiltro = intervalo?.fim
  const filtrandoDia = Boolean(inicioFiltro)
  const anoMes = filtrandoDia ? null : mesSelecionado?.anoMes

  const resumo = useConsulta(useCallback(
    () => buscarResumoPeriodo(inicioFiltro ? { inicio: inicioFiltro, fim: fimFiltro } : null),
    [inicioFiltro, fimFiltro],
  ), null)
  const resumoAnterior = useConsulta(useCallback(
    () => buscarResumoPeriodo(diaAnterior(inicioFiltro ? { inicio: inicioFiltro, fim: fimFiltro } : null)),
    [inicioFiltro, fimFiltro],
  ), null)

  const temas = useConsulta(useCallback(() => buscarDistribuicaoTemas(anoMes), [anoMes]), [])
  const perguntas = useConsulta(useCallback(() => buscarPerguntasFrequentes(anoMes), [anoMes]), [])
  const aguardando = useConsulta(useCallback(() => buscarAguardandoAtendente(5), []), [])

  const cabecalho = (
    <CabecalhoPagina
      titulo="Olá, Administrador"
      descricao={filtrandoDia
        ? `Como o AIFÁCIL se saiu em ${descreverPeriodo(periodo)}. Escolha "Todos os dias" para voltar à visão por mês.`
        : mesSelecionado ? `Como o AIFÁCIL se saiu em ${mesSelecionado.mesCompleto.toLowerCase()}. Clique em uma barra do gráfico para ver outro mês.` : 'Resumo do atendimento no WhatsApp.'}
    />
  )

  if (!mesSelecionado) {
    return (
      <LayoutPainel cabecalho={cabecalho}>
        <AvisoConsulta carregando={estatisticas.carregando} erro={estatisticas.erro} aoTentarNovamente={estatisticas.recarregar}>
          <p className="cartao py-12 text-center text-sm text-slate-500">Ainda não há atendimentos registrados.</p>
        </AvisoConsulta>
      </LayoutPainel>
    )
  }

  const atual = filtrandoDia ? resumo.dados : mesSelecionado
  const anterior = filtrandoDia ? resumoAnterior.dados : meses[indice - 1]
  const nomePeriodo = filtrandoDia ? descreverPeriodo(periodo) : mesSelecionado.mesCompleto.toLowerCase()
  const selo = filtrandoDia ? descreverPeriodo({ dia: periodo.dia }) : mesSelecionado.mes
  const nomeAnterior = filtrandoDia ? 'dia anterior' : anterior?.mesCompleto.toLowerCase()
  const legendaComparacao = anterior || filtrandoDia ? `vs. ${nomeAnterior ?? 'dia anterior'}` : 'primeiro mês registrado'
  const listaTemas = filtrandoDia ? (resumo.dados?.temas ?? []) : temas.dados
  const listaPerguntas = filtrandoDia ? (resumo.dados?.frequentes ?? []) : perguntas.dados
  const consultaTemas = filtrandoDia ? resumo : temas
  const consultaPerguntas = filtrandoDia ? resumo : perguntas

  const filtro = (
    <section className="cartao p-4" aria-label="Filtro por dia e hora">
      <FiltroPeriodo periodo={periodo} aoMudar={definirPeriodo} rotuloTodos="Por mês" />
    </section>
  )

  if (!atual) {
    return (
      <LayoutPainel cabecalho={cabecalho}>
        {filtro}
        <AvisoConsulta carregando={resumo.carregando} erro={resumo.erro} aoTentarNovamente={resumo.recarregar}>
          <p className="cartao py-12 text-center text-sm text-slate-500">Carregando o período...</p>
        </AvisoConsulta>
      </LayoutPainel>
    )
  }

  const taxaResolucao = taxaResolucaoDoMes(atual)

  return (
    <LayoutPainel cabecalho={cabecalho}>
      {filtro}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        <CartaoMetrica
          titulo="Atendimentos"
          icone={IconeConversa}
          selo={selo}
          valor={formatadorNumero.format(atual.atendimentos)}
          variacao={anterior ? variacaoPercentual(atual.atendimentos, anterior.atendimentos) : null}
          legenda={legendaComparacao}
        />
        <CartaoMetrica
          titulo="Perguntas"
          icone={IconePergunta}
          selo={selo}
          valor={formatadorNumero.format(atual.perguntas)}
          variacao={anterior ? variacaoPercentual(atual.perguntas, anterior.perguntas) : null}
          legenda={legendaComparacao}
        />
        <CartaoMetrica
          titulo="Resolvidos"
          icone={IconeConfirmado}
          selo={selo}
          valor={virgula(taxaResolucao)}
          unidade="%"
          variacao={anterior ? variacaoPercentual(taxaResolucao, taxaResolucaoDoMes(anterior)) : null}
          legenda={`vs. ${anterior ? nomeAnterior : 'mês anterior'} · ${formatadorNumero.format(atual.resolvidos)} sem atendente`}
        />
        <CartaoMetrica
          titulo="Tempo médio"
          icone={IconeRelogio}
          selo={selo}
          valor={virgula(atual.tempoResposta)}
          unidade="s"
          variacao={anterior ? variacaoPercentual(atual.tempoResposta, anterior.tempoResposta) : null}
          menorEMelhor
          legenda={legendaComparacao}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]">
        <GraficoContatos meses={meses} mesSelecionado={mesSelecionado} aoSelecionarMes={(item) => { definirPeriodo(periodoVazio); definirChaveSelecionada(item.anoMes) }} />
        <AvisoConsulta carregando={aguardando.carregando} erro={aguardando.erro} aoTentarNovamente={aguardando.recarregar}>
          <ListaAguardando atendimentos={aguardando.dados} />
        </AvisoConsulta>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AvisoConsulta carregando={consultaTemas.carregando} erro={consultaTemas.erro} aoTentarNovamente={consultaTemas.recarregar}>
          <DistribuicaoTemas temas={listaTemas} nomeMes={nomePeriodo} />
        </AvisoConsulta>
        <AvisoConsulta carregando={consultaPerguntas.carregando} erro={consultaPerguntas.erro} aoTentarNovamente={consultaPerguntas.recarregar}>
          <PerguntasFrequentes perguntas={listaPerguntas} nomeMes={nomePeriodo} />
        </AvisoConsulta>
      </section>
    </LayoutPainel>
  )
}
