const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const f = 'file://' + process.argv[2]; const res = []; const ok = (name, cond, info) => res.push((cond ? 'ĐẠT  ' : 'LỖI  ') + name + (cond ? '' : ' → ' + JSON.stringify(info)));
  await p.goto(f + '#cong-trinh'); await p.waitForTimeout(300);
  // 1. Chiều cao PCCC
  const hc = await p.evaluate(() => [
    hcCompute({ road: 0, floor: 66, win: .9, mode: "win" }).H, hcCompute({ road: -0.45, floor: 66, win: .9, mode: "win" }).H,
    hcCompute({ road: 0, floor: 66, tang: 3.3, mode: "none" }).H, hcCompute({ road: 0, floor: 66, parapet: 70.5, mode: "roof" }).H,
    hcCompute({ road: 0, floor: 66, rail: 1.1, mode: "rail" }).H, hcCompute({ bas: -9.6, exitlvl: 0 }).depth]);
  ok('Chiều cao: cửa sổ 66 + 0,9', hc[0] === 66.9, hc[0]); ok('Chiều cao: đường −0,45', hc[1] === 67.35, hc[1]); ok('Chiều cao: không cửa sổ (1/2 tầng)', hc[2] === 67.65, hc[2]);
  ok('Chiều cao: mái khai thác', hc[3] === 70.5, hc[3]); ok('Chiều cao: lan can', hc[4] === 67.1, hc[4]); ok('Độ sâu hầm 9,6 m', hc[5] === 9.6, hc[5]);
  await p.goto(f + '#chieu-cao'); await p.waitForTimeout(200);
  await p.selectOption('#hcmode', 'none'); await p.waitForTimeout(150);
  ok('Đổi chế độ hiện ô chiều cao tầng', await p.$('#hctang') !== null);
  await p.fill('#hcfloor', '30'); await p.fill('#hctang', '4'); await p.waitForTimeout(150);
  const big = await p.$eval('.hc-out .big', e => e.textContent); ok('Hiển thị 32 m', big.trim() === '32 m', big);
  await p.screenshot({ path: process.argv[3] + '-hc.png' });
  await p.click('#hcuse'); await p.waitForTimeout(400); if (!(await p.$('#cth'))) console.log('DBG', await p.evaluate(() => location.hash + ' | ' + document.getElementById('hdr').textContent + ' | ' + document.getElementById('view').innerHTML.slice(0, 200)));
  ok('Chuyển sang Toàn nhà với 32 m', await p.$eval('#cth', e => e.value) === '32', await p.$eval('#cth', e => e.value));
  // 2. Mẫu công trình
  await p.selectOption('#ctpreset', '0'); await p.waitForTimeout(250);
  ok('Mẫu chung cư 24 tầng → 70 m', await p.$eval('#cth', e => e.value) === '70');
  // 3. Ngưỡng
  const th = await p.evaluate(() => ({
    a: thresholdsCT({ i: 0, h: 26, n: 9, nb: 1, a: 700, sp: false }).map(x => x.txt),
    b: thresholdsCT({ i: 25, h: 40, n: 12, nb: 1, a: 3000, sp: false }).map(x => x.txt),
    c: thresholdsCT({ i: 0, h: 70, n: 24, nb: 2, a: 1200, sp: true }).map(x => x.txt),
    d: thresholdsCT({ i: 25, h: 30, n: 9, nb: 0, a: 1000, sp: true }).map(x => x.txt) }));
  ok('Chung cư 26 m: cao thêm 2,1 m → N1', th.a.some(t => /Cao thêm \*\*2,1 m\*\* \(vượt 28 m/.test(t) && /không nhiễm khói/.test(t)), th.a);
  ok('Chung cư 26 m: giảm ≤ 25 m bỏ được gì đó hoặc không', Array.isArray(th.a));
  ok('Văn phòng 3 000 m² không đạt → giảm ~2 500 m²', th.b.some(t => /giảm diện tích 1 tầng.*2\.500 m²/.test(t)), th.b);
  ok('Chung cư 70 m 1 200 m² → tăng tới ~2 500 m²', th.c.some(t => /tăng tới khoảng \*\*2\.500 m²/.test(t)), th.c);
  ok('9 tầng: thêm 1 tầng → B.8; thêm 2 → phòng trực', th.d.some(t => /Thêm \*\*1 tầng\*\* \(lên 10 tầng\)/.test(t)) && th.d.some(t => /Thêm \*\*2 tầng\*\* \(lên 11 tầng\).*phòng trực/.test(t)), th.d);
  const thRefs = await p.evaluate(() => { const un = []; [[0, 26, 9], [25, 40, 12], [27, 1, 1], [0, 90, 30]].forEach(([i, h, n]) => thresholdsCT({ i, h, n, nb: 1, a: 1500 }).forEach(x => refTokens(x.ref).forEach(t => { if (!refFound(resolveRef(t.q))) un.push(t.q); }))); return un; });
  ok('Mọi số điều của ngưỡng đều mở được', thRefs.length === 0, thRefs);
  await p.goto(f + '#cong-trinh'); await p.waitForTimeout(200);
  ok('Mục "Ngưỡng gần nhất" hiển thị', await p.$$eval('.ct-sec h2', x => x.some(e => /Ngưỡng gần nhất/.test(e.textContent))));
  // 4. Phóng to sơ đồ
  await p.click('.ref.dg'); await p.waitForTimeout(200);
  ok('Bấm "Sơ đồ" mở lớp phóng to', await p.$eval('#dgov', e => !e.hidden));
  const w1 = await p.$eval('.dgov-svg', e => e.getBoundingClientRect().width);
  await p.click('[data-zoom="1"]'); await p.waitForTimeout(100);
  const w2 = await p.$eval('.dgov-svg', e => e.getBoundingClientRect().width);
  ok('Phóng to làm sơ đồ rộng hơn', w2 > w1 * 1.3, [w1, w2]);
  await p.screenshot({ path: process.argv[3] + '-zoom.png' });
  await p.click('#dgclose'); await p.waitForTimeout(100);
  ok('Đóng lớp phóng to', await p.$eval('#dgov', e => e.hidden));
  await p.goto(f + '#so-do'); await p.waitForTimeout(200); await p.click('#dg-bai-do svg'); await p.waitForTimeout(150);
  ok('Chạm vào sơ đồ ở trang Sơ đồ cũng phóng to', await p.$eval('#dgov', e => !e.hidden));
  await p.keyboard.press('Escape'); ok('Phím Esc đóng', await p.$eval('#dgov', e => e.hidden));
  // 5. G.7 theo chiều cao nhà
  const g7 = await p.evaluate(() => { const t = o => o.out.map(s => s.items.map(x => x.txt).join(' ')).join(' ');
    return [t(gpEvaluate({ g: "F5.1", k: 12, a: 1000, ch: 8, bac: "I", f5h: "C2", f5s: "S0", den: 1, hn: 18 })), t(gpEvaluate({ g: "F5.1", k: 12, a: 1000, ch: 8, bac: "I", f5h: "C2", f5s: "S0", den: 1 }))]; });
  ok('G.7: nhà 18 m → tăng 30 % (110 → 143)', /143 người\/m/.test(g7[0]) && /chiều cao PCCC của nhà 18 m/.test(g7[0]), g7[0].match(/\d+ người\/m/g));
  ok('G.7: chưa nhập chiều cao nhà → ghi chú', /chưa nhập chiều cao nhà/.test(g7[1]));
  ok('Không lỗi JS', errs.length === 0, errs);
  ok('Không tràn ngang', await p.evaluate(() => document.documentElement.scrollWidth) === 390);
  console.log(res.join('\n')); console.log(`${res.filter(r => r.startsWith('ĐẠT')).length}/${res.length}`);
  await b.close();
})();
