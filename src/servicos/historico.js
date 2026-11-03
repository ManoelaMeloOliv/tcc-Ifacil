import { supabase } from '../lib/supabaseClient'

// resolvida = o bot respondeu sem pedir ajuda humana; finalizada = a secretaria encerrou
export const serviceStatus = {
  encaminhada: { label: 'Aguardando atendente', className: 'bg-red-50 text-red-600 ring-red-100' },
  em_andamento: { label: 'Em andamento', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  resolvida: { label: 'Respondido pelo bot', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  finalizada: { label: 'Finalizado', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
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

function apenasDigitos(bruto) {
  return (bruto ?? '').split('@')[0].replace(/\D/g, '')
}

// "5548999991234" ou "5548999991234@s.whatsapp.net" -> "+55 48 99999-1234"
function formatarTelefone(bruto) {
  const digitos = apenasDigitos(bruto)
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
    whatsappLink: apenasDigitos(linha.telefone) ? `https://wa.me/${apenasDigitos(linha.telefone)}` : null,
    lastMessage: linha.ultima_mensagem ?? '',
    topic: linha.tema ?? 'Outros',
    startedAt: linha.iniciada_em,
    messages: linha.total_mensagens ?? 0,
    responseTime: Number(linha.tempo_resposta_medio_seg ?? 0),
    status: serviceStatus[linha.status] ? linha.status : 'em_andamento',
  }))
}

export async function getMensagensConversa(conversaId) {
  const { data, error } = await supabase
    .from('mensagens')
    .select('id, tipo, mensagem, enviada_em, utilizou_rag, encaminhada_humano')
    .eq('conversa_id', conversaId)
    .order('enviada_em', { ascending: true })

  if (error) throw error

  return (data ?? []).map((linha) => ({
    id: linha.id,
    fromBot: linha.tipo === 'bot',
    text: linha.mensagem ?? '',
    sentAt: linha.enviada_em,
    usedRag: linha.utilizou_rag,
    forwarded: linha.encaminhada_humano,
  }))
}

export async function finalizarAtendimento(conversaId) {
  const { error } = await supabase.rpc('painel_finalizar_atendimento', { p_conversa: conversaId })
  if (error) throw error
}
