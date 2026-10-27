export function AvisoConsulta({ carregando, erro, onTentarNovamente, children }) {
  if (erro) {
    return (
      <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6 text-center">
        <p className="text-sm font-semibold text-red-700">Não foi possível carregar os dados.</p>
        <p className="mt-1 text-xs text-red-500">{erro.message ?? 'Erro desconhecido'}</p>
        {onTentarNovamente && (
          <button type="button" onClick={onTentarNovamente} className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100">
            Tentar novamente
          </button>
        )}
      </div>
    )
  }

  if (carregando) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-12 text-center shadow-sm" aria-live="polite">
        <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        <p className="mt-3 text-sm text-slate-400">Carregando...</p>
      </div>
    )
  }

  return children
}
