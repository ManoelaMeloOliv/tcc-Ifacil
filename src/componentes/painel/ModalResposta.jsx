import { useEffect, useState } from 'react'
import { categories } from '../../dados/dadosPerguntas'
import { CloseIcon } from './IconesPainel'

const emptyAnswer = { question: '', answer: '', categoryId: categories[0].id, active: true }

export function ModalResposta({ answer, onSave, onClose }) {
  const [form, setForm] = useState(emptyAnswer)

  useEffect(() => {
    setForm(answer ? { ...answer } : emptyAnswer)
  }, [answer])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave({ ...form, question: form.question.trim(), answer: form.answer.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div role="dialog" aria-modal="true" aria-labelledby="titulo-modal-resposta" className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="titulo-modal-resposta" className="text-lg font-bold text-slate-900">{answer ? 'Editar resposta' : 'Nova resposta'}</h2>
            <p className="mt-1 text-sm text-slate-500">Respostas padrão utilizadas pelo assistente no WhatsApp.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Fechar">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="pergunta" className="mb-2 block text-sm font-semibold text-slate-700">Pergunta</label>
            <input
              id="pergunta"
              value={form.question}
              onChange={(event) => updateField('question', event.target.value)}
              placeholder="Ex.: Quais documentos preciso para a matrícula?"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label htmlFor="resposta" className="mb-2 block text-sm font-semibold text-slate-700">Resposta</label>
            <textarea
              id="resposta"
              value={form.answer}
              onChange={(event) => updateField('answer', event.target.value)}
              rows={5}
              placeholder="Escreva em linguagem simples e acessível."
              required
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="categoria" className="mb-2 block text-sm font-semibold text-slate-700">Categoria</label>
              <select
                id="categoria"
                value={form.categoryId}
                onChange={(event) => updateField('categoryId', Number(event.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => updateField('active', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                />
                Resposta ativa no assistente
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">Salvar resposta</button>
          </div>
        </form>
      </div>
    </div>
  )
}
