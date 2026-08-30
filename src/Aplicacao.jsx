import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PaginaLogin } from './paginas/PaginaLogin'
import { RotaProtegida, RotaPublica } from './componentes/autenticacao/RotaProtegida'

const PaginaPainel = lazy(() =>
  import('./paginas/PaginaPainel').then((module) => ({
    default: module.PaginaPainel,
  })),
)

const PaginaPerguntas = lazy(() =>
  import('./paginas/PaginaPerguntas').then((module) => ({
    default: module.PaginaPerguntas,
  })),
)

const PaginaHistorico = lazy(() =>
  import('./paginas/PaginaHistorico').then((module) => ({
    default: module.PaginaHistorico,
  })),
)

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        <p className="mt-4 text-sm font-medium text-slate-500">Carregando painel...</p>
      </div>
    </div>
  )
}

/** Envolve as páginas do painel: exige sessão e mostra o loading do lazy import. */
function PaginaProtegida({ children }) {
  return (
    <RotaProtegida>
      <Suspense fallback={<PageLoading />}>{children}</Suspense>
    </RotaProtegida>
  )
}

function Aplicacao() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RotaPublica>
              <PaginaLogin />
            </RotaPublica>
          }
        />
        <Route
          path="/painel"
          element={
            <PaginaProtegida>
              <PaginaPainel />
            </PaginaProtegida>
          }
        />
        <Route
          path="/painel/perguntas"
          element={
            <PaginaProtegida>
              <PaginaPerguntas />
            </PaginaProtegida>
          }
        />
        <Route
          path="/painel/historico"
          element={
            <PaginaProtegida>
              <PaginaHistorico />
            </PaginaProtegida>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/painel" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Aplicacao
