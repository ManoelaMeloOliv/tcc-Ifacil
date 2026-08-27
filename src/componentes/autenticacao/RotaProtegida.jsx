import { Navigate } from 'react-router-dom'
import { getAdminLogado } from '../../servicos/autenticacao'

export function RotaProtegida({ children }) {
  const admin = getAdminLogado()

  if (!admin) {
    return <Navigate to="/" replace />
  }

  return children
}
