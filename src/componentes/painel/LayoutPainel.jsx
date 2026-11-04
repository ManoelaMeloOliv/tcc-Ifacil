import { createElement, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogoMarca } from '../marca/LogoMarca'
import { IconeGrade, IconeHistorico, IconeSair, IconeMenu, IconePergunta } from './IconesPainel'
import { useSessao } from '../autenticacao/useSessao'
import { sairAdmin } from '../../servicos/autenticacao'

const NOME_INSTITUICAO = import.meta.env.VITE_NOME_INSTITUICAO || 'Instituto Federal'

const navegacao = [
  { rotulo: 'Visão geral', icone: IconeGrade, destino: '/painel', exato: true },
  { rotulo: 'Perguntas & Respostas', icone: IconePergunta, destino: '/painel/perguntas' },
  { rotulo: 'Histórico', icone: IconeHistorico, destino: '/painel/historico' },
]

export function LayoutPainel({ children }) {
  const [menuAberto, definirMenuAberto] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const { sessao } = useSessao()
  const navegar = useNavigate()

  const email = sessao?.user?.email ?? ''
  const iniciais = email.slice(0, 2).toUpperCase() || 'AD'

  async function aoSair() {
    setSaindo(true)
    try {
      await sairAdmin()
      navegar('/', { replace: true })
    } finally {
      setSaindo(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {menuAberto && <button type="button" aria-label="Fechar menu" onClick={() => definirMenuAberto(false)} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-68 flex-col border-r border-emerald-900 bg-emerald-950 px-4 py-6 text-white transition-transform lg:translate-x-0 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-3"><LogoMarca claro /></div>
        <nav className="mt-10 space-y-1" aria-label="Menu principal">
          {navegacao.map(({ rotulo, icone, destino, exato }) => (
            <NavLink key={rotulo} to={destino} end={exato} onClick={() => definirMenuAberto(false)} className={({ isActive }) => `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/30' : 'text-emerald-100/65 hover:bg-white/5 hover:text-white'}`}>
              {createElement(icone, { className: 'h-5 w-5 shrink-0' })}{rotulo}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-68">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-7">
          <button type="button" onClick={() => definirMenuAberto(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Abrir menu"><IconeMenu className="h-6 w-6" /></button>
          <div className="hidden lg:block"><p className="text-xs text-slate-400">Painel administrativo</p><p className="text-sm font-semibold text-slate-700">{NOME_INSTITUICAO}</p></div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">{iniciais}</div><div className="hidden sm:block"><p className="text-sm font-semibold text-slate-800">Administrador</p><p className="max-w-44 truncate text-xs text-slate-400">{email || 'Gestão iFácil'}</p></div></div>
            <button type="button" onClick={aoSair} disabled={saindo} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50" aria-label="Sair do painel" title="Sair do painel"><IconeSair className="h-5 w-5" /></button>
          </div>
        </header>
        <main className="p-4 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
