import { useEffect, useState } from 'react';
import { ArrowUp, Heart } from 'lucide-react';
import { content } from '../content';

function daysTogether() {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(content.startDate || '')) return null;
  const [year, month, day] = content.startDate.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day) return null;
  const now = new Date();
  return Math.max(0, Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(year, month - 1, day)) / 86400000));
}
export default function Footer({ theme }) {
  const [days, setDays] = useState(daysTogether);
  useEffect(() => { const id = setInterval(() => setDays(daysTogether()), 60000); return () => clearInterval(id); }, []);
  return <footer className="footer section-shell"><Heart className="footer-heart" size={26} strokeWidth={1} /><p className="footer-quote">En esta vida, <em>contigo.</em></p><p className="together-counter">{days === null ? 'Nuestra historia sigue sumando momentos.' : <><strong>{days.toLocaleString('es')}</strong> días juntos. Y todos los que nos quedan.</>}</p><div className="footer-bottom"><span>Hecho con todo mi amor para Aranza</span><span className="footer-mode"><span className="status-dot" />{theme === 'night' ? 'Bajo el mismo cielo' : 'Bajo la misma luz'}</span><a href="#inicio" aria-label="Volver al inicio"><ArrowUp size={16} /></a></div></footer>;
}
