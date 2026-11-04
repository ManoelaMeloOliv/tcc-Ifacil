import { Navigate } from 'react-router-dom'
import { useSessao } from './useSessao'

function TelaCarregando() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
    </div>
  )
}

export function RotaProtegida({ children }) {
  const { sessao, carregando } = useSessao()

  if (carregando) return <TelaCarregando />
  if (!sessao) return <Navigate to="/" replace />

  return children
}

export function RotaPublica({ children }) {
  const { sessao, carregando } = useSessao()

  if (carregando) return <TelaCarregando />
  if (sessao) return <Navigate to="/painel" replace />

  return children
}
