import { useEffect, useState } from 'react'
import { buscarSessaoAtual, aoMudarAutenticacao } from '../../servicos/autenticacao'

export function useSessao() {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    buscarSessaoAtual()
      .then((atual) => {
        if (ativo) setSessao(atual)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    const cancelar = aoMudarAutenticacao((nova) => {
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
