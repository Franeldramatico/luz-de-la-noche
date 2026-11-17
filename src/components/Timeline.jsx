import { motion } from 'framer-motion';
import { ArrowUpRight, Heart, MapPin, Sparkles } from 'lucide-react';
import { content } from '../content';
import SectionHeading from './SectionHeading';

const icons = [MapPin, Heart, Sparkles];
export default function Timeline() {
  return <section id="historia" className="section-shell content-section timeline-section">
    <SectionHeading number="01" label="NUESTRA HISTORIA" title="Algunas cosas estaban" accent="destinadas a pasar." description="No es una historia perfecta. Es la nuestra. Y por eso es mi favorita." />
    <div className="timeline-grid">{content.moments.map((moment, index) => { const Icon = icons[index]; return <motion.article className="moment-card" key={moment.title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: index * .1, duration: .5 }}>
      <div className="timeline-marker"><span>{String(index + 1).padStart(2, '0')}</span></div>
      <div className="moment-top"><Icon size={21} strokeWidth={1.3} /><span>{moment.chapter}</span></div><h3>{moment.title}</h3><p>{moment.text}</p><div className="moment-bottom">{moment.label}<ArrowUpRight size={15} /></div>
    </motion.article>; })}</div>
    <p className="section-afterword">Y lo más bonito es que esto apenas comienza.</p>
  </section>;
}
