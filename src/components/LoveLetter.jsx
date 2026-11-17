import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { content } from '../content';
import SectionHeading from './SectionHeading';

export default function LoveLetter() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  return <section id="carta" className="section-shell content-section letter-section"><SectionHeading number="03" label="DE MI CORAZÓN AL TUYO" title="Hay cosas que merecen" accent="quedarse escritas." description="Esta no es una carta cualquiera. Es un pedacito de mí, para ti." />
    <div className={`envelope-scene ${open ? 'is-open' : ''}`}><div className="envelope-shadow" /><button ref={triggerRef} className="envelope" aria-expanded={open} aria-controls="love-letter" aria-label={open ? 'Cerrar carta para Aranza' : 'Abrir carta para Aranza'} onClick={() => open ? close() : setOpen(true)}><span className="envelope-paper"><span>Mi querida Aranza,</span><i /><i /><i /></span><span className="envelope-pocket" /><span className="envelope-flap" /><span className="wax-seal"><Heart size={23} strokeWidth={1.3} /></span><span className="envelope-address">Para Aranza</span></button></div>
    <p className="envelope-instruction">{open ? 'Una carta que siempre puedes volver a leer.' : 'Un clic para abrir. Todo mi amor adentro.'}</p>
    <AnimatePresence>{open && <motion.article id="love-letter" className="letter-paper" initial={{ opacity: 0, height: 0, y: 18 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: .55 }}><div className="letter-content"><button className="close-letter" onClick={close} aria-label="Cerrar carta"><X size={19} /></button><span className="tiny-label">PARA LEER DESPACITO</span><h3>Mi querida Aranza,</h3>{content.letter.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<div className="letter-signature">Con todo mi amor,<span>{content.signature}</span><Heart size={19} strokeWidth={1.2} /></div></div></motion.article>}</AnimatePresence>
  </section>;
}
