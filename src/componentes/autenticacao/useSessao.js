import { useEffect, useState } from 'react'
import { getSessaoAtual, onMudancaAuth } from '../../servicos/autenticacao'

/**
 * Devolve a sessão atual do Supabase Auth.
 *
 * `carregando` começa true porque a sessão é lida de forma assíncrona: sem isso
 * a tela piscaria de volta pro login a cada F5, antes do token ser restaurado.
 */
export function useSessao() {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    getSessaoAtual()
      .then((atual) => {
        if (ativo) setSessao(atual)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    const cancelar = onMudancaAuth((nova) => {
      if (!ativo) return
      setSessao(nova)
      setCarregando(false)
    })

    return () => {
      ativo = false
      cancelar()
    }
  }, [])

  return { sessao, carregando }
}
