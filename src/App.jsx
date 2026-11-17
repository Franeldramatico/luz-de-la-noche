import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useScroll, useSpring } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Heart, Menu, X } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import ThemeToggle from './components/ThemeToggle';
import AudioPlayer from './components/AudioPlayer';
import WaterScene from './components/WaterScene';
import OceanAtmosphere from './components/OceanAtmosphere';

function MoonKeepsake() {
  return <div className="hero-keepsake" aria-hidden="true">
    <svg viewBox="0 0 240 240" fill="none">
      <defs><linearGradient id="keepsake-moon" x1="95" y1="66" x2="155" y2="163" gradientUnits="userSpaceOnUse"><stop stopColor="var(--text)" /><stop offset="1" stopColor="var(--accent)" stopOpacity=".55" /></linearGradient></defs>
      <circle className="keepsake-ring" cx="120" cy="120" r="108" stroke="currentColor" strokeOpacity=".25" strokeDasharray="1 9" />
      <circle cx="120" cy="120" r="90" stroke="currentColor" strokeOpacity=".18" />
      <path d="M133 67a57 57 0 1 0 40 87 52 52 0 0 1-40-87Z" fill="url(#keepsake-moon)" />
      <path d="m157 80 2.7 8.3L168 91l-8.3 2.7L157 102l-2.7-8.3L146 91l8.3-2.7Z" fill="currentColor" />
      <path d="M151 133c-20-13-14-26-4-19l4 4 4-4c10-7 16 6-4 19Z" fill="var(--pink)" />
      <path d="M12 120h13m190 0h13M120 12v13m0 190v13" stroke="currentColor" strokeOpacity=".6" />
      <circle cx="120" cy="30" r="3" fill="currentColor" />
    </svg>
    <span>BAJO LA MISMA LUZ</span>
    <small>TÚ, YO Y TODAS NUESTRAS VIDAS.</small>
  </div>;
}

