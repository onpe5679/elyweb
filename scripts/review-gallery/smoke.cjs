const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const base = process.env.REVIEW_URL || 'http://127.0.0.1:3230/elyweb/';
  const entries = JSON.parse(fs.readFileSync(path.join(__dirname, '../../review-gallery/data.json')));
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  try {
    await page.goto(base);
    await page.locator('.card').last().waitFor();
    assert.equal(await page.locator('.card').count(), entries.length);
    await page.locator('.compare-toggle').nth(0).click();
    await page.locator('.compare-toggle').nth(1).click();
    await page.locator('#open-compare').click();
    assert.equal(await page.locator('dialog').evaluate(e=>e.open), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog').evaluate(e=>e.open), false);
    await page.locator('#editorial summary').click();
    await page.locator('#note-editorial').fill('검토 메모 저장 확인');
    await page.reload();
    await page.locator('#note-editorial').waitFor({state:'attached'});
    assert.equal(await page.locator('#note-editorial').inputValue(),'검토 메모 저장 확인');
    await page.evaluate(()=>localStorage.clear());
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    for (const item of entries) {
      for (const [kind, suffix] of Object.entries(item.paths)) {
        const url = new URL(item.baseUrl + suffix, base).href;
        const errors = [];
        const handler = error => errors.push(error.message);
        page.on('pageerror', handler);
        const response = await page.goto(url, {waitUntil:'networkidle'});
        assert.equal(response.status(),200, url);
        await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.loading!=='lazy').map(i=>i.decode().catch(()=>{}))));
        const broken = await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.loading!=='lazy' && i.complete && i.naturalWidth===0).map(i=>i.src));
        assert.deepEqual(broken,[],`${item.id}/${kind} broken images`);
        assert.deepEqual(errors,[],`${item.id}/${kind} runtime errors`);
        page.off('pageerror',handler);
        console.log('OK',item.id,kind);
      }
    }
    console.log('Gallery comparison, notes, mobile layout and 15 preview entry pages passed.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
