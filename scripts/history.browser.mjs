import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true });
try {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    for (const [width, height] of [[1440, 960], [390, 844], [320, 568]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Abrir menú ilustrado' }).click();
    const menu = page.frameLocator('.nightfall-menu iframe');
    await menu.locator('#scene[data-arrival=settled]').waitFor();
    await menu.locator('.menu-item.story').click();
    await menu.locator('#overlay.open[data-moving=false]').waitFor();
    const result = await menu.locator('.section-eyes').evaluate(svg => {
      const eyes = [...svg.querySelectorAll('.pose-eye-aperture')];
      const animation = eyes[0]?.getAnimations()[0];
      if (!animation) return { count: eyes.length, hasAnimation: false };
      animation.pause();
      animation.currentTime = 5.8 * 1000 * .62;
      const open = getComputedStyle(eyes[0]).transform;
      animation.currentTime = 5.8 * 1000 * .646;
      const closed = getComputedStyle(eyes[0]).transform;
      return { count: eyes.length, hasAnimation: true, open, closed, box: svg.getBoundingClientRect().toJSON() };
    });
    assert.equal(result.count, 2, 'History portrait has both eye lids');
    assert.equal(result.hasAnimation, true, `History portrait eyes animate: ${JSON.stringify(result)}`);
    assert.notEqual(result.open, result.closed, 'Blink visibly closes the eyes');
    assert.ok(result.box.width > 0 && result.box.height > 0, 'Animated eyes align over the visible portrait');
    const mapping = await menu.locator('.section-eyes').evaluate(svg => {
      const origin = new DOMPoint(578, 496).matrixTransform(svg.querySelector('.pose-eyes').getScreenCTM());
      const second = new DOMPoint(804, 342).matrixTransform(svg.querySelector('.pose-eyes').getScreenCTM());
      const rect = svg.getBoundingClientRect();
      return {
        actualX: origin.x, expectedX: rect.left + rect.width * (.5 + (578 - 740) * .82 / 1000),
        actualY: origin.y, expectedY: rect.top + rect.height * (.5 + (496 - 420) * .82 / 1000),
        secondX: second.x, expectedSecondX: rect.left + rect.width * (.5 + (804 - 740) * .82 / 1000),
        secondY: second.y, expectedSecondY: rect.top + rect.height * (.5 + (342 - 420) * .82 / 1000),
      };
    });
    assert.ok(Math.abs(mapping.actualX - mapping.expectedX) < 1, 'Eye overlay uses original portrait camera coordinates');
    assert.ok(Math.abs(mapping.actualY - mapping.expectedY) < 1 && Math.abs(mapping.secondY - mapping.expectedSecondY) < 1 && Math.abs(mapping.secondX - mapping.expectedSecondX) < 1, 'Both eyelids stay aligned on desktop and mobile');
    if (process.argv[2] && reducedMotion === 'no-preference') {
      await menu.locator('.section-character').scrollIntoViewIfNeeded();
      for (const [name, fraction] of [['open', .62], ['closed', .646]]) {
        await menu.locator('.section-eyes').evaluate((svg, time) => {
          svg.getAnimations({ subtree: true }).forEach(animation => {
            animation.pause();
            animation.currentTime = 5800 * time;
          });
        }, fraction);
        await page.screenshot({ path: `${process.argv[2]}/history-${width}-${name}.png` });
      }
    }
    await page.close();
    }
  }
  console.log('PASS history copy, entrance motion, eye overlays and blinking (including reduced-motion mode).');
} finally {
  await browser.close();
}
