// One bounded canvas replaces hundreds of independently repainted SVG nodes.
// The public API is shared by React's homepage and the illustrated menu.
export function mountOcean(atmosphere, { isPaused = () => false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = `ocean-canvas ${atmosphere.classList.contains('homepage-ocean') ? 'homepage-ocean-canvas' : ''}`;
  canvas.setAttribute('aria-hidden', 'true');
  const previousDisplay = atmosphere.style.display;
  atmosphere.style.display = 'none';
  atmosphere.after(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); atmosphere.style.display = previousDisplay; return () => {}; }
  const homepage = atmosphere.classList.contains('homepage-ocean');
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 96;
  const brush = sprite.getContext('2d');
  let width = 1, height = 1, scale = 1, frame = 0, resizeFrame = 0;
  let lastDraw = -Infinity, disposed = false, lastTrail = 0;
  let particles = [], trails = [], drawnBubbles = [], tint = '#c1f7ff', pops = 0;
  let pointer = null;

  function resize() {
    width = innerWidth; height = innerHeight;
    const compact = width <= 1024 || matchMedia('(pointer: coarse)').matches;
    scale = Math.min(compact ? .7 : 1, 1000 / width, 700 / height);
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const count = compact ? 18 : 28;
    particles = Array.from({ length: count }, (_, i) => ({
      x: .04 + (i * .1731) % .92, phase: (i * .2317) % 1,
      radius: i % 6 === 0 ? 25 + i % 12 : 5 + i % 14,
      duration: 20 + i % 17, alpha: i % 3 === 0 ? .6 : .78,
    }));
    canvas.dataset.particles = String(count);
  }
  function makeSprite() {
    if (!brush) return;
    brush.clearRect(0, 0, 96, 96);
    const pearl = brush.createRadialGradient(36, 31, 2, 48, 48, 43);
    const daylight = document.documentElement.dataset.theme === 'day';
    pearl.addColorStop(0, daylight ? '#ffffff45' : '#efffff25');
    pearl.addColorStop(.48, '#caffff02'); pearl.addColorStop(.83, '#acb5ef0c'); pearl.addColorStop(1, daylight ? '#438fa62c' : '#a1edff28');
    brush.fillStyle = pearl;
    const rim = brush.createLinearGradient(16, 14, 80, 86);
    rim.addColorStop(0, daylight ? '#6897ad' : '#e2ffff'); rim.addColorStop(.35, tint);
    rim.addColorStop(.65, daylight ? '#c694b3' : '#eebde180'); rim.addColorStop(1, tint);
    brush.strokeStyle = rim; brush.lineWidth = 1.2;
    brush.beginPath(); brush.arc(48, 48, 41, 0, Math.PI * 2); brush.fill(); brush.stroke();
    brush.strokeStyle = daylight ? '#ffffffb3' : '#e7ffffb3'; brush.lineWidth = 2.4; brush.lineCap = 'round';
    brush.beginPath(); brush.arc(47, 47, 34, Math.PI * 1.06, Math.PI * 1.46); brush.stroke();
    brush.lineWidth = .8; brush.strokeStyle = daylight ? '#527f9c80' : '#ffc5e5a6';
    brush.beginPath(); brush.arc(49, 49, 36, .1, Math.PI * .4); brush.stroke();
    brush.fillStyle = '#f3ffffd9'; brush.beginPath(); brush.ellipse(34, 24, 4, 1.8, -.6, 0, Math.PI * 2); brush.fill();
  }
  const paused = () => document.hidden || isPaused() || atmosphere.classList.contains('effects-paused');
  function draw(now) {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const time = now / 1000;
    const section = document.documentElement.classList.contains('section-active');
    // Restore drifting light and water currents without live SVG filters or
    // moving a full-screen texture. They share the bounded 30-FPS canvas.
    const daylight = document.documentElement.dataset.theme === 'day';
    for (let i = 0; i < 2; i++) {
      const x = width * (.38 + i * .42) + Math.sin(time * .16 + i) * width * .035;
      const light = ctx.createLinearGradient(x, 0, x - width * .18, height * .8);
      light.addColorStop(0, daylight ? '#68b3ce24' : '#a7faff20');
      light.addColorStop(1, '#8cefff00');
      ctx.fillStyle = light; ctx.globalAlpha = section ? .35 : .7;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + width * .07, 0);
      ctx.lineTo(x - width * .08, height * .8); ctx.lineTo(x - width * .3, height * .8); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = tint; ctx.lineWidth = .9;
    for (let i = 0; i < 3; i++) {
      const y = height * (.16 + i * .29) + Math.sin(time * .35 + i) * 9;
      ctx.globalAlpha = .1 + Math.max(0, Math.sin(time * .3 + i)) * .1;
      ctx.beginPath(); ctx.moveTo(width * .48, y);
      ctx.bezierCurveTo(width * .64, y - 24, width * .79, y + 24, width * 1.05, y - 12); ctx.stroke();
    }
    drawnBubbles = [];
    for (const [i, bubble] of particles.entries()) {
      if (section && i % 3 === 2) continue;
      if (bubble.poppedUntil > now) continue;
      const phase = (time / bubble.duration + bubble.phase) % 1;
      let x = width * bubble.x + Math.sin(time * .32 + i) * (i % 2 ? 12 : 20);
      const y = height + 65 - phase * (height + 130);
      if (pointer) {
        const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy);
        if (distance < 130 && distance > 0) x += dx / distance * (1 - distance / 130) * 18;
      }
      const fade = Math.min(1, phase * 12, (1 - phase) * 12);
      // Leave the headline and reading column quiet without removing ambience.
      const behindCopy = homepage && x < width * .6 && y > 110 && y < height - 85;
      ctx.globalAlpha = bubble.alpha * fade * (behindCopy ? .3 : section ? .65 : 1);
      const size = bubble.radius * 2.3;
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      if (fade > .3) drawnBubbles.push({ x, y, radius: size * .44, particle: bubble });
    }
    ctx.strokeStyle = tint; ctx.fillStyle = tint;
    for (let i = 0; i < 14; i++) {
      ctx.globalAlpha = .12 + (Math.sin(time * .45 + i) + 1) * .12;
      ctx.beginPath(); ctx.arc((i * 173.3 + 35) % width, (i * 97.7 + 45) % height, i % 4 ? .8 : 1.5, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < (section ? 2 : 4); i++) {
      const x = width * (.15 + i * .217), y = height * (.19 + (i * .163) % .6) + Math.sin(time * .4 + i) * 5;
      ctx.globalAlpha = .12 + Math.max(0, Math.sin(time * .2 + i)) * .2;
      ctx.lineWidth = .8; ctx.beginPath();
      ctx.moveTo(x, y + 4); ctx.bezierCurveTo(x - 17, y - 5, x - 5, y - 16, x, y - 8);
      ctx.bezierCurveTo(x + 5, y - 16, x + 17, y - 5, x, y + 4); ctx.stroke();
    }
    trails = trails.filter(trail => now - trail.start < 1300);
    for (const trail of trails) {
      const progress = (now - trail.start) / 1300;
      ctx.globalAlpha = (1 - progress) * (trail.burst ? .7 : .35);
      const radius = trail.burst ? trail.radius * (1 + progress * .7) : 3 + progress * 5;
      const y = trail.y - progress * (trail.burst ? 12 : 35);
      ctx.lineWidth = trail.burst ? 1 : .8;
      ctx.beginPath(); ctx.arc(trail.x, y, radius, 0, Math.PI * 2); ctx.stroke();
      if (trail.burst) {
        for (let i = 0; i < 5; i++) {
          const angle = i * Math.PI * 2 / 5;
          ctx.beginPath(); ctx.arc(trail.x + Math.cos(angle) * radius * 1.5, y + Math.sin(angle) * radius * 1.5, 1.5 * (1 - progress), 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }
  function tick(now) {
    frame = 0;
    if (disposed || paused()) return;
    if (now - lastDraw >= 1000 / 30) { draw(now); lastDraw = now; }
    frame = requestAnimationFrame(tick);
  }
  function synchronize() {
    if (disposed) return;
    tint = document.documentElement.dataset.theme === 'day' ? '#427d98' : '#c1f7ff';
    makeSprite();
    canvas.style.zIndex = document.documentElement.classList.contains('section-active') ? '23' : '3';
    canvas.hidden = paused();
    if (paused()) { cancelAnimationFrame(frame); frame = 0; }
    else if (!frame) { lastDraw = -Infinity; frame = requestAnimationFrame(tick); }
  }
  const onResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { resize(); synchronize(); });
  };
  const onPointer = event => {
    if (paused() || event.target.closest?.('button,a,input,textarea,select,summary')) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (event.type === 'pointermove' && (event.pointerType === 'touch' || performance.now() - lastTrail < 170)) return;
    lastTrail = performance.now();
    const bubble = event.type === 'pointerdown' && drawnBubbles.find(bubble => Math.hypot(bubble.x - event.clientX, bubble.y - event.clientY) < bubble.radius + 8);
    if (bubble) {
      bubble.particle.poppedUntil = lastTrail + 2600;
      canvas.dataset.pops = String(++pops);
    }
    if (trails.length >= 12) trails.shift();
    trails.push({ x: bubble ? bubble.x : event.clientX, y: bubble ? bubble.y : event.clientY, start: lastTrail, burst: Boolean(bubble), radius: bubble?.radius || 0 });
  };
  const onPointerLeave = () => { pointer = null; };
  const observer = new MutationObserver(synchronize);
  observer.observe(atmosphere, { attributes: true, attributeFilter: ['class'] });
  const rootObserver = new MutationObserver(synchronize);
  rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  addEventListener('resize', onResize, { passive: true });
  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('pointerdown', onPointer, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', synchronize);
  resize(); synchronize();
  return () => {
    disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(resizeFrame);
    observer.disconnect(); rootObserver.disconnect();
    removeEventListener('resize', onResize); removeEventListener('pointermove', onPointer); removeEventListener('pointerdown', onPointer);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', synchronize);
    atmosphere.style.display = previousDisplay; canvas.remove();
  };
}
