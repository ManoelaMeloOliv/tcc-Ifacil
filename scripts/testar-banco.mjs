// Testa a conexão com o Supabase, o RLS e o login de admin.
//
//   npm run testar:banco
//   npm run testar:banco -- admin@escola.com minhasenha
//
// Sem credenciais, roda só a parte 1 (visitante deve ser bloqueado).
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function carregarEnv() {
  let bruto
  try {
    bruto = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  } catch {
    return {}
  }
  const env = {}
  for (const linha of bruto.split('\n')) {
    const limpa = linha.trim()
    if (!limpa || limpa.startsWith('#')) continue
    const sep = limpa.indexOf('=')
    if (sep === -1) continue
    env[limpa.slice(0, sep).trim()] = limpa.slice(sep + 1).trim().replace(/^["']|["']$/g, '')
  }
  return env
}

const env = carregarEnv()
const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL
const chave = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY

if (!url || !chave) {
  console.error('\n❌ Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY.')
  console.error('   Copie .env.example para .env e preencha com os dados do Supabase.\n')
  process.exit(1)
}

const [emailAdmin, senhaAdmin] = process.argv.slice(2)

const OBJETOS = [
  'categorias',
  'conversas',
  'respostas_padrao',
  'vw_historico_atendimentos',
  'vw_estatisticas_mensais',
  'vw_perguntas_frequentes',
  'vw_resumo_dashboard',
  'vw_respostas_padrao',
]

let falhas = 0

console.log(`\n🔌 ${url}\n`)

// ── Parte 1: visitante sem login NÃO pode ler nada ──────────────
console.log('🔒 Sem login (papel anon) — o esperado é ser BLOQUEADO:\n')
{
  const anon = createClient(url, chave)
  for (const nome of OBJETOS) {
    const { data, error } = await anon.from(nome).select('*').limit(1)
    if (error) {
      console.log(`  ✅ ${nome.padEnd(28)} bloqueado`)
    } else if ((data ?? []).length === 0) {
      console.log(`  ✅ ${nome.padEnd(28)} bloqueado (0 linhas)`)
    } else {
      falhas++
      console.log(`  ❌ ${nome.padEnd(28)} VAZANDO — visitante leu ${data.length} linha(s)!`)
    }
  }
}

// ── Parte 2: admin logado PODE ler ─────────────────────────────
if (!emailAdmin || !senhaAdmin) {
  console.log('\n⏭️  Parte 2 pulada (login do admin não informado).')
  console.log('   Rode: npm run testar:banco -- admin@escola.com suasenha\n')
} else {
  console.log('\n🔑 Com login de admin — o esperado é PERMITIR:\n')
  const auth = createClient(url, chave)
  const { error: erroLogin } = await auth.auth.signInWithPassword({
    email: emailAdmin,
    password: senhaAdmin,
  })

  if (erroLogin) {
    falhas++
    console.log(`  ❌ Login falhou: ${erroLogin.message}`)
    console.log('     Cadastre o admin em Authentication > Users e confirme o e-mail.')
  } else {
    console.log('  ✅ Login OK\n')
    for (const nome of OBJETOS) {
      const { count, error } = await auth.from(nome).select('*', { count: 'exact', head: true })
      if (error) {
        falhas++
        console.log(`  ❌ ${nome.padEnd(28)} ${error.message}`)
      } else {
        console.log(`  ✅ ${nome.padEnd(28)} ${count ?? 0} registro(s)`)
      }
    }
    await auth.auth.signOut()
  }
}

if (falhas === 0) {
  console.log('\n🎉 Tudo certo.\n')
} else {
  console.log(`\n⚠️  ${falhas} problema(s) acima.`)
  console.log('   VAZANDO  -> rode sql/rls_policies.sql no SQL Editor.')
  console.log('   Erro com admin logado -> objeto não existe ou falta GRANT.\n')
  process.exit(1)
}
