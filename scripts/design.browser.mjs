// Optional visual/interaction regression checks. Requires Playwright.
// node scripts/design.browser.mjs http://localhost:4173 [screenshot-directory]
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const base = process.argv[2] || 'http://localhost:4173';
const screenshots = process.argv[3];
if (screenshots) await mkdir(screenshots, { recursive: true });
const devices = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'short-desktop', width: 1366, height: 768 },
  { name: 'phone', width: 390, height: 844, mobile: true },
  { name: 'compact-phone', width: 375, height: 667, mobile: true },
  { name: 'small-phone', width: 320, height: 568, mobile: true },
  { name: 'landscape-phone', width: 844, height: 390, mobile: true },
  { name: 'tablet', width: 768, height: 1024, mobile: true },
];
const browser = await chromium.launch({ headless: true });
const capture = (page, name) => screenshots ? page.screenshot({ path: join(screenshots, `${name}.png`) }) : Promise.resolve();
try {
  for (const device of devices) {
    const page = await browser.newPage({ viewport: { width: device.width, height: device.height }, isMobile: Boolean(device.mobile), hasTouch: Boolean(device.mobile) });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-postscript')).opacity === '1');
    const title = await page.locator('.hero-title-line').evaluateAll(lines => lines.map(line => {
      const rect = line.getBoundingClientRect();
      return { right: rect.right, left: rect.left, clipped: line.scrollWidth > line.clientWidth + 1 };
    }));
    for (const line of title) {
      assert.equal(line.clipped, false, `${device.name}: title must not be clipped`);
      assert.ok(line.left >= 0 && line.right <= device.width, `${device.name}: complete title must fit`);
    }
    assert.equal(await page.locator('html').evaluate(el => el.scrollWidth > innerWidth), false);
    if (device.width <= 700 && device.height <= 740) {
      const invitation = await page.locator('.story-button').boundingBox();
      const music = await page.locator('.soundtrack-now-playing').boundingBox();
      assert.ok(invitation.y + invitation.height <= music.y, `${device.name}: compact player must leave the invitation visible`);
    }
    const icon = await page.locator('link[rel=icon]').getAttribute('href');
    assert.equal((await page.request.get(new URL(icon, base).href)).status(), 200);
    assert.match(await page.locator('html').evaluate(el => getComputedStyle(el, '::-webkit-scrollbar-thumb').backgroundImage), /linear-gradient/);
    await capture(page, `${device.name}-night`);
    // The scroll-triggered dedication must reveal when actually in view, even
    // on small screens. The progress line tracks real native document scrolling.
    await page.locator('#dedicatoria').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.quiet-section > p')).opacity === '1');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.page-reading-progress')).transform !== 'matrix(0, 0, 0, 1, 0, 0)');
    await capture(page, `${device.name}-dedication`);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    // Exercise both palettes and wait for their real CSS transitions to end.
    for (const theme of ['day', 'night']) {
      if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('.theme-toggle').click();
      await page.waitForFunction(theme => document.documentElement.dataset.theme === theme && !document.body.getAnimations().some(animation => animation.playState === 'running'), theme);
      const contrast = await page.locator('.story-button').evaluate(button => {
        const luminance = rgb => {
          const values = rgb.match(/[\d.]+/g).slice(0, 3).map(value => {
            const channel = Number(value) / 255;
            return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
          });
          return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
        };
        const style = getComputedStyle(button), a = luminance(style.color), b = luminance(style.backgroundColor);
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      });
      assert.ok(contrast >= 4.5, `${device.name}: ${theme} call to action must remain legible (${contrast.toFixed(2)})`);
      if (theme === 'day') await capture(page, `${device.name}-day`);
    }
    await page.getByRole('button', { name: 'Abrir menú ilustrado' }).click();
    const menu = page.frameLocator('.nightfall-menu iframe');
    await menu.locator('#scene[data-arrival=settled]').waitFor();
    // Click a known ambient bubble without dispatching a click on any UI.
    await menu.locator('body').evaluate(body => {
      const now = performance.now() / 1000;
      const x = innerWidth * .04 + Math.sin(now * .32) * 20;
      const y = innerHeight + 65 - (now / 20 % 1) * (innerHeight + 130);
      body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: x, clientY: y, pointerType: 'mouse' }));
    });
    assert.ok(Number(await menu.locator('.ocean-canvas').getAttribute('data-pops')) >= 1, `${device.name}: bubbles respond to touch/click`);
    await menu.locator('.menu-item.story').click();
    const settled = () => menu.locator('#overlay.open[data-moving=false]').waitFor();
    await settled();
    const beforeSwap = await menu.locator('[data-section=razones]').evaluate(button => {
      button.click();
      return { page: document.querySelector('#overlay').dataset.page, leaving: document.querySelector('.section-scene').inert };
    });
    assert.equal(beforeSwap.page, 'historia', `${device.name}: old scene must finish its fade before content changes`);
    assert.equal(beforeSwap.leaving, true);
    await settled();
    assert.equal(await menu.locator('#overlay').getAttribute('data-page'), 'razones');
    for (const key of ['historia', 'carta']) {
      await menu.locator(`[data-section=${key}]`).click();
      await settled();
      const alignment = await menu.locator('.section-tabs').evaluate(tabs => {
        const selected = tabs.querySelector('[aria-current=page]').getBoundingClientRect();
        const indicator = tabs.querySelector('.section-tab-indicator').getBoundingClientRect();
        return Math.abs(selected.left - indicator.left) + Math.abs(selected.width - indicator.width);
      });
      assert.ok(alignment < 2, `${device.name}: navigation indicator must follow selection`);
      assert.equal(await menu.locator('.section-scene').evaluate(el => Number(getComputedStyle(el).opacity)), 1);
      await capture(page, `${device.name}-${key}`);
    }
    await menu.locator('.section-tabs').evaluate(tabs => {
      for (const key of ['historia', 'razones', 'carta', 'razones', 'historia']) tabs.querySelector(`[data-section=${key}]`).click();
    });
    await settled();
    assert.equal(await menu.locator('#overlay').getAttribute('data-page'), 'historia');
    assert.equal(await menu.locator('.section-immersion,.section-character-ghost').count(), 0);
    assert.equal(await menu.locator('.section-scene').evaluate(el => el.inert), false);
    await menu.locator('.section-tabs').evaluate(tabs => {
      tabs.querySelector('[data-section=carta]').click();
      tabs.querySelector('[data-section=historia]').click();
    });
    await settled();
    assert.equal(await menu.locator('#overlay').getAttribute('data-page'), 'historia', `${device.name}: returning to the outgoing section must cancel a pending destination`);
    // Arrow-key navigation belongs to the persistent menu, not to a remounted
    // scene. Returning and closing must also work midway through navigation.
    await menu.locator('[data-section=historia]').focus();
    await page.keyboard.press('ArrowRight');
    await settled();
    assert.equal(await menu.locator('#overlay').getAttribute('data-page'), 'razones');
    await menu.locator('[data-section=carta]').click();
    await menu.locator('#closeDialog').click();
    await menu.locator('#overlay:not(.open)').waitFor({ state: 'attached' });
    await page.getByRole('button', { name: 'Cerrar menú y volver al inicio' }).click();
    await page.locator('.nightfall-menu').waitFor({ state: 'detached' });
    await page.waitForFunction(() => !document.querySelector('.homepage-ocean-canvas').hidden);
    assert.deepEqual(errors, [], `${device.name}: no browser errors`);
    console.log(`PASS ${device.name}: complete title, scrolling, themes, icon, scrollbar, bubbles, coordinated transitions, indicator, rapid navigation and keyboard.`);
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto(base);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-postscript')).opacity === '1');
  assert.notEqual(await page.locator('.hero-keepsake').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.equal(await page.locator('.homepage-ocean-canvas').getAttribute('data-particles'), '18');
  await page.getByRole('button', { name: 'Abrir menú ilustrado' }).click();
  const menu = page.frameLocator('.nightfall-menu iframe');
  await menu.locator('#scene[data-arrival=settled]').waitFor();
  await menu.locator('.menu-item.story').click();
  await menu.locator('#overlay.open[data-moving=false]').waitFor();
  assert.notEqual(await menu.locator('.section-tab-indicator').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  const motion = await menu.locator('.section-tabs').evaluate(async tabs => {
    tabs.querySelector('[data-section=carta]').click();
    await new Promise(resolve => requestAnimationFrame(resolve));
    return document.querySelector('.section-scene').getAnimations().flatMap(animation => animation.effect.getKeyframes()).some(frame => frame.transform || frame.translate);
  });
  assert.equal(motion, false, 'outgoing scene fades before the full animated handoff');
  await menu.locator('#overlay.open[data-moving=false]').waitFor();
  console.log('PASS full animations remain enabled with the operating-system reduced-motion preference.');
  await page.close();
} finally { await browser.close(); }
