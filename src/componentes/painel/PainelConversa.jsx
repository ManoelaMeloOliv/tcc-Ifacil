import { useCallback, useEffect, useState } from 'react'
import { AvisoConsulta } from '../interface/AvisoConsulta'
import { useConsulta } from '../interface/useConsulta'
import { CloseIcon, WhatsAppIcon } from './IconesPainel'
import { finalizarAtendimento, formatServiceDate, getMensagensConversa, serviceStatus } from '../../servicos/historico'

// *negrito* do WhatsApp vira <strong>; o resto fica como texto puro
function TextoWhatsApp({ text }) {
  return text.split(/(\*[^*\n]+\*)/g).map((parte, indice) => (
    /^\*[^*\n]+\*$/.test(parte) ? <strong key={indice}>{parte.slice(1, -1)}</strong> : parte
  ))
}

export function PainelConversa({ service, onClose, onFinalizado }) {
  const mensagens = useConsulta(useCallback(() => getMensagensConversa(service.id), [service.id]), [])
  const [finalizando, setFinalizando] = useState(false)
  const [erroFinalizar, setErroFinalizar] = useState(null)
  const status = serviceStatus[service.status]
  const aguardando = service.status === 'encaminhada'

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  async function handleFinalizar() {
    setFinalizando(true)
    setErroFinalizar(null)
    try {
      await finalizarAtendimento(service.id)
      onFinalizado()
    } catch (falha) {
      setErroFinalizar(falha.message ?? 'Erro desconhecido')
    } finally {
      setFinalizando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 cursor-default" />
      <aside role="dialog" aria-modal="true" aria-labelledby="titulo-conversa" className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="titulo-conversa" className="text-lg font-bold text-slate-900">{service.name}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{service.phone} · {service.topic} · iniciada em {formatServiceDate(service.startedAt)}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Fechar">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}>{status.label}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              {service.whatsappLink && (
                <a href={service.whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                  <WhatsAppIcon className="h-4 w-4" />Abrir no WhatsApp
                </a>
              )}
              {aguardando && (
                <button type="button" onClick={handleFinalizar} disabled={finalizando} className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
                  {finalizando ? 'Salvando...' : 'Marcar como resolvido'}
                </button>
              )}
            </div>
          </div>

          {aguardando && (
            <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-600">
              O aluno pediu atendimento humano e o bot está em silêncio com ele. Responda pelo WhatsApp do número do bot e, ao terminar, marque como resolvido para o bot voltar a atender.
            </p>
          )}
          {erroFinalizar && <p role="alert" className="mt-3 text-xs text-red-600">Não foi possível finalizar: {erroFinalizar}</p>}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-5">
          <AvisoConsulta carregando={mensagens.carregando} erro={mensagens.erro} onTentarNovamente={mensagens.recarregar}>
            {mensagens.dados.length === 0 && <p className="py-12 text-center text-sm text-slate-400">Nenhuma mensagem registrada.</p>}
            <ol className="space-y-3">
              {mensagens.dados.map((mensagem) => (
                <li key={mensagem.id} className={`flex ${mensagem.fromBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm ${mensagem.fromBot ? 'rounded-tl-sm bg-white text-slate-700' : 'rounded-tr-sm bg-emerald-600 text-white'}`}>
                    <p className="whitespace-pre-wrap break-words"><TextoWhatsApp text={mensagem.text} /></p>
                    <p className={`mt-1 flex flex-wrap items-center gap-x-2 text-[11px] ${mensagem.fromBot ? 'text-slate-400' : 'text-emerald-100'}`}>
                      <span>{mensagem.fromBot ? 'Bot' : 'Aluno'} · {formatServiceDate(mensagem.sentAt)}</span>
                      {mensagem.usedRag && <span className="rounded bg-sky-50 px-1.5 font-semibold text-sky-700">editais</span>}
                      {mensagem.forwarded && <span className="rounded bg-red-50 px-1.5 font-semibold text-red-600">encaminhou para humano</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </AvisoConsulta>
        </div>
      </aside>
    </div>
  )
}
