// Quét toàn bộ kết quả hiển thị tìm số thập phân dùng dấu chấm (vd 31.7 m)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + process.argv[2] + '#cong-trinh'); await p.waitForTimeout(300);
  const bad = await p.evaluate(() => { const re = /(?<![\d.])\d+\.\d{1,2}(?!\d)\s*(m\b|m²|m³|%|người|kg|giờ)/; const found = new Set(); const txt = o => o.flatMap(s => s.items.map(x => x.txt));
    const hs = [3.6, 7.5, 12.8, 15.5, 21.3, 28.4, 31.7, 50.5, 62.3, 75.5, 99.9, 120.4];
    CT.forEach((c, i) => hs.forEach(h => { const v = { i, h, n: Math.max(1, Math.round(h / 3.3)), nb: 2, a: 1234.5, v: 23456.7, sp: h > 20, hang: "C" }; [...txt(ctEvaluate(v).out), ...thresholdsCT(v).map(x => x.txt || "")].forEach(t => { const m = t.match(re); if (m) found.add(c.n + " " + h + ": " + m[0] + " ← " + t.slice(0, 90)); }); }));
    const pick = re => CT.findIndex(x => re.test(x.n));
    [[[/thương mại/i, -2, 3], [/văn phòng/i, 4, 9], [/chung cư/i, 10, 27]], [[/khách sạn/i, 1, 20]], [[/thương mại/i, 1, 2], [/chung cư/i, 3, 15]]].forEach(ps => [33.3, 66.6, 88.8].forEach(h => { const m = { h, n: 27, nb: 2, sp: true, parts: ps.map(([r, f, t]) => ({ i: pick(r), from: f, to: t, a: 1500 })) }; const r = mxEvaluate(m); [...txt(r.out), ...txt(r.common), ...r.partSecs.flatMap(x => txt(x.secs))].forEach(t => { const mm = t.match(re); if (mm) found.add("MX " + h + ": " + mm[0] + " ← " + t.slice(0, 90)); }); }));
    ["F1.1","F2.1","F3.1","F4.3","F5.1"].forEach(g => [0, 2, 3, 7, 12].forEach(k => { const o = gpEvaluate({ g, k, a: 777.7, ch: 4.35, bac: "II", f5h: "C2", f5s: "S0", den: 2.5, hn: 13.3, L: 33.3, W: 12.1 }); txt(o.out).forEach(t => { const m = t.match(re); if (m) found.add("GP " + g + ": " + m[0] + " ← " + t.slice(0, 90)); }); }));
    return [...found].slice(0, 30); });
  console.log(bad.length ? bad.join("\n") : "Không có số thập phân dấu chấm"); await b.close(); })();
