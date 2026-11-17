import historySet from '../nightfall_assets/escenografia_historia.svg?raw';
import likesSet from '../nightfall_assets/escenografia_gustos.svg?raw';
import letterSet from '../nightfall_assets/escenografia_carta.svg?raw';
import eyes2 from '../nightfall_assets/parpados_posicion_2.svg?raw';
import eyes3 from '../nightfall_assets/parpados_posicion_3.svg?raw';
import eyes4 from '../nightfall_assets/parpados_posicion_4.svg?raw';
import completion2 from '../nightfall_assets/complemento_posicion_2.svg?raw';
import completion3 from '../nightfall_assets/complemento_posicion_3.svg?raw';
import completion4 from '../nightfall_assets/complemento_posicion_4.svg?raw';
import './section-living-details.css';

const designs = {
  2: { set: historySet, completion: completion2, eyes: eyes2, face: [740, 420, 300, 260], left: 440, right: 1150 },
  3: { set: letterSet, completion: completion3, eyes: eyes3, face: [910, 320, 250, 210], left: 620, right: 1320 },
  4: { set: likesSet, completion: completion4, eyes: eyes4, face: [430, 260, 165, 150], left: 235, right: 830 },
};

const hairRegions = {
  2: ['M0 0H400Q300 170 250 400Q220 550 0 720Z', 'M1130 0H1671V720Q1410 650 1240 450Q1150 250 1130 0Z'],
  3: ['M0 0H535Q470 180 430 360Q350 450 280 600L230 700 100 941H0Z', 'M1120 0H1670V820L1530 750Q1480 590 1320 490Q1200 300 1120 0Z'],
  4: ['M0 0H255Q210 200 170 380L230 600 220 920 390 1120 445 1240 350 1320 160 1200 0 900Z', 'M780 0H1024V1220L850 1100 845 900 905 720 850 560 890 420 800 270Z'],
};

function renderBlink(character, pose, markup) {
  const ns = 'http://www.w3.org/2000/svg';
  const documentEyes = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const defs = documentEyes.querySelector('defs');
  documentEyes.querySelectorAll('.pose-eye').forEach((eye, index) => {
    const [x, y, angle] = eye.dataset.pivot.split(' ').map(Number);
    const clip = document.createElementNS(ns, 'clipPath');
    clip.id = `p${pose.number}-eye-aperture-${index}`;
    clip.append(eye.querySelector('.pose-eye-socket').cloneNode());
    defs.append(clip);
    eye.querySelector('.pose-eye-texture').innerHTML = `<g clip-path="url(#${clip.id})"><g transform="translate(${x} ${y}) rotate(${angle})"><g class="pose-eye-aperture"><g transform="rotate(${-angle}) translate(${-x} ${-y})"><image href="${pose.src}" width="${pose.width}" height="${pose.height}"/></g></g></g></g>`;
  });
  // Restaurar sólo la montura que cruza el ojo, no la pupila ni la piel.
  const rim = pose.number === 3 ? 'M916 236Q934 263 970 270' : pose.number === 2 ? 'M504 440Q553 411 606 426Q637 430 652 451M744 314Q735 341 741 367' : 'M420 236Q444 253 472 248';
  const mask = document.createElementNS(ns, 'mask');
  mask.id = `p${pose.number}-glasses-protect`;
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.setAttribute('x', '0'); mask.setAttribute('y', '0');
  mask.setAttribute('width', pose.width); mask.setAttribute('height', pose.height);
  mask.innerHTML = `<path d="${rim}" fill="none" stroke="white" stroke-width="${pose.number === 4 ? 3 : 5}"/>`;
  defs.append(mask);
  const protectedRim = document.createElementNS(ns, 'image');
  protectedRim.setAttribute('href', pose.src);
  protectedRim.setAttribute('width', pose.width); protectedRim.setAttribute('height', pose.height);
  protectedRim.setAttribute('mask', `url(#${mask.id})`);
  documentEyes.documentElement.append(protectedRim);
  character.querySelector('.pose-eyes').innerHTML = documentEyes.documentElement.outerHTML;
}

