import { ArrowUpRight, HeartHandshake, LogOut, Menu, X } from 'lucide-react';

type SiteHeaderProps = {
  menuOpen: boolean;
  loggedIn: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onLogout: () => void;
  onLogin: () => void;
};

export function SiteHeader({ menuOpen, loggedIn, onToggleMenu, onCloseMenu, onLogout, onLogin }: SiteHeaderProps) {
  return <header className="navbar container">
    <a className="brand" href="#inicio"><span className="brand-icon"><HeartHandshake size={23}/></span> facilita<span className="brand-dot">.</span><small>rebuild</small></a>
    <nav className={menuOpen ? 'nav-links expanded' : 'nav-links'} aria-label="Navegação principal">
      <a href="#como-funciona" onClick={onCloseMenu}>Como funciona</a>
      <a href="#servicos" onClick={onCloseMenu}>Serviços</a>
      <a href="#sobre" onClick={onCloseMenu}>Sobre nós</a>
    </nav>
    <div className="nav-actions">{loggedIn ? <button className="text-button" onClick={onLogout}><LogOut size={16}/> Sair</button> : <button className="button button-dark" onClick={onLogin}>Entrar <ArrowUpRight size={16}/></button>}</div>
    <button className="mobile-menu" aria-label="Abrir menu" onClick={onToggleMenu}>{menuOpen ? <X/> : <Menu/>}</button>
  </header>;
}
