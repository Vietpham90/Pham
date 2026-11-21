// Tìm trong sổ tay, tra nhóm F, lưu mục ★
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const f = 'file://' + process.argv[2]; const res = []; const ok = (n, c, i) => res.push((c ? 'ĐẠT  ' : 'LỖI  ') + n + (c ? '' : ' → ' + String(JSON.stringify(i)).slice(0, 260)));
  await p.goto(f); await p.waitForTimeout(300);
  // [từ khóa, chữ phải có trong tiêu đề hoặc đoạn trích của kết quả đầu]
  const Q = [["khoang đệm", /khoang đệm/i], ["REI 150", /REI 150/], ["hanh lang cut", /hành lang cụt|cụt/i], ["N1", /N1/], ["đai ngăn cháy", /đai ngăn cháy/i], ["bãi đỗ xe chữa cháy", /bãi đỗ/i],
    ["thang máy chữa cháy", /thang máy chữa cháy/i], ["G.9", /G\.9/], ["3.2.6.1", /3\.2\.6\.1/], ["Bảng E.1", /E\.1/], ["tầng lánh nạn", /lánh nạn/i], ["tang ham", /tầng hầm|hầm/i],
    ["khoảng cách phòng cháy", /khoảng cách/i], ["bậc chịu lửa", /bậc chịu lửa/i], ["F5.2", /F5\.2/], ["cửa ngăn cháy loại 2", /cửa ngăn cháy/i], ["sprinkler", /sprinkler|chữa cháy tự động/i], ["1,2 m", /1,2 m/]];
  const bad = [];
  for (const [q, re] of Q) { await p.fill('#q', q); await p.waitForTimeout(200);
    const r = await p.evaluate(() => { const li = document.querySelector('.results li'); return { n: document.querySelectorAll('.results li').length, first: li ? li.innerText : '' }; });
    if (!r.n) bad.push(q + ': không có kết quả'); else if (!re.test(r.first)) bad.push(q + ': kết quả đầu không liên quan → ' + r.first.slice(0, 80).replace(/\n/g, ' | ')); }
  ok(`${Q.length} từ khóa tra cứu thường dùng đều ra kết quả liên quan ở đầu`, bad.length === 0, bad); if (bad.length) console.log(bad.join('\n'));
  // bấm kết quả → mở đúng mục và cuộn tới
  await p.fill('#q', 'khoang đệm ngăn cháy'); await p.waitForTimeout(200); await p.click('.results li button'); await p.waitForTimeout(400);
  ok('Bấm kết quả → mở đúng mục, mục đang mở', await p.evaluate(() => { const d = [...document.querySelectorAll('details[open]')]; return d.length > 0 && d.some(x => /khoang đệm/i.test(x.innerText)); }));
  // Tra nhanh nhóm F
  await p.fill('#q', ''); await p.goto(f + '#tra-nhanh'); await p.waitForTimeout(300);
  const fq = async q => { await p.fill('#fq', q); await p.waitForTimeout(150); return p.$eval('#fres', e => e.innerText); };
  const F = [["karaoke", "F2.1"], ["phòng khám", "F3.4"], ["gara", "F5"], ["thư viện", "F2.1"], ["chung cư", "F1.3"], ["khach san", "F1.2"], ["nhà sách", "F3.1"], ["data center", null]];
  const fb = []; for (const [q, g] of F) { const t = await fq(q); if (g && !t.includes(g)) fb.push(q + ' → ' + t.slice(0, 60)); }
  ok('Tra nhóm F theo Bảng 6 (karaoke, phòng khám, gara, thư viện, chung cư, khách sạn không dấu, nhà sách)', fb.length === 0, fb);
  const dc = await fq('trung tâm dữ liệu'); ok('"trung tâm dữ liệu" → F5.2 (Bảng 6)', /F5\.2/.test(dc), dc.slice(0, 120));
  // Lưu mục ★ → Đã lưu → bỏ lưu
  await p.goto(f + '#thoat-nan'); await p.waitForTimeout(300);
  await p.click('[data-star]'); await p.waitForTimeout(150);
  await p.goto(f + '#da-luu'); await p.waitForTimeout(250);
  const n1 = (await p.$$('.results li')).length; ok('Lưu ★ → có trong Đã lưu', n1 >= 1, n1);
  await p.click('.results li button'); await p.waitForTimeout(300);
  ok('Mở mục đã lưu → về đúng mục', /Thoát nạn/.test(await p.$eval('#hdr', e => e.textContent)), await p.$eval('#hdr', e => e.textContent));
  await p.click('details[open] [data-star]'); await p.waitForTimeout(150); await p.goto(f + '#da-luu'); await p.waitForTimeout(250);
  ok('Bỏ ★ → mục biến khỏi Đã lưu', (await p.$$('.results li')).length === n1 - 1);
  // nút quay lại của điện thoại
  await p.goto(f); await p.waitForTimeout(200); await p.click('[data-go="cong-trinh"]'); await p.waitForTimeout(200); await p.click('[data-go="gian-phong"]'); await p.waitForTimeout(200);
  await p.goBack(); await p.waitForTimeout(250);
  ok('Nút quay lại của trình duyệt → về Toàn nhà', await p.evaluate(() => location.hash === '#cong-trinh' && !!document.getElementById('cth')));
  ok('Không lỗi JS', errs.length === 0, errs);
  console.log(res.join('\n')); console.log(`${res.filter(r => r.startsWith('ĐẠT')).length}/${res.length}`); await b.close(); })();
