// Đo hiệu năng: tải trang, vẽ các màn hình, gõ phím, độ dài trang
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); // giả lập điện thoại tầm trung
  const reqs = []; p.on('request', r => { if (!r.url().startsWith('file:')) reqs.push(r.url().slice(0, 80)); });
  const t0 = Date.now(); await p.goto('file://' + process.argv[2], { waitUntil: 'load' }); const load = Date.now() - t0;
  const fcp = await p.evaluate(() => (performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime || 0);
  const out = { 'tải trang (ms)': load, 'FCP (ms)': Math.round(fcp), 'yêu cầu mạng ngoài': reqs.length, 'DOM nút trang chủ': await p.evaluate(() => document.querySelectorAll('*').length) };
  for (const h of ['cong-trinh', 'hon-hop', 'gian-phong', 'tinh-thoat-nan', 'thoat-nan', 'so-do']) {
    const r = await p.evaluate(h => new Promise(res => { const t = performance.now(); location.hash = h; requestAnimationFrame(() => setTimeout(() => res([performance.now() - t, document.documentElement.scrollHeight, document.querySelectorAll('#view *').length]), 0)); }), h);
    out['#' + h] = `${Math.round(r[0])} ms · cao ${r[1]} px · ${r[2]} nút`;
  }
  await p.evaluate(() => location.hash = 'cong-trinh'); await p.waitForTimeout(200);
  const ty = await p.evaluate(() => { const el = document.getElementById('cth'); const t = performance.now(); for (let i = 0; i < 10; i++) { el.value = String(20 + i); el.dispatchEvent(new Event('input', { bubbles: true })); } return (performance.now() - t) / 10; });
  out['gõ 1 phím Toàn nhà (ms)'] = Math.round(ty);
  await p.evaluate(() => location.hash = 'tinh-thoat-nan'); await p.waitForTimeout(200);
  const ty2 = await p.evaluate(() => { const el = document.querySelector('.tna'); const t = performance.now(); for (let i = 0; i < 10; i++) { el.value = String(500 + i); el.dispatchEvent(new Event('input', { bubbles: true })); } return (performance.now() - t) / 10; });
  out['gõ 1 phím Thoát nạn (ms)'] = Math.round(ty2);
  console.log(JSON.stringify(out, null, 1), reqs); await b.close(); })();
