// Coreografía de apertura: caída -> contacto con el agua -> suspensión.
// Las transformaciones usan las coordenadas del SVG, también en la composición móvil.
export function playMenuArrival(stage, host, atmosphere) {
  const portrait = host.querySelector('.arrival-portrait');
  const environment = host.querySelector('.scene-environment');
  const navigation = stage.querySelector('.menu');
  const ns = 'http://www.w3.org/2000/svg';
  const surface = document.createElementNS(ns, 'svg');
  surface.setAttribute('class', 'menu-arrival-effects');
  surface.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
  surface.setAttribute('aria-hidden', 'true');
  atmosphere.after(surface);
  const effects = document.createElementNS(ns, 'g');
  effects.setAttribute('class', 'arrival-effects');
  surface.append(effects);
  const animations = new Set();
  const timers = new Set();
  let disposed = false;
  let previousWidth = innerWidth;

  function later(callback, delay) {
    const timer = setTimeout(() => { timers.delete(timer); if (!disposed) callback(); }, delay);
    timers.add(timer);
  }

  function animate(element, frames, options, remove = false) {
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.finished.then(() => {
      animations.delete(animation);
      if (remove) element.remove();
    }, () => { animations.delete(animation); if (remove) element.remove(); });
    return animation;
  }

  function node(name, attributes, parent = effects) {
    const element = document.createElementNS(ns, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    parent.append(element);
    return element;
  }

  function waterContact() {
    if (disposed || stage.dataset.arrival === 'settled') return;
    stage.dataset.arrival = 'landing';
    navigation.inert = false;
    const bounds = host.getBoundingClientRect();
    const point = { x: bounds.left + 310 * bounds.width / 1672, y: bounds.top + 580 * bounds.height / 941 };
    const compact = stage.classList.contains('is-compact');
    const radius = compact ? Math.min(125, innerWidth * .32) : 185;
    const anchor = node('g', { transform: `translate(${point.x} ${point.y})` });

    for (let i = 0; i < 3; i++) {
      const ring = node('ellipse', { cx: 0, cy: 0, rx: radius, ry: radius * .2, fill: 'none', stroke: i === 1 ? '#77e8ff' : '#d5ffff', 'stroke-width': i === 0 ? 2 : 1.2, style: 'transform-origin:0 0' }, anchor);
      animate(ring, [
        { transform: 'scale(.08)', opacity: 0 },
        { transform: 'scale(.35)', opacity: .8, offset: .18 },
        { transform: 'scale(1.45)', opacity: 0 },
      ], { duration: 1250, delay: i * 140, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }, true);
    }

    const drops = compact ? 3 : 6;
    for (let i = 0; i < drops; i++) {
      const angle = Math.PI * (1.08 + i / (drops - 1) * .84);
      const distance = (compact ? 75 : 135) + i % 4 * 14;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const size = .5 + i % 3 * .25;
      const drop = node('path', { d: 'M0-7C-1-3-4 0-4 3A4 4 0 0 0 4 3C4 0 1-3 0-7Z', fill: '#c3ffff', 'fill-opacity': '.6', stroke: '#e6ffff', 'stroke-width': '.6', style: 'transform-origin:0 0' }, anchor);
      animate(drop, [
        { transform: `translate(0,0) rotate(0deg) scale(${size * .4})`, opacity: 0 },
        { transform: `translate(${dx * .5}px,${dy * .8}px) rotate(${dx * .4}deg) scale(${size})`, opacity: .9, offset: .4 },
        { transform: `translate(${dx}px,${dy * .3 + 35}px) rotate(${dx}deg) scale(${size * .2})`, opacity: 0 },
      ], { duration: 950 + i % 4 * 110, delay: i % 3 * 25, easing: 'ease-out', fill: 'both' }, true);
    }

    for (let i = 0; i < (compact ? 2 : 4); i++) {
      const x = (i - 4) * (compact ? 13 : 19);
      const bubble = node('circle', { cx: x, cy: 24 + i % 4 * 15, r: 3 + i % 4, fill: '#b9ffff10', stroke: '#c0ffff', 'stroke-width': 1 }, anchor);
      animate(bubble, [{ transform: 'translateY(0)', opacity: 0 }, { transform: 'translateY(-20px)', opacity: .8, offset: .15 }, { transform: `translate(${i % 2 ? 14 : -10}px,-${115 + i % 3 * 35}px)`, opacity: 0 }], { duration: 1550, delay: i * 65, easing: 'ease-out', fill: 'both' }, true);
    }
    later(() => anchor.remove(), 2400);
  }

  function settle() {
    stage.dataset.arrival = 'settled';
    navigation.inert = false;
    portrait.style.transform = '';
    effects.replaceChildren();
  }

  function completeInstantly() {
    if (stage.dataset.arrival === 'settled') return;
    timers.forEach(clearTimeout); timers.clear();
    settle();
    animations.forEach(animation => animation.cancel());
  }

  stage.dataset.arrival = 'falling';
  navigation.inert = true;
  const falling = animate(portrait, [
    { transform: 'translate(85px,-1150px) rotate(-13deg) scale(1.04)', opacity: 0, offset: 0, easing: 'ease-in' },
    { transform: 'translate(56px,-810px) rotate(-9deg) scale(1.025)', opacity: 1, offset: .28, easing: 'cubic-bezier(.4,0,.8,.6)' },
    { transform: 'translate(4px,-32px) rotate(-1deg) scale(1)', opacity: 1, offset: .66, easing: 'cubic-bezier(.16,1,.3,1)' },
    { transform: 'translate(0,16px) rotate(.5deg) scale(1)', opacity: 1, offset: .8, easing: 'ease-out' },
    { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1, offset: 1 },
  ], { duration: 1500, easing: 'linear', fill: 'both' });
  later(waterContact, 900);
  falling.finished.then(() => {
    if (disposed || stage.dataset.arrival === 'settled') return;
    stage.dataset.arrival = 'revealing';
    const reveal = animate(environment, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, fill: 'both', easing: 'ease-out' });
    reveal.finished.then(() => { if (!disposed) { stage.dataset.arrival = 'settled'; navigation.inert = false; falling.cancel(); reveal.cancel(); } }, () => {});
  }, () => {});

  // Girar el teléfono no reinicia una caída a mitad del nuevo encuadre.
  function onResize() {
    if (Math.abs(innerWidth - previousWidth) > 2 && stage.dataset.arrival !== 'settled') {
      completeInstantly();
    }
    previousWidth = innerWidth;
  }
  addEventListener('resize', onResize, { passive: true });
  const onVisibility = () => { if (document.hidden) completeInstantly(); };
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('nightfall:skip-arrival', completeInstantly);

  return () => {
    disposed = true;
    timers.forEach(clearTimeout); timers.clear();
    animations.forEach(animation => animation.cancel()); animations.clear();
    removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('nightfall:skip-arrival', completeInstantly);
    surface.remove();
  };
}
