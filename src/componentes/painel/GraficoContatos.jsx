import { useTema } from '../interface/useTema'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const formatadorNumero = new Intl.NumberFormat('pt-BR')

export function GraficoContatos({ meses, mesSelecionado, aoSelecionarMes }) {
  const { escuro } = useTema()
  const cores = escuro
    ? { grade: '#1b3d3c', eixoX: '#9fb8b2', eixoY: '#7d9b95', barra: '#2f5c58' }
    : { grade: '#e3ece7', eixoX: '#587068', eixoY: '#7d8f89', barra: '#bdd5cd' }

  function selecionarMes(dadosBarra) {
    if (dadosBarra?.payload) {
      aoSelecionarMes(dadosBarra.payload)
    }
  }

  return (
    <article className="cartao p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div>
          <h2 className="titulo-display text-base text-slate-900">Contatos por mês</h2>
          <p className="mt-1 text-sm text-slate-500">Clique em uma barra para analisar o período</p>
        </div>
        <div className="text-right">
          <p className="numero-display text-xl text-slate-900">{formatadorNumero.format(mesSelecionado.contatos)}</p>
          <p className="mt-0.5 text-xs text-slate-500">contatos em {mesSelecionado.mesCompleto.toLowerCase()}</p>
        </div>
      </div>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={meses} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={cores.grade} />
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: cores.eixoX, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: cores.eixoY, fontSize: 11 }} />
            <Bar
              dataKey="contatos"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              className="cursor-pointer"
              activeBar={false}
              isAnimationActive={false}
              onClick={selecionarMes}
            >
              {meses.map((item) => (
                <Cell
                  key={item.anoMes}
                  fill={item.anoMes === mesSelecionado.anoMes ? '#38a848' : cores.barra}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-300" />Outros meses</li>
        <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Mês selecionado: {mesSelecionado.mesCompleto}</li>
      </ul>
    </article>
  )
}
