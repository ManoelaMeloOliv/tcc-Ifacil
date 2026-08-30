import { supabase } from '../lib/supabaseClient'

/**
 * Autenticação via Supabase Auth.
 *
 * A sessão é guardada pelo próprio client (localStorage) e enviada como JWT em
 * toda requisição ao banco. É esse token que as policies de RLS enxergam — por
 * isso o login aqui protege os dados de verdade, e não só a navegação.
 */

export async function loginAdmin(email, senha) {
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

export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSessaoAtual() {
  const { data, error } = await supabase.auth.getSession()
  if (error) return null
  return data.session
}

/** Registra um listener de login/logout. Devolve a função para cancelar. */
export function onMudancaAuth(callback) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => {
    callback(sessao)
  })
  return () => data.subscription.unsubscribe()
}
