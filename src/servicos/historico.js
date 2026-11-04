import { supabase } from '../lib/supabaseClient'

export const statusAtendimento = {
  encaminhada: { rotulo: 'Aguardando atendente', classes: 'bg-red-600 text-white' },
  em_andamento: { rotulo: 'Em andamento', classes: 'bg-amber-50 text-amber-700' },
  resolvida: { rotulo: 'Respondido pelo bot', classes: 'bg-emerald-50 text-emerald-700' },
  finalizada: { rotulo: 'Finalizado', classes: 'bg-slate-100 text-slate-500' },
}

const LIMITE_HISTORICO = 500

const formatadorData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const formatadorHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function formatarDataAtendimento(dataIso) {
  if (!dataIso) return '--/-- --:--'
  const data = new Date(dataIso)
  if (isNaN(data.getTime())) return '--/-- --:--'
  return `${formatadorData.format(data)} ${formatadorHora.format(data)}`
}

function apenasDigitos(bruto) {
  return (bruto ?? '').split('@')[0].replace(/\D/g, '')
}

export function formatarTelefone(bruto) {
  const digitos = apenasDigitos(bruto)
  const partes = digitos.match(/^(55)(\d{2})(\d{4,5})(\d{4})$/)
  if (!partes) return digitos || 'Sem número'
  return `+${partes[1]} ${partes[2]} ${partes[3]}-${partes[4]}`
}

export function iniciaisDoNome(nome) {
  if (!nome) return '??'
  const partes = nome.trim().split(/\s+/)
  const primeiras = partes.slice(0, 2).map((parte) => parte[0]?.toUpperCase() ?? '')
  return primeiras.join('') || '??'
}

function paraAtendimento(linha) {
  return {
    id: linha.id,
    iniciais: iniciaisDoNome(linha.nome_contato),
    nome: linha.nome_contato || 'Contato sem nome',
    telefone: formatarTelefone(linha.telefone),
    linkWhatsapp: apenasDigitos(linha.telefone) ? `https://wa.me/${apenasDigitos(linha.telefone)}` : null,
    ultimaMensagem: linha.ultima_mensagem ?? '',
    tema: linha.tema ?? 'Outros',
    iniciadaEm: linha.iniciada_em,
    totalMensagens: linha.total_mensagens ?? 0,
    tempoResposta: Number(linha.tempo_resposta_medio_seg ?? 0),
    status: statusAtendimento[linha.status] ? linha.status : 'em_andamento',
  }
}

export async function buscarHistoricoAtendimentos() {
  const { data, error } = await supabase
    .from('vw_historico_atendimentos')
    .select('*')
    .order('iniciada_em', { ascending: false })
    .limit(LIMITE_HISTORICO)

  if (error) throw error
  return (data ?? []).map(paraAtendimento)
}

export async function buscarAguardandoAtendente(limite = 5) {
  const { data, error } = await supabase
    .from('vw_historico_atendimentos')
    .select('*')
    .eq('status', 'encaminhada')
    .order('iniciada_em', { ascending: false })
    .limit(limite)

  if (error) throw error
  return (data ?? []).map(paraAtendimento)
}

export async function contarAguardandoAtendente() {
  const { count, error } = await supabase
    .from('vw_historico_atendimentos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'encaminhada')

  if (error) throw error
  return count ?? 0
}

export async function buscarMensagensConversa(conversaId) {
  const { data, error } = await supabase
    .from('mensagens')
    .select('id, tipo, mensagem, enviada_em, utilizou_rag, encaminhada_humano')
    .eq('conversa_id', conversaId)
    .order('enviada_em', { ascending: true })

  if (error) throw error

  return (data ?? []).map((linha) => ({
    id: linha.id,
    autor: linha.tipo,
    texto: linha.mensagem ?? '',
    enviadaEm: linha.enviada_em,
    usouRag: linha.utilizou_rag,
    encaminhada: linha.encaminhada_humano,
  }))
}

export async function finalizarAtendimento(conversaId) {
  const { error } = await supabase.rpc('painel_finalizar_atendimento', { p_conversa: conversaId })
  if (error) throw error
}
