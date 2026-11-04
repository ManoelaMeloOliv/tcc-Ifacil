import { createClient } from '@supabase/supabase-js'

const urlSupabase = import.meta.env.VITE_SUPABASE_URL
const chaveAnonima = import.meta.env.VITE_SUPABASE_ANON_KEY

export const configuracaoValida = Boolean(urlSupabase && chaveAnonima)

export const supabase = configuracaoValida ? createClient(urlSupabase, chaveAnonima) : null
