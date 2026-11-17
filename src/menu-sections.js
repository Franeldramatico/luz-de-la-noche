import historyPose from '../nightfall_assets/aranza_historia_scene.webp';
import historyEyeSource from '../nightfall_assets/aranza_historia.webp';
import letterPose from '../nightfall_assets/aranza_carta_scene.webp';
import likesPose from '../nightfall_assets/aranza_gustos_scene.webp';
import compositeBounds from '../nightfall_assets/scene_composite_bounds.json';
import { mountSectionWater } from './section-water';
import { playSectionTransition } from './section-transition';
import { renderHistoryBlink } from './section-history-blink';
import './menu-sections.css';
import './menu-section-polish.css';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const arrow = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const heart = '<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const configurations = {
  historia: { angle: 0, zoom: .82, number: '01', label: 'MEMORIES THAT NEVER FADE', kicker: 'ARCHIVO 001 / NUESTRO SOCIAL LINK', title: 'NUESTRA<br>HISTORIA', pose: { src: historyPose, width: 1671, height: 941, x: 740, y: 420, number: 2 } },
  razones: { angle: 0, zoom: .55, number: '10', label: 'ALL THE LITTLE THINGS I LOVE ABOUT YOU', kicker: 'ARCHIVO 002 / DIEZ COSAS QUE ME GUSTAN DE TI', title: 'LO QUE<br>ME GUSTA', pose: { src: likesPose, width: 1024, height: 1536, x: 430, y: 285, number: 4 } },
  carta: { angle: 0, zoom: .90, number: '03', label: 'SOME WORDS ARE MEANT TO STAY', kicker: 'ARCHIVO 003 / DE MI CORAZÓN AL TUYO', title: 'CARTA<br>ESPECIAL', pose: { src: letterPose, width: 1670, height: 941, x: 910, y: 330, number: 3 } },
};

