import { createElement, useCallback, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogoMarca } from '../marca/LogoMarca'
import { AlternarTema } from './AlternarTema'
import { IconeGrade, IconeHistorico, IconeMenu, IconePergunta, IconeSair } from './IconesPainel'
import { useConsulta } from '../interface/useConsulta'
import { useSessao } from '../autenticacao/useSessao'
import { sairAdmin } from '../../servicos/autenticacao'
import { contarAguardandoAtendente } from '../../servicos/historico'

const NOME_INSTITUICAO = import.meta.env.VITE_NOME_INSTITUICAO || 'Instituto Federal'

const grupos = [
  { titulo: 'Visão geral', itens: [{ rotulo: 'Painel', icone: IconeGrade, destino: '/painel', exato: true }] },
  { titulo: 'Atendimento', itens: [{ rotulo: 'Histórico', icone: IconeHistorico, destino: '/painel/historico', contador: true }] },
  { titulo: 'Conteúdo do bot', itens: [{ rotulo: 'Perguntas e respostas', icone: IconePergunta, destino: '/painel/perguntas' }] },
]

export function LayoutPainel({ cabecalho, children }) {
  const [menuAberto, definirMenuAberto] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const { sessao } = useSessao()
  const navegar = useNavigate()
  const aguardando = useConsulta(useCallback(() => contarAguardandoAtendente(), []), 0)

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
      {menuAberto && (
        <button type="button" aria-label="Fechar menu" onClick={() => definirMenuAberto(false)} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />
      )}

      <aside
        className={`fixed bottom-3 left-3 top-3 z-40 flex w-[248px] flex-col overflow-y-auto rounded-[20px] border border-white/5 bg-hero p-3 transition-transform lg:translate-x-0 ${menuAberto ? 'translate-x-0' : '-translate-x-[110%]'}`}
      >
        <div className="inline-flex w-fit rounded-xl bg-white px-3 py-1.5"><LogoMarca altura={40} /></div>

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xs font-semibold text-white">IF</span>
          <div className="min-w-0">
            <p className="truncate text-[0.82rem] font-medium leading-4 text-white">{NOME_INSTITUICAO}</p>
            <p className="truncate text-xs text-white/60">Atendimento no WhatsApp</p>
          </div>
        </div>

        <nav className="mt-5 flex-1" aria-label="Menu principal">
          {grupos.map((grupo) => (
            <div key={grupo.titulo} className="mb-5">
              <p className="mb-1.5 px-3 text-xs font-medium text-white/40">{grupo.titulo}</p>
              <ul className="space-y-0.5">
                {grupo.itens.map(({ rotulo, icone, destino, exato, contador }) => (
                  <li key={rotulo}>
                    <NavLink
                      to={destino}
                      end={exato}
                      onClick={() => definirMenuAberto(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {createElement(icone, { className: `h-[18px] w-[18px] shrink-0 ${isActive ? 'text-emerald-400' : 'text-white/50'}` })}
                          <span className="flex-1">{rotulo}</span>
                          {contador && aguardando.dados > 0 && (
                            <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-xs font-medium leading-4 text-white" title="Aguardando atendente">
                              {aguardando.dados}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-semibold text-ink">{iniciais}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.82rem] font-medium leading-4 text-white">Administrador</p>
            <p className="truncate text-xs text-white/60">{email || 'Gestão AIFÁCIL'}</p>
          </div>
          <button
            type="button"
            onClick={aoSair}
            disabled={saindo}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Sair do painel"
            title="Sair do painel"
          >
            <IconeSair className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>

      <div className="p-3 lg:pl-[272px]">
        <header className="relative rounded-[20px] bg-hero px-5 pb-24 pt-5 sm:px-8">
          <div className="mb-10 flex items-center justify-between">
            <button type="button" onClick={() => definirMenuAberto(true)} className="rounded-lg bg-hero-ctrl p-2 text-white lg:hidden" aria-label="Abrir menu">
              <IconeMenu className="h-5 w-5" />
            </button>
            <p className="hidden text-sm text-white/60 lg:block">{NOME_INSTITUICAO}</p>
            <div className="flex items-center gap-2.5">
              <AlternarTema />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-ink" aria-hidden="true">{iniciais}</span>
            </div>
          </div>
          {cabecalho}
        </header>

        <main className="relative -mt-16 space-y-5 px-3 pb-10 sm:px-5">{children}</main>
      </div>
    </div>
  )
}
