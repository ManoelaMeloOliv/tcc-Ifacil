import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmailIcon, EyeIcon, LockIcon } from '../interface/Icones'
import { CampoFormulario } from '../interface/CampoFormulario'
import { loginAdmin } from '../../servicos/autenticacao'

export function FormularioLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      await loginAdmin(email, senha)
      navigate('/painel', { replace: true })
    } catch (falha) {
      setErro(falha.message || 'Não foi possível entrar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  const passwordAction = (
    <button
      type="button"
      onClick={() => setShowPassword((current) => !current)}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
    >
      <EyeIcon hidden={showPassword} className="h-4 w-4" />
      {showPassword ? 'Ocultar' : 'Mostrar'}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <CampoFormulario
        id="email"
        name="email"
        type="email"
        label="E-mail"
        icon={EmailIcon}
        placeholder="seuemail@exemplo.com"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={enviando}
        required
      />

      <CampoFormulario
        id="password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        label="Senha"
        icon={LockIcon}
        action={passwordAction}
        placeholder="Digite sua senha"
        autoComplete="current-password"
        minLength="6"
        value={senha}
        onChange={(event) => setSenha(event.target.value)}
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
            name="remember"
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
