import { supabase } from '../lib/supabaseClient'

function paraResposta(linha) {
  return {
    id: linha.id,
    pergunta: linha.pergunta,
    resposta: linha.resposta,
    categoriaId: linha.categoria_id,
    ativa: linha.ativo,
    ordem: linha.ordem,
    criadaEm: linha.criado_em,
    atualizadaEm: linha.atualizado_em,
  }
}

function paraLinha({ pergunta, resposta, categoriaId, ativa }) {
  return { pergunta, resposta, categoria_id: categoriaId || null, ativo: ativa }
}

export async function buscarCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nome, slug_cor, rotulo_menu, nativa, ordem_menu')
    .order('ordem_menu')
    .order('nome')

  if (error) throw error
  return (data ?? []).map((linha) => ({
    id: linha.id,
    nome: linha.rotulo_menu?.trim() || linha.nome,
    cor: linha.slug_cor,
    nativa: linha.nativa,
    ordem: linha.ordem_menu,
  }))
}

export async function criarAssunto(nome, ordem) {
  const { error } = await supabase.from('categorias').insert({ nome, rotulo_menu: nome, ordem_menu: ordem })
  if (error) throw error
}

export async function renomearAssunto(id, nome) {
  const { error } = await supabase.from('categorias').update({ rotulo_menu: nome }).eq('id', id)
  if (error) throw error
}

export async function excluirAssunto(id) {
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) throw error
}

export async function ordenarAssuntos(ids) {
  const { error } = await supabase.rpc('painel_ordenar_assuntos', { p_ids: ids })
  if (error) throw error
}

export async function ordenarRespostas(ids) {
  const { error } = await supabase.rpc('painel_ordenar_respostas', { p_ids: ids })
  if (error) throw error
}

export async function buscarRespostasPadrao() {
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
    .update(paraLinha(resposta))
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

export async function buscarMensagensBot() {
  const { data, error } = await supabase
    .from('mensagens_bot')
    .select('chave, titulo, descricao, texto, atualizado_em')
    .order('ordem')

  if (error) throw error
  return (data ?? []).map((linha) => ({
    chave: linha.chave,
    titulo: linha.titulo,
    descricao: linha.descricao ?? '',
    texto: linha.texto,
    atualizadaEm: linha.atualizado_em,
  }))
}

export async function atualizarMensagemBot(chave, texto) {
  const { data, error } = await supabase
    .from('mensagens_bot')
    .update({ texto })
    .eq('chave', chave)
    .select('chave, texto, atualizado_em')
    .single()

  if (error) throw error
  return { chave: data.chave, texto: data.texto, atualizadaEm: data.atualizado_em }
}
