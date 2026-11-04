import { useTema } from '../interface/useTema'
import { IconeLua, IconeSol } from './IconesPainel'

export function AlternarTema({ className = '' }) {
  const { escuro, alternar } = useTema()
  const rotulo = escuro ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={rotulo}
      title={rotulo}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-hero-ctrl text-white transition hover:bg-hero-hover ${className}`}
    >
      {escuro ? <IconeSol className="h-[18px] w-[18px]" /> : <IconeLua className="h-[18px] w-[18px]" />}
    </button>
  )
}
