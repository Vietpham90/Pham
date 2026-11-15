const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const f = 'file://' + process.argv[2];
  const res = []; const ok = (name, cond, info) => res.push((cond ? 'ĐẠT  ' : 'LỖI  ') + name + (cond ? '' : ' → ' + JSON.stringify(info).slice(0, 300)));
  // A. Dấu phẩy thập phân, dấu cách hàng nghìn
  let ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'vi-VN' }); let p = await ctx.newPage(); p.setDefaultTimeout(4000);
  let errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(f + '#cong-trinh'); await p.waitForTimeout(300);
  const typeIn = async (sel, text) => { await p.click(sel, { clickCount: 3 }); await p.keyboard.press('Control+A'); await p.keyboard.type(text); await p.waitForTimeout(120); };
  const types = await p.$$eval('.ct-form input', x => [...new Set(x.map(e => e.type))]);
  ok('Ô số nhận được dấu phẩy (không dùng type=number thuần)', !types.includes('number'), types);
  await typeIn('#cth', '28,5');
  const chip = await p.$eval('.ct-sum', e => e.innerText);
  ok('Gõ "28,5" → hiểu là 28,5 m', /28[.,]5 m/.test(chip), chip);
  ok('28,5 m → yêu cầu N1', /phải có N1/.test(await p.$eval('#ctres', e => e.innerText)));
  await typeIn('#cta', '1 200');
  ok('Gõ "1 200" → 1 200 m²', /1\.200 m²\/tầng|1 200/.test(await p.$eval('#ctres', e => e.innerText)), (await p.$eval('#ctres', e => e.innerText)).match(/[\d. ]+ m²\/tầng/));
  await p.goto(f + '#gian-phong'); await p.waitForTimeout(250);
  await typeIn('#gpch', '4,5'); await typeIn('#gpa', '600');
  ok('Gian phòng: chiều cao "4,5"', /2\.700 m³/.test(await p.$eval('#gpres', e => e.innerText)), (await p.$eval('#gpres', e => e.innerText)).match(/[\d.]+ m³/));
  await p.goto(f + '#cong-trinh'); await p.waitForTimeout(250);
  await typeIn('#cth', '67,35');
  ok('Chiều cao nhập tay "67,35" → 67,35 m', /67,35 m/.test(await p.$eval('.ct-sum', e => e.innerText)), await p.$eval('.ct-sum', e => e.innerText));
  console.log('A xong');
  // B. Giá trị biên
  const edge = await p.evaluate(() => { const bad = []; const re = /NaN|undefined|Infinity|null/;
    const cases = [{ i: 0, h: -5, n: 0, nb: -1, a: -100 }, { i: 0, h: "", n: "", nb: "", a: "" }, { i: 0, h: 1e6, n: 1e4, nb: 9, a: 1e9 }, { i: 999, h: 20, n: 5 }, { i: 27, h: 10, n: 1, hang: "Z" }];
    cases.push({ i: 0, h: 30, n: 9, a: -100 }, { i: 0, h: -30, n: -2, a: 'abc' }); cases.forEach(v => { try { const o = ctEvaluate(v); o.out.forEach(s => s.items.forEach(x => { if (re.test(x.txt)) bad.push([v, x.txt.slice(0, 80)]); })); thresholdsCT(v); } catch (e) { bad.push([v, e.message]); } });
    [{ g: "F3.1", k: 99, a: -5, ch: 0 }, { g: "F5.1", k: 12, a: 1000, ch: 5, f5h: "Z", f5s: "S9", den: -1 }, { g: "ZZ", k: 0, a: 100, ch: 3 }].forEach(v => { try { gpEvaluate(v).out.forEach(s => s.items.forEach(x => { if (re.test(x.txt)) bad.push([v, x.txt.slice(0, 80)]); })); } catch (e) { bad.push([v, e.message]); } });
    try { mxEvaluate({ h: 30, n: 10, nb: 0, parts: [] }); mxEvaluate({ h: 30, n: 10, nb: 0, parts: [{ i: 999, from: 1, to: 2 }] }); } catch (e) { bad.push(["mx", e.message]); }
    return bad; });
  ok('Giá trị biên (âm, rỗng, quá lớn, mã sai) không gây lỗi', edge.length === 0, edge);
  ok('Không lỗi JS (phần A, B)', errs.length === 0, errs);
  await ctx.close();
  console.log('B xong');
  // C. Dữ liệu lưu bị hỏng / phiên bản cũ
  ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); p = await ctx.newPage(); p.setDefaultTimeout(4000); errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(f); await p.waitForTimeout(200);
  await p.evaluate(() => {
    localStorage.setItem("pccc-ct", JSON.stringify({ i: 999, h: "abc", n: null }));
    localStorage.setItem("pccc-mx", JSON.stringify({ h: 30, n: 10, parts: [{ i: 999, from: 1, to: 3 }, { i: 0, from: "x", to: null }] }));
    localStorage.setItem("pccc-gp", JSON.stringify({ g: "F9.9", k: 999, f5h: "Q" }));
    localStorage.setItem("pccc-projects", JSON.stringify([{ id: "x", rows: null }, { title: "cũ" }]));
    localStorage.setItem("pccc-report-draft", "{hỏng");
    localStorage.setItem("pccc-saved", JSON.stringify(["khong-ton-tai--3", 5, null]));
    localStorage.setItem("pccc-hc", "[]");
  });
  for (const h of ['', '#cong-trinh', '#hon-hop', '#gian-phong', '#du-an', '#phieu', '#da-luu', '#chieu-cao', '#tra-nhanh', '#so-do', '#khong-co-trang-nay', '#settings']) {
    await p.goto(f + h); await p.waitForTimeout(150);
    const blank = await p.$eval('#view', e => e.innerText.trim().length < 20);
    if (blank) errs.push('trang trống: ' + h);
  }
  ok('Dữ liệu lưu bị hỏng: mọi trang vẫn mở được', errs.length === 0, errs);
  await p.goto(f + '#cong-trinh'); await p.waitForTimeout(200);
  try { await p.click('[data-report="ct"]'); await p.waitForTimeout(150); ok('Tạo phiếu sau khi dữ liệu hỏng', (await p.$$('.rp-row')).length > 0); } catch (e) { ok('Tạo phiếu sau khi dữ liệu hỏng', false, e.message); }
  await p.goto(f + '#hon-hop'); await p.waitForTimeout(200);
  try { await p.click('[data-report="mx"]'); await p.waitForTimeout(150); ok('Tạo phiếu hỗn hợp với phần lỗi', (await p.$$('.rp-row')).length > 0, errs); } catch (e) { ok('Tạo phiếu hỗn hợp với phần lỗi', false, e.message); }
  await p.goto(f + '#gian-phong'); await p.waitForTimeout(200);
  try { await p.click('[data-report="gp"]'); await p.waitForTimeout(150); ok('Tạo phiếu gian phòng với dữ liệu lỗi', (await p.$$('.rp-row')).length > 0, errs); } catch (e) { ok('Tạo phiếu gian phòng với dữ liệu lỗi', false, e.message); }
  ok('Không lỗi JS (phần C)', errs.length === 0, errs);
  console.log('C xong');
  // D. Tìm kiếm ký tự đặc biệt, điều hướng
  errs = [];
  await p.goto(f); await p.waitForTimeout(150);
  for (const t of ['(', '[', '*', '+?', '\\', 'REI 150)', 'đ', 'ĐƯỜNG', '  ', 'a'.repeat(300), '<script>', 'F1.3']) { await p.fill('#q', t); await p.waitForTimeout(140); }
  ok('Tìm kiếm ký tự đặc biệt không lỗi', errs.length === 0, errs);
  ok('Không chèn mã qua ô tìm kiếm', await p.evaluate(() => !document.querySelector('#view script')));
  await p.fill('#q', 'duong xe chua chay'); await p.waitForTimeout(200);
  ok('Tìm không dấu "duong xe chua chay" có kết quả', (await p.$$('.results li')).length > 0);
  await p.click('#clearQ'); await p.goto(f + '#thoat-nan'); await p.waitForTimeout(150);
  const star = await p.$('[data-star]'); const det = await p.$('details'); const before = await det.evaluate(e => e.open);
  await star.click(); await p.waitForTimeout(100);
  ok('Bấm lưu mục không làm gập/mở mục', (await det.evaluate(e => e.open)) === before);
  await p.click('#backBtn'); await p.waitForTimeout(150);
  ok('Nút quay lại về Mục lục', await p.evaluate(() => !!document.querySelector('.toc')));
  console.log('D xong');
  // E. Hiệu năng
  await p.goto(f + '#cong-trinh'); await p.waitForTimeout(200);
  const t = await p.evaluate(() => { const v = { i: 0, h: 70, n: 24, nb: 2, a: 1200, sp: true }; const t0 = performance.now(); for (let k = 0; k < 20; k++) { ctEvaluate(v); thresholdsCT(v); } return (performance.now() - t0) / 20; });
  ok(`Thời gian tính 1 lần (kết quả + ngưỡng): ${t.toFixed(1)} ms`, t < 60, t);
  const tmx = await p.evaluate(() => { const t0 = performance.now(); for (let k = 0; k < 20; k++) mxResult(); return (performance.now() - t0) / 20; });
  ok(`Thời gian hiển thị nhà hỗn hợp: ${tmx.toFixed(1)} ms`, tmx < 80, tmx);
  // F. Nền tối các màn hình mới
  await ctx.close(); ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' }); p = await ctx.newPage(); p.setDefaultTimeout(4000);
  const low = await p.evaluate(() => 0);
  for (const h of ['#tinh-thoat-nan', '#cong-trinh']) {
    await p.goto(f + h); await p.waitForTimeout(250);
    const bad = await p.evaluate(() => { const lum = c => { const m = c.match(/\d+(\.\d+)?/g); if (!m) return 1; const [r, g, b] = m.slice(0, 3).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
      const bgOf = el => { while (el) { const c = getComputedStyle(el).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; el = el.parentElement; } return getComputedStyle(document.body).backgroundColor; };
      const out = []; document.querySelectorAll('#view *').forEach(el => { if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const fg = getComputedStyle(el).color, bg = bgOf(el); const L1 = lum(fg), L2 = lum(bg); const cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05); if (cr < 3) out.push([el.tagName, el.textContent.trim().slice(0, 30), cr.toFixed(2)]); }); return out.slice(0, 8); });
    ok('Nền tối ' + h + ': tương phản chữ ≥ 3:1', bad.length === 0, bad);
    await p.screenshot({ path: process.argv[3] + '-dark' + h.replace('#', '-') + '.png' });
  }
  await b.close();
  console.log(res.join('\n')); console.log(`${res.filter(r => r.startsWith('ĐẠT')).length}/${res.length}`);
})();
