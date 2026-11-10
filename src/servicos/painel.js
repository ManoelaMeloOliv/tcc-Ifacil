import { supabase } from '../lib/supabaseClient'

const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const NOMES_MES_COMPLETO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export async function buscarEstatisticasMensais() {
  const { data, error } = await supabase
    .from('vw_estatisticas_mensais')
    .select('*')
    .order('mes', { ascending: true })

  if (error) throw error

  return (data ?? []).map((linha) => {
    const indiceMes = Number(linha.mes.slice(5, 7)) - 1

    return {
      mes: NOMES_MES[indiceMes],
      mesCompleto: NOMES_MES_COMPLETO[indiceMes],
      anoMes: linha.mes,
      contatos: linha.total_contatos ?? 0,
      atendimentos: linha.total_atendimentos ?? 0,
      resolvidos: linha.total_resolvidos ?? 0,
      perguntas: linha.total_perguntas ?? 0,
      tempoResposta: Number(linha.tempo_resposta_medio_seg ?? 0),
    }
  })
}

export async function buscarDistribuicaoTemas(anoMes) {
  if (!anoMes) return []

  const { data, error } = await supabase
    .from('vw_temas_mensais')
    .select('tema, cor, total')
    .eq('mes', anoMes)

  if (error) throw error

  const totalGeral = (data ?? []).reduce((soma, linha) => soma + linha.total, 0)

  return (data ?? [])
    .map((linha) => ({
      nome: linha.tema,
      cor: linha.cor,
      valor: totalGeral ? Math.round((linha.total / totalGeral) * 100) : 0,
    }))
    .sort((a, b) => b.valor - a.valor)
}

export async function buscarPerguntasFrequentes(anoMes, limite = 3) {
  if (!anoMes) return []

  const { data, error } = await supabase
    .from('vw_perguntas_frequentes')
    .select('*')
    .eq('mes', anoMes)
    .order('vezes_utilizada', { ascending: false })
    .limit(limite)

  if (error) throw error

  return (data ?? []).map((linha, indice) => ({
    posicao: indice + 1,
    pergunta: linha.pergunta,
    tema: linha.tema ?? 'Outros',
    quantidade: linha.vezes_utilizada ?? 0,
  }))
}

function distribuicaoEmPercentual(linhas) {
  const totalGeral = linhas.reduce((soma, linha) => soma + Number(linha.total), 0)
  return linhas
    .map((linha) => ({
      nome: linha.tema,
      cor: linha.cor,
      valor: totalGeral ? Math.round((Number(linha.total) / totalGeral) * 100) : 0,
    }))
    .sort((a, b) => b.valor - a.valor)
}

// Indicadores de um intervalo qualquer ({ inicio, fim } em ISO), no mesmo formato dos meses
export async function buscarResumoPeriodo(intervalo) {
  if (!intervalo) return null

  const { data, error } = await supabase.rpc('painel_resumo_periodo', { p_inicio: intervalo.inicio, p_fim: intervalo.fim })
  if (error) throw error

  const resumo = data ?? {}
  return {
    atendimentos: Number(resumo.atendimentos ?? 0),
    contatos: Number(resumo.contatos ?? 0),
    resolvidos: Number(resumo.resolvidos ?? 0),
    perguntas: Number(resumo.perguntas ?? 0),
    tempoResposta: Number(resumo.tempo_resposta ?? 0),
    temas: distribuicaoEmPercentual(resumo.temas ?? []),
    frequentes: [...(resumo.frequentes ?? [])]
      .sort((a, b) => b.vezes - a.vezes)
      .map((linha, indice) => ({
        posicao: indice + 1,
        pergunta: linha.pergunta,
        tema: linha.tema ?? 'Outros',
        quantidade: Number(linha.vezes ?? 0),
      })),
  }
}
