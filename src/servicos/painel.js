import { supabase } from '../lib/supabaseClient'

const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const NOMES_MES_COMPLETO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export async function getEstatisticasMensais() {
  const { data, error } = await supabase
    .from('vw_estatisticas_mensais')
    .select('*')
    .order('mes', { ascending: true })

  if (error) throw error

  return (data ?? []).map((linha) => {
    // Adiciona T00:00:00 para evitar que o Date parseie em UTC e volte 1 dia no fuso GMT-3
    const dataMes = new Date(`${linha.mes}T00:00:00`)
    const indexMes = isNaN(dataMes.getMonth()) ? 0 : dataMes.getMonth()

    return {
      mes: NOMES_MES[indexMes],
      fullMonth: NOMES_MES_COMPLETO[indexMes],
      anoMes: linha.mes,
      contacts: linha.total_contatos ?? 0,
      resolved: linha.total_resolvidos ?? 0,
      questions: linha.total_perguntas ?? 0,
      responseTime: Number(linha.tempo_resposta_medio_seg ?? 0),
    }
  })
}

export async function getDistribuicaoTemas(anoMes) {
  if (!anoMes) return []
  
  const [ano, mes] = anoMes.split('-').map(Number)
  const inicio = new Date(Date.UTC(ano, mes - 1, 1))
  const fim = new Date(Date.UTC(ano, mes, 1))

  const { data, error } = await supabase
    .from('conversas')
    .select('categoria_id, categorias(nome, cor)')
    .gte('iniciada_em', inicio.toISOString())
    .lt('iniciada_em', fim.toISOString())

  if (error) throw error

  const contagem = new Map()
  for (const linha of data ?? []) {
    const nome = linha.categorias?.nome ?? 'Outros'
    const atual = contagem.get(nome) ?? { name: nome, color: linha.categorias?.cor ?? '#cbd5e1', total: 0 }
    atual.total += 1
    contagem.set(nome, atual)
  }

  const totalGeral = [...contagem.values()].reduce((soma, item) => soma + item.total, 0)

  return [...contagem.values()]
    .map((item) => ({
      name: item.name,
      color: item.color,
      value: totalGeral ? Math.round((item.total / totalGeral) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value)
}

export async function getPerguntasFrequentes(limite = 3) {
  const { data, error } = await supabase
    .from('vw_perguntas_frequentes')
    .select('*')
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