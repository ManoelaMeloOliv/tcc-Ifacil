import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PaginaLogin } from './paginas/PaginaLogin'

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

function Aplicacao() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaLogin />} />
        <Route
          path="/painel"
          element={
            <Suspense fallback={<PageLoading />}>
              <PaginaPainel />
            </Suspense>
          }
        />
        <Route
          path="/painel/perguntas"
          element={
            <Suspense fallback={<PageLoading />}>
              <PaginaPerguntas />
            </Suspense>
          }
        />
        <Route
          path="/painel/historico"
          element={
            <Suspense fallback={<PageLoading />}>
              <PaginaHistorico />
            </Suspense>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/painel" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Aplicacao
