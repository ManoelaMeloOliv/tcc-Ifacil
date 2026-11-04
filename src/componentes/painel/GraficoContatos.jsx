import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const formatadorNumero = new Intl.NumberFormat('pt-BR')

export function GraficoContatos({ meses, mesSelecionado, aoSelecionarMes }) {
  function selecionarMes(dadosBarra) {
    if (dadosBarra?.payload) {
      aoSelecionarMes(dadosBarra.payload)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <h2 className="font-bold text-slate-900">Contatos por mês</h2>
          <p className="mt-1 text-sm text-slate-500">Clique em uma barra para analisar o período</p>
        </div>
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Últimos 12 meses</span>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={meses} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Bar
              dataKey="contatos"
              radius={[7, 7, 2, 2]}
              maxBarSize={34}
              className="cursor-pointer"
              activeBar={false}
              isAnimationActive={false}
              onClick={selecionarMes}
            >
              {meses.map((item) => (
                <Cell
                  key={item.anoMes}
                  fill={item.anoMes === mesSelecionado.anoMes ? '#dc2626' : '#059669'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4" aria-live="polite">
        <div><p className="text-xs text-slate-500">Mês selecionado</p><p className="mt-1 text-sm font-bold text-slate-900">{mesSelecionado.mesCompleto}</p></div>
        <div><p className="text-xs text-slate-500">Contatos</p><p className="mt-1 text-sm font-bold text-slate-900">{formatadorNumero.format(mesSelecionado.contatos)}</p></div>
        <div><p className="text-xs text-slate-500">Perguntas</p><p className="mt-1 text-sm font-bold text-slate-900">{formatadorNumero.format(mesSelecionado.perguntas)}</p></div>
        <div><p className="text-xs text-slate-500">Resolvidos pelo bot</p><p className="mt-1 text-sm font-bold text-emerald-700">{formatadorNumero.format(mesSelecionado.resolvidos)}</p></div>
      </div>
    </article>
  )
}
