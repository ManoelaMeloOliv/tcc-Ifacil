import { supabase } from '../lib/supabaseClient'

export async function entrarAdmin(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('E-mail ou senha inválidos.')
    }
    if (error.message.includes('Email not confirmed')) {
      throw new Error('E-mail ainda não confirmado. Confira sua caixa de entrada.')
    }
    throw new Error(error.message)
  }

  return data.user
}

export async function sairAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function buscarSessaoAtual() {
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}

export function aoMudarAutenticacao(aoMudar) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => {
    aoMudar(sessao)
  })
  return () => data.subscription.unsubscribe()
}
