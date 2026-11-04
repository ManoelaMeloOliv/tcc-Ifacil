import { Link } from 'react-router-dom'
import { IconeSetaDireita, IconeSino } from './IconesPainel'
import { formatarDataAtendimento } from '../../servicos/historico'

export function ListaAguardando({ atendimentos }) {
  return (
    <article className="cartao cartao-alerta flex flex-col p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-superficie text-red-600">
          <IconeSino className="h-4 w-4" />
        </span>
        <h2 className="flex-1 text-sm font-medium text-slate-900">Aguardando atendente</h2>
        <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-medium text-white">{atendimentos.length}</span>
      </div>

      {atendimentos.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">Nenhuma conversa esperando por uma pessoa.</p>
      ) : (
        <ul className="mt-4 divide-y divide-red-100">
          {atendimentos.map((item) => (
            <li key={item.id}>
              <Link to="/painel/historico" className="flex items-center gap-3 py-3 transition hover:opacity-80">
                <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.nome}</p>
                  <p className="truncate text-xs text-slate-500">{item.ultimaMensagem || item.tema} · {formatarDataAtendimento(item.iniciadaEm)}</p>
                </div>
                <IconeSetaDireita className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/painel/historico" className="mt-auto pt-4 text-sm font-medium text-emerald-700 hover:underline">Ver todos os atendimentos</Link>
    </article>
  )
}
