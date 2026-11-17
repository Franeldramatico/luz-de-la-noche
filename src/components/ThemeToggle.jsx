import { Moon, Sun, RotateCcw } from 'lucide-react';

export default function ThemeToggle({ theme, toggle, reset, isAutomatic }) {
  return <div className="theme-controls">
    <button className="theme-toggle" onClick={toggle} aria-label={`Activar modo ${theme === 'day' ? 'noche' : 'día'}`} title={isAutomatic ? 'Tema según tu hora local' : 'Tema manual'}>
      <Sun size={15} /><span className={`toggle-track ${theme}`}><span /></span><Moon size={15} />
    </button>
    {!isAutomatic && <button className="auto-button" onClick={reset} aria-label="Volver al tema automático" title="Volver al tema automático"><RotateCcw size={13} /><span>Auto</span></button>}
  </div>;
}
