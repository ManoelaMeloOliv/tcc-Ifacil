import { useMemo, useState } from 'react'
import { useConsulta } from '../interface/useConsulta'
import {
  atualizarRespostaPadrao,
  buscarCategorias,
  buscarRespostasPadrao,
  criarRespostaPadrao,
  excluirRespostaPadrao,
  ordenarRespostas,
} from '../../servicos/perguntas'

const SEM_CATEGORIA = { id: null, nome: 'Sem assunto', cor: 'slate' }

function compararOrdem(a, b) {
  return (a.ordem ?? Infinity) - (b.ordem ?? Infinity) || String(a.criadaEm).localeCompare(String(b.criadaEm))
}

export function useRespostas() {
  const consultaRespostas = useConsulta(buscarRespostasPadrao, [])
  const consultaCategorias = useConsulta(buscarCategorias, [])
  const categorias = consultaCategorias.dados
  const [alteradas, setAlteradas] = useState(null)
  const respostas = alteradas ?? consultaRespostas.dados

  const [busca, definirBusca] = useState('')
  const [filtroCategoria, definirFiltroCategoria] = useState('todas')
  const [emEdicao, definirEmEdicao] = useState(null)
  const [modalAberto, definirModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroAcao, setErroAcao] = useState(null)

  const podeOrdenar = filtroCategoria !== 'todas' && !busca.trim()

  const respostasVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    const filtradas = respostas.filter((item) => {
      const combinaCategoria = filtroCategoria === 'todas' || item.categoriaId === filtroCategoria
      const combinaBusca = !termo || item.pergunta.toLowerCase().includes(termo) || item.resposta.toLowerCase().includes(termo)
      return combinaCategoria && combinaBusca
    })
    return filtroCategoria === 'todas' ? filtradas : [...filtradas].sort(compararOrdem)
  }, [respostas, busca, filtroCategoria])

  function buscarCategoriaPorId(categoriaId) {
    return categorias.find((categoria) => categoria.id === categoriaId) ?? SEM_CATEGORIA
  }

  async function executar(acao, mensagemErro) {
    setSalvando(true)
    setErroAcao(null)
    try {
      await acao()
    } catch (falha) {
      setErroAcao(`${mensagemErro}: ${falha.message}`)
    } finally {
      setSalvando(false)
    }
  }

  function moverResposta(indice, direcao) {
    const lista = [...respostasVisiveis]
    const destino = indice + direcao
    ;[lista[indice], lista[destino]] = [lista[destino], lista[indice]]

    return executar(async () => {
      await ordenarRespostas(lista.map((item) => item.id))
      const posicoes = new Map(lista.map((item, posicao) => [item.id, posicao + 1]))
      setAlteradas(respostas.map((item) => (posicoes.has(item.id) ? { ...item, ordem: posicoes.get(item.id) } : item)))
    }, 'Não foi possível reordenar')
  }

  function abrirCriacao() {
    definirEmEdicao(null)
    definirModalAberto(true)
  }

  function abrirEdicao(resposta) {
    definirEmEdicao(resposta)
    definirModalAberto(true)
  }

  function fecharModal() {
    definirModalAberto(false)
    definirEmEdicao(null)
  }

  function salvarResposta(formulario) {
    return executar(async () => {
      const salva = formulario.id
        ? await atualizarRespostaPadrao(formulario.id, formulario)
        : await criarRespostaPadrao(formulario)
      setAlteradas(formulario.id
        ? respostas.map((item) => (item.id === salva.id ? salva : item))
        : [salva, ...respostas])
      fecharModal()
    }, 'Não foi possível salvar')
  }

  function apagarResposta(resposta) {
    if (!window.confirm(`Excluir a resposta "${resposta.pergunta}"?`)) return

    return executar(async () => {
      await excluirRespostaPadrao(resposta.id)
      setAlteradas(respostas.filter((item) => item.id !== resposta.id))
    }, 'Não foi possível excluir')
  }

  function recarregar() {
    setAlteradas(null)
    consultaRespostas.recarregar()
    consultaCategorias.recarregar()
  }

  return {
    consultaRespostas,
    consultaCategorias,
    categorias,
    respostas,
    respostasVisiveis,
    busca,
    definirBusca,
    filtroCategoria,
    definirFiltroCategoria,
    podeOrdenar,
    emEdicao,
    modalAberto,
    salvando,
    erroAcao,
    buscarCategoriaPorId,
    moverResposta,
    abrirCriacao,
    abrirEdicao,
    fecharModal,
    salvarResposta,
    apagarResposta,
    recarregar,
  }
}
