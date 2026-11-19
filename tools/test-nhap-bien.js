const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2] + '#hon-hop'); await p.waitForTimeout(300);
  const R = await p.evaluate(() => {
    const res = []; const ok = (n, c, info) => res.push([n, !!c, c ? '' : info]);
    const ix = re => CT.findIndex(c => re.test(c.n));
    const txt = r => [...r.out, ...r.common, ...r.partSecs.flatMap(x => x.secs)].flatMap(s => s.items.map(i => i.txt)).join("\n");
    const bad = /NaN|undefined|Infinity|null/;
    const TM = ix(/thương mại/), CC = ix(/^Nhà chung cư/), GX = ix(/^Gara để xe/), VP = ix(/^Văn phòng/);
    const cases = [
      ['Tầng chồng lấn (TM 1→5, CC 4→20)', { h: 60, n: 20, nb: 1, sp: true, parts: [{ i: TM, from: 1, to: 5, a: 2000 }, { i: CC, from: 4, to: 20, a: 1200 }] }],
      ['Nhập ngược (từ 10 → 3)', { h: 40, n: 12, nb: 0, sp: true, parts: [{ i: TM, from: 3, to: 1, a: 2000 }, { i: VP, from: 10, to: 3, a: 1200 }] }],
      ['Chỉ một phần', { h: 30, n: 10, nb: 0, sp: false, parts: [{ i: VP, from: 1, to: 10, a: 1200 }] }],
      ['Không có phần nào', { h: 30, n: 10, nb: 0, parts: [] }],
      ['Phần chỉ trong hầm', { h: 30, n: 10, nb: 2, sp: true, parts: [{ i: GX, from: -2, to: -1, a: 3000 }, { i: CC, from: 1, to: 10, a: 900 }] }],
      ['Tầng vượt số tầng nhà (to 40 > n 20)', { h: 60, n: 20, nb: 0, sp: true, parts: [{ i: CC, from: 1, to: 40, a: 900 }] }],
      ['Diện tích trống, chiều cao 0', { h: 0, n: 1, nb: 0, parts: [{ i: TM, from: 1, to: 1, a: "" }, { i: VP, from: 1, to: 1 }] }]];
    cases.forEach(([n, m]) => { try { const r = mxEvaluate(m); const t = txt(r); ok('Hỗn hợp – ' + n + ': không lỗi, không NaN', !bad.test(t), (t.match(/[^\n]*(NaN|undefined|Infinity|null)[^\n]*/) || [""])[0].slice(0, 120)); } catch (e) { ok('Hỗn hợp – ' + n, false, e.message); } });
    const r1 = mxEvaluate(cases[0][1]); const t1 = txt(r1);
    ok('Chồng lấn tầng → có cảnh báo tầng trùng giữa các phần', /cùng khai báo tầng 4 → tầng 5/.test(t1), t1.split("\n").filter(x => /tầng/.test(x)).slice(0, 3));
    const r6 = mxEvaluate(cases[5][1]); const t6 = txt(r6);
    ok('Phần vượt số tầng nhà → có cảnh báo', /vượt số tầng|lớn hơn số tầng|quá số tầng/.test(t6), t6.split("\n").slice(0, 3));
    // Gian phòng biên
    const g = [{ g: "F3.1", k: 3, a: 0, ch: 0 }, { g: "F4.3", k: 7, a: "", p: 0 }, { g: "F5.1", k: 12, a: 500, ch: 4, f5h: "E", f5s: "S3", bac: "V", den: 6 }, { g: "F5.2", k: 13, a: 1000, xe: 0 }, { g: "F1.3", k: 10, a: 100000, ch: 30 }];
    g.forEach(v => { try { const t = gpEvaluate(v).out.flatMap(s => s.items.map(i => i.txt)).join("\n"); ok('Gian phòng biên ' + JSON.stringify(v).slice(0, 60), !bad.test(t), (t.match(/[^\n]*(NaN|undefined|Infinity|null)[^\n]*/) || [""])[0].slice(0, 120)); } catch (e) { ok('Gian phòng biên', false, e.message); } });
    // Đồng bộ: dữ liệu hỏng từ máy khác
    try { syncApply({ at: Date.now() + 9e5, saved: [1, null, "x"], ct: { i: 999, h: "abc" }, mx: { parts: [{ i: 999 }, null, { i: 0, from: "a" }] }, gp: { k: 999, g: 5 } }); ok('Đồng bộ: dữ liệu hỏng không làm treo', typeof route === 'function', 0); }
    catch (e) { ok('Đồng bộ: dữ liệu hỏng không làm treo', false, e.message); }
    return res; });
  // sau khi áp dữ liệu hỏng, mọi trang vẫn mở được
  for (const h of ['#cong-trinh', '#hon-hop', '#gian-phong', '#da-luu', '']) { await p.goto('file://' + process.argv[2] + h); await p.waitForTimeout(250); const blank = await p.$eval('#view', e => e.innerText.trim().length < 30); R.push(['Sau dữ liệu đồng bộ hỏng, trang ' + (h || 'chủ') + ' vẫn mở', !blank, 'trống']); }
  const ct = await p.evaluate(() => { location.hash = 'cong-trinh'; return [ctV.i, typeof ctV.h, mxV.parts.length, gpV.g]; });
  R.push(['Dữ liệu hỏng được làm sạch (công trình hợp lệ, phần lỗi bị bỏ)', ct[0] >= 0 && ct[0] < 40, ct]);
  const bad = R.filter(r => !r[1]);
  console.log(R.map(r => (r[1] ? 'ĐẠT  ' : 'LỖI  ') + r[0] + (r[1] ? '' : ' → ' + JSON.stringify(r[2]).slice(0, 300))).join('\n'));
  console.log(`${R.length - bad.length}/${R.length}`, errs); await b.close(); })();
