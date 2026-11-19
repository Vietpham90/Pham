// Trường hợp đặc biệt: đúng giá trị ngưỡng, nhập biên, cách gõ số kiểu Việt Nam
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(300);
  const R = await p.evaluate(() => {
    const res = []; const ok = (n, c, info) => res.push([n, !!c, c ? '' : info]);
    const ix = re => CT.findIndex(c => re.test(c.n));
    const T = v => ctEvaluate(v).out.flatMap(s => s.items.map(x => x.txt.replace(/\*\*/g, "") + " {" + x.ref + "}" + (x.lv ? " #" + x.lv : ""))).join("\n");
    const VP = ix(/^Văn phòng/), CC = ix(/^Nhà chung cư/), KS = ix(/^Khách sạn/), RL = ix(/riêng lẻ/), GX = ix(/^Gara để xe/), TM = ix(/thương mại/), XS = ix(/^Nhà sản xuất/);
    const base = (i, h, n, o) => Object.assign({ i, h, n, nb: 1, a: 1000, sp: false }, o || {});
    const lift = t => /Thang máy chữa cháy mỗi khoang/.test(t);
    // 1. Thang máy chữa cháy: > 28 m; F1.3 > 50 m; hầm sâu > 9 m
    ok('VP 28 m: chưa bắt buộc thang máy chữa cháy', !lift(T(base(VP, 28, 8))), 0);
    ok('VP 28,1 m: bắt buộc', lift(T(base(VP, 28.1, 9))), 0);
    ok('Chung cư 50 m: chưa bắt buộc', !lift(T(base(CC, 50, 16))), 0);
    ok('Chung cư 50,1 m: bắt buộc', lift(T(base(CC, 50.1, 16))), 0);
    ok('VP 20 m có hầm sâu > 9 m: bắt buộc', lift(T(base(VP, 20, 6, { nb: 3, deep: true }))), 0);
    // 2. Khoảng cách mép đường: < 12 m → 5; 12 – 28 → 8; > 28 → 10
    const road = t => (t.match(/Mép đường cách tường nhà ≤ (\d+) m/) || [])[1];
    ok('11,9 m → mép đường ≤ 5 m', road(T(base(VP, 11.9, 3))) === '5', road(T(base(VP, 11.9, 3))));
    ok('12 m → ≤ 8 m', road(T(base(VP, 12, 4))) === '8', road(T(base(VP, 12, 4))));
    ok('28 m → ≤ 8 m', road(T(base(VP, 28, 8))) === '8', road(T(base(VP, 28, 8))));
    ok('28,1 m → ≤ 10 m', road(T(base(VP, 28.1, 9))) === '10', road(T(base(VP, 28.1, 9))));
    // 3. Đai ngăn cháy (4.33.4): miễn khi ≤ 3 tầng HOẶC < 15 m, gara hở, có chữa cháy tự động
    const belt = t => /Không bắt buộc đai ngăn cháy/.test(t);
    ok('4 tầng, 14,9 m: miễn đai (< 15 m)', belt(T(base(VP, 14.9, 4))), 0);
    ok('4 tầng, 15 m: phải có đai', !belt(T(base(VP, 15, 4))), 0);
    ok('3 tầng, 16 m: miễn đai (≤ 3 tầng)', belt(T(base(VP, 16, 3))), 0);
    ok('4 tầng, 15 m có sprinkler: miễn đai', belt(T(base(VP, 15, 4, { sp: true }))), 0);
    // 4. Phụ lục A: > 50 m (F1.3: > 75 m)
    const A = t => /Nhà cao trên (50|75) m/.test(t);
    ok('VP 50 m: chưa áp dụng Phụ lục A', !A(T(base(VP, 50, 15))), 0);
    ok('VP 50,1 m: áp dụng Phụ lục A', A(T(base(VP, 50.1, 15))), 0);
    ok('Chung cư 75 m: chưa áp dụng Phụ lục A.3', !A(T(base(CC, 75, 24))), 0);
    ok('Chung cư 75,1 m: áp dụng', A(T(base(CC, 75.1, 24))), 0);
    // 5. Lánh nạn: > 100 m; > 120 m khi có báo cháy + chữa cháy tự động
    const ln = t => /Khu vực lánh nạn tạm thời/.test(t) && /#bad/.test((t.match(/Khu vực lánh nạn[^\n]*/) || [""])[0]);
    ok('VP 100 m: chưa cần lánh nạn', !ln(T(base(VP, 100, 28))), 0);
    ok('VP 100,5 m không sprinkler: phải có lánh nạn', ln(T(base(VP, 100.5, 28))), (T(base(VP, 100.5, 28)).match(/[^\n]*lánh nạn[^\n]*/g)));
    ok('VP 120 m có sprinkler: chưa cần', !ln(T(base(VP, 120, 33, { sp: true }))), 0);
    ok('VP 120,5 m có sprinkler: phải có', ln(T(base(VP, 120.5, 33, { sp: true }))), 0);
    // 6. Phạm vi: ≤ 150 m, ≤ 3 hầm (F5: ≤ 50 m, 1 hầm)
    const out = t => /Vượt phạm vi điều chỉnh/.test(t);
    ok('VP 150 m, 3 hầm: trong phạm vi', !out(T(base(VP, 150, 40, { nb: 3 }))), 0);
    ok('VP 150,1 m: vượt', out(T(base(VP, 150.1, 40))), 0);
    ok('VP 4 hầm: vượt', out(T(base(VP, 60, 18, { nb: 4 }))), 0);
    ok('Nhà xưởng 50 m: trong phạm vi; 51 m: vượt', !out(T(base(XS, 50, 10, { nb: 0, hang: "C" }))) && out(T(base(XS, 51, 10, { nb: 0, hang: "C" }))), 0);
    // 7. Nhà ở riêng lẻ: thuộc phạm vi khi ≥ 7 tầng, ≥ 25 m, ≥ 2 hầm hoặc ≥ 5 000 m³
    const inF14 = t => /thuộc phạm vi/.test(t) && !/không thuộc/.test(t);
    ok('Nhà riêng lẻ 6 tầng 24,9 m 4 999 m³: không thuộc phạm vi', !inF14(T(base(RL, 24.9, 6, { v: 4999 }))), (T(base(RL, 24.9, 6, { v: 4999 })).split("\n")[0]));
    ok('7 tầng: thuộc phạm vi', inF14(T(base(RL, 22, 7, { v: 3000 }))), 0);
    ok('25 m: thuộc phạm vi', inF14(T(base(RL, 25, 6, { v: 3000 }))), 0);
    ok('5 000 m³: thuộc phạm vi', inF14(T(base(RL, 15, 5, { v: 5000 }))), 0);
    ok('2 hầm: thuộc phạm vi', inF14(T(base(RL, 15, 5, { v: 3000, nb: 2 }))), 0);
    // 8. Nhập biên: 1 tầng, 0 m, ô trống, số âm, số rất lớn
    const bad = [];
    [base(VP, 0, 1), base(VP, "", "", { a: "", nb: "" }), base(VP, -5, -2, { a: -100 }), base(CC, 3.5, 1, { nb: 0 }), base(TM, 4, 1, { a: 50000 }), base(GX, 1e6, 1e4, { a: 1e9, v: 1e12 })].forEach(v => { try { const t = T(v); if (/NaN|undefined|Infinity|null/.test(t)) bad.push([v, t.match(/[^\n]*(NaN|undefined|Infinity|null)[^\n]*/)[0].slice(0, 90)]); } catch (e) { bad.push([v, e.message]); } });
    ok('Nhập biên (0 m, ô trống, âm, cực lớn) không lỗi, không NaN', bad.length === 0, bad);
    // 9. Cách gõ số kiểu Việt Nam trong ô tìm kiếm
    const q = s => ctQty(s);
    ok('"1.500 m2" (dấu chấm hàng nghìn) → 1 500 m²', q("văn phòng 1.500 m2").a === 1500, q("văn phòng 1.500 m2"));
    ok('"12.000 m3" → 12 000 m³', q("kho 12.000 m3").v === 12000, q("kho 12.000 m3"));
    ok('"25,5 m" → 25,5 m', q("chung cư 25,5 m").h === 25.5, q("chung cư 25,5 m"));
    ok('"cao 45m, 12 tầng" → 45 m, 12 tầng', q("văn phòng cao 45m, 12 tầng").h === 45 && q("văn phòng cao 45m, 12 tầng").n === 12, q("văn phòng cao 45m, 12 tầng"));
    ok('"1500m²" (ký hiệu ²) → 1 500 m²', q("siêu thị 1500m²").a === 1500, q("siêu thị 1500m²"));
    ok('"2 tầng hầm, 20 tầng nổi" → 2 hầm, 20 tầng', q("chung cư 2 tầng hầm, 20 tầng nổi").nb === 2 && q("chung cư 2 tầng hầm, 20 tầng nổi").n === 20, q("chung cư 2 tầng hầm, 20 tầng nổi"));
    ok('"KHÁCH SẠN" (chữ hoa) → Khách sạn', (ctFind("KHÁCH SẠN", 1)[0] || {}).i === KS, 0);
    ok('Chỉ gõ số "25 tầng 80m" → không gợi ý bừa', ctFind("25 tầng 80m", 3).length === 0, ctFind("25 tầng 80m", 3).map(x => x.c.n));
    return res; });
  const bad = R.filter(r => !r[1]);
  console.log(R.map(r => (r[1] ? 'ĐẠT  ' : 'LỖI  ') + r[0] + (r[1] ? '' : ' → ' + JSON.stringify(r[2]).slice(0, 300))).join('\n'));
  console.log(`${R.length - bad.length}/${R.length}`, errs); await b.close(); })();