export function setupMenuSections() {
  const overlay = document.querySelector('#overlay');
  const content = document.querySelector('#dialog-content');
  const surface = overlay.querySelector('.section-scene');
  const character = overlay.querySelector('.section-character');
  const scroll = overlay.querySelector('.section-scroll');
  const tabs = overlay.querySelector('.section-tabs');
  const indicator = tabs.querySelector('.section-tab-indicator');
  const state = { history: 0, reason: 0, letterOpen: false };
  const portraitLayout = matchMedia('(max-width: 1024px) and (orientation: portrait)');
  let current = null;
  let revision = 0;
  let pendingClose = null;
  let gustosFrame = null;
  let gustosReady = null;
  const animations = new Set();
  const imagesReady = new Map(Object.entries(configurations).map(([key, { pose }]) => {
    const image = new Image(); image.src = pose.src;
    return [key, image.decode().catch(() => {})];
  }));
  function updateIndicator() {
    const selected = tabs.querySelector('[aria-current="page"]');
    if (!selected) return;
    const box = selected.getBoundingClientRect();
    indicator.style.width = `${box.width}px`;
    indicator.style.transform = `translateX(${box.left - tabs.getBoundingClientRect().left}px)`;
    tabs.classList.add('has-selection');
  }
  function syncGustos() {
    const clearance = Number.parseFloat(document.documentElement.style.getPropertyValue('--soundtrack-clearance')) || 0;
    gustosFrame?.contentWindow?.postMessage({ type: 'nightfall:gustos-state', paused: document.hidden || current?.key !== 'razones' || !overlay.classList.contains('open'), index: state.reason, clearance }, location.origin);
  }
  const layoutObserver = new ResizeObserver(() => {
    overlay.style.setProperty('--gustos-top', `${overlay.querySelector('.section-topline').getBoundingClientRect().height}px`);
    updateIndicator();
    syncGustos();
  });
  layoutObserver.observe(overlay.querySelector('.section-topline'));
  layoutObserver.observe(tabs);
  document.fonts.ready.then(updateIndicator);
  const clearanceObserver = new MutationObserver(syncGustos);
  clearanceObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
  addEventListener('pagehide', () => { layoutObserver.disconnect(); clearanceObserver.disconnect(); }, { once: true });
  addEventListener('message', event => {
    if (!gustosFrame || event.source !== gustosFrame.contentWindow || event.origin !== location.origin) return;
    if (event.data?.type === 'nightfall:gustos-selection' && Number.isInteger(event.data.index) && event.data.index >= 0 && event.data.index < 5) state.reason = event.data.index;
    if (current?.key !== 'razones' || !overlay.classList.contains('open')) return;
    if (event.data?.type === 'nightfall:gustos-exit') document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    if (event.data?.type === 'nightfall:gustos-focus') {
      const destination = event.data.direction === 'previous' ? overlay.querySelector('.section-tabs button:last-child') : document.querySelector('#closeDialog');
      destination?.focus();
    }
  });
  document.addEventListener('visibilitychange', syncGustos);
  overlay.classList.add('reload-section');
  const disposeWater = mountSectionWater(overlay);
  addEventListener('pagehide', disposeWater, { once: true });
  function layoutCharacter() {
    if (portraitLayout.matches && current?.key !== 'razones') content.querySelector('.section-intro')?.after(character);
    else scroll.before(character);
  }

  function animate(node, frames, options) {
    const animation = node.animate(frames, options);
    animations.add(animation);
    animation.finished.then(() => { if (!['both', 'forwards'].includes(options.fill)) animations.delete(animation); }, () => animations.delete(animation));
    return animation;
  }
  function cancelAnimations() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
    overlay.querySelectorAll('.section-character-ghost').forEach(ghost => ghost.remove());
    overlay.querySelectorAll('.section-immersion').forEach(node => node.remove());
  }
  function capture(configuration, point) {
    const box = character.getBoundingClientRect();
    const pose = configuration.pose;
    return {
      x: box.left + box.width * (.5 + (point.x - pose.x) * configuration.zoom / 1000),
      y: box.top + box.height * (.5 + (point.y - pose.y) * configuration.zoom / 1000),
    };
  }
  function refreshDetail(node, direction = 1) {
    node.getAnimations().forEach(animation => animation.cancel());
    animate(node, [{ opacity: .1, transform: `translateX(${direction * 15}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 340, easing: 'ease-out' });
  }

  function renderHistory(page) {
    content.innerHTML = `<p class="section-intro">${escape(page.introduction)}</p>
      <div class="history-chapters" role="group" aria-label="Elegir recuerdo">${page.timeline.map((item, index) => `<button type="button" data-story="${index}" aria-pressed="${index === state.history}"><span>${escape(item.number)}</span><span>${escape(item.title)}</span>${arrow}</button>`).join('')}</div>
      <article class="history-memory" aria-live="polite"><span class="memory-kicker"></span><h2></h2><p></p></article>
      <div class="memory-bottom"><span class="memory-position"></span><span>CONTINUARÁ <i>↗</i></span></div>
      <p class="section-edit-note">CHILE ↔ MÉXICO · SIEMPRE JUNTITOS :3</p>`;
    updateHistory(state.history, false);
  }
  function updateHistory(index, motion = true) {
    const items = current.page.timeline;
    state.history = (index + items.length) % items.length;
    character.dataset.memory = String(state.history);
    const item = items[state.history];
    content.querySelectorAll('[data-story]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.story) === state.history)));
    const detail = content.querySelector('.history-memory');
    detail.querySelector('.memory-kicker').textContent = `RECUERDO ${item.number} / NUESTRA HISTORIA`;
    detail.querySelector('h2').textContent = item.title;
    detail.querySelector('p').textContent = item.text;
    content.querySelector('.memory-position').textContent = `${String(state.history + 1).padStart(2, '0')} — ${String(items.length).padStart(2, '0')}`;
    if (motion) refreshDetail(detail);
  }

  function prepareReasons() {
    if (!gustosFrame) {
      gustosFrame = document.createElement('iframe');
      gustosFrame.className = 'gustos-scene-frame';
      gustosFrame.title = 'Aranxita · Lo que me gusta de ti';
      gustosFrame.hidden = true;
      gustosReady = new Promise(resolve => gustosFrame.addEventListener('load', () => { syncGustos(); resolve(); }, { once: true }));
      gustosFrame.src = `${import.meta.env.BASE_URL}scenes/gustos.html`;
      surface.append(gustosFrame);
    }
    return gustosReady;
  }
  function renderReasons() {
    // Preserve the approved artwork and its selection; only the shared scene
    // surface participates in navigation. Never clone this animated iframe.
    scroll.before(character);
    content.replaceChildren();
    gustosFrame.hidden = false;
    requestAnimationFrame(syncGustos);
  }

  function renderLetter(page) {
    character.dataset.letter = state.letterOpen ? 'open' : 'closed';
    content.innerHTML = `<p class="section-intro">Hay cosas que merecen quedarse escritas.<br>Esta es una de ellas.</p>
      <div class="section-letter ${state.letterOpen ? 'letter-open' : ''}">
        <button type="button" class="letter-envelope" data-letter-toggle aria-expanded="${state.letterOpen}" aria-controls="section-letter-paper" aria-label="${state.letterOpen ? 'Cerrar carta de amor' : 'Abrir carta de amor'}"><span class="envelope-inside"></span><span class="envelope-front"></span><span class="envelope-top"></span><span class="envelope-seal">${heart}</span><span class="envelope-to">PARA ARANZA</span></button>
        <p class="envelope-prompt">${state.letterOpen ? 'Palabras para volver a leer.' : 'Toca el sello. Todo mi amor, adentro.'}</p>
        <article id="section-letter-paper" class="section-letter-paper" ${state.letterOpen ? '' : 'hidden'}><span class="letter-small-label">DE FRANXITO, SOLO PARA TI</span><h2>Con todo mi amor</h2><p>${escape(page.body)}</p><div class="letter-paper-heart">${heart}</div></article>
      </div><p class="section-edit-note">DE CHILE A MÉXICO · CON AMOR, FRANXITO</p>`;
  }
  function toggleLetter() {
    state.letterOpen = !state.letterOpen;
    character.dataset.letter = state.letterOpen ? 'open' : 'closed';
    const letter = content.querySelector('.section-letter');
    const button = content.querySelector('[data-letter-toggle]');
    const paper = content.querySelector('.section-letter-paper');
    button.setAttribute('aria-expanded', String(state.letterOpen));
    button.setAttribute('aria-label', state.letterOpen ? 'Cerrar carta de amor' : 'Abrir carta de amor');
    letter.classList.toggle('letter-open', state.letterOpen);
    paper.hidden = !state.letterOpen;
    content.querySelector('.envelope-prompt').textContent = state.letterOpen ? 'Palabras para volver a leer.' : 'Toca el sello. Todo mi amor, adentro.';
    if (state.letterOpen) {
      const reduced = false;
      animate(paper, reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(24px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: reduced ? 180 : 650, easing: 'cubic-bezier(.22,1,.36,1)' });
      paper.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  document.addEventListener('nightfall:section-open', async event => {
    const { key, page } = event.detail;
    const configuration = configurations[key];
    if (!configuration) return;
    event.detail.handled = true;
    const navigating = overlay.classList.contains('open') && Boolean(current);
    const opacity = Number(getComputedStyle(surface).opacity);
    cancelAnimations();
    const turn = ++revision;
    const reduced = false;
    const order = Object.keys(configurations);
    const direction = order.indexOf(key) >= order.indexOf(current?.key) ? 1 : -1;
    const ready = key === 'razones' ? prepareReasons() : imagesReady.get(key);
    overlay.dataset.moving = 'true';
    surface.inert = true;
    overlay.querySelectorAll('[data-section]').forEach(button => {
      if (button.dataset.section === key) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    updateIndicator();
    // Out → swap → in. The previous composition stays intact until invisible,
    // including Me gusta. Revisions make rapid navigation last-request-wins.
    const departure = animate(surface, [{ opacity: navigating ? opacity : 0 }, { opacity: 0 }], { duration: navigating ? reduced ? 70 : 145 : 0, easing: 'ease-out', fill: 'both' });
    try {
      await Promise.all([departure.finished, ready]);
      if (turn !== revision) return;
      current = { key, page };
      overlay.dataset.page = key;
      document.documentElement.classList.toggle('gustos-active', key === 'razones');
      if (gustosFrame) gustosFrame.hidden = key !== 'razones';
      // Move the persistent portrait out of the old, scrollable content before
      // replacing it, so portrait mobile and desktop share the same element.
      scroll.before(character);
      character.dataset.pose = String(configuration.pose.number);
      const bounds = compositeBounds[key];
      character.innerHTML = `<div class="section-model-float"><img class="section-composite" src="${configuration.pose.src}" style="left:${bounds.left}%;top:${bounds.top}%;width:${bounds.width}%;height:${bounds.height}%" alt="" decoding="async" draggable="false">${key === 'historia' ? '<svg class="section-eyes" viewBox="-500 -500 1000 1000" aria-hidden="true"><g transform="scale(.82)"><g transform="translate(-740 -420)" class="pose-eyes"></g></g></svg>' : ''}<span class="portrait-orbit"></span></div>`;
      if (key === 'historia') renderHistoryBlink(character, { ...configuration.pose, src: historyEyeSource });
      overlay.querySelector('.section-watermark').textContent = configuration.number;
      overlay.querySelector('.section-live-label').textContent = configuration.label;
      overlay.querySelector('#dialog-kicker').textContent = configuration.kicker;
      overlay.querySelector('#dialog-title').innerHTML = configuration.title;
      if (key === 'razones') renderReasons();
      if (key === 'historia') renderHistory(page);
      if (key === 'carta') renderLetter(page);
      layoutCharacter();
      scroll.scrollTop = 0;
      syncGustos();
      surface.inert = false;
      const contact = key === 'razones' ? { x: innerWidth * .42, y: innerHeight * .65 } : capture(configuration, new DOMPoint(key === 'carta' ? 880 : 740, 815));
      const sequence = playSectionTransition({ overlay, animate, contact, navigating });
      const entrance = animate(surface, reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
        { opacity: 0, transform: `translate3d(${direction * 16}px,6px,0) scale(1.006)` },
        { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' },
      ], { duration: reduced ? 110 : 480, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
      departure.cancel();
      const details = [];
      if (!reduced && key !== 'razones') {
        details.push(animate(character, [{ translate: '0 24px' }, { translate: '0 0' }], { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' }).finished);
        [overlay.querySelector('#dialog-kicker'), overlay.querySelector('#dialog-title'), ...content.children].filter(node => node !== character).forEach((node, index) => {
          details.push(animate(node, [{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], { duration: 360, delay: 35 * Math.min(index, 5), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }).finished);
        });
      }
      await Promise.all([entrance.finished, sequence.finished, ...details]);
      if (turn === revision) { entrance.cancel(); overlay.dataset.moving = 'false'; }
    } catch (error) {
      if (turn !== revision || error.name === 'AbortError') return;
      cancelAnimations(); surface.inert = false; overlay.dataset.moving = 'false';
      console.error('No se pudo completar la transición de sección.', error);
    }
  });

  document.addEventListener('nightfall:section-exit', event => {
    if (!current) return;
    event.detail.handled = true;
    const sourceOpacity = Number(getComputedStyle(surface).opacity);
    cancelAnimations();
    ++revision;
    const reduced = false;
    surface.inert = true;
    const sequence = playSectionTransition({ overlay, configuration: configurations[current.key], animate, contact: capture(configurations[current.key], new DOMPoint(740, 815)), returning: true });
    const animation = animate(surface, [{ opacity: sourceOpacity, translate: '0 0' }, { opacity: 0, translate: reduced ? '0 0' : '0 8px' }], { duration: reduced ? 150 : 240, easing: 'ease-in-out', fill: 'both' });
    let complete = false;
    pendingClose = () => { if (!complete) { complete = true; pendingClose = null; event.detail.finish(); } };
    Promise.all([animation.finished, sequence.finished]).then(() => pendingClose?.(), () => {});
  });
  document.addEventListener('nightfall:section-closed', () => {
    const closedRevision = ++revision;
    // Mantener el encuadre de regreso hasta que termine el fundido del panel.
    setTimeout(() => { if (closedRevision === revision && !overlay.classList.contains('open')) cancelAnimations(); }, 300);
    overlay.dataset.moving = 'false';
    surface.inert = false;
    current = null;
    if (gustosFrame) gustosFrame.hidden = true;
    document.documentElement.classList.remove('gustos-active');
    syncGustos();
  });
  overlay.addEventListener('click', event => {
    if (overlay.dataset.closing === 'true') return;
    const section = event.target.closest('[data-section]');
    // aria-current follows the latest request immediately; current still owns
    // the outgoing content during its fade. Compare against the request so a
    // quick return to that outgoing section can cancel a pending destination.
    if (section && section.getAttribute('aria-current') !== 'page') document.dispatchEvent(new CustomEvent('nightfall:navigate-section', { detail: { key: section.dataset.section } }));
    const story = event.target.closest('[data-story]');
    if (story) updateHistory(Number(story.dataset.story));
    if (event.target.closest('[data-letter-toggle]')) toggleLetter();
  });
  overlay.addEventListener('keydown', event => {
    const section = event.target.closest('[data-section]');
    if (section && ['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const buttons = [...tabs.querySelectorAll('button')];
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (buttons.indexOf(section) + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[index].focus(); buttons[index].click();
      return;
    }
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    const item = event.target.closest('[data-story]');
    if (!item) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    updateHistory(state.history + direction); content.querySelector(`[data-story="${state.history}"]`).focus();
  });
  let resizeFrame;
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (pendingClose) pendingClose();
      if (overlay.classList.contains('open')) {
        animations.forEach(animation => { if (animation.playState === 'running') animation.finish(); });
        layoutCharacter(); updateIndicator();
      }
    });
  }, { passive: true });
}
