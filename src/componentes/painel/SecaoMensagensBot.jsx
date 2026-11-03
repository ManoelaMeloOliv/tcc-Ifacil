import { useState } from 'react'
import { AvisoConsulta } from '../interface/AvisoConsulta'
import { useConsulta } from '../interface/useConsulta'
import { atualizarMensagemBot, getMensagensBot } from '../../servicos/perguntas'
import { formatServiceDate } from '../../servicos/historico'

function CartaoMensagem({ message, onSaved }) {
  const [texto, setTexto] = useState(message.text)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const alterado = texto.trim() !== message.text.trim()

  async function handleSalvar() {
    setSalvando(true)
    setErro(null)
    try {
      onSaved(await atualizarMensagemBot(message.key, texto.trim()))
    } catch (falha) {
      setErro(falha.message ?? 'Erro desconhecido')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{message.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{message.description}</p>
        </div>
        <p className="text-xs text-slate-400">Atualizada em {formatServiceDate(message.updatedAt)}</p>
      </div>

      <label htmlFor={`mensagem-${message.key}`} className="sr-only">Texto de {message.title}</label>
      <textarea
        id={`mensagem-${message.key}`}
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        rows={Math.min(12, Math.max(3, texto.split('\n').length + 1))}
        className="mt-4 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">Use *texto* para negrito no WhatsApp.</p>
        <div className="flex gap-2">
          {alterado && (
            <button type="button" onClick={() => setTexto(message.text)} disabled={salvando} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Desfazer</button>
          )}
          <button type="button" onClick={handleSalvar} disabled={!alterado || !texto.trim() || salvando} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
      {erro && <p role="alert" className="mt-2 text-xs text-red-600">Não foi possível salvar: {erro}</p>}
    </article>
  )
}

export function SecaoMensagensBot() {
  const mensagens = useConsulta(getMensagensBot, [])
  // Cópia local para refletir o que foi salvo sem buscar tudo de novo
  const [alteradas, setAlteradas] = useState(null)
  const messages = alteradas ?? mensagens.dados

  function handleSaved(salva) {
    setAlteradas(messages.map((item) => (item.key === salva.key ? { ...item, ...salva } : item)))
  }

  return (
    <section className="mt-10" aria-labelledby="titulo-mensagens-bot">
      <div className="mb-4">
        <h2 id="titulo-mensagens-bot" className="text-lg font-bold text-slate-900">Mensagens do bot</h2>
        <p className="mt-1 text-sm text-slate-500">Textos fixos enviados pelo assistente no WhatsApp. As alterações valem a partir da próxima mensagem recebida.</p>
      </div>

      <AvisoConsulta carregando={mensagens.carregando} erro={mensagens.erro} onTentarNovamente={() => { setAlteradas(null); mensagens.recarregar() }}>
        <div className="grid gap-4 xl:grid-cols-2">
          {messages.map((message) => (
            <CartaoMensagem key={`${message.key}-${message.updatedAt}`} message={message} onSaved={handleSaved} />
          ))}
        </div>
      </AvisoConsulta>
    </section>
  )
}
