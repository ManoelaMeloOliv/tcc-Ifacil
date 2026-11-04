import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconeEmail, IconeOlho, IconeCadeado } from '../interface/Icones'
import { CampoFormulario } from '../interface/CampoFormulario'
import { entrarAdmin } from '../../servicos/autenticacao'

export function FormularioLogin() {
  const [mostrarSenha, definirMostrarSenha] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navegar = useNavigate()

  async function aoEnviar(evento) {
    evento.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      await entrarAdmin(email, senha)
      navegar('/painel', { replace: true })
    } catch (falha) {
      setErro(falha.message || 'Não foi possível entrar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  const acaoSenha = (
    <button
      type="button"
      onClick={() => definirMostrarSenha((atual) => !atual)}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
    >
      <IconeOlho oculto={mostrarSenha} className="h-4 w-4" />
      {mostrarSenha ? 'Ocultar' : 'Mostrar'}
    </button>
  )

  return (
    <form onSubmit={aoEnviar} className="mt-8 space-y-5">
      <CampoFormulario
        id="email"
        name="email"
        type="email"
        rotulo="E-mail"
        icone={IconeEmail}
        placeholder="seuemail@exemplo.com"
        autoComplete="email"
        value={email}
        onChange={(evento) => setEmail(evento.target.value)}
        disabled={enviando}
        required
      />

      <CampoFormulario
        id="senha"
        name="senha"
        type={mostrarSenha ? 'text' : 'password'}
        rotulo="Senha"
        icone={IconeCadeado}
        acao={acaoSenha}
        placeholder="Digite sua senha"
        autoComplete="current-password"
        minLength="6"
        value={senha}
        onChange={(evento) => setSenha(evento.target.value)}
        disabled={enviando}
        required
      />

      {erro && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-100">
          {erro}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2.5 text-slate-600">
          <input
            type="checkbox"
            name="lembrar"
            className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
          />
          Lembrar meu acesso
        </label>

        <button type="button" className="font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline">
          Esqueci minha senha
        </button>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="mt-2 flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-5 font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {enviando && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {enviando ? 'Entrando...' : 'Entrar no painel'}
      </button>
    </form>
  )
}
