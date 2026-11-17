import { useState } from 'react';
import { Heart, RotateCw } from 'lucide-react';
import { content } from '../content';
import SectionHeading from './SectionHeading';

function ReasonCard({ reason, index }) {
  const [flipped, setFlipped] = useState(false);
  return <button className={`reason-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-expanded={flipped} aria-label={`${reason[0]}. ${flipped ? 'Ocultar razón' : 'Descubrir razón'}`}>
    <span className="reason-inner"><span className="reason-front" aria-hidden={flipped}><span className="reason-number">{String(index + 1).padStart(2, '0')}</span><Heart className="reason-heart" size={29} strokeWidth={1} /><span className="reason-title">{reason[0]}</span><span className="reason-hint">Toca para descubrir <RotateCw size={12} /></span></span><span className="reason-back" aria-hidden={!flipped}><Heart size={17} strokeWidth={1.3} /><span>{reason[1]}</span><span className="reason-hint">Toca para volver</span></span></span>
  </button>;
}
export default function ReasonsGrid() {
  return <section id="razones" className="reasons-section"><div className="section-shell content-section"><SectionHeading number="02" label="POR QUÉ TÚ" title="Mil razones." accent="Y siempre tú." description="Podría escribir una lista infinita. Aquí van algunas de mis favoritas." /><div className="reasons-grid">{content.reasons.map((reason, index) => <ReasonCard key={reason[0]} reason={reason} index={index} />)}</div><p className="section-afterword">Las mejores razones no se explican. Se sienten.</p></div></section>;
}
