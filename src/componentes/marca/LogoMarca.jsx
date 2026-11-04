import logo from '../../assets/logo-aifacil.png'

export function LogoMarca({ altura = 44 }) {
  return <img src={logo} alt="AIFÁCIL" style={{ height: altura }} className="logo-marca block w-auto max-w-full box-content" />
}
