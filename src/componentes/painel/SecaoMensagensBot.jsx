import { useState } from 'react'
import { AvisoConsulta } from '../interface/AvisoConsulta'
import { useConsulta } from '../interface/useConsulta'
import { atualizarMensagemBot, buscarMensagensBot } from '../../servicos/perguntas'
import { formatarDataAtendimento } from '../../servicos/historico'

function CartaoMensagem({ mensagem, aoSalvar }) {
  const [texto, setTexto] = useState(mensagem.texto)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const alterado = texto.trim() !== mensagem.texto.trim()

  async function salvar() {
    setSalvando(true)
    setErro(null)
    try {
      aoSalvar(await atualizarMensagemBot(mensagem.chave, texto.trim()))
    } catch (falha) {
      setErro(falha.message ?? 'Erro desconhecido')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <article className="cartao p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{mensagem.titulo}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{mensagem.descricao}</p>
        </div>
        <p className="text-xs text-slate-400">Atualizada em {formatarDataAtendimento(mensagem.atualizadaEm)}</p>
      </div>

      <label htmlFor={`mensagem-${mensagem.chave}`} className="sr-only">Texto de {mensagem.titulo}</label>
      <textarea
        id={`mensagem-${mensagem.chave}`}
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        rows={Math.min(12, Math.max(3, texto.split('\n').length + 1))}
        className="mt-4 w-full resize-y rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">Use *texto* para negrito no WhatsApp.</p>
        <div className="flex gap-2">
          {alterado && (
            <button type="button" onClick={() => setTexto(mensagem.texto)} disabled={salvando} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Desfazer</button>
          )}
          <button type="button" onClick={salvar} disabled={!alterado || !texto.trim() || salvando} className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-ink transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
      {erro && <p role="alert" className="mt-2 text-xs text-red-600">Não foi possível salvar: {erro}</p>}
    </article>
  )
}

export function SecaoMensagensBot() {
  const consulta = useConsulta(buscarMensagensBot, [])
  const [alteradas, setAlteradas] = useState(null)
  const mensagens = alteradas ?? consulta.dados

  function aoSalvarMensagem(salva) {
    setAlteradas(mensagens.map((item) => (item.chave === salva.chave ? { ...item, ...salva } : item)))
  }

  return (
    <section id="painel-mensagens" role="tabpanel" aria-labelledby="aba-mensagens">
      <div className="mb-4">
        <h2 id="titulo-mensagens-bot" className="titulo-display text-lg text-slate-900">Mensagens do bot</h2>
        <p className="mt-1 text-sm text-slate-500">Textos fixos enviados pelo assistente no WhatsApp. As alterações valem a partir da próxima mensagem recebida.</p>
      </div>

      <AvisoConsulta carregando={consulta.carregando} erro={consulta.erro} aoTentarNovamente={() => { setAlteradas(null); consulta.recarregar() }}>
        <div className="grid gap-4 xl:grid-cols-2">
          {mensagens.map((mensagem) => (
            <CartaoMensagem key={`${mensagem.chave}-${mensagem.atualizadaEm}`} mensagem={mensagem} aoSalvar={aoSalvarMensagem} />
          ))}
        </div>
      </AvisoConsulta>
    </section>
  )
}
