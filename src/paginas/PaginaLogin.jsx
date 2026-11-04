import { FormularioLogin } from '../componentes/autenticacao/FormularioLogin'
import { IconeConfirmar } from '../componentes/interface/Icones'
import { LogoMarca } from '../componentes/marca/LogoMarca'
import { AlternarTema } from '../componentes/painel/AlternarTema'

const beneficios = [
  'Atendimentos centralizados em um só lugar',
  'Respostas do bot editáveis pela equipe',
  'Acompanhamento em tempo real pelo painel',
]

export function PaginaLogin() {
  return (
    <main className="min-h-screen bg-slate-50 p-3">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-3 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden rounded-[20px] bg-hero p-10 text-white lg:flex xl:p-14">
          <div className="inline-flex w-fit rounded-xl bg-white px-4 py-2"><LogoMarca altura={48} /></div>

          <div className="max-w-xl">
            <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.05em] xl:text-[3.5rem]">
              Seu atendimento mais <span className="text-emerald-400">fácil</span>, humano e eficiente.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/60">
              Gerencie conversas, ajuste as respostas do assistente e acompanhe os números do atendimento no WhatsApp.
            </p>

            <ul className="mt-10 space-y-3">
              {beneficios.map((beneficio) => (
                <li key={beneficio} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-ink">
                    <IconeConfirmar className="h-3 w-3" />
                  </span>
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/50">© {new Date().getFullYear()} AIFÁCIL. Todos os direitos reservados.</p>
        </section>

        <section className="relative flex items-center justify-center rounded-[20px] bg-superficie px-5 py-10 sm:px-10 lg:px-14">
          <div className="absolute right-4 top-4"><AlternarTema /></div>
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <div className="inline-flex rounded-xl bg-white px-3 py-1.5"><LogoMarca altura={44} /></div>
            </div>

            <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">Área administrativa</span>
            <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-slate-900">Bem-vindo de volta</h2>
            <p className="mt-2 leading-6 text-slate-500">Entre com suas credenciais para acessar o painel do AIFÁCIL.</p>

            <FormularioLogin />

            <p className="mt-8 text-center text-sm text-slate-500">
              Precisa de ajuda?{' '}
              <button type="button" className="font-medium text-emerald-700 hover:underline">
                Fale com o suporte
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
