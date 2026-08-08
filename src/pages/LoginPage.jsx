import { BrandLogo } from '../components/brand/BrandLogo'
import { LoginForm } from '../components/auth/LoginForm'
import { CheckIcon } from '../components/ui/Icons'

const benefits = [
  'Atendimentos centralizados em um só lugar',
  'Gestão simples, rápida e segura',
  'Acompanhamento da equipe em tempo real',
]

export function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-emerald-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-14">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-28 h-[30rem] w-[30rem] rounded-full border-[80px] border-emerald-800/50" />
          <div className="absolute right-20 top-32 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_30px_8px_rgba(239,68,68,0.25)]" />

          <div className="relative z-10">
            <BrandLogo light />
          </div>

          <div className="relative z-10 max-w-xl py-16">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Atendimento inteligente
            </p>
            <h1 className="text-5xl font-bold leading-[1.12] tracking-tight xl:text-6xl">
              Seu atendimento mais{' '}
              <span className="relative text-emerald-400">
                fácil
                <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-red-500" />
              </span>
              , humano e eficiente.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-emerald-100/70">
              Gerencie conversas, acompanhe sua equipe e ofereça uma experiência melhor aos seus clientes com o iFácil.
            </p>

            <ul className="mt-10 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm text-emerald-50/90">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-xs text-emerald-100/50">
            © {new Date().getFullYear()} iFácil. Todos os direitos reservados.
          </p>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-bl-full bg-emerald-100/60 lg:hidden" />

          <div className="relative z-10 w-full max-w-md">
            <div className="mb-12 lg:hidden">
              <BrandLogo />
            </div>

            <div className="mb-8">
              <span className="mb-5 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-100">
                Área administrativa
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Bem-vindo de volta
              </h2>
              <p className="mt-3 leading-7 text-slate-500">
                Entre com suas credenciais para acessar o painel do iFácil.
              </p>
            </div>

            <LoginForm />

            <p className="mt-8 text-center text-sm text-slate-500">
              Precisa de ajuda?{' '}
              <button type="button" className="font-semibold text-emerald-700 hover:underline">
                Fale com o suporte
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
