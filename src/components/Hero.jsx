import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { content } from '../content';

export default function Hero({ theme }) {
  return <section className="hero section-shell" id="inicio">
    <motion.div className="hero-copy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9 }}>
      <span className="eyebrow"><span className="status-dot" /> UN PEQUEÑO UNIVERSO, SOLO PARA TI</span>
      <p className="hero-dedication">Para ti, Aranza</p>
      <h1 key={theme}>{theme === 'night' ? <>Coloring my<br /><em>night</em> with you<span className="title-period">.</span></> : <>Contigo todos<br />los días son<br /><em>luminosos.</em></>}</h1>
      <p className="hero-subtitle">{content.subtitle}</p>
      <a href="#historia" className="primary-button">Un paseo por lo nuestro <ArrowUpRight size={17} /></a>
      <div className="hero-footnote"><span className="small-line" /> TÚ, YO Y TODO LO QUE NOS QUEDA</div>
    </motion.div>
    <div className={`celestial-art ${theme}`} aria-hidden="true">
      <div className="orbit orbit-outer" /><div className="orbit orbit-middle" /><div className="orbit orbit-inner" />
      <div className="celestial-body" /><span className="orbit-spark spark-a"><Sparkles size={26} strokeWidth={1} /></span><span className="orbit-spark spark-b"><Sparkles size={17} strokeWidth={1} /></span><span className="orbit-dot" />
      <div className="art-caption"><span>COORDENADAS DE MI LUGAR FAVORITO</span><p>Donde estés tú.</p><div className="caption-rule" /><span>SIEMPRE EN LA MISMA ÓRBITA</span></div>
    </div>
    <a className="scroll-cue" href="#historia"><ArrowDown size={14} /> <span>Hay más de nosotros aquí abajo</span></a>
    <span className="hero-side-note" aria-hidden="true">A LOVE LETTER IN EVERY LIGHT</span>
  </section>;
}
