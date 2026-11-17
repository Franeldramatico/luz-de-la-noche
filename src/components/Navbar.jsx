import { Heart } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar(props) {
  return <header className="navbar"><div className="nav-inner">
    <a className="brand" href="#inicio" aria-label="Para Aranza, inicio"><Heart size={19} strokeWidth={1.4} /><span>Para Aranza<span className="brand-dot">.</span></span></a>
    <nav className="nav-links" aria-label="Navegación principal"><a href="#historia">Nuestra historia</a><a href="#razones">Por qué tú</a><a href="#carta">Una carta para ti</a></nav>
    <ThemeToggle {...props} />
  </div></header>;
}
