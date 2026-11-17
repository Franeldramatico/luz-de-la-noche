// Cached texture layers, animated by the compositor instead of repainting
// 80–100 canvas strips per frame. All text and portrait pixels stay untouched.
export function mountSectionWater(overlay) {
  const host = overlay.querySelector('.section-water');
  const surface = document.createElement('div');
  surface.className = 'section-water-surface'; surface.setAttribute('aria-hidden', 'true');
  const light = document.createElement('div');
  light.className = 'section-water-caustics'; light.setAttribute('aria-hidden', 'true');
  host.append(surface, light);
  return () => { surface.remove(); light.remove(); };
}
