import { describe, expect, it, vi } from 'vitest'

vi.mock('../lib/supabaseClient', () => ({ supabase: null }))

const { formatarDataAtendimento, formatarTelefone, iniciaisDoNome, intervaloDoFiltro } = await import('./historico')

describe('formatarTelefone', () => {
  it('formata celular brasileiro com DDI', () => {
    expect(formatarTelefone('5548999991234')).toBe('+55 48 99999-1234')
  })

  it('aceita o formato do WhatsApp com sufixo', () => {
    expect(formatarTelefone('5548999991234@s.whatsapp.net')).toBe('+55 48 99999-1234')
  })

  it('formata telefone fixo', () => {
    expect(formatarTelefone('554832221234')).toBe('+55 48 3222-1234')
  })

  it('devolve só os dígitos quando não reconhece o padrão', () => {
    expect(formatarTelefone('12345')).toBe('12345')
  })

  it('avisa quando não há número', () => {
    expect(formatarTelefone(null)).toBe('Sem número')
  })
})

describe('iniciaisDoNome', () => {
  it('usa as duas primeiras iniciais em maiúsculas', () => {
    expect(iniciaisDoNome('maria da silva')).toBe('MD')
  })

  it('usa ?? quando não há nome', () => {
    expect(iniciaisDoNome('')).toBe('??')
    expect(iniciaisDoNome(null)).toBe('??')
  })
})

describe('formatarDataAtendimento', () => {
  it('devolve marcador quando a data é vazia ou inválida', () => {
    expect(formatarDataAtendimento(null)).toBe('--/-- --:--')
    expect(formatarDataAtendimento('texto')).toBe('--/-- --:--')
  })

  it('formata dia, mês e hora', () => {
    expect(formatarDataAtendimento('2026-11-04T15:30:00')).toBe('04/11 15:30')
  })
})

describe('intervaloDoFiltro', () => {
  it('não filtra sem dia', () => {
    expect(intervaloDoFiltro({})).toBeNull()
  })

  it('cobre o dia inteiro quando não há horas', () => {
    const { inicio, fim } = intervaloDoFiltro({ dia: '2026-11-09' })
    expect(new Date(fim) - new Date(inicio)).toBe(24 * 60 * 60 * 1000)
    expect(inicio).toBe(new Date('2026-11-09T00:00:00').toISOString())
  })

  it('inclui o minuto final da hora escolhida', () => {
    const { inicio, fim } = intervaloDoFiltro({ dia: '2026-11-09', horaInicio: '14:00', horaFim: '15:30' })
    expect(inicio).toBe(new Date('2026-11-09T14:00:00').toISOString())
    expect(fim).toBe(new Date('2026-11-09T15:31:00').toISOString())
  })
})
