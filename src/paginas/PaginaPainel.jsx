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

function taxaResolucaoDoMes(mes) {
  return mes.atendimentos ? (mes.resolvidos / mes.atendimentos) * 100 : 0
}

function virgula(numero, casas = 1) {
  return numero.toFixed(casas).replace('.', ',')
}

// Compara com o período anterior em números, não em porcentagem:
// selo "+3" e legenda "em outubro eram 4".
function comparar(valorAtual, valorAnterior, { quando, casas = 0, unidade = '', unidadeDiferenca = unidade, singular = false }) {
  if (valorAnterior === null || valorAnterior === undefined) return { legenda: `sem dados ${quando}` }
  const formatar = (numero) => (casas ? virgula(numero, casas) : formatadorNumero.format(Math.round(numero)))
  const diferenca = Number((valorAtual - valorAnterior).toFixed(casas))
  return {
    sinal: diferenca,
    diferenca: diferenca === 0 ? 'igual' : `${diferenca > 0 ? '+' : '−'}${formatar(Math.abs(diferenca))}${unidadeDiferenca}`,
    legenda: `${quando} ${singular ? 'era' : 'eram'} ${formatar(valorAnterior)}${unidade}`,
  }
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
        ? `Como o AIFÁCIL se saiu em ${descreverPeriodo(periodo)}. Escolha "Por mês" para voltar à visão mensal.`
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
  const quando = filtrandoDia ? 'no dia anterior' : anterior ? `em ${anterior.mesCompleto.toLowerCase()}` : 'do mês anterior'
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
  const comparacao = {
    atendimentos: comparar(atual.atendimentos, anterior?.atendimentos, { quando }),
    perguntas: comparar(atual.perguntas, anterior?.perguntas, { quando }),
    resolvidos: comparar(taxaResolucao, anterior ? taxaResolucaoDoMes(anterior) : null, { quando, casas: 1, unidade: '%', unidadeDiferenca: ' pontos', singular: true }),
    tempo: comparar(atual.tempoResposta, anterior?.tempoResposta, { quando, casas: 1, unidade: ' s', singular: true }),
  }

  return (
    <LayoutPainel cabecalho={cabecalho}>
      {filtro}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        <CartaoMetrica
          titulo="Atendimentos"
          icone={IconeConversa}
          selo={selo}
          valor={formatadorNumero.format(atual.atendimentos)}
          {...comparacao.atendimentos}
        />
        <CartaoMetrica
          titulo="Perguntas"
          icone={IconePergunta}
          selo={selo}
          valor={formatadorNumero.format(atual.perguntas)}
          {...comparacao.perguntas}
        />
        <CartaoMetrica
          titulo="Resolvidos"
          icone={IconeConfirmado}
          selo={selo}
          valor={virgula(taxaResolucao)}
          unidade="%"
          {...comparacao.resolvidos}
          detalhe={`${formatadorNumero.format(atual.resolvidos)} de ${formatadorNumero.format(atual.atendimentos)} resolvidos só pelo bot`}
        />
        <CartaoMetrica
          titulo="Tempo médio"
          icone={IconeRelogio}
          selo={selo}
          valor={virgula(atual.tempoResposta)}
          unidade="s"
          {...comparacao.tempo}
          menorEMelhor
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
