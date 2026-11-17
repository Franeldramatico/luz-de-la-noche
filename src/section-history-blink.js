import historyEyes from '../nightfall_assets/parpados_posicion_2.svg?raw';
import './section-living-details.css';

export function renderHistoryBlink(character, pose) {
  const ns = 'http://www.w3.org/2000/svg';
  const parsed = new DOMParser().parseFromString(historyEyes, 'image/svg+xml');
  const defs = parsed.querySelector('defs');
  parsed.querySelectorAll('.pose-eye').forEach((eye, index) => {
    const [x, y, angle] = eye.dataset.pivot.split(' ').map(Number);
    const clip = document.createElementNS(ns, 'clipPath');
    clip.id = `history-eye-aperture-${index}`;
    clip.append(eye.querySelector('.pose-eye-socket').cloneNode());
    defs.append(clip);
    eye.querySelector('.pose-eye-texture').innerHTML =
      `<g clip-path="url(#${clip.id})"><g transform="translate(${x} ${y}) rotate(${angle})"><g class="pose-eye-aperture"><g transform="rotate(${-angle}) translate(${-x} ${-y})"><image href="${pose.src}" width="${pose.width}" height="${pose.height}"/></g></g></g></g>`;
  });
  const mask = document.createElementNS(ns, 'mask');
  mask.id = 'history-glasses-rim';
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.setAttribute('x', '0');
  mask.setAttribute('y', '0');
  mask.setAttribute('width', pose.width);
  mask.setAttribute('height', pose.height);
  mask.innerHTML = '<path d="M504 440Q553 411 606 426Q637 430 652 451M744 314Q735 341 741 367" fill="none" stroke="white" stroke-width="5"/>';
  defs.append(mask);
  const rim = document.createElementNS(ns, 'image');
  rim.setAttribute('href', pose.src);
  rim.setAttribute('width', pose.width);
  rim.setAttribute('height', pose.height);
  rim.setAttribute('mask', 'url(#history-glasses-rim)');
  parsed.documentElement.append(rim);
  character.querySelector('.pose-eyes').innerHTML = parsed.documentElement.outerHTML;
}
