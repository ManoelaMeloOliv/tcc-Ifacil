import { createElement, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LogoMarca } from '../marca/LogoMarca'
import { BellIcon, GridIcon, HistoryIcon, MenuIcon, QuestionIcon } from './IconesPainel'

const navigation = [
  { label: 'Visão geral', icon: GridIcon, to: '/painel', end: true },
  { label: 'Perguntas & Respostas', icon: QuestionIcon, to: '/painel/perguntas' },
  { label: 'Histórico', icon: HistoryIcon, to: '/painel/historico' },
]

export function LayoutPainel({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {menuOpen && <button type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-col border-r border-emerald-900 bg-emerald-950 px-4 py-6 text-white transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-3"><LogoMarca light /></div>
        <nav className="mt-10 space-y-1" aria-label="Menu principal">
          {navigation.map(({ label, icon, to, end }) => (
            <NavLink key={label} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/30' : 'text-emerald-100/65 hover:bg-white/5 hover:text-white'}`}>
              {createElement(icon, { className: 'h-5 w-5 shrink-0' })}{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"/><span className="text-xs font-semibold">Bot operando normalmente</span></div>
          <p className="mt-2 text-xs leading-5 text-emerald-100/50">Todos os serviços estão online.</p>
        </div>
      </aside>

      <div className="lg:pl-68">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-7">
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Abrir menu"><MenuIcon className="h-6 w-6" /></button>
          <div className="hidden lg:block"><p className="text-xs text-slate-400">Painel administrativo</p><p className="text-sm font-semibold text-slate-700">Instituto Federal</p></div>
          <div className="ml-auto flex items-center gap-3">
            <button type="button" className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50" aria-label="Notificações"><BellIcon className="h-5 w-5"/><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500"/></button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">AD</div><div className="hidden sm:block"><p className="text-sm font-semibold text-slate-800">Administrador</p><p className="text-xs text-slate-400">Gestão iFácil</p></div></div>
          </div>
        </header>
        <main className="p-4 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
