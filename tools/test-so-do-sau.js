// Kiểm tra sâu sơ đồ: chữ chồng chữ, phóng to từng sơ đồ, liên kết từ sổ tay, id trùng, nhóm, hiệu ứng
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const res = []; const ok = (n, c, i) => res.push((c ? 'ĐẠT  ' : 'LỖI  ') + n + (c ? '' : ' → ' + String(JSON.stringify(i)).slice(0, 600)));
  const F = 'file://' + process.argv[2];
  await p.goto(F + '#so-do'); await p.waitForTimeout(500);
  await p.evaluate(async () => { for (const b of document.querySelectorAll('.dgbox')) { b.scrollIntoView(); await new Promise(r => setTimeout(r, 30)); } });
  await p.waitForTimeout(1500);
  const ov = await p.evaluate(() => { const bad = [];
    document.querySelectorAll('.dgbox svg.dg').forEach(svg => { const id = svg.closest('.dgbox').id;
      const T = [...svg.querySelectorAll('text')].filter(t => t.textContent.trim()).map(t => ({ t: t.textContent.trim(), b: t.getBBox() }));
      for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const a = T[i].b, c = T[j].b;
        const w = Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x), h = Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y);
        if (w > 1.5 && h > 2) bad.push([id, T[i].t.slice(0, 25), T[j].t.slice(0, 25)]); } });
    return bad; });
  ok('Không có chữ chồng lên chữ trong 20 sơ đồ', ov.length === 0, ov);
  const pills = await p.evaluate(() => { const bad = []; document.querySelectorAll('.dgbox svg.dg').forEach(svg => { const id = svg.closest('.dgbox').id;
      const P = [...svg.querySelectorAll('rect.pill')].map(r => r.getBBox()); const T = [...svg.querySelectorAll('text:not(.dimt)')].filter(t => t.textContent.trim()).map(t => ({ t: t.textContent.trim(), b: t.getBBox() }));
      P.forEach(a => T.forEach(({ t, b: c }) => { const w = Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x), h = Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y); if (w > 2 && h > 2) bad.push([id, t.slice(0, 25)]); })); });
    return bad; });
  ok('Nền nhãn kích thước không che chữ khác', pills.length === 0, pills);
  const cnt = await p.evaluate(() => ({ n: Object.keys(DIAGS).length, nocat: Object.keys(DIAGS).filter(k => !DIAG_CAT[k]), nocap: Object.entries(DIAGS).filter(([k, d]) => !d.cap || !d.t || !d.ref).map(x => x[0]), pills: document.querySelectorAll('.dgbox .pill').length, dimt: [...document.querySelectorAll('.dgbox text.dimt')].filter(t => t.textContent.trim()).length }));
  ok('Mỗi sơ đồ có nhóm, tiêu đề, chú thích, số điều', cnt.nocat.length === 0 && cnt.nocap.length === 0, cnt);
  ok('Mọi nhãn kích thước có nền viên', cnt.pills === cnt.dimt, cnt);
  const order = await p.evaluate(() => ({ idx: [...document.querySelectorAll('[data-dgjump]')].map(x => x.dataset.dgjump), cards: [...document.querySelectorAll('.dgbox')].map(x => x.id.slice(3)), nos: [...document.querySelectorAll('.dg-no')].map(x => +x.textContent) }));
  ok('Thứ tự thẻ trùng mục lục, đánh số 1…20 liền mạch', JSON.stringify(order.idx) === JSON.stringify(order.cards) && order.nos.every((n, i) => n === i + 1), order);
  const ids = await p.evaluate(() => { const c = {}; document.querySelectorAll('[id]').forEach(e => c[e.id] = (c[e.id] || 0) + 1); return Object.entries(c).filter(([, n]) => n > 1); });
  ok('Không trùng id trong trang (mẫu nền, gradient)', ids.length === 0, ids);
  const brokenRef = await p.evaluate(() => { const have = new Set([...document.querySelectorAll('[id]')].map(e => e.id)); const bad = new Set();
    document.querySelectorAll('.dgbox svg *').forEach(e => { for (const at of ['href', 'fill', 'filter', 'stroke']) { const v = e.getAttribute(at) || ''; const m = v.match(/#([\w-]+)/); if (m && (at === 'href' || v.startsWith('url(')) && !have.has(m[1])) bad.add(m[1]); } });
    return [...bad]; });
  ok('Mọi tham chiếu url(#…), href="#…" đều tồn tại', brokenRef.length === 0, brokenRef);
  // phóng to từng sơ đồ
  const zoomBad = [];
  for (const id of await p.evaluate(() => Object.keys(DIAGS))) {
    await p.evaluate(i => openDiag(i), id); await p.waitForTimeout(80);
    const r = await p.evaluate(() => { const o = document.getElementById('dgov'); const s = o && o.querySelector('svg'); const bb = s && s.getBoundingClientRect(); return { vis: o && !o.hidden, w: bb && bb.width, pills: o.querySelectorAll('.pill').length, dimt: [...o.querySelectorAll('text.dimt')].filter(t => t.textContent.trim()).length }; });
    if (!r.vis || !(r.w > 300) || r.pills !== r.dimt) zoomBad.push([id, r]);
    await p.keyboard.press('Escape'); await p.waitForTimeout(40);
    if (!(await p.evaluate(() => document.getElementById('dgov').hidden))) { await p.evaluate(() => closeDiag()); zoomBad.push([id, 'Esc không đóng']); }
  }
  ok('Phóng to được cả 20 sơ đồ, nhãn có nền, Esc đóng lại', zoomBad.length === 0, zoomBad);
  // liên kết từ sổ tay tới sơ đồ mới
  const links = await p.evaluate(() => { const want = ['khoang-cach-nha', 'thang-bo', 'cua-thoat-nan', 'khoang-dem', 'thang-loai-3']; const found = {};
    ORDER.forEach(sid => { const tmp = document.createElement('div'); tmp.innerHTML = SECTIONS[sid].blocks.map(b => b.html || '').join(''); });
    const allRefs = new Set(); ORDER.forEach(sid => SECTIONS[sid].blocks.forEach(b => (b.text.match(/\b(?:bảng [a-z]?\.?\d+(?:\.\d+)*|\d+\.\d+(?:\.\d+)*)/g) || []).forEach(r => allRefs.add(r))));
    allRefs.forEach(r => { const q = r.replace(/^bảng/, 'Bảng').replace(/Bảng ([a-z])/, (m, c) => 'Bảng ' + c.toUpperCase()); DIAG_FOR.forEach(([re, id]) => { if (re.test(q)) (found[id] = found[id] || []).push(q); }); });
    return want.map(id => [id, (found[id] || []).slice(0, 4)]); });
  ok('Sơ đồ mới có số điều trong sổ tay trỏ tới', links.every(([, l]) => l.length), links);
  // bấm nút "Sơ đồ" thật trong trang công trình
  await p.goto(F + '#thoat-nan'); await p.waitForTimeout(400);
  const dgBtns = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-diag]')].map(x => x.dataset.diag))]);
  ok('Trang Thoát nạn có nút mở sơ đồ thang bộ / cửa thoát nạn / thang loại 3', ['thang-bo', 'cua-thoat-nan', 'thang-loai-3'].every(x => dgBtns.includes(x)), dgBtns);
  if (dgBtns.includes('thang-bo')) { await p.evaluate(() => { const d = document.querySelector('[data-diag="thang-bo"]').closest('details'); d.open = true; d.scrollIntoView(); }); await p.click('details[open] [data-diag="thang-bo"]'); await p.waitForTimeout(200);
    ok('Bấm "Sơ đồ" → mở đúng sơ đồ thang bộ', await p.evaluate(() => !document.getElementById('dgov').hidden && document.querySelector('#dgov b').textContent.includes('Thang bộ'))); }
  await p.goto(F + '#chay-lan'); await p.waitForTimeout(400);
  const dg2 = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-diag]')].map(x => x.dataset.diag))]);
  ok('Trang Chống cháy lan có nút mở sơ đồ khoảng cách giữa hai nhà', dg2.includes('khoang-cach-nha'), dg2);
  await p.goto(F + '#ngan-chay'); await p.waitForTimeout(400);
  const dg3 = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-diag]')].map(x => x.dataset.diag))]);
  ok('Trang Ngăn cháy có nút mở sơ đồ khoang đệm', dg3.includes('khoang-dem'), dg3);
  await p.goto(F + '#phan-loai'); await p.waitForTimeout(400);
  ok('Không gắn nhầm sơ đồ do mã nhóm F4.1, F1.3 (mục Vật liệu, Nhóm nguy hiểm cháy)', await p.evaluate(() => [...document.querySelectorAll('details')].filter(d => /^1\.[15] /.test(d.querySelector('summary').textContent)).every(d => !d.querySelector('.dglinks'))));
  { const q = await (await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })).newPage(); const e2 = []; q.on('pageerror', x => e2.push(x.message)); await q.goto(F + '#so-do'); await q.waitForTimeout(300); await q.evaluate(() => openDiag('khoang-dem')); await q.waitForTimeout(100);
    ok('Giảm chuyển động: lửa đứng yên, phóng to vẫn chạy', await q.evaluate(() => document.querySelectorAll('#dg-flame animate').length === 0 && !document.getElementById('dgov').hidden) && !e2.length, e2); await q.context().close(); }
  // tìm trong tra nhanh
  await p.goto(F + '#so-do'); await p.waitForTimeout(300);
  ok('Không lỗi JS', errs.length === 0, errs);
  console.log(res.join('\n')); console.log(`${res.filter(r => r.startsWith('ĐẠT')).length}/${res.length}`); await b.close(); })();
