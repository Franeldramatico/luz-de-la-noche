// Optional integration checks. Requires Playwright and a running dev/preview server.
// Usage: node scripts/menu.browser.mjs http://localhost:5173
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:5173';
const cases = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844, mobile: true },
  { name: 'small-phone', width: 320, height: 568, mobile: true },
  { name: 'landscape-phone', width: 844, height: 390, mobile: true },
  { name: 'tablet', width: 768, height: 1024, mobile: true },
];
const browser = await chromium.launch({ headless: true });
try {
  for (const device of cases) {
    const page = await browser.newPage({ viewport: { width: device.width, height: device.height }, isMobile: Boolean(device.mobile), hasTouch: Boolean(device.mobile) });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.getByRole('button', { name: 'Abrir menú ilustrado' }).click();
    const frame = page.frameLocator('.nightfall-menu iframe');
    const gustos = frame.frameLocator('.gustos-scene-frame');
    await frame.locator('#scene[data-arrival=settled]').waitFor();
    const atmosphere = await frame.locator('.ocean-canvas').evaluate(canvas => {
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      return { visible: !canvas.hidden && getComputedStyle(canvas).display !== 'none', particles: Number(canvas.dataset.particles), painted: pixels.some((value, index) => index % 4 === 3 && value > 0) };
    });
    assert.equal(atmosphere.visible, true, `${device.name}: atmosphere must be visible`);
    assert.ok(atmosphere.particles >= 18 && atmosphere.painted, `${device.name}: bubbles and light must be drawn`);
    assert.equal(await frame.locator('.menu-eyelid').count(), 2);
    assert.equal(await frame.locator('.menu-eyelid').first().evaluate(el => getComputedStyle(el).animationPlayState), 'running');
    const blink = await frame.locator('.menu-eyelid').first().evaluate(el => {
      const animation = el.getAnimations()[0];
      animation.pause();
      animation.currentTime = 0;
      const open = getComputedStyle(el).transform;
      animation.currentTime = 2944;
      const closed = getComputedStyle(el).transform;
      animation.play();
      return { open, closed };
    });
    assert.notEqual(blink.open, blink.closed, `${device.name}: eyes must blink`);
    const card = await page.locator('.soundtrack-now-playing').boundingBox();
    if (device.mobile && device.height > device.width) {
      const art = await frame.locator('.living-art').boundingBox();
      const options = await frame.locator('.menu').boundingBox();
      // The focal point of the original portrait stays on the left, as on PC.
      const faceX = art.x + art.width * 310 / 1672;
      assert.ok(faceX > 0 && faceX < device.width * .35, `${device.name}: portrait must stay at the left edge`);
      assert.ok(art.x <= 1, `${device.name}: artwork must not become a centred thumbnail`);
      assert.ok(options.x >= device.width * .44, `${device.name}: choices must remain beside the portrait`);
    }
    for (const selector of ['.menu-item.story', '.menu-item.reasons', '.menu-item.letter']) {
      const box = await frame.locator(selector).boundingBox();
      assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= device.width + 1 && box.y + box.height <= device.height + 1, `${device.name}: menu option outside viewport`);
      const overlaps = box.x < card.x + card.width && box.x + box.width > card.x && box.y < card.y + card.height && box.y + box.height > card.y;
      assert.equal(overlaps, false, `${device.name}: music covers ${selector}`);
    }
    await frame.locator('.menu-item.story').click();
    const settled = () => frame.locator('#overlay.open[data-moving=false]').waitFor();
    await settled();
    assert.equal(await frame.locator('.menu-eyelid').first().evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
    await frame.locator('[data-story="1"]').click();
    assert.equal(await frame.locator('[data-story="1"]').getAttribute('aria-pressed'), 'true');
    for (const section of ['razones', 'carta', 'historia']) {
      await frame.locator(`.section-tabs [data-section="${section}"]`).click();
      await settled();
      assert.equal(await frame.locator('.section-character-ghost').count(), 0);
      assert.equal(await frame.locator('.section-immersion').count(), 0);
      if (section === 'razones') {
        await gustos.locator('#char .ap').first().waitFor({ state: 'attached' });
        assert.equal(await gustos.locator('.item').count(), 5);
        assert.equal(await gustos.locator('h1').textContent(), 'Aranxita');
        assert.equal(await gustos.locator('#pic').evaluate(image => image.getAttribute('href').startsWith('data:image/webp;base64,')), true);
        await gustos.locator('.item').nth(1).click();
        assert.equal(await gustos.locator('.item').nth(1).getAttribute('aria-pressed'), 'true');
        await gustos.locator('#blink').evaluate(button => button.scrollIntoView({ block: 'end' }));
        await gustos.getByRole('button', { name: 'Parpadear', exact: true }).click();
        assert.equal(await gustos.locator('html').evaluate(el => el.scrollWidth > innerWidth), false);
        const bounds = await gustos.locator('#blink').boundingBox();
        const music = await page.locator('.soundtrack-now-playing').boundingBox();
        const overlaps = bounds.x < music.x + music.width && bounds.x + bounds.width > music.x && bounds.y < music.y + music.height && bounds.y + bounds.height > music.y;
        assert.equal(overlaps, false, `${device.name}: music must not cover the gustos controls`);
      } else {
        assert.equal(await frame.locator('.section-composite').evaluate(image => image.complete && image.naturalWidth > 0), true);
        if (await frame.locator('.gustos-scene-frame').count()) assert.equal(await gustos.locator('#char').evaluate(el => el.animationsPaused()), true);
      }
      assert.equal(await frame.locator('html').evaluate(el => el.scrollWidth > innerWidth), false);
      if (section === 'carta') {
        await frame.locator('.letter-envelope').click();
        await frame.locator('.section-letter-paper').waitFor();
      }
    }
    assert.equal(await frame.locator('[data-story="1"]').getAttribute('aria-pressed'), 'true');
    // Rapid taps must settle on the last requested section, with no ghost leaks.
    for (const section of ['razones', 'historia', 'carta', 'razones']) await frame.locator(`.section-tabs [data-section="${section}"]`).click();
    await settled();
    assert.equal(await frame.locator('#overlay').getAttribute('data-page'), 'razones');
    assert.equal(await frame.locator('.section-character-ghost').count(), 0);
    assert.equal(await gustos.locator('.item').nth(1).getAttribute('aria-pressed'), 'true');
    await gustos.locator('.item').first().click();
    await page.keyboard.press('ArrowDown');
    assert.equal(await gustos.locator('.item').nth(1).getAttribute('aria-pressed'), 'true');
    // Orientation changes keep content and navigation usable.
    if (device.mobile) {
      await page.setViewportSize({ width: device.height, height: device.width });
      await gustos.locator('#char').waitFor();
      assert.equal(await frame.locator('#overlay').getAttribute('data-page'), 'razones');
    }
    await gustos.locator('.item').first().focus();
    await page.keyboard.press('Escape');
    await frame.locator('#overlay:not(.open)').waitFor({ state: 'attached' });
    await page.getByRole('button', { name: 'Cerrar menú y volver al inicio' }).click();
    await page.locator('.nightfall-menu').waitFor({ state: 'detached' });
    assert.equal(await page.locator('.soundtrack-karaoke').isVisible(), true);
    assert.deepEqual(errors, []);
    console.log(`PASS ${device.name}: layout, player clearance, sections, retained state, letter, rapid navigation, keyboard, orientation, cleanup.`);
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto(`${base}/menu.html`);
  await page.locator('#scene[data-arrival=settled]').waitFor();
  assert.equal(await page.locator('.menu-eyelid').first().evaluate(el => getComputedStyle(el).animationName), 'none');
  await page.locator('.menu-item.story').click();
  await page.locator('#overlay.open[data-moving=false]').waitFor();
  assert.equal(await page.locator('.section-model-float').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.equal(await page.locator('.section-immersion').count(), 0);
  await page.locator('.section-tabs [data-section="razones"]').click();
  const gustos = page.frameLocator('.gustos-scene-frame');
  await gustos.locator('#char .ap').first().waitFor({ state: 'attached' });
  assert.equal(await gustos.locator('#char').evaluate(el => el.animationsPaused()), true);
  assert.equal(await gustos.locator('.bub').count(), 0);
  await gustos.locator('.item').nth(2).click();
  assert.equal(await gustos.locator('.item').nth(2).getAttribute('aria-pressed'), 'true');
  console.log('PASS reduced motion: no falling/continuous float, navigation completes.');
  await page.close();
} finally { await browser.close(); }