function detailHairCrown(svg, pose) {
  const number = pose.number;
  const ns = 'http://www.w3.org/2000/svg';
  const crown = svg.querySelector('.completion-crown');
  const outline = crown.querySelector('path');
  const clipping = document.createElementNS(ns, 'clipPath');
  clipping.id = `p${number}-crown-texture`;
  clipping.append(outline.cloneNode());
  svg.querySelector('defs').append(clipping);
  const texture = document.createElementNS(ns, 'g');
  texture.setAttribute('clip-path', `url(#${clipping.id})`);
  const [left, right, center, height] = number === 2 ? [278, 980, 625, 145] : number === 3 ? [407, 1065, 745, 142] : [219, 524, 370, 83];
  for (let i = 0; i < 96; i++) {
    const u = i / 95;
    const x = left + (right - left) * u;
    const y = -height * Math.sin(Math.PI * u) + 8 * Math.sin(i * 3.7);
    const endX = center + (x - center) * .54;
    const path = document.createElementNS(ns, 'path');
    const width = 1.2 + (i % 5) * .8;
    path.setAttribute('d', `M${x} ${y}C${x - (x - center) * .08} ${y - 14} ${endX} ${y * .2} ${endX - 10} 66C${endX + width} ${y * .15} ${x + width} ${y + 8} ${x} ${y}Z`);
    path.setAttribute('fill', ['#06070d', '#15121f', '#0a0912', '#242034', '#10101c', '#1b192a'][i % 6]);
    path.setAttribute('opacity', i % 6 === 3 ? '.4' : '.8');
    texture.append(path);
  }
  crown.append(texture);
  // La misma textura del dibujo llega hasta la unión: evita una tapa plana
  // o una costura de color. El SVG nuevo define el contorno que faltaba.
  const paintedTexture = document.createElementNS(ns, 'image');
  paintedTexture.setAttribute('href', pose.src);
  paintedTexture.setAttribute('width', pose.width);
  paintedTexture.setAttribute('height', pose.height);
  paintedTexture.setAttribute('transform', 'translate(0 1) scale(1 -2.4)');
  const paintedShape = document.createElementNS(ns, 'g');
  paintedShape.setAttribute('clip-path', `url(#${clipping.id})`);
  paintedShape.append(paintedTexture);
  crown.append(paintedShape);
  crown.setAttribute('transform', `scale(1 ${number === 4 ? .6 : .62})`);
}

