import { supabase } from '../lib/supabaseClient'

export async function getCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nome, cor, slug_cor')
    .order('nome')

  if (error) throw error
  return data ?? []
}

export async function getRespostasPadrao() {
  const { data, error } = await supabase
    .from('vw_respostas_padrao')
    .select('*')
    .order('atualizado_em', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function criarRespostaPadrao({ pergunta, resposta, categoria_id, ativo }) {
  const { data, error } = await supabase
    .from('respostas_padrao')
    .insert({ pergunta, resposta, categoria_id, ativo })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function atualizarRespostaPadrao(id, { pergunta, resposta, categoria_id, ativo }) {
  const { data, error } = await supabase
    .from('respostas_padrao')
    .update({ pergunta, resposta, categoria_id, ativo, atualizado_em: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function excluirRespostaPadrao(id) {
  const { error } = await supabase.from('respostas_padrao').delete().eq('id', id)
  if (error) throw error
}