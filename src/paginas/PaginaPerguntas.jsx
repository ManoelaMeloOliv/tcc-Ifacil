import { useMemo, useState } from 'react'
import { EtiquetaCategoria } from '../componentes/painel/EtiquetaCategoria'
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { ModalResposta } from '../componentes/painel/ModalResposta'
import { categories, getCategory, standardAnswers } from '../dados/dadosPerguntas'

export function PaginaPerguntas() {
  const [answers, setAnswers] = useState(standardAnswers)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const visibleAnswers = useMemo(() => {
    const term = search.trim().toLowerCase()

    return answers.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter
      const matchesSearch = !term || item.question.toLowerCase().includes(term) || item.answer.toLowerCase().includes(term)
      return matchesCategory && matchesSearch
    })
  }, [answers, search, categoryFilter])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(answer) {
    setEditing(answer)
    setModalOpen(true)
  }

  function handleSave(form) {
    const updatedAt = new Date().toISOString()

    setAnswers((current) => (
      form.id
        ? current.map((item) => (item.id === form.id ? { ...form, updatedAt } : item))
        : [{ ...form, id: Math.max(0, ...current.map((item) => item.id)) + 1, updatedAt }, ...current]
    ))

    setModalOpen(false)
    setEditing(null)
  }

  function handleDelete(answer) {
    if (!window.confirm(`Excluir a resposta "${answer.question}"?`)) return
    setAnswers((current) => current.filter((item) => item.id !== answer.id))
  }

  return (
    <LayoutPainel>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">BASE DE CONHECIMENTO</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Perguntas & Respostas</h1>
          <p className="mt-2 text-sm text-slate-500">Gerencie as respostas padrão para as dúvidas frequentes.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
          <PlusIcon className="h-4 w-4" />Nova resposta
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar pergunta ou resposta..."
              aria-label="Buscar pergunta"
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategoryFilter('all')} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${categoryFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todas</button>
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => setCategoryFilter(category.id)} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${categoryFilter === category.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-5 py-3.5">Pergunta</th>
                <th scope="col" className="px-5 py-3.5">Resposta</th>
                <th scope="col" className="px-5 py-3.5">Categoria</th>
                <th scope="col" className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleAnswers.map((item) => (
                <tr key={item.id} className="align-top transition hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">{item.question}</p>
                    {!item.active && <span className="mt-1.5 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Inativa</span>}
                  </td>
                  <td className="max-w-md px-5 py-4"><p className="line-clamp-2 text-sm leading-6 text-slate-500">{item.answer}</p></td>
                  <td className="px-5 py-4"><EtiquetaCategoria category={getCategory(item.categoryId)} /></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => openEdit(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700" aria-label={`Editar ${item.question}`}><PencilIcon className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleDelete(item)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label={`Excluir ${item.question}`}><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleAnswers.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-slate-400">Nenhuma resposta encontrada para esse filtro.</p>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-3.5 text-xs text-slate-400">
          {visibleAnswers.length} de {answers.length} respostas cadastradas
        </div>
      </section>

      {modalOpen && <ModalResposta answer={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null) }} />}
    </LayoutPainel>
  )
}
