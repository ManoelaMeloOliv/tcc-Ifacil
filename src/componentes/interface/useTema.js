import { useSyncExternalStore } from 'react'

const ouvintes = new Set()

function lerTema() {
  return document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro'
}

function assinar(ouvinte) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

function definirTema(tema) {
  document.documentElement.dataset.tema = tema
  try {
    localStorage.setItem('tema', tema)
  } catch {
    // sem armazenamento disponível: o tema vale só nesta sessão
  }
  ouvintes.forEach((ouvinte) => ouvinte())
}

export function useTema() {
  const tema = useSyncExternalStore(assinar, lerTema, () => 'claro')

  return {
    tema,
    escuro: tema === 'escuro',
    alternar: () => definirTema(tema === 'escuro' ? 'claro' : 'escuro'),
  }
}
