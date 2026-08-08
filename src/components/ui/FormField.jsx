import { createElement } from 'react'

export function FormField({ icon, label, action, ...inputProps }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <label htmlFor={inputProps.id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        {action}
      </div>

      <div className="group relative">
        {createElement(icon, {
          className:
            'pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-emerald-600',
        })}
        <input
          {...inputProps}
          className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>
    </div>
  )
}
