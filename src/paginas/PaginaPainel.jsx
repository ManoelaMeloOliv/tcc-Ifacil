import { useMemo, useState } from 'react'
import { CartaoMetrica } from '../componentes/painel/CartaoMetrica'
import { DistribuicaoTemas } from '../componentes/painel/DistribuicaoTemas'
import { GraficoContatos } from '../componentes/painel/GraficoContatos'
import { CheckCircleIcon, ChatIcon, ClockIcon, QuestionIcon } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { PerguntasFrequentes } from '../componentes/painel/PerguntasFrequentes'
import { getQuestionsForMonth, getTopicsForMonth, monthlyContacts } from '../dados/dadosPainel'

const numberFormatter = new Intl.NumberFormat('pt-BR')

export function PaginaPainel() {
  const [selectedMonth, setSelectedMonth] = useState(monthlyContacts.at(-1))
  const topics = useMemo(() => getTopicsForMonth(selectedMonth), [selectedMonth])
  const questions = useMemo(() => getQuestionsForMonth(selectedMonth), [selectedMonth])
  const resolutionRate = (selectedMonth.resolved / selectedMonth.contacts) * 100

  return (
    <LayoutPainel>
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-emerald-700">VISÃO GERAL · {selectedMonth.fullMonth.toUpperCase()}</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Olá, Administrador!</h1><p className="mt-2 text-sm text-slate-500">Analisando o desempenho do iFácil em {selectedMonth.fullMonth}.</p></div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-right"><p className="text-xs text-emerald-600">Período selecionado</p><p className="text-sm font-bold text-emerald-800">{selectedMonth.fullMonth}</p></div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        <CartaoMetrica title={`Perguntas em ${selectedMonth.month}`} value={numberFormatter.format(selectedMonth.questions)} detail="Perguntas recebidas durante o mês" icon={QuestionIcon} />
        <CartaoMetrica title={`Atendimentos em ${selectedMonth.month}`} value={numberFormatter.format(selectedMonth.contacts)} detail="Pessoas que entraram em contato" icon={ChatIcon} accent="slate" />
        <CartaoMetrica title="Resolvidos pelo bot" value={numberFormatter.format(selectedMonth.resolved)} detail={`${resolutionRate.toFixed(1).replace('.', ',')}% sem atendimento humano`} icon={CheckCircleIcon} />
        <CartaoMetrica title="Tempo de resposta" value={`${selectedMonth.responseTime.toFixed(1).replace('.', ',')}s`} detail={`Média de resposta em ${selectedMonth.fullMonth}`} icon={ClockIcon} accent="red" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.8fr)]">
        <GraficoContatos selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
        <DistribuicaoTemas topics={topics} monthName={selectedMonth.fullMonth} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <PerguntasFrequentes questions={questions} monthName={selectedMonth.fullMonth} />
        <article className="relative overflow-hidden rounded-2xl bg-emerald-900 p-6 text-white shadow-sm">
          <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full border-[40px] border-emerald-700/40" />
          <p className="relative text-sm font-semibold text-emerald-200">Eficiência do iFácil</p>
          <p className="relative mt-3 text-5xl font-bold tracking-tight">{resolutionRate.toFixed(1).replace('.', ',')}%</p>
          <p className="relative mt-3 max-w-sm text-sm leading-6 text-emerald-100/70">dos atendimentos de {selectedMonth.fullMonth} foram concluídos pelo bot sem precisar encaminhar para uma pessoa.</p>
          <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-emerald-950"><div className="h-full rounded-full bg-emerald-400 transition-[width] duration-300" style={{ width: `${resolutionRate}%` }} /></div>
        </article>
      </section>
    </LayoutPainel>
  )
}
