// Kiểm thử sơ đồ: đủ 15 sơ đồ, chữ không tràn khung, số điều mở đúng sơ đồ, phóng to được
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const res = []; const ok = (n, c, i) => res.push((c ? 'ĐẠT  ' : 'LỖI  ') + n + (c ? '' : ' → ' + String(JSON.stringify(i)).slice(0, 300)));
  await p.goto('file://' + process.argv[2] + '#so-do'); await p.waitForTimeout(400);
  const n = await p.$$eval('.dgbox', x => x.length); ok('Có 15 sơ đồ', n === 15, n);
  ok('Mục lục sơ đồ dạng chip (15 nút)', (await p.$$('[data-dgjump]')).length === 15);
  const over = await p.evaluate(() => { const bad = []; document.querySelectorAll('.dgbox svg').forEach(svg => { const vb = svg.viewBox.baseVal; svg.querySelectorAll('text').forEach(t => { const bb = t.getBBox(); if (bb.x < -1 || bb.x + bb.width > vb.width + 1 || bb.y < -1 || bb.y + bb.height > vb.height + 2) bad.push([svg.closest('.dgbox').id, t.textContent.slice(0, 30), Math.round(bb.x + bb.width), Math.round(bb.y + bb.height)]); }); }); return bad; });
  ok('Chữ trong mọi sơ đồ nằm trong khung', over.length === 0, over);
  const map = await p.evaluate(() => [["1.4.60", "tang-ham"], ["3.2.13", "khan-cap"], ["3.3.5", "hanh-lang"], ["6.13", "thang-may-cc"], ["A.2.12", "thang-may-cc"], ["6.11", "loi-ra-mai"], ["6.5", "duong-tranh"], ["A.3.2", "lanh-nan"], ["6.2.1", "bai-do"], ["3.2.8", "loi-ra"]].map(([r, id]) => { const f = DIAG_FOR.find(([re]) => re.test(r)); return [r, f ? f[1] : null, id]; }).filter(x => x[1] !== x[2]));
  ok('Số điều liên kết đúng sơ đồ (1.4.60, 3.2.13, 3.3.5, 6.13, A.2.12, 6.11, 6.5, A.3.2…)', map.length === 0, map);
  await p.click('[data-dgjump="lanh-nan"]'); await p.waitForTimeout(600);
  ok('Bấm chip "Tầng lánh nạn" cuộn tới sơ đồ', await p.evaluate(() => { const r = document.getElementById('dg-lanh-nan').getBoundingClientRect(); return r.top >= 0 && r.top < 400; }));
  await p.click('#dg-thang-may-cc svg'); await p.waitForTimeout(300);
  ok('Bấm sơ đồ mới → phóng to', await p.evaluate(() => { const o = document.getElementById('dgov'); return !!o && !o.hidden && !!o.querySelector('svg'); }));
  const an = await p.evaluate(() => ({ flow: getComputedStyle(document.querySelector('.dgbox .flow')).animationName, flame: document.querySelectorAll('.dgbox .flame').length, sky: document.querySelectorAll('.dgbox .sky').length, legend: document.querySelectorAll('.dg-legend span').length }));
  ok('Hiệu ứng: mũi tên thoát nạn chuyển động, có lửa, bầu trời, chú giải 6 mục', an.flow === 'dgflow' && an.flame >= 5 && an.sky >= 4 && an.legend === 6, an);
  { const q = await (await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })).newPage(); await q.goto('file://' + process.argv[2] + '#so-do'); await q.waitForTimeout(300);
    ok('Máy bật "Giảm chuyển động" → tắt hiệu ứng', await q.evaluate(() => getComputedStyle(document.querySelector('.dgbox .flow')).animationName === 'none')); await q.context().close(); }
  const pos = async () => p.evaluate(() => [...document.querySelectorAll('#dg-khoang-cach .mover')].map(c => { const r = c.getBoundingClientRect(); return Math.round(r.x); }).join(','));
  const p1 = await pos(); await p.waitForTimeout(700); const p2 = await pos();
  ok('Người di chuyển theo hướng thoát nạn (vị trí thay đổi theo thời gian)', p1 && p1 !== p2, [p1, p2]);
  ok('Có xe chữa cháy chạy, mây trôi, thảm cỏ, sàn vân gạch', await p.evaluate(() => document.querySelectorAll('.dgbox .mtruck').length >= 2 && document.querySelectorAll('.dgbox .cloud').length >= 4 && document.querySelectorAll('.dgbox .grass').length >= 4 && getComputedStyle(document.querySelector('#dg-khoang-cach .corr')).fill.includes('dg-floor')));
  { const q = await (await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })).newPage(); await q.goto('file://' + process.argv[2] + '#so-do'); await q.waitForTimeout(300);
    ok('Giảm chuyển động → ẩn người chạy, xe chạy', await q.evaluate(() => [...document.querySelectorAll('.dgbox .mover, .dgbox .mtruck')].every(e => getComputedStyle(e).display === 'none'))); await q.context().close(); }
  ok('Vòng 3: lửa có quầng, cửa sổ sáng đèn, nước phun, vùng nóng, dấu an toàn', await p.evaluate(() => document.querySelectorAll('.dgbox .glow').length >= 5 && document.querySelectorAll('.dgbox .wn').length >= 40 && document.querySelectorAll('.dgbox .wn.lit').length >= 5 && document.querySelectorAll('#dg-dai-ngan-chay .drop').length >= 10 && !!document.querySelector('#dg-tuong-ngan-chay .heat') && !!document.querySelector('#dg-tuong-ngan-chay .safe')));
  await p.evaluate(() => document.getElementById('dg-tuong-ngan-chay').scrollIntoView()); await p.waitForTimeout(1600);
  ok('Cuộn tới sơ đồ → nét kích thước vẽ xong, nhãn hiện rõ', await p.evaluate(() => { const b = document.getElementById('dg-tuong-ngan-chay'); return b.classList.contains('in') && [...b.querySelectorAll('.dim')].every(l => parseFloat(getComputedStyle(l).strokeDashoffset) < .01) && [...b.querySelectorAll('.dimt')].every(t => getComputedStyle(t).opacity === '1'); }));
  { const q = await (await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })).newPage(); await q.goto('file://' + process.argv[2] + '#so-do'); await q.waitForTimeout(300);
    ok('Giảm chuyển động → kích thước, nhãn hiện ngay không chờ cuộn', await q.evaluate(() => !document.body.classList.contains('dg-io') && [...document.querySelectorAll('.dgbox .dimt')].every(t => getComputedStyle(t).opacity === '1'))); await q.context().close(); }
  ok('Không tràn ngang', (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390);
  ok('Không lỗi JS', errs.length === 0, errs);
  console.log(res.join('\n')); console.log(`${res.filter(r => r.startsWith('ĐẠT')).length}/${res.length}`); await b.close(); })();
