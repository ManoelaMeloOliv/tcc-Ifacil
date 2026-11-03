import { supabase } from '../lib/supabaseClient'

function paraResposta(linha) {
  return {
    id: linha.id,
    question: linha.pergunta,
    answer: linha.resposta,
    categoryId: linha.categoria_id,
    active: linha.ativo,
    updatedAt: linha.atualizado_em,
  }
}

function paraLinha({ question, answer, categoryId, active }) {
  return { pergunta: question, resposta: answer, categoria_id: categoryId || null, ativo: active }
}

export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nome, cor, slug_cor')
    .order('nome')

  if (error) throw error
  return (data ?? []).map((linha) => ({ id: linha.id, name: linha.nome, color: linha.slug_cor }))
}

export async function getRespostasPadrao() {
  const { data, error } = await supabase
    .from('vw_respostas_padrao')
    .select('*')
    .order('atualizado_em', { ascending: false })

  if (error) throw error
  return (data ?? []).map(paraResposta)
}

export async function criarRespostaPadrao(resposta) {
  const { data, error } = await supabase
    .from('respostas_padrao')
    .insert(paraLinha(resposta))
    .select()
    .single()

  if (error) throw error
  return paraResposta(data)
}

export async function atualizarRespostaPadrao(id, resposta) {
  const { data, error } = await supabase
    .from('respostas_padrao')
    .update({ ...paraLinha(resposta), atualizado_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return paraResposta(data)
}

export async function excluirRespostaPadrao(id) {
  const { error } = await supabase.from('respostas_padrao').delete().eq('id', id)
  if (error) throw error
}

export async function getMensagensBot() {
  const { data, error } = await supabase
    .from('mensagens_bot')
    .select('chave, titulo, descricao, texto, atualizado_em')
    .order('ordem')

  if (error) throw error
  return (data ?? []).map((linha) => ({
    key: linha.chave,
    title: linha.titulo,
    description: linha.descricao ?? '',
    text: linha.texto,
    updatedAt: linha.atualizado_em,
  }))
}

export async function atualizarMensagemBot(chave, texto) {
  const { data, error } = await supabase
    .from('mensagens_bot')
    .update({ texto, atualizado_em: new Date().toISOString() })
    .eq('chave', chave)
    .select('chave, texto, atualizado_em')
    .single()

  if (error) throw error
  return { key: data.chave, text: data.texto, updatedAt: data.atualizado_em }
}
