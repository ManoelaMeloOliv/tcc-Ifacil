import { IconeCalendario } from './IconesPainel'
import { diaLocal, periodoVazio } from './periodo'

const classeCampo = 'rounded-lg border border-slate-200 bg-superficie px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50'
const classeAtalho = (ativo) => `rounded-lg px-3 py-2 text-xs font-semibold transition ${ativo ? 'bg-emerald-400 text-ink' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`

export function FiltroPeriodo({ periodo, aoMudar, rotuloTodos = 'Todos os dias', children }) {
  const { dia, horaInicio, horaFim } = periodo
  const mudar = (campo) => (evento) => aoMudar({ ...periodo, [campo]: evento.target.value })
  const escolherDia = (novoDia) => aoMudar({ ...periodo, dia: novoDia })

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <IconeCalendario className="h-4 w-4 text-slate-400" />
        <button type="button" onClick={() => escolherDia(diaLocal(0))} className={classeAtalho(dia === diaLocal(0))}>Hoje</button>
        <button type="button" onClick={() => escolherDia(diaLocal(-1))} className={classeAtalho(dia === diaLocal(-1))}>Ontem</button>
        <button type="button" onClick={() => aoMudar(periodoVazio)} className={classeAtalho(!dia)}>{rotuloTodos}</button>
      </div>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Dia
        <input type="date" value={dia} onChange={mudar('dia')} className={classeCampo} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Das
        <input type="time" value={horaInicio} onChange={mudar('horaInicio')} disabled={!dia} className={classeCampo} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Até
        <input type="time" value={horaFim} onChange={mudar('horaFim')} disabled={!dia} className={classeCampo} />
      </label>
      {children}
    </div>
  )
}
