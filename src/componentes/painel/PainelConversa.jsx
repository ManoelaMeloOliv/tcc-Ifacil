import { useCallback, useEffect, useState } from 'react'
import { AvisoConsulta } from '../interface/AvisoConsulta'
import { useConsulta } from '../interface/useConsulta'
import { IconeFechar, IconeWhatsApp } from './IconesPainel'
import { finalizarAtendimento, formatarDataAtendimento, buscarMensagensConversa, statusAtendimento } from '../../servicos/historico'

function TextoWhatsApp({ texto }) {
  return texto.split(/(\*[^*\n]+\*)/g).map((parte, indice) => (
    /^\*[^*\n]+\*$/.test(parte) ? <strong key={indice}>{parte.slice(1, -1)}</strong> : parte
  ))
}

const estiloMensagem = {
  usuario: { rotulo: 'Aluno', lado: 'justify-end', balao: 'rounded-tr-sm bg-emerald-600 text-white', detalhe: 'text-emerald-100' },
  bot: { rotulo: 'Bot', lado: 'justify-start', balao: 'rounded-tl-sm bg-white text-slate-700', detalhe: 'text-slate-400' },
  atendente: { rotulo: 'Secretaria', lado: 'justify-start', balao: 'rounded-tl-sm bg-sky-100 text-slate-800', detalhe: 'text-slate-500' },
}

export function PainelConversa({ atendimento, aoFechar, aoFinalizar }) {
  const mensagens = useConsulta(useCallback(() => buscarMensagensConversa(atendimento.id), [atendimento.id]), [])
  const [finalizando, setFinalizando] = useState(false)
  const [erroFinalizar, setErroFinalizar] = useState(null)
  const status = statusAtendimento[atendimento.status]
  const aguardando = atendimento.status === 'encaminhada'

  useEffect(() => {
    function aoPressionarEsc(evento) {
      if (evento.key === 'Escape') aoFechar()
    }

    document.addEventListener('keydown', aoPressionarEsc)
    return () => document.removeEventListener('keydown', aoPressionarEsc)
  }, [aoFechar])

  async function finalizar() {
    setFinalizando(true)
    setErroFinalizar(null)
    try {
      await finalizarAtendimento(atendimento.id)
      aoFinalizar()
    } catch (falha) {
      setErroFinalizar(falha.message ?? 'Erro desconhecido')
    } finally {
      setFinalizando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <button type="button" aria-label="Fechar" onClick={aoFechar} className="absolute inset-0 cursor-default" />
      <aside role="dialog" aria-modal="true" aria-labelledby="titulo-conversa" className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="titulo-conversa" className="text-lg font-bold text-slate-900">{atendimento.nome}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{atendimento.telefone} · {atendimento.tema} · iniciada em {formatarDataAtendimento(atendimento.iniciadaEm)}</p>
            </div>
            <button type="button" onClick={aoFechar} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Fechar">
              <IconeFechar className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.classes}`}>{status.rotulo}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              {atendimento.linkWhatsapp && (
                <a href={atendimento.linkWhatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                  <IconeWhatsApp className="h-4 w-4" />Abrir no WhatsApp
                </a>
              )}
              {aguardando && (
                <button type="button" onClick={finalizar} disabled={finalizando} className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
                  {finalizando ? 'Salvando...' : 'Marcar como resolvido'}
                </button>
              )}
            </div>
          </div>

          {aguardando && (
            <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-600">
              Esta conversa aguarda atendimento humano e o bot fica em silêncio com o aluno por até 24 horas sem conversa. Responda pelo WhatsApp do número do bot e, ao terminar, marque como resolvido para o bot voltar a atender.
            </p>
          )}
          {erroFinalizar && <p role="alert" className="mt-3 text-xs text-red-600">Não foi possível finalizar: {erroFinalizar}</p>}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-5">
          <AvisoConsulta carregando={mensagens.carregando} erro={mensagens.erro} aoTentarNovamente={mensagens.recarregar}>
            {mensagens.dados.length === 0 && <p className="py-12 text-center text-sm text-slate-400">Nenhuma mensagem registrada.</p>}
            <ol className="space-y-3">
              {mensagens.dados.map((mensagem) => {
                const estilo = estiloMensagem[mensagem.autor] ?? estiloMensagem.bot
                return (
                  <li key={mensagem.id} className={`flex ${estilo.lado}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm ${estilo.balao}`}>
                      <p className="whitespace-pre-wrap break-words"><TextoWhatsApp texto={mensagem.texto} /></p>
                      <p className={`mt-1 flex flex-wrap items-center gap-x-2 text-[11px] ${estilo.detalhe}`}>
                        <span>{estilo.rotulo} · {formatarDataAtendimento(mensagem.enviadaEm)}</span>
                        {mensagem.usouRag && <span className="rounded bg-sky-50 px-1.5 font-semibold text-sky-700">editais</span>}
                        {mensagem.encaminhada && <span className="rounded bg-red-50 px-1.5 font-semibold text-red-600">encaminhou para humano</span>}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </AvisoConsulta>
        </div>
      </aside>
    </div>
  )
}
