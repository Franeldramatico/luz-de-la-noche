// Optional asset preparation: requires Playwright and a running Vite dev server.
// Originals are read only. Output is flattened, transparent WebP scene artwork.
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const base = process.argv[2] || 'http://localhost:5173';
const specs = [
  { key: 'historia', file: 'aranza_historia', number: 2, width: 1671, height: 941, x: 740, y: 420, zoom: .82 },
  { key: 'razones', file: 'aranza_gustos', number: 4, width: 1024, height: 1536, x: 430, y: 285, zoom: .55 },
  { key: 'carta', file: 'aranza_carta', number: 3, width: 1670, height: 941, x: 910, y: 330, zoom: .90 },
];
const browser = await chromium.launch({ headless: true });
const layouts = {};
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // Saving generated assets must not let Vite HMR reload the baking document.
  await page.routeWebSocket('**/*', socket => socket.close());
  await page.goto(`${base}/menu.html`);
  await page.evaluate(() => document.fonts.ready);

  async function bake(spec, menu = false, compact = false) {
    const data = await page.evaluate(async ({ spec, menu, compact }) => {
      document.body.replaceChildren();
      document.documentElement.className = '';
      let host, svg;
      if (menu) {
        const { default: markup } = await import('/nightfall_assets/living-scene.svg?raw');
        const stage = document.createElement('div');
        stage.className = 'scene art-ready'; stage.dataset.arrival = 'settled';
        host = document.createElement('div'); host.className = 'living-art';
        host.innerHTML = markup.replaceAll('escenario_sin_menu.webp', '/nightfall_assets/escenario_sin_menu.webp').replaceAll('agua_portada.webp', '/nightfall_assets/agua_portada.webp').replaceAll('aranza_recortada.webp', '/nightfall_assets/aranza_recortada.webp');
        stage.append(host); document.body.append(stage);
        if (compact) host.querySelector('.logo').remove();
        svg = host.querySelector('svg');
      } else {
        const [{ default: markup }, { renderCharacterEffects }] = await Promise.all([
          import('/src/section-portrait.svg?raw'), import('/src/section-character-effects.js'),
        ]);
        const overlay = document.createElement('div');
        overlay.id = 'overlay'; overlay.className = 'reload-section open'; overlay.dataset.page = spec.key;
        host = document.createElement('div'); host.className = 'section-character'; host.dataset.pose = String(spec.number);
        host.innerHTML = markup; overlay.append(host); document.body.append(overlay);
        const pose = { ...spec, src: `/nightfall_assets/${spec.file}.webp` };
        const image = host.querySelector('.section-pose-image');
        image.setAttribute('href', pose.src); image.setAttribute('width', pose.width); image.setAttribute('height', pose.height);
        host.querySelector('.section-model-anchor').setAttribute('transform', `translate(${-pose.x} ${-pose.y})`);
        host.querySelector('.section-model-camera').setAttribute('transform', `scale(${pose.zoom})`);
        renderCharacterEffects(host, pose);
        svg = host.querySelector('svg');
      }
      // Neutral, open-eyed pose. No live animation or filter turbulence is baked.
      svg.pauseAnimations?.();
      [host, ...host.querySelectorAll('*')].forEach(el => {
        el.style.setProperty('animation', 'none', 'important');
        el.style.setProperty('transition', 'none', 'important');
      });
      host.querySelectorAll('.hair').forEach(el => el.style.setProperty('filter', 'none', 'important'));
      host.querySelectorAll('.eyelid').forEach(el => el.style.setProperty('transform', 'scaleY(0)', 'important'));
      host.querySelectorAll('.pose-eye-aperture').forEach(el => { el.style.transform = 'none'; el.style.opacity = '1'; });
      host.querySelectorAll('.pose-eye-lash').forEach(el => { el.style.opacity = '0'; });
      await new Promise(resolve => requestAnimationFrame(resolve));
      const clone = svg.cloneNode(true);
      const originals = [svg, ...svg.querySelectorAll('*')];
      const copies = [clone, ...clone.querySelectorAll('*')];
      const properties = ['display', 'visibility', 'opacity', 'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'filter', 'clip-path', 'mask', 'mask-type', 'transform', 'transform-origin', 'transform-box'];
      originals.forEach((el, index) => {
        const style = getComputedStyle(el);
        properties.forEach(property => {
          const value = style.getPropertyValue(property).replace(/url\(["']?[^)"']*#([^"')]+)["']?\)/g, 'url(#$1)');
          if (value) copies[index].style.setProperty(property, value);
        });
      });
      const ns = 'http://www.w3.org/2000/svg';
      const defs = document.createElementNS(ns, 'defs'); clone.prepend(defs);
      const cache = new Map();
      for (const image of [...clone.querySelectorAll('image')]) {
        const href = image.getAttribute('href') || image.getAttribute('xlink:href');
        if (!href) continue;
        const key = `${href}:${image.getAttribute('width')}:${image.getAttribute('height')}`;
        let id = cache.get(key);
        if (!id) {
          const response = await fetch(new URL(href, location.href));
          if (!response.ok) throw new Error(`Image unavailable: ${href}`);
          // Read the real bytes once, then share one embedded image with <use>.
          const blob = await response.blob();
          const url = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob); });
          id = `baked-image-${cache.size}`; cache.set(key, id);
          const source = document.createElementNS(ns, 'image');
          source.id = id; source.setAttribute('href', url);
          source.setAttribute('width', image.getAttribute('width')); source.setAttribute('height', image.getAttribute('height'));
          defs.append(source);
        }
        // <use x=...> translates a clip path differently from <image x=...>.
        // Keep offset background samples as images so the logo mask stays put.
        if (image.hasAttribute('x') || image.hasAttribute('y')) {
          image.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
          image.setAttribute('href', defs.querySelector(`#${id}`).getAttribute('href'));
          continue;
        }
        const use = document.createElementNS(ns, 'use');
        for (const attr of image.attributes) if (!['href', 'xlink:href'].includes(attr.name)) use.setAttribute(attr.name, attr.value);
        use.setAttribute('href', `#${id}`); image.replaceWith(use);
      }
      const width = menu ? 1672 : 1600, height = menu ? 941 : 1600;
      clone.setAttribute('xmlns', ns); clone.setAttribute('viewBox', menu ? '0 0 1672 941' : '-1000 -1000 2000 2000');
      clone.setAttribute('width', width); clone.setAttribute('height', height);
      clone.style.width = `${width}px`; clone.style.height = `${height}px`; clone.style.overflow = 'hidden';
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
      try {
        const image = new Image(); image.src = url; await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
        let output = canvas;
        let bounds = null;
        if (!menu) {
          const pixels = canvas.getContext('2d').getImageData(0, 0, width, height).data;
          let left = width, top = height, right = 0, bottom = 0;
          for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
            if (pixels[(y * width + x) * 4 + 3] > 3) {
              left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
            }
          }
          left = Math.max(0, left - 8); top = Math.max(0, top - 8);
          right = Math.min(width, right + 9); bottom = Math.min(height, bottom + 9);
          output = document.createElement('canvas'); output.width = right - left; output.height = bottom - top;
          output.getContext('2d').drawImage(canvas, left, top, output.width, output.height, 0, 0, output.width, output.height);
          bounds = { left: -50 + left / width * 200, top: -50 + top / height * 200, width: output.width / width * 200, height: output.height / height * 200 };
        }
        return { data: output.toDataURL('image/webp', .92).split(',')[1], bounds };
      } finally { URL.revokeObjectURL(url); }
    }, { spec, menu, compact });
    const name = menu ? `menu_composite${compact ? '_compact' : ''}.webp` : `${spec.file}_scene.webp`;
    await writeFile(new URL(`../nightfall_assets/${name}`, import.meta.url), Buffer.from(data.data, 'base64'));
    if (spec) layouts[spec.key] = data.bounds;
    console.log(`Prepared ${name}`);
  }
  for (const spec of specs) await bake(spec);
  await bake(null, true, false); await bake(null, true, true);
  await writeFile(new URL('../nightfall_assets/scene_composite_bounds.json', import.meta.url), `${JSON.stringify(layouts, null, 2)}\n`);
} finally { await browser.close(); }
