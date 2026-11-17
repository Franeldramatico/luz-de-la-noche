import './section-transition.css';

// A short water/light handoff made from a few compositor-friendly HTML layers.
// No duplicated SVG scenery, full-screen blur, or dozens of particle animations.
export function playSectionTransition({ overlay, animate, contact, returning = false, navigating = false }) {
  const reduced = false;
  const compact = innerWidth <= 1024;
  const duration = reduced ? 110 : returning ? 260 : navigating ? 600 : 680;
  const revealAt = reduced ? 0 : 30;
  const root = document.createElement('div');
  root.className = 'section-immersion section-handoff'; root.setAttribute('aria-hidden', 'true');
  root.style.setProperty('--contact-x', `${Math.max(24, Math.min(innerWidth - 24, contact.x))}px`);
  root.style.setProperty('--contact-y', `${Math.max(90, Math.min(innerHeight - 24, contact.y))}px`);
  root.innerHTML = '<div class="immersion-light"></div><div class="immersion-contact"><i class="handoff-ring"></i><i class="handoff-ring"></i><i class="handoff-bubble"></i><i class="handoff-bubble"></i><i class="handoff-bubble"></i></div>';
  overlay.querySelector('#dialog').append(root);
  const run = (node, frames, options) => animate(node, frames, { fill: 'both', ...options });
  const lifetime = run(root, [{ opacity: 1 }, { opacity: 1 }], { duration });
  run(root.querySelector('.immersion-light'), [{ opacity: 0, transform: 'translate3d(-4%,0,0)' }, { opacity: reduced ? .08 : .3, offset: .35 }, { opacity: 0, transform: 'translate3d(4%,0,0)' }], { duration, easing: 'ease-in-out' });
  if (!reduced && !returning) {
    root.querySelectorAll('.handoff-ring').forEach((node, index) => {
      const radius = compact ? 150 : 270;
      node.style.width = `${radius}px`; node.style.height = `${radius * .22}px`;
      run(node, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.25)' }, { opacity: .4, offset: .22 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.65)' }], { duration: 440, delay: 30 + index * 70, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
    root.querySelectorAll('.handoff-bubble').forEach((node, index) => {
      run(node, [{ opacity: 0, transform: `translate3d(${index * 17 - 17}px,10px,0) scale(.5)` }, { opacity: .55, offset: .22 }, { opacity: 0, transform: `translate3d(${index * 24 - 24}px,-70px,0) scale(1)` }], { duration: 410, delay: 60 + index * 40, easing: 'ease-out' });
    });
  }
  lifetime.finished.then(() => root.remove(), () => root.remove());
  return { duration, revealAt, finished: lifetime.finished };
}