export default function App() {
  const themeState = useTheme();
  const reduced = false;
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 28 });
  const reveal = { hidden: { opacity: 0, y: reduced ? 0 : 16 }, visible: { opacity: 1, y: 0, transition: { duration: reduced ? .15 : .7, ease: [.22, 1, .36, 1] } } };
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : .09 } } };
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPanelOpen, setMenuPanelOpen] = useState(false);
  const menuButton = useRef(null);
  const closeButton = useRef(null);
  const iframe = useRef(null);
  const background = useRef(null);
  const soundtrackClearance = useRef(0);
  const sendMenuLayout = () => iframe.current?.contentWindow?.postMessage({ type: 'nightfall:layout', soundtrackHeight: soundtrackClearance.current }, location.origin);
  const closeMenu = () => { setMenuPanelOpen(false); setMenuOpen(false); requestAnimationFrame(() => menuButton.current?.focus()); };
  useEffect(() => {
    const card = document.querySelector('.soundtrack-now-playing');
    if (!card) return;
    const measure = () => {
      const height = Math.ceil(card.getBoundingClientRect().height + 28);
      if (height === soundtrackClearance.current) return;
      soundtrackClearance.current = height;
      document.documentElement.style.setProperty('--soundtrack-clearance', `${height}px`);
      sendMenuLayout();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(card); measure();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    background.current.inert = menuOpen;
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (menuOpen) closeButton.current?.focus();
    const onKey = event => {
      if (!menuOpen) return;
      if (event.key === 'Escape') closeMenu();
      if (event.key === 'Tab' && event.target === closeButton.current && event.shiftKey) { event.preventDefault(); iframe.current?.focus(); }
    };
    const onMessage = event => {
      if (event.origin !== location.origin || event.source !== iframe.current?.contentWindow) return;
      if (event.data === 'nightfall:close') closeMenu();
      if (event.data === 'nightfall:focus-close') closeButton.current?.focus();
      if (event.data === 'nightfall:panel-open') setMenuPanelOpen(true);
      if (event.data === 'nightfall:panel-close') setMenuPanelOpen(false);
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('message', onMessage);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); window.removeEventListener('message', onMessage); };
  }, [menuOpen]);
  return <MotionConfig reducedMotion="never">
    <div ref={background} className="homepage-shell">
      <WaterScene />
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <header className="reload-header"><a className="reload-brand" href="#inicio" aria-label="Aranza y Franxito, inicio"><span className="brand-monogram">A<span>/</span>F</span><span>ARANZA <b>&</b> FRANXITO<small>OUR OWN LITTLE WORLD</small></span></a><div className="header-right"><span className="header-dedication">Una historia que quiero vivir contigo</span><ThemeToggle {...themeState} /><button ref={menuButton} className="open-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menú ilustrado" aria-expanded={menuOpen} aria-controls="nightfall-menu"><span>MENÚ</span><Menu size={23} strokeWidth={1.6} /></button></div><motion.div className="page-reading-progress" style={{ scaleX: reduced ? scrollYProgress : smoothProgress }} aria-hidden="true" /></header>
      <main id="main">
        <section id="inicio" className="reload-hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="vertical-caption" aria-hidden="true">EVERY DAY. EVERY NIGHT. EVERY VERSION OF US.</div>
          <motion.div className="reload-copy" variants={stagger} initial="hidden" animate="visible">
            <motion.div className="chapter-label" variants={reveal}><span className="live-dot" /> NUESTRA HISTORIA <span className="label-slash">/</span> CAPÍTULO SIN FINAL</motion.div>
            <motion.p className="for-you" variants={reveal}>Para mi persona favorita, Aranza.</motion.p>
            <motion.h1 variants={stagger} aria-label="En cualquier vida. Contigo.">{['EN CUALQUIER', 'VIDA.', 'CONTIGO.'].map((line, index) => <span key={line} className={`hero-title-line ${index === 2 ? 'hero-title-accent' : ''}`} aria-hidden="true"><motion.span variants={reveal}>{line}</motion.span></span>)}</motion.h1>
            <motion.div className="hero-message" variants={reveal}><span className="message-line" /><AnimatePresence mode="wait" initial={false}><motion.p key={themeState.theme} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>{themeState.theme === 'night' ? 'Si el mundo se apaga, quédate un ratito más. Contigo, hasta la noche tiene su propia luz.' : 'Entre todos los lugares del mundo, siempre vuelvo a ti. Contigo, los días tienen otra luz.'}</motion.p></AnimatePresence></motion.div>
            <motion.button className="story-button" variants={reveal} onClick={() => setMenuOpen(true)}><span>ENTRA EN NUESTRA HISTORIA</span><ArrowUpRight size={22} strokeWidth={1.5} /></motion.button>
            <motion.p className="hero-postscript" variants={reveal}>No importa la hora. Mi lugar favorito sigue siendo contigo.</motion.p>
          </motion.div>
          <motion.div className="keepsake-entrance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: .4 }}><MoonKeepsake /></motion.div>
          <div className="scene-caption"><span className="caption-cross">+</span><div><span>{themeState.theme === 'night' ? 'SIDE B / COLOR YOUR NIGHT' : 'SIDE A / WHEN THE MOON’S REACHING OUT STARS'}</span><p>{themeState.theme === 'night' ? 'La noche también es nuestra.' : 'Qué bonito coincidir contigo.'}</p></div></div>
          <div className="hero-bottom"><a href="#dedicatoria"><ArrowDown size={15} /><span>QUÉDATE UN POCO MÁS</span></a><span className="world-status"><span className="live-dot" />{themeState.theme === 'night' ? 'NIGHTFALL' : 'DAYLIGHT'} EDITION <i>/</i> {themeState.isAutomatic ? 'HORA LOCAL' : 'TU MOMENTO, TUS REGLAS'}</span></div>
        </section>
        <motion.section id="dedicatoria" className="quiet-section" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }}>
          <motion.div className="quiet-index" variants={reveal}>01 <span>/</span> LO QUE DE VERDAD IMPORTA</motion.div>
          <motion.div className="quiet-heart" variants={reveal}><Heart size={25} strokeWidth={1.1} /></motion.div>
          <motion.p variants={reveal}>Hay un mundo entero ahí fuera.<br />Y aun así, <em>te elegiría a ti.</em></motion.p>
          <motion.span className="quiet-description" variants={reveal}>Por las risas, por la calma, por todo lo que somos.<br />Este pequeño rincón existe para recordártelo.</motion.span>
          <motion.button className="text-link" variants={reveal} onClick={() => setMenuOpen(true)}>Nuestros recuerdos están aquí <ArrowUpRight size={16} /></motion.button>
          <div className="quiet-watermark" aria-hidden="true">YOU & ME</div>
        </motion.section>
      </main>
      <footer className="reload-footer"><span>HECHO CON TODO MI AMOR PARA ARANZA</span><span>ARANZA & FRANXITO <span className="footer-slash">/</span> TO BE CONTINUED</span></footer>
      <OceanAtmosphere paused={menuOpen} />
    </div>
    <div role={menuOpen ? 'dialog' : undefined} aria-modal={menuOpen ? true : undefined} aria-label={menuOpen ? 'Menú ilustrado Aranza y Franxito y su banda sonora' : undefined}>
    <AnimatePresence>{menuOpen && <motion.div id="nightfall-menu" className="nightfall-menu" initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }} transition={{ duration: reduced ? .15 : .36, ease: [.22, 1, .36, 1] }}>
      <iframe ref={iframe} src={`${import.meta.env.BASE_URL}menu.html`} onLoad={sendMenuLayout} title="Menú original Persona 3: Nuestra historia, Lo que me gusta y Carta especial" />
      <button className="close-nightfall" ref={closeButton} onClick={closeMenu} hidden={menuPanelOpen} aria-label="Cerrar menú y volver al inicio"><span>VOLVER</span><X size={22} /></button>
    </motion.div>}</AnimatePresence>
    <AudioPlayer theme={themeState.theme} menuOpen={menuOpen} menuPanelOpen={menuPanelOpen} />
    </div>
  </MotionConfig>;
}
