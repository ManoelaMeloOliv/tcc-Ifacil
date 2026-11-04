export function ErroConfiguracao() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div role="alert" className="max-w-lg rounded-lg border border-red-100 bg-superficie p-8">
        <h1 className="text-xl font-bold text-slate-900">Configuração incompleta</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Faltam as variáveis <code>VITE_SUPABASE_URL</code> e/ou <code>VITE_SUPABASE_ANON_KEY</code>.
          Copie o arquivo <code>.env.example</code> para <code>.env</code>, preencha com os dados do seu
          projeto Supabase e reinicie o <code>npm run dev</code>.
        </p>
      </div>
    </main>
  )
}
