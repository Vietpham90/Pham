// Đối chiếu số liệu G.3, G.4, G.7 giữa tab Thoát nạn (tnGian) và tab Gian phòng (gpEvaluate)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2] + '#tinh-thoat-nan'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const bad = []; let n = 0; const rnd = a => a[Math.floor(Math.random() * a.length)];
    for (let i = 0; i < 3000; i++) {
      const hg = rnd(F5H), S = rnd(["S0", "S1", "S2", "S3"]), bac = rnd(["I", "II", "III", "IV", "V"]), a = rnd([200, 800, 1000, 1500, 3000, 6000, 12000]), ch = rnd([3, 4.5, 6, 7, 10, 13, 20]), den = rnd([0.5, 1, 2, 2.5, 3, 4, 5]), pos = rnd(["mid", "dead"]), h = rnd([6, 9, 12, 15, 18, 24, 30]), P = rnd([5, 20, 30, 60, 200]);
      const x = tnGian({ g: "F5.1", bac, s: S, h, den, f5h: hg }, { f: "1", k: 7, a, hg, ch, pos, gex: 2 }, P);
      const t = gpEvaluate({ g: "F5.1", k: 7, a, ch, p: P, bac, f5h: hg, f5s: S, den, pos, hn: h }).out.flatMap(s => s.items.map(i => i.txt)).join(" | ").replace(/\*\*/g, "");
      const m3 = t.match(/Từ chỗ làm việc xa nhất tới lối ra thoát nạn gần nhất: ≤ (\d+) m/), inf = /không hạn chế/.test(t);
      const g3gp = m3 ? +m3[1] : inf ? Infinity : null;
      const m4 = t.match(/(?:hành lang cụt|ở giữa hai lối ra): từ cửa gian (?:theo hành lang )?tới lối ra gần nhất ≤ (\d+) m/), g4gp = m4 ? +m4[1] : null;
      const m7 = t.match(/Định mức (\d+) người\/m/), r7gp = m7 ? +m7[1] : null;
      n++;
      if (g3gp !== x.g3) bad.push(["G3", { hg, S, bac, a, ch, den }, g3gp, x.g3]);
      if (a <= 1000 && den <= 5 && g4gp !== x.g4) bad.push(["G4", { hg, S, a, den, pos }, g4gp, x.g4]);
      if (r7gp !== x.rate) bad.push(["G7", { hg, S, a, ch, h }, r7gp, x.rate]);
    }
    return { n, bad: bad.slice(0, 8), nb: bad.length }; });
  console.log(JSON.stringify(r, null, 1), errs); await b.close(); })();
