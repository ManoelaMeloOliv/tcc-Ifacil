import { AvisoConsulta } from '../componentes/interface/AvisoConsulta'
import { IconeMais } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { ModalResposta } from '../componentes/painel/ModalResposta'
import { SecaoAssuntos } from '../componentes/painel/SecaoAssuntos'
import { SecaoMensagensBot } from '../componentes/painel/SecaoMensagensBot'
import { TabelaRespostas } from '../componentes/painel/TabelaRespostas'
import { useRespostas } from '../componentes/painel/useRespostas'

export function PaginaPerguntas() {
  const {
    consultaRespostas,
    consultaCategorias,
    categorias,
    respostas,
    respostasVisiveis,
    busca,
    definirBusca,
    filtroCategoria,
    definirFiltroCategoria,
    podeOrdenar,
    emEdicao,
    modalAberto,
    salvando,
    erroAcao,
    buscarCategoriaPorId,
    moverResposta,
    abrirCriacao,
    abrirEdicao,
    fecharModal,
    salvarResposta,
    apagarResposta,
    recarregar,
  } = useRespostas()

  return (
    <LayoutPainel>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">BASE DE CONHECIMENTO</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Perguntas & Respostas</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Cada resposta ativa aparece no menu do WhatsApp dentro do seu assunto. Se o aluno escrever uma pergunta parecida, o bot envia o texto cadastrado sem consultar a IA. Se não houver resposta parecida, ele busca nos editais.</p>
        </div>
        <button type="button" onClick={abrirCriacao} disabled={consultaCategorias.carregando || !!consultaCategorias.erro} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          <IconeMais className="h-4 w-4" />Nova resposta
        </button>
      </div>

      {erroAcao && (
        <p role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{erroAcao}</p>
      )}

      <AvisoConsulta carregando={consultaRespostas.carregando || consultaCategorias.carregando} erro={consultaRespostas.erro ?? consultaCategorias.erro} aoTentarNovamente={recarregar}>
      <TabelaRespostas
        respostas={respostas}
        respostasVisiveis={respostasVisiveis}
        categorias={categorias}
        busca={busca}
        aoBuscar={definirBusca}
        filtroCategoria={filtroCategoria}
        aoFiltrar={definirFiltroCategoria}
        podeOrdenar={podeOrdenar}
        salvando={salvando}
        buscarCategoria={buscarCategoriaPorId}
        aoMover={moverResposta}
        aoEditar={abrirEdicao}
        aoApagar={apagarResposta}
      />

      <SecaoAssuntos categorias={categorias} respostas={respostas} aoAlterar={consultaCategorias.recarregar} />
      </AvisoConsulta>

      <SecaoMensagensBot />

      {modalAberto && <ModalResposta resposta={emEdicao} categorias={categorias} salvando={salvando} aoSalvar={salvarResposta} aoFechar={fecharModal} />}
    </LayoutPainel>
  )
}
