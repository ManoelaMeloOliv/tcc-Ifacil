import { useState } from 'react'
import { AvisoConsulta } from '../componentes/interface/AvisoConsulta'
import { AbasPagina, CabecalhoPagina } from '../componentes/painel/CabecalhoPagina'
import { IconeMais } from '../componentes/painel/IconesPainel'
import { LayoutPainel } from '../componentes/painel/LayoutPainel'
import { ModalResposta } from '../componentes/painel/ModalResposta'
import { SecaoAssuntos } from '../componentes/painel/SecaoAssuntos'
import { SecaoMensagensBot } from '../componentes/painel/SecaoMensagensBot'
import { ListaRespostas } from '../componentes/painel/ListaRespostas'
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

  const [aba, definirAba] = useState('respostas')

  const abas = [
    { id: 'respostas', rotulo: 'Respostas padrão', contagem: respostas.length },
    { id: 'assuntos', rotulo: 'Assuntos do menu', contagem: categorias.length },
    { id: 'mensagens', rotulo: 'Mensagens do bot' },
  ]

  const cabecalho = (
    <CabecalhoPagina
      titulo="Perguntas e respostas"
      descricao="Cada resposta ativa aparece no menu do WhatsApp dentro do seu assunto. Se o aluno escrever algo parecido, o bot envia o texto cadastrado, sem consultar a IA."
      acoes={
        aba === 'respostas' && (
          <button type="button" onClick={abrirCriacao} disabled={consultaCategorias.carregando || !!consultaCategorias.erro} className="botao-primario">
            <IconeMais className="h-4 w-4" />Nova resposta
          </button>
        )
      }
      filtros={<AbasPagina abas={abas} ativa={aba} aoMudar={definirAba} />}
    />
  )

  return (
    <LayoutPainel cabecalho={cabecalho}>
      {erroAcao && (
        <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{erroAcao}</p>
      )}

      {aba !== 'mensagens' && (
        <AvisoConsulta carregando={consultaRespostas.carregando || consultaCategorias.carregando} erro={consultaRespostas.erro ?? consultaCategorias.erro} aoTentarNovamente={recarregar}>
          {aba === 'respostas' ? (
            <ListaRespostas
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
          ) : (
            <SecaoAssuntos categorias={categorias} respostas={respostas} aoAlterar={consultaCategorias.recarregar} />
          )}
        </AvisoConsulta>
      )}

      {aba === 'mensagens' && <SecaoMensagensBot />}

      {modalAberto && <ModalResposta resposta={emEdicao} categorias={categorias} salvando={salvando} aoSalvar={salvarResposta} aoFechar={fecharModal} />}
    </LayoutPainel>
  )
}
