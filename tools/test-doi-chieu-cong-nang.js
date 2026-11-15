// Đối chiếu G.5, G.2b, số người G.9 giữa tab Thoát nạn (tnSpace) và tab Gian phòng (gpEvaluate) — nhà công cộng
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2] + '#tinh-thoat-nan'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const bad = []; let n = 0, m5 = 0, m2 = 0; const rnd = a => a[Math.floor(Math.random() * a.length)];
    for (let i = 0; i < 4000; i++) {
      const g = rnd(["F1.1", "F1.2", "F2.1", "F2.2", "F3.1", "F3.2", "F3.3", "F3.6", "F4.1", "F4.2", "F4.3"]), bac = rnd(["I", "II", "III", "IV", "V"]), k = Math.floor(Math.random() * G9.length);
      const a = rnd([40, 200, 800, 1500, 3000, 6000]), ch = rnd([3, 4, 6, 9]), fl = Math.random() < .5, pp = rnd(["", 20, 60]), xe = rnd([0, 30, 80]);
      const x = tnSpace({ g, bac }, { f: "1", k, a, ch, fl, xe, p: pp }, g9P(k, a, pp, xe));
      const t = gpEvaluate({ g, k, a, ch, p: pp, xe, bac, lane: fl, ad: fl, den: 1 }).out.flatMap(s => s.items.map(i => i.txt)).join(" | ").replace(/\*\*/g, "");
      const mP = t.match(/= (\d+) người|Theo thiết kế: (\d+) người/); const Pgp = mP ? +(mP[1] || mP[2]) : null;
      const m7 = t.match(/Định mức (\d+) người\/m/), rgp = m7 ? +m7[1] : null;
      const mb = t.match(/Từ điểm bất kỳ trong gian tới lối ra gần nhất: ≤ (\d+) m/), dgp = mb ? +mb[1] : null;
      n++; if (rgp) m5++; if (dgp) m2++;
      if (Pgp !== x.P) bad.push(["P", { g, k, a, pp, xe }, Pgp, x.P]);
      if (rgp !== x.rate) bad.push(["G5", { g, bac, k, a, ch, fl }, rgp, x.rate]);
      if (dgp !== x.g2b) bad.push(["G2b", { g, bac, k, a, ch, fl }, dgp, x.g2b]);
    }
    return { n, m5, m2, bad: bad.slice(0, 6), nb: bad.length }; });
  console.log(JSON.stringify(r, null, 1), errs); await b.close(); })();