export function renderCharacterEffects(character, pose) {
  const design = designs[pose.number];
  const id = `character-p${pose.number}`;
  const [cx, cy, rx, ry] = design.face;
  const edgeMask = pose.number === 4 ? '' : `mask="url(#${id}-body-edge)"`;
  character.querySelector('.section-pose-image').setAttribute('mask', `url(#${id}-stationary)`);
  const [leftHair, rightHair] = hairRegions[pose.number];
  const outsideFace = `M0 0H${pose.width}V${pose.height}H0Z M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
  character.querySelector('.pose-effect-defs').innerHTML = `
    <filter id="${id}-hair-feather" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
    <mask id="${id}-stationary" maskUnits="userSpaceOnUse" x="0" y="0" width="${pose.width}" height="${pose.height}"><rect width="${pose.width}" height="${pose.height}" fill="white"/><g clip-path="url(#${id}-face-safe)" filter="url(#${id}-hair-feather)"><path d="${leftHair}" fill="black"/><path d="${rightHair}" fill="black"/></g>${pose.number === 4 ? '' : `<rect x="${pose.number === 3 ? 500 : 0}" y="865" width="${pose.width}" height="76" fill="url(#${id}-body-fade)"/>`}</mask>
    <linearGradient id="${id}-body-fade" x1="0" y1="865" x2="0" y2="941" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
    <mask id="${id}-body-edge" maskUnits="userSpaceOnUse" x="0" y="0" width="${pose.width}" height="${pose.height}"><rect width="${pose.width}" height="${pose.height}" fill="white"/><rect x="${pose.number === 3 ? 500 : 0}" y="865" width="${pose.width}" height="76" fill="url(#${id}-body-fade)"/></mask>
    <clipPath id="${id}-face-safe"><path d="${outsideFace}" clip-rule="evenodd" fill-rule="evenodd"/></clipPath>
    <mask id="${id}-silhouette" maskUnits="userSpaceOnUse" x="0" y="0" width="${pose.width}" height="${pose.height}" style="mask-type:alpha"><image href="${pose.src}" width="${pose.width}" height="${pose.height}" ${edgeMask}/></mask>
    <mask id="${id}-left-hair" maskUnits="userSpaceOnUse" x="0" y="0" width="${pose.width}" height="${pose.height}"><path d="${leftHair}" fill="white" filter="url(#${id}-hair-feather)"/></mask>
    <mask id="${id}-right-hair" maskUnits="userSpaceOnUse" x="0" y="0" width="${pose.width}" height="${pose.height}"><path d="${rightHair}" fill="white" filter="url(#${id}-hair-feather)"/></mask>`;
  const setDocument = new DOMParser().parseFromString(design.set, 'image/svg+xml');
  const frontSelector = pose.number === 2 ? '.set-memory-shards' : pose.number === 3 ? '.set-letter-pages' : null;
  const frontProp = frontSelector ? setDocument.querySelector(frontSelector) : null;
  character.querySelector('.pose-props-front').innerHTML = frontProp?.outerHTML || '';
  frontProp?.remove();
  character.querySelector('.pose-stage-set').innerHTML = setDocument.documentElement.outerHTML;
  const completionDocument = new DOMParser().parseFromString(design.completion, 'image/svg+xml');
  detailHairCrown(completionDocument.documentElement, pose);
  const seams = completionDocument.querySelector('.completion-seams');
  character.querySelector('.pose-completion-front').innerHTML = seams?.outerHTML || '';
  seams?.remove();
  character.querySelector('.pose-completion').innerHTML = completionDocument.documentElement.outerHTML;
  character.querySelector('.pose-hair-layer').innerHTML = `<g clip-path="url(#${id}-face-safe)">
    <g class="pose-hair-left"><g mask="url(#${id}-left-hair)"><image href="${pose.src}" width="${pose.width}" height="${pose.height}" ${edgeMask}/></g></g>
    <g class="pose-hair-right"><g mask="url(#${id}-right-hair)"><image href="${pose.src}" width="${pose.width}" height="${pose.height}" ${edgeMask}/></g></g>
  </g>`;
  character.querySelector('.pose-refraction').innerHTML = `<g mask="url(#${id}-silhouette)" clip-path="url(#${id}-face-safe)">
    <g class="pose-waterlight" fill="none" stroke="#88eaff" stroke-width="12" stroke-linecap="round" opacity=".18">
      <path d="M-100 90Q300-30 600 110T1300 80T2000 120M-100 290Q300 170 600 310T1300 280T2000 320M-100 490Q300 370 600 510T1300 480T2000 520M-100 690Q300 570 600 710T1300 680T2000 720M-100 890Q300 770 600 910T1300 880T2000 920M-100 1090Q300 970 600 1110T1300 1080T2000 1120M-100 1290Q300 1170 600 1310T1300 1280T2000 1320M-100 1490Q300 1370 600 1510T1300 1480T2000 1520"/>
    </g>
    <g class="pose-waterlight second" fill="none" stroke="#d0ffff" stroke-width="2" opacity=".26"><path d="M-100 170Q450 40 900 190T1900 170M-100 570Q450 440 900 590T1900 570M-100 970Q450 840 900 990T1900 970M-100 1370Q450 1240 900 1390T1900 1370"/></g>
  </g>`;
  character.querySelector('.pose-submersion-back').innerHTML = pose.number === 4 ? `<g class="submerged-current" fill="none" stroke="#a3f3ff" stroke-width="1.7"><ellipse cx="560" cy="920" rx="450" ry="68" opacity=".13"/><g class="submersion-ripple"><ellipse cx="560" cy="920" rx="440" ry="62"/><ellipse cx="560" cy="920" rx="465" ry="72" opacity=".3"/></g><ellipse class="submersion-ripple second" cx="560" cy="920" rx="440" ry="62"/></g>` : '';
  if (pose.number === 4) {
    character.querySelector('.pose-effect-defs').insertAdjacentHTML('beforeend', `<linearGradient id="${id}-submerged-ink" x1="0" y1="850" x2="0" y2="1600" gradientUnits="userSpaceOnUse"><stop stop-color="#80e5ff" stop-opacity=".06"/><stop offset=".2" stop-color="#1390cd" stop-opacity=".16"/><stop offset="1" stop-color="#1269bd" stop-opacity=".32"/></linearGradient>`);
    character.querySelector('.pose-submersion-front').innerHTML = `<g class="submerged-current">
      <g mask="url(#${id}-silhouette)"><path d="M-100 920Q240 880 560 920T1200 920V1700H-100Z" fill="url(#${id}-submerged-ink)"/><g class="submerged-sheen" fill="none" stroke="#b3f4ff" stroke-width="3"><path d="M-100 1000Q250 900 600 1000T1200 1000M-100 1180Q250 1080 600 1180T1200 1180M-100 1360Q250 1260 600 1360T1200 1360M-100 1540Q250 1440 600 1540T1200 1540"/></g></g>
      <path d="M140 924Q270 958 560 955T970 925" fill="none" stroke="#c0f6ff" stroke-width="2" opacity=".48"/>
      <path d="M160 933Q330 967 565 965T950 936" fill="none" stroke="#87dbee" stroke-width="1" opacity=".22"/>
    </g><g fill="#b7f2ff" fill-opacity=".025" stroke="#ccf7ff" stroke-opacity=".6" stroke-width="1.2">${[[270,830,6],[860,730,8],[220,1050,5],[900,1130,9],[315,1270,7],[790,1380,6]].map(([x,y,r],index)=>`<circle class="submersion-bubble" style="--bubble:${index}" cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
  } else character.querySelector('.pose-submersion-front').replaceChildren();
  renderBlink(character, pose, design.eyes);
}
