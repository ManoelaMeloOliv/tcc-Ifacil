import { useCallback, useEffect, useState } from 'react'

export function useConsulta(consulta, valorInicial = null) {
  const [dados, setDados] = useState(valorInicial)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro(null)

    consulta()
      .then((resultado) => {
        if (ativo) setDados(resultado)
      })
      .catch((falha) => {
        if (ativo) setErro(falha)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [consulta, versao])

  const recarregar = useCallback(() => setVersao((atual) => atual + 1), [])

  return { dados, carregando, erro, recarregar }
}
