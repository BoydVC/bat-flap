// Headless smoke test for Bat Flap. Reuses playwright-core from bridge-penalties (read-only) + system Chrome.
const { chromium } = require('/workspace/tokenmax/bridge-penalties/tests/node_modules/playwright-core');
const URL = process.env.URL || 'http://127.0.0.1:4361/';
const OUT = process.env.OUT || '/workspace/tokenmax/out-oct15';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const results = [];
  const errors = [];
  for (const profile of [
    { name: 'desktop', opts: { viewport: { width: 1280, height: 720 } } },
    { name: 'iphone', opts: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } },
  ]) {
    const ctx = await browser.newContext(profile.opts);
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(`[${profile.name}] console: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`[${profile.name}] pageerror: ${e.message}`));
    await page.goto(URL, { waitUntil: 'load' });
    await sleep(500);
    const s0 = await page.evaluate(() => BatFlap.state);
    if (profile.name === 'iphone') await page.tap('canvas', { position: { x: 200, y: 400 } });
    else await page.keyboard.press('Space');
    await sleep(150);
    const s1 = await page.evaluate(() => ({ state: BatFlap.state, audio: BatFlap.audio }));
    await page.evaluate(() => BatFlap.autopilot(true));
    const t0 = Date.now();
    let snap;
    while (Date.now() - t0 < 40000) {
      snap = await page.evaluate(() => ({ state: BatFlap.state, score: BatFlap.score, candy: BatFlap.candy }));
      if (snap.state !== 'play' || snap.score >= 12) break;
      await sleep(250);
    }
    if (profile.name === 'desktop') await page.screenshot({ path: `${OUT}/bat-flap-00-best.png` });
    else await page.screenshot({ path: `/workspace/tokenmax/bat-flap/screenshots/iphone-flight.png` });
    // stop flying -> should crash and reach game over
    await page.evaluate(() => BatFlap.autopilot(false));
    const t1 = Date.now(); let over;
    while (Date.now() - t1 < 10000) { over = await page.evaluate(() => ({ state: BatFlap.state, score: BatFlap.score, best: BatFlap.best, ls: localStorage.getItem('batflap.best') })); if (over.state === 'over') break; await sleep(200); }
    await sleep(900);
    await page.screenshot({ path: `/workspace/tokenmax/bat-flap/screenshots/${profile.name}-gameover.png` });
    // mute toggle
    await page.click('#mute'); const muted = await page.evaluate(() => BatFlap.muted);
    // restart works
    if (profile.name === 'iphone') await page.tap('canvas', { position: { x: 200, y: 600 } }); else await page.keyboard.press('Space');
    await sleep(150);
    const s2 = await page.evaluate(() => BatFlap.state);
    results.push({ profile: profile.name, title: s0, afterStart: s1, midFlight: snap, gameOver: over, mutedAfterClick: muted, afterRestart: s2 });
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify({ results, errors }, null, 2));
  const ok = results.every(r => r.title === 'title' && r.afterStart.state === 'play' && r.midFlight.score > 0 && r.gameOver.state === 'over' && String(r.gameOver.best) === r.gameOver.ls && r.afterRestart === 'play') && errors.length === 0;
  console.log(ok ? 'PASS' : 'FAIL');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
