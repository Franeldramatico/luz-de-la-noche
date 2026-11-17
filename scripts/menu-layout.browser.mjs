import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:5173';
const browser = await chromium.launch({ headless: true });
try {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const page = await browser.newPage({ reducedMotion });
    for (const [width, height] of [[1917, 932], [1920, 1080], [1366, 768], [2560, 1080]]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${base}/menu.html`);
      await page.locator('#scene[data-arrival=landing]').waitFor();
      assert.ok(await page.locator('.menu-arrival-effects ellipse').count() >= 3, 'Splash rings must appear, regardless of OS motion settings');
      await page.locator('#scene[data-arrival=settled]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const layout = await page.evaluate(() => ({
        scene: document.querySelector('#scene').getBoundingClientRect().toJSON(),
        labels: [...document.querySelectorAll('.menu-item')].map(el => el.getBoundingClientRect().toJSON()),
      }));
      assert.ok(layout.scene.left <= 1 && layout.scene.right >= width - 1);
      assert.ok(layout.scene.top <= 1 && layout.scene.bottom >= height - 1);
      for (const rect of layout.labels) {
        assert.ok(rect.top >= 0 && rect.bottom <= height - 16, `Menu clipped at ${width}×${height}`);
        assert.ok(rect.left >= 0 && rect.right <= width);
      }
      const blink = await page.locator('.menu-eyelid').first().evaluate(el => {
        const animation = el.getAnimations()[0];
        if (!animation) return null;
        animation.pause();
        animation.currentTime = 0;
        const opened = { opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform };
        animation.currentTime = 6400 * .458;
        const closed = { opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform };
        return { opened, closed, state: getComputedStyle(el).visibility };
      });
      assert.ok(blink, 'Eyelids must have a blink animation');
      assert.notDeepEqual(blink.opened, blink.closed, 'Blink must visibly close the eyes');
      assert.equal(blink.state, 'visible');
      console.log(`PASS ${width}×${height}, ${reducedMotion}: edge-to-edge artwork, complete menu, visible blink.`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
