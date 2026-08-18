import { useMemo, useState } from 'react'
import { CalendarIcon, ChatIcon, SearchIcon } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { formatServiceDate, serviceHistory, serviceStatus } from '../dados/dadosHistorico'

const avatarColors = [
  'bg-emerald-100 text-emerald-700',
  'bg-red-100 text-red-600',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
]

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'resolved', label: 'Resolvidos' },
  { value: 'forwarded', label: 'Encaminhados' },
  { value: 'ongoing', label: 'Em andamento' },
]

export function PaginaHistorico() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const visibleServices = useMemo(() => {
    const term = search.trim().toLowerCase()

    return serviceHistory.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesSearch = !term
        || item.name.toLowerCase().includes(term)
        || item.phone.toLowerCase().includes(term)
        || item.lastMessage.toLowerCase().includes(term)
      return matchesStatus && matchesSearch
    })
  }, [search, statusFilter])

  const forwardedCount = serviceHistory.filter((item) => item.status === 'forwarded').length
  const ongoingCount = serviceHistory.filter((item) => item.status === 'ongoing').length

  return (
    <LayoutPainel>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">ATENDIMENTOS</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Histórico de atendimentos</h1>
          <p className="mt-2 text-sm text-slate-500">Conversas realizadas pelo assistente via WhatsApp.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2">
            <p className="text-xs text-red-500">Aguardando atendente</p>
            <p className="text-sm font-bold text-red-700">{forwardedCount + ongoingCount} atendimentos</p>
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
            <CalendarIcon className="h-4 w-4" />Filtrar por data
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por número ou palavra-chave..."
              aria-label="Buscar atendimento"
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button key={filter.value} type="button" onClick={() => setStatusFilter(filter.value)} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${statusFilter === filter.value ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-3.5">Usuário</th>
                <th scope="col" className="px-5 py-3.5">Última mensagem</th>
                <th scope="col" className="px-5 py-3.5">Tema</th>
                <th scope="col" className="px-5 py-3.5">Data</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleServices.map((item, index) => (
                <tr key={item.id} className="transition hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${avatarColors[index % avatarColors.length]}`}>{item.initials}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-sm px-5 py-4"><p className="truncate text-sm text-slate-600">{item.lastMessage}</p><p className="mt-1 text-xs text-slate-400">{item.messages} mensagens · {item.responseTime.toFixed(1).replace('.', ',')}s de resposta</p></td>
                  <td className="px-5 py-4"><span className="text-sm text-slate-500">{item.topic}</span></td>
                  <td className="whitespace-nowrap px-5 py-4"><span className="text-sm text-slate-500">{formatServiceDate(item.startedAt)}</span></td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${serviceStatus[item.status].className}`}>{serviceStatus[item.status].label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleServices.length === 0 && (
            <div className="px-5 py-12 text-center">
              <ChatIcon className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">Nenhum atendimento encontrado para esse filtro.</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-3.5 text-xs text-slate-400">
          {visibleServices.length} de {serviceHistory.length} atendimentos
        </div>
      </section>
    </LayoutPainel>
  )
}
