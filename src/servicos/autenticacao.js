import { supabase } from '../lib/supabaseClient'

const CHAVE_SESSAO = 'ifacil_admin'

export async function loginAdmin(email, senha) {
  const { data, error } = await supabase.rpc('verificar_login_admin', {
    p_email: email,
    p_senha: senha,
  })

  if (error) throw error

  // Se a RPC retornar array ou objeto único
  const admin = Array.isArray(data) ? data[0] : data
  if (!admin) throw new Error('E-mail ou senha inválidos.')

  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(admin))
  return admin
}

export function logoutAdmin() {
  sessionStorage.removeItem(CHAVE_SESSAO)
}

export function getAdminLogado() {
  const bruto = sessionStorage.getItem(CHAVE_SESSAO)
  if (!bruto) return null

  try {
    return JSON.parse(bruto)
  } catch {
    sessionStorage.removeItem(CHAVE_SESSAO)
    return null
  }
}