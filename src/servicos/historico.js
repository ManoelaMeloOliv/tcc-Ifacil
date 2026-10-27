import { supabase } from '../lib/supabaseClient'

export const serviceStatus = {
  resolvida: { label: 'Resolvido', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  encaminhada: { label: 'Encaminhado', className: 'bg-red-50 text-red-600 ring-red-100' },
  em_andamento: { label: 'Em andamento', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
}

const LIMITE_HISTORICO = 500

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function formatServiceDate(isoDate) {
  if (!isoDate) return '--/-- --:--'
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return '--/-- --:--'
  return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`
}

// "5548999991234" ou "5548999991234@s.whatsapp.net" -> "+55 48 99999-1234"
function formatarTelefone(bruto) {
  const digitos = (bruto ?? '').split('@')[0].replace(/\D/g, '')
  const partes = digitos.match(/^(55)(\d{2})(\d{4,5})(\d{4})$/)
  if (!partes) return digitos || 'Sem número'
  return `+${partes[1]} ${partes[2]} ${partes[3]}-${partes[4]}`
}

function iniciaisDoNome(nome) {
  if (!nome) return '??'
  const partes = nome.trim().split(/\s+/)
  const primeiras = partes.slice(0, 2).map((parte) => parte[0]?.toUpperCase() ?? '')
  return primeiras.join('') || '??'
}

export async function getHistoricoAtendimentos() {
  const { data, error } = await supabase
    .from('vw_historico_atendimentos')
    .select('*')
    .order('iniciada_em', { ascending: false })
    .limit(LIMITE_HISTORICO)

  if (error) throw error

  return (data ?? []).map((linha) => ({
    id: linha.id,
    initials: iniciaisDoNome(linha.nome_contato),
    name: linha.nome_contato || 'Contato sem nome',
    phone: formatarTelefone(linha.telefone),
    lastMessage: linha.ultima_mensagem ?? '',
    topic: linha.tema ?? 'Outros',
    startedAt: linha.iniciada_em,
    messages: linha.total_mensagens ?? 0,
    responseTime: Number(linha.tempo_resposta_medio_seg ?? 0),
    status: serviceStatus[linha.status] ? linha.status : 'em_andamento',
  }))
}
