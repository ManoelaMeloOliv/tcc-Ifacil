import { useCallback, useState } from 'react'
import { AvisoConsulta } from '../componentes/interface/AvisoConsulta'
import { useConsulta } from '../componentes/interface/useConsulta'
import { CabecalhoPagina } from '../componentes/painel/CabecalhoPagina'
import { CartaoMetrica } from '../componentes/painel/CartaoMetrica'
import { DistribuicaoTemas } from '../componentes/painel/DistribuicaoTemas'
import { GraficoContatos } from '../componentes/painel/GraficoContatos'
import { IconeConfirmado, IconeConversa, IconePergunta, IconeRelogio } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { ListaAguardando } from '../componentes/painel/ListaAguardando'
import { PerguntasFrequentes } from '../componentes/painel/PerguntasFrequentes'
import { buscarAguardandoAtendente } from '../servicos/historico'
import { buscarDistribuicaoTemas, buscarEstatisticasMensais, buscarPerguntasFrequentes } from '../servicos/painel'

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

export function PaginaPainel() {
  const estatisticas = useConsulta(buscarEstatisticasMensais, [])
  const meses = estatisticas.dados
  const [chaveSelecionada, definirChaveSelecionada] = useState(null)
  const indice = chaveSelecionada ? meses.findIndex((item) => item.anoMes === chaveSelecionada) : meses.length - 1
  const mesSelecionado = meses[indice] ?? meses.at(-1)
  const anoMes = mesSelecionado?.anoMes

  const temas = useConsulta(useCallback(() => buscarDistribuicaoTemas(anoMes), [anoMes]), [])
  const perguntas = useConsulta(useCallback(() => buscarPerguntasFrequentes(anoMes), [anoMes]), [])
  const aguardando = useConsulta(useCallback(() => buscarAguardandoAtendente(5), []), [])

  const cabecalho = (
    <CabecalhoPagina
      titulo="Olá, Administrador"
      descricao={mesSelecionado ? `Como o AIFÁCIL se saiu em ${mesSelecionado.mesCompleto.toLowerCase()}. Clique em uma barra do gráfico para ver outro mês.` : 'Resumo do atendimento no WhatsApp.'}
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

  const anterior = meses[indice - 1]
    const nomeMes = mesSelecionado.mesCompleto.toLowerCase()
  const taxaResolucao = taxaResolucaoDoMes(mesSelecionado)
  const legendaComparacao = anterior ? `vs. ${anterior.mesCompleto.toLowerCase()}` : 'primeiro mês registrado'

  return (
    <LayoutPainel cabecalho={cabecalho}>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        <CartaoMetrica
          titulo="Atendimentos"
          icone={IconeConversa}
          selo={mesSelecionado.mes}
          valor={formatadorNumero.format(mesSelecionado.atendimentos)}
          variacao={anterior ? variacaoPercentual(mesSelecionado.atendimentos, anterior.atendimentos) : null}
          legenda={legendaComparacao}
        />
        <CartaoMetrica
          titulo="Perguntas"
          icone={IconePergunta}
          selo={mesSelecionado.mes}
          valor={formatadorNumero.format(mesSelecionado.perguntas)}
          variacao={anterior ? variacaoPercentual(mesSelecionado.perguntas, anterior.perguntas) : null}
          legenda={legendaComparacao}
        />
        <CartaoMetrica
          titulo="Resolvidos"
          icone={IconeConfirmado}
          selo={mesSelecionado.mes}
          valor={virgula(taxaResolucao)}
          unidade="%"
          variacao={anterior ? variacaoPercentual(taxaResolucao, taxaResolucaoDoMes(anterior)) : null}
          legenda={`vs. ${anterior ? anterior.mesCompleto.toLowerCase() : "mês anterior"} · ${formatadorNumero.format(mesSelecionado.resolvidos)} sem atendente`}
        />
        <CartaoMetrica
          titulo="Tempo médio"
          icone={IconeRelogio}
          selo={mesSelecionado.mes}
          valor={virgula(mesSelecionado.tempoResposta)}
          unidade="s"
          variacao={anterior ? variacaoPercentual(mesSelecionado.tempoResposta, anterior.tempoResposta) : null}
          menorEMelhor
          legenda={legendaComparacao}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]">
        <GraficoContatos meses={meses} mesSelecionado={mesSelecionado} aoSelecionarMes={(item) => definirChaveSelecionada(item.anoMes)} />
        <AvisoConsulta carregando={aguardando.carregando} erro={aguardando.erro} aoTentarNovamente={aguardando.recarregar}>
          <ListaAguardando atendimentos={aguardando.dados} />
        </AvisoConsulta>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AvisoConsulta carregando={temas.carregando} erro={temas.erro} aoTentarNovamente={temas.recarregar}>
          <DistribuicaoTemas temas={temas.dados} nomeMes={nomeMes} />
        </AvisoConsulta>
        <AvisoConsulta carregando={perguntas.carregando} erro={perguntas.erro} aoTentarNovamente={perguntas.recarregar}>
          <PerguntasFrequentes perguntas={perguntas.dados} nomeMes={nomeMes} />
        </AvisoConsulta>
      </section>
    </LayoutPainel>
  )
}
