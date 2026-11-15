// Kiểm thử: gõ tên công trình ở ô tìm kiếm → chọn → nhập quy mô → tóm tắt yêu cầu chính
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const f = 'file://' + process.argv[2];
  const res = []; const ok = (name, cond, info) => res.push((cond ? 'ĐẠT  ' : 'LỖI  ') + name + (cond ? '' : ' → ' + String(JSON.stringify(info)).slice(0, 400)));
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.setDefaultTimeout(4000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(f); await p.waitForTimeout(300);
  const typeIn = async (sel, t) => { await p.click(sel, { clickCount: 3 }); await p.keyboard.press('Control+A'); await p.keyboard.press('Backspace'); if (t) await p.keyboard.type(t); await p.waitForTimeout(150); };
  await p.fill('#q', 'khach san'); await p.waitForTimeout(300);
  ok('Gõ "khach san" (không dấu) ở ô tìm kiếm → gợi ý công trình', (await p.$$('[data-ctgo]')).length > 0, await p.innerText('#view'));
  await p.click('[data-ctgo]'); await p.waitForTimeout(300);
  ok('Bấm gợi ý → mở Tra theo công trình với Khách sạn', /Khách sạn/.test(await p.$eval('.ct-form .sel', e => e.innerText)) && (await p.inputValue('#q')) === '');
  await typeIn('#cth', '45'); await typeIn('#ctn', '13'); await typeIn('#cta', ''); await typeIn('#ctat', '19500'); await typeIn('#ctv', '78000');
  const sum = await p.innerText('.ct-key');
  ok('Tổng 19 500 m² ÷ 13 tầng → 1.500 m²/tầng (ước tính)', /1\.500 m²\/tầng \(ước tính\)/.test(await p.innerText('.ct-sum')), await p.innerText('.ct-sum'));
  ok('Tóm tắt có nhóm Kết cấu và Kiến trúc', /KẾT CẤU|Kết cấu/i.test(sum) && /Kiến trúc/i.test(sum), sum.slice(0, 300));
  for (const k of ['Bậc chịu lửa', 'Giới hạn chịu lửa kết cấu', 'Số lối ra thoát nạn', 'Buồng thang bộ', 'Bản thang, lối ra', 'Khoảng cách thoát nạn', 'Đường, bãi đỗ xe chữa cháy', 'Thang máy chữa cháy'])
    ok('Tóm tắt có "' + k + '"', sum.includes(k), sum.slice(0, 200));
  ok('Khách sạn 45 m: thang máy chữa cháy bắt buộc', /Thang máy chữa cháy\s+Lưu ý|Thang máy chữa cháy mỗi khoang/.test(sum), sum.match(/Thang máy chữa cháy[\s\S]{0,120}/));
  // cảnh báo
  await typeIn('#cth', '160');
  ok('Cao 160 m → mục "Cần xử lý" ở đầu tóm tắt', /Cần xử lý/.test(await p.innerText('.ct-key')));
  // Không gợi ý khi gõ thuật ngữ không phải tên công trình
  await p.fill('#q', 'REI 150'); await p.waitForTimeout(300);
  ok('Gõ "REI 150" → không hiện gợi ý công trình', (await p.$$('[data-ctgo]')).length === 0);
  await p.fill('#q', 'nha xuong'); await p.waitForTimeout(300);
  const xs = await p.$$eval('[data-ctgo] span', x => x.map(e => e.textContent));
  ok('Gõ "nha xuong" → gợi ý nhà sản xuất', xs.length > 0, xs);
  await p.fill('#q', ''); await p.waitForTimeout(100);
  // Kiểm tra trên toàn bộ danh mục: mọi công trình đều có tóm tắt đủ mục chính
  const miss = await p.evaluate(() => { const bad = []; CT.forEach((c, i) => [9, 30, 60].forEach(h => { const r = ctEvaluate({ i, h, n: Math.round(h / 3.3), nb: 1, at: 12000, sp: true, hang: "C" }); const rows = ctSummaryRows(r.out).map(x => x.label);
      ["Bậc chịu lửa", "Số lối ra thoát nạn", "Bản thang, lối ra", "Đường, bãi đỗ xe chữa cháy"].forEach(k => { if (!rows.includes(k) && !(c.g === "F1.4" && h <= 9)) bad.push(c.n + " " + h + " m: thiếu " + k); }); })); return bad; });
  ok('Toàn bộ danh mục công trình × 3 chiều cao: tóm tắt đủ mục chính', miss.length === 0, miss.slice(0, 6));
  await p.goto(f + '#cong-trinh'); await p.waitForTimeout(250);
  ok('Không tràn ngang 390 px', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  await p.evaluate(() => document.querySelector('.ct-key').scrollIntoView()); await p.screenshot({ path: process.argv[3] + '-sum.png' });
  ok('Không lỗi JS', errs.length === 0, errs);
  await b.close();
  console.log(res.join('\n')); console.log(`${res.filter(r => r.startsWith('ĐẠT')).length}/${res.length}`);
})();
