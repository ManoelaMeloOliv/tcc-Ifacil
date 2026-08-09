import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
export function DistribuicaoTemas({ topics, monthName }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-bold text-slate-900">Distribuição por tema</h2>
      <p className="mt-1 text-sm text-slate-500">Assuntos mais procurados em {monthName}</p>
      <div className="relative mx-auto mt-4 h-52 max-w-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={topics} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none" isAnimationActive={false}>
              {topics.map((topic) => <Cell key={topic.name} fill={topic.color} />)}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="text-2xl text-slate-900">100%</strong><span className="text-xs text-slate-400">das perguntas</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-3">
        {topics.map((topic) => (
          <div key={topic.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: topic.color }} />{topic.name}</span>
            <strong className="text-slate-800">{topic.value}%</strong>
          </div>
        ))}
      </div>
    </article>
  )
}
