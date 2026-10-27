import { supabase } from '../lib/supabaseClient'

const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const NOMES_MES_COMPLETO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// A view já devolve os últimos 12 meses, inclusive os zerados
export async function getEstatisticasMensais() {
  const { data, error } = await supabase
    .from('vw_estatisticas_mensais')
    .select('*')
    .order('mes', { ascending: true })

  if (error) throw error

  return (data ?? []).map((linha) => {
    // 'YYYY-MM-DD': lê o mês direto do texto para não cair no mês anterior por causa do fuso
    const indexMes = Number(linha.mes.slice(5, 7)) - 1

    return {
      month: NOMES_MES[indexMes],
      fullMonth: NOMES_MES_COMPLETO[indexMes],
      anoMes: linha.mes,
      contacts: linha.total_contatos ?? 0,
      services: linha.total_atendimentos ?? 0,
      resolved: linha.total_resolvidos ?? 0,
      questions: linha.total_perguntas ?? 0,
      responseTime: Number(linha.tempo_resposta_medio_seg ?? 0),
    }
  })
}

export async function getDistribuicaoTemas(anoMes) {
  if (!anoMes) return []

  const { data, error } = await supabase
    .from('vw_temas_mensais')
    .select('tema, cor, total')
    .eq('mes', anoMes)

  if (error) throw error

  const totalGeral = (data ?? []).reduce((soma, linha) => soma + linha.total, 0)

  return (data ?? [])
    .map((linha) => ({
      name: linha.tema,
      color: linha.cor,
      value: totalGeral ? Math.round((linha.total / totalGeral) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value)
}

export async function getPerguntasFrequentes(anoMes, limite = 3) {
  if (!anoMes) return []

  const { data, error } = await supabase
    .from('vw_perguntas_frequentes')
    .select('*')
    .eq('mes', anoMes)
    .order('vezes_utilizada', { ascending: false })
    .limit(limite)

  if (error) throw error

  return (data ?? []).map((linha, indice) => ({
    position: indice + 1,
    question: linha.pergunta,
    topic: linha.tema ?? 'Outros',
    amount: linha.vezes_utilizada ?? 0,
  }))
}

export async function getResumoDashboard() {
  const { data, error } = await supabase.from('vw_resumo_dashboard').select('*').single()
  if (error) throw error
  return data
}
