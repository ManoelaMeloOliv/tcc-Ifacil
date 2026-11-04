import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Aplicacao from './Aplicacao.jsx'
import { ErroConfiguracao } from './paginas/ErroConfiguracao.jsx'
import { configuracaoValida } from './lib/supabaseClient.js'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {configuracaoValida ? <Aplicacao /> : <ErroConfiguracao />}
  </StrictMode>,
)
