import { useTema } from '../interface/useTema'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
const CORES_REFINADAS = {
  '#059669': '#38a848',
  '#f59e0b': '#f08c00',
  '#ef4444': '#e5372b',
  '#0ea5e9': '#0e7c86',
  '#cbd5e1': '#b4c2bd',
}

function refinarCor(cor) {
  return CORES_REFINADAS[cor?.toLowerCase()] ?? cor
}

export function DistribuicaoTemas({ temas, nomeMes }) {
  const { escuro } = useTema()
  const estiloBalao = escuro
    ? { background: '#0f2d2c', border: '1px solid #1b3d3c', borderRadius: 8, color: '#f2f7f5' }
    : { background: '#ffffff', border: '1px solid #cfdcd5', borderRadius: 8, color: '#0a2a2a' }

  return (
    <article className="cartao cartao-agua p-5 sm:p-6">
      <h2 className="titulo-display text-base text-slate-900">Distribuição por tema</h2>
      <p className="mt-1 text-sm text-slate-500">Assuntos mais procurados em {nomeMes.toLowerCase()}</p>
      {temas.length === 0 ? <p className="py-16 text-center text-sm text-slate-500">Nenhum atendimento neste mês.</p> : <>
      <div className="relative mx-auto mt-4 h-52 max-w-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={temas} dataKey="valor" innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none" isAnimationActive={false}>
              {temas.map((tema) => <Cell key={tema.nome} fill={refinarCor(tema.cor)} />)}
            </Pie>
            <Tooltip contentStyle={estiloBalao} itemStyle={{ color: estiloBalao.color }} formatter={(valor) => [`${valor}%`, 'Participação']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="numero-display text-2xl text-slate-900">{temas[0].valor}%</strong><span className="text-xs text-slate-500">{temas[0].nome}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-3">
        {temas.map((tema) => (
          <div key={tema.nome} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: refinarCor(tema.cor) }} />{tema.nome}</span>
            <strong className="font-medium text-slate-900">{tema.valor}%</strong>
          </div>
        ))}
      </div>
      </>}
    </article>
  )
}
