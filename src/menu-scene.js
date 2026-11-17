import desktopScene from '../nightfall_assets/menu_composite.webp';
import compactScene from '../nightfall_assets/menu_composite_compact.webp';
import portraitLayer from '../nightfall_assets/aranza_recortada.webp';
import waterLayer from '../nightfall_assets/agua_portada.webp';
import hairCompletion from '../nightfall_assets/aranza_cabello_extension.svg';
import menuEyes from './menu-eyes.svg?raw';
import { mountOcean } from './ocean-effects';
import { playMenuArrival } from './menu-arrival';
import { setupMenuSections } from './menu-sections';
import './menu-scene.css';
import './display-type.css';
import './menu-motion.css';
import './experience.css';
import './menu-polish.css';

const host = document.querySelector('.living-art');
const stage = document.querySelector('#scene');
const atmosphere = document.querySelector('.ocean-atmosphere');
setupMenuSections();
const disposeOcean = mountOcean(atmosphere, { isPaused: () => document.documentElement.classList.contains('ocean-paused') || document.documentElement.classList.contains('gustos-active') });
let disposeArrival;
host.innerHTML = `<img class="arrival-water" src="${waterLayer}" alt=""><div class="scene-environment"><div class="menu-composite-frame"><picture><source media="(max-width:1024px)" srcset="${compactScene}"><img src="${desktopScene}" alt="" width="1672" height="941" decoding="async"></picture></div></div><div class="arrival-portrait"><img class="arrival-hair-extension" src="${hairCompletion}" alt=""><img src="${portraitLayer}" alt="" width="1672" height="941"></div>`;
const ready = [...host.querySelectorAll('img')].map(image => image.decode().catch(() => {}));
// Only the tiny eye area is live; the expensive scene remains cached artwork.
host.querySelector('.menu-composite-frame').insertAdjacentHTML('beforeend', menuEyes);
Promise.all(ready).then(() => {
  stage.classList.add('art-ready');
  disposeArrival = playMenuArrival(stage, host, atmosphere);
  updateMotion();
});
addEventListener('pagehide', () => { disposeArrival?.(); disposeOcean(); }, { once: true });

function updateMotion() {
  const panelOpen = document.querySelector('#overlay').classList.contains('open');
  const reference = stage.dataset.reference === 'true';
  document.documentElement.classList.toggle('ocean-paused', document.hidden || reference);
  document.documentElement.classList.toggle('ocean-obscured', reference);
  document.documentElement.classList.toggle('section-active', panelOpen);
  document.documentElement.classList.toggle('menu-model-paused', panelOpen);
}
new MutationObserver(updateMotion).observe(document.querySelector('#overlay'), { attributes: true, attributeFilter: ['class'] });
new MutationObserver(updateMotion).observe(stage, { attributes: true, attributeFilter: ['data-reference'] });
document.addEventListener('visibilitychange', updateMotion);
updateMotion();

let pointerFrame = 0;
let pointerAt = 0;
addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || document.documentElement.classList.contains('menu-model-paused') || stage.classList.contains('is-compact') || pointerFrame || performance.now() - pointerAt < 120) return;
  pointerAt = performance.now();
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0;
    host.style.setProperty('--look-x', `${((event.clientX / innerWidth - .5) * 2).toFixed(2)}px`);
    host.style.setProperty('--look-y', `${((event.clientY / innerHeight - .5) * 1.5).toFixed(2)}px`);
  });
}, { passive: true });
