import { useCallback, useState } from 'react'
import { AvisoConsulta } from '../componentes/interface/AvisoConsulta'
import { useConsulta } from '../componentes/interface/useConsulta'
import { CartaoMetrica } from '../componentes/painel/CartaoMetrica'
import { DistribuicaoTemas } from '../componentes/painel/DistribuicaoTemas'
import { GraficoContatos } from '../componentes/painel/GraficoContatos'
import { IconeConfirmado, IconeConversa, IconeRelogio, IconePergunta } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { PerguntasFrequentes } from '../componentes/painel/PerguntasFrequentes'
import { buscarDistribuicaoTemas, buscarEstatisticasMensais, buscarPerguntasFrequentes } from '../servicos/painel'

const formatadorNumero = new Intl.NumberFormat('pt-BR')

export function PaginaPainel() {
  const estatisticas = useConsulta(buscarEstatisticasMensais, [])
  const meses = estatisticas.dados
  const [chaveSelecionada, definirChaveSelecionada] = useState(null)
  const mesSelecionado = meses.find((item) => item.anoMes === chaveSelecionada) ?? meses.at(-1)
  const anoMes = mesSelecionado?.anoMes

  const temas = useConsulta(useCallback(() => buscarDistribuicaoTemas(anoMes), [anoMes]), [])
  const perguntas = useConsulta(useCallback(() => buscarPerguntasFrequentes(anoMes), [anoMes]), [])

  if (!mesSelecionado) {
    return (
      <LayoutPainel>
        <AvisoConsulta carregando={estatisticas.carregando} erro={estatisticas.erro} aoTentarNovamente={estatisticas.recarregar}>
          <p className="py-12 text-center text-sm text-slate-400">Ainda não há atendimentos registrados.</p>
        </AvisoConsulta>
      </LayoutPainel>
    )
  }

  const taxaResolucao = mesSelecionado.atendimentos ? (mesSelecionado.resolvidos / mesSelecionado.atendimentos) * 100 : 0

  return (
    <LayoutPainel>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-emerald-700">VISÃO GERAL · {mesSelecionado.mesCompleto.toUpperCase()}</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Olá, Administrador!</h1><p className="mt-2 text-sm text-slate-500">Analisando o desempenho do iFácil em {mesSelecionado.mesCompleto}.</p></div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-right"><p className="text-xs text-emerald-600">Período selecionado</p><p className="text-sm font-bold text-emerald-800">{mesSelecionado.mesCompleto}</p></div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        <CartaoMetrica titulo={`Perguntas em ${mesSelecionado.mes}`} valor={formatadorNumero.format(mesSelecionado.perguntas)} detalhe="Perguntas recebidas durante o mês" icone={IconePergunta} />
        <CartaoMetrica titulo={`Atendimentos em ${mesSelecionado.mes}`} valor={formatadorNumero.format(mesSelecionado.atendimentos)} detalhe={`${formatadorNumero.format(mesSelecionado.contatos)} pessoas entraram em contato`} icone={IconeConversa} destaque="cinza" />
        <CartaoMetrica titulo="Resolvidos pelo bot" valor={formatadorNumero.format(mesSelecionado.resolvidos)} detalhe={`${taxaResolucao.toFixed(1).replace('.', ',')}% sem atendimento humano`} icone={IconeConfirmado} />
        <CartaoMetrica titulo="Tempo de resposta" valor={`${mesSelecionado.tempoResposta.toFixed(1).replace('.', ',')}s`} detalhe={`Média de resposta em ${mesSelecionado.mesCompleto}`} icone={IconeRelogio} destaque="vermelho" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.8fr)]">
        <GraficoContatos meses={meses} mesSelecionado={mesSelecionado} aoSelecionarMes={(item) => definirChaveSelecionada(item.anoMes)} />
        <AvisoConsulta carregando={temas.carregando} erro={temas.erro} aoTentarNovamente={temas.recarregar}>
          <DistribuicaoTemas temas={temas.dados} nomeMes={mesSelecionado.mesCompleto} />
        </AvisoConsulta>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <AvisoConsulta carregando={perguntas.carregando} erro={perguntas.erro} aoTentarNovamente={perguntas.recarregar}>
          <PerguntasFrequentes perguntas={perguntas.dados} nomeMes={mesSelecionado.mesCompleto} />
        </AvisoConsulta>
        <article className="relative overflow-hidden rounded-2xl bg-emerald-900 p-6 text-white shadow-sm">
          <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full border-[40px] border-emerald-700/40" />
          <p className="relative text-sm font-semibold text-emerald-200">Eficiência do iFácil</p>
          <p className="relative mt-3 text-5xl font-bold tracking-tight">{taxaResolucao.toFixed(1).replace('.', ',')}%</p>
          <p className="relative mt-3 max-w-sm text-sm leading-6 text-emerald-100/70">dos atendimentos de {mesSelecionado.mesCompleto} foram concluídos pelo bot sem precisar encaminhar para uma pessoa.</p>
          <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-emerald-950"><div className="h-full rounded-full bg-emerald-400 transition-[width] duration-300" style={{ width: `${taxaResolucao}%` }} /></div>
        </article>
      </section>
    </LayoutPainel>
  )
}
