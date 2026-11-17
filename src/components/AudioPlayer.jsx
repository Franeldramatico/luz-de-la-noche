import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Heart, Languages, LoaderCircle, Moon, Music2, Pause, Play, Sun, Volume2, VolumeX } from 'lucide-react';
import { tracks } from '../content';
import { Soundtrack } from '../audio/soundtrack';
import { cuesExceedDuration, currentCue, parseSubtitles } from '../audio/lyrics';
import './audio-player.css';

const VOLUME_KEY = 'aranza:soundtrack-volume';
function savedVolume() {
  try {
    const stored = localStorage.getItem(VOLUME_KEY);
    const value = stored === null ? .3 : Number(stored);
    return Number.isFinite(value) && value >= 0 && value <= 1 ? value : .3;
  } catch { return .3; }
}
const format = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;

export default function AudioPlayer({ theme, menuOpen = false, menuPanelOpen = false }) {
  const engine = useRef(null);
  const initialTheme = useRef(theme);
  const lastVolume = useRef(.3);
  const player = useRef(null);
  const expandButton = useRef(null);
  const fileRequest = useRef({ day: 0, night: 0 });
  const [state, setState] = useState({ theme, playing: false, status: 'loading', time: 0, duration: 0, volume: .3 });
  const [expanded, setExpanded] = useState(false);
  const [lyrics, setLyrics] = useState({ day: null, night: null });
  const [lyricErrors, setLyricErrors] = useState({ day: '', night: '' });
  const [lyricLanguages, setLyricLanguages] = useState({ day: 'en', night: 'en' });
  const [displayLanguage, setDisplayLanguage] = useState('en');
  const track = tracks[theme];
  const importedLyrics = lyrics[theme];
  const canTranslate = !importedLyrics && Boolean(track.syncedLyrics?.translations?.es);
  const selectedLyrics = displayLanguage === 'es' ? track.syncedLyrics?.translations?.es || track.syncedLyrics : track.syncedLyrics;
  const fullLyrics = selectedLyrics || track.textLyrics;
  const cues = importedLyrics || selectedLyrics?.cues;
  const lyricLanguage = importedLyrics ? lyricLanguages[theme] : selectedLyrics?.language;
  const time = state.theme === theme ? state.time : 0;
  const cueIndex = cues ? currentCue(cues, time) : -1;
  const busy = state.playing && ['loading', 'buffering'].includes(state.status);
  const highlightCue = state.playing && state.status === 'playing' && state.theme === theme && Boolean(cues?.[cueIndex]?.text);

  useEffect(() => {
    const controller = new Soundtrack({ tracks, theme: initialTheme.current, volume: savedVolume(), onChange: setState });
    engine.current = controller;
    const resume = event => {
      // Let the explicit play/pause button own its gesture (no double toggle).
      if (!event.isTrusted || event.target?.closest?.('.soundtrack-play')) return;
      if (event.type === 'keydown' && (event.repeat || event.altKey || event.ctrlKey || event.metaKey || !['Enter', ' '].includes(event.key))) return;
      controller.resumeFromInteraction();
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
    controller.autoplay();
    return () => {
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
      controller.destroy();
      engine.current = null;
    };
  }, []);
  useEffect(() => { engine.current?.setTheme(theme); }, [theme]);
  useEffect(() => { setExpanded(false); }, [menuOpen, menuPanelOpen]);
  useEffect(() => {
    if (!expanded) return;
    const outside = event => { if (!player.current?.contains(event.target)) setExpanded(false); };
    const escape = event => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setExpanded(false);
      expandButton.current?.focus();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape, true);
    // An iframe is a separate document: entering it closes this non-modal panel.
    const blur = () => {
      const active = document.activeElement;
      if (active?.tagName === 'IFRAME' && !player.current?.contains(active)) setExpanded(false);
    };
    window.addEventListener('blur', blur);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape, true);
      window.removeEventListener('blur', blur);
    };
  }, [expanded]);

  const changeVolume = value => {
    if (value > 0) lastVolume.current = value;
    engine.current?.setVolume(value);
    try { localStorage.setItem(VOLUME_KEY, String(value)); } catch { /* Private browsing can deny storage. */ }
  };
  const toggle = () => state.playing ? engine.current?.pause() : engine.current?.play();
  const importLyrics = async event => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    const selectedTheme = theme;
    const request = ++fileRequest.current[selectedTheme];
    input.value = '';
    if (!file) return;
    try {
      if (file.size > 200000) throw new Error('size');
      const parsed = parseSubtitles(await file.text(), file.name);
      if (fileRequest.current[selectedTheme] !== request) return;
      setLyrics(previous => ({ ...previous, [selectedTheme]: parsed }));
      setLyricErrors(previous => ({ ...previous, [selectedTheme]: '' }));
    } catch (error) {
      if (fileRequest.current[selectedTheme] !== request) return;
      setLyricErrors(previous => ({ ...previous, [selectedTheme]: error.message === 'size' ? 'El archivo debe ocupar menos de 200 KB.' : 'No pudimos leer los tiempos. Usa un LRC [mm:ss.xx], un SRT o un WebVTT con tiempos de inicio y fin válidos.' }));
    }
  };
  const notice = state.status === 'error' ? 'No pudimos abrir el MP3. Pulsa play para reintentar.'
    : state.status === 'interaction' ? 'Tu navegador necesita un toque: toca la web o pulsa play para escuchar.'
    : busy ? 'Preparando nuestra canción…'
    : state.playing ? 'Quédate un ratito. Esta canción también es para ti.'
    : 'Un pequeño descanso. La música vuelve cuando pulses play.';

  return <aside ref={player} className={`soundtrack ${menuOpen ? 'soundtrack--menu' : ''} ${expanded ? 'soundtrack--expanded' : ''}`} aria-label="Nuestra banda sonora">
    {expanded && <section className="soundtrack-panel" id="soundtrack-details" aria-label="Canción y letra">
      <div className="soundtrack-heading"><span>{theme === 'night' ? <Moon size={13} /> : <Sun size={13} />}{track.side}</span><Heart size={14} aria-hidden="true" /></div>
      <h2>{track.title}</h2>
      <p className="soundtrack-artist">{track.artist}<span>Persona 3 Reload · Original Soundtrack</span></p>
      <div className="soundtrack-dedication"><span>DE MÍ, PARA TI</span><p>{track.dedication}</p></div>
      <div className="soundtrack-progress"><span>{format(time)}</span><input aria-label="Posición de la canción" type="range" min="0" max={state.duration || 1} step="0.1" value={Math.min(time, state.duration || 1)} disabled={!state.duration} style={{ '--range-fill': `${state.duration ? time / state.duration * 100 : 0}%` }} aria-valuetext={`${format(time)} de ${format(state.duration)}`} onChange={event => engine.current?.seek(Number(event.target.value))} /><span>{format(state.duration)}</span></div>
      <div className="soundtrack-volume"><button type="button" onClick={() => changeVolume(state.volume ? 0 : lastVolume.current)} aria-label={state.volume ? 'Silenciar música' : 'Activar sonido'}>{state.volume ? <Volume2 size={17} /> : <VolumeX size={17} />}</button><label htmlFor="soundtrack-volume">Volumen</label><input id="soundtrack-volume" type="range" min="0" max="1" step="0.01" value={state.volume} style={{ '--range-fill': `${state.volume * 100}%` }} aria-valuetext={`${Math.round(state.volume * 100)} %`} onChange={event => changeVolume(Number(event.target.value))} /><span>{Math.round(state.volume * 100)}%</span></div>
      {fullLyrics && <details className="soundtrack-full-lyrics" open={!cues} key={theme}>
        <summary>{importedLyrics ? 'Letra incluida completa' : 'Letra completa'} <span>{fullLyrics.language === 'es' ? 'Español' : 'English'}</span></summary>
        <p className="soundtrack-timing-note">{track.syncedLyrics?.timingNote || (track.syncedLyrics ? 'Letra y tiempos que compartiste, incluidos en la web.' : 'Texto que compartiste · sin marcas de tiempo.')}</p>
        {selectedLyrics?.translationNote && <p className="soundtrack-timing-note">{selectedLyrics.translationNote}</p>}
        <div className="soundtrack-lyrics-scroll" role="region" aria-label={`Letra completa de ${track.title}`} lang={fullLyrics.language} tabIndex={0}>
          {fullLyrics.text.split('\n\n').map((stanza, index) => <p key={index}>{stanza}</p>)}
        </div>
      </details>}
      {!track.textLyrics && <div className="soundtrack-links"><a href={track.lyrics} target="_blank" rel="noopener noreferrer">Consultar letra <ExternalLink size={12} /><span className="soundtrack-sr-only"> en Letras.com (abre otra pestaña)</span></a></div>}
      <details className="soundtrack-options"><summary>Opciones de subtítulos</summary>
      <div className="soundtrack-import"><label className="soundtrack-file">{cues ? 'Usar otro archivo de subtítulos' : 'Añadir subtítulos (LRC, SRT, VTT)'}<input type="file" accept=".lrc,.srt,.vtt,text/plain,text/vtt,application/x-subrip" onChange={importLyrics} /></label>{importedLyrics ? <button type="button" onClick={() => { ++fileRequest.current[theme]; setLyrics(previous => ({ ...previous, [theme]: null })); setLyricErrors(previous => ({ ...previous, [theme]: '' })); }}>{track.syncedLyrics ? 'Restaurar letra incluida' : 'Quitar'}</button> : !track.syncedLyrics && <p>Carga una letra que puedas utilizar. Conservamos sus tiempos originales, sin generar ni estimar la sincronización. Solo durante esta visita; no se sube a ningún servidor.</p>}</div>
      {(!track.syncedLyrics || importedLyrics) && <label className="soundtrack-language">Idioma del archivo<select value={lyricLanguages[theme]} onChange={event => { const value = event.target.value; setLyricLanguages(previous => ({ ...previous, [theme]: value })); }}><option value="en">English</option><option value="es">Español</option></select></label>}
      </details>
      {cues && <p className="soundtrack-timing-note">{importedLyrics ? 'Tiempos del archivo aportado; coincidencia con esta grabación no verificada.' : track.syncedLyrics?.timingNote || 'Sigue la posición del MP3 con tus marcas de tiempo originales.'}</p>}
      {cues && cuesExceedDuration(cues, state.duration) && <p className="soundtrack-error" role="status">Hay tiempos posteriores al final del audio. Comprueba la versión del archivo; no ajustamos sus tiempos automáticamente.</p>}
      {lyricErrors[theme] && <p className="soundtrack-error" role="alert">{lyricErrors[theme]}</p>}
      <p className="soundtrack-notice" role="status">{notice}</p>
    </section>}
    <div className={`soundtrack-now-playing ${state.playing ? 'soundtrack-is-playing' : ''}`}>
    <div className="soundtrack-dock">
      <button type="button" className="soundtrack-expand" ref={expandButton} aria-controls={expanded ? 'soundtrack-details' : undefined} aria-expanded={expanded} aria-label={expanded ? 'Cerrar detalles de música' : `Abrir música: ${track.title}`} onClick={() => setExpanded(value => !value)}>
        <span className="soundtrack-disc"><Music2 size={17} aria-hidden="true" /></span><span className="soundtrack-summary"><span>{state.status === 'interaction' ? 'UN TOQUE PARA ESCUCHAR' : <>PARA ARANZA <i>/</i> {theme === 'night' ? 'NOCHE' : 'DÍA'}</>}</span><strong>{track.title}</strong><small>{track.artist}</small></span>{expanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </button>
      <button type="button" className="soundtrack-play" onClick={toggle} aria-label={state.playing ? 'Pausar música' : state.status === 'error' ? 'Reintentar reproducir música' : 'Reproducir música'} aria-pressed={state.playing}>{busy ? <LoaderCircle className="soundtrack-spinner" size={19} /> : state.playing ? <Pause size={19} /> : <Play size={19} />}</button>
    </div>
    {cues && <div className={`soundtrack-karaoke ${highlightCue ? 'has-active-cue' : ''}`} role="region" aria-label={`Letra sincronizada de ${track.title}`} lang={lyricLanguage}>
      <div className="soundtrack-caption-toolbar">
        <div className="soundtrack-caption-label"><span className="soundtrack-equalizer" aria-hidden="true"><i /><i /><i /></span><span className="soundtrack-eyebrow">{importedLyrics ? 'TU LETRA' : 'LA BANDA SONORA DE LO NUESTRO'}</span><Heart size={11} aria-hidden="true" /></div>
        {canTranslate && <button type="button" className="soundtrack-translate" aria-label={displayLanguage === 'es' ? 'Mostrar letra original en inglés' : 'Traducir letra al español'} aria-pressed={displayLanguage === 'es'} title={displayLanguage === 'es' ? 'Volver al original en inglés' : 'Traducción manual al español (no oficial)'} onClick={() => setDisplayLanguage(language => language === 'es' ? 'en' : 'es')}><Languages size={14} aria-hidden="true" /><span>{displayLanguage === 'es' ? 'English' : 'Español'}</span></button>}
      </div>
      <p className="karaoke-current">{cueIndex < 0 ? '♪' : cues[cueIndex].text || '♪'}</p>
      <p className="karaoke-neighbor">{cues[cueIndex + 1]?.text || '\u00a0'}</p>
    </div>}
    </div>
    <span className="soundtrack-sr-only" role="status">{state.status === 'error' || state.status === 'interaction' ? notice : ''}</span>
  </aside>;
}
