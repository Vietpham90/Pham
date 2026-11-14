const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2] + '#cong-trinh'); await p.waitForTimeout(300);
  const r = await p.evaluate((N) => {
    let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const pick = a => a[Math.floor(rnd() * a.length)];
    const bad = []; const badRe = /NaN|undefined|Infinity|\bnull\b|\[object|\$\{/;
    const unresolved = new Set(); let n = 0;
    const check = (kind, input, secs) => {
      secs.forEach(s => s.items.forEach(x => {
        n++;
        if (!x.txt || badRe.test(x.txt)) bad.push({ kind, input, txt: (x.txt || "<rỗng>").slice(0, 160) });
        if (!x.ref) bad.push({ kind, input, txt: "thiếu số điều: " + x.txt.slice(0, 80) });
        refTokens(x.ref).forEach(t => { if (!refFound(resolveRef(t.q))) unresolved.add(t.q); });
      }));
    };
    for (let k = 0; k < N; k++) {
      const v = { i: Math.floor(rnd() * CT.length), h: pick([0, 3, 6, 9, 12, 14.9, 15, 15.1, 21, 25, 28, 28.1, 36, 50, 50.1, 75, 75.5, 100, 120, 150, 151, 200]), n: pick([1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 16, 17, 25, 40, 60]), nb: pick([0, 1, 2, 3, 4]),
        a: pick(["", 0, 100, 300, 500, 520, 800, 1200, 2500, 3500, 6000, 12000, 30000]), p: pick(["", 5, 15, 20, 50, 60, 250]), v: pick(["", 3000, 5000, 30000, 120000, 300000]), sp: rnd() > .5, deep: rnd() > .7, hh: rnd() > .8, hang: pick(["A", "B", "C", "D", "E"]), c1: rnd() > .8 };
      try { check("ct", v, ctEvaluate(v).out); } catch (e) { bad.push({ kind: "ct", input: v, txt: "LỖI " + e.message }); }
    }
    for (let k = 0; k < N / 4; k++) {
      const np = 1 + Math.floor(rnd() * 4), N2 = pick([3, 8, 20, 35]), parts = [];
      for (let j = 0; j < np; j++) { const from = pick([-3, -2, -1, 1, 2, 5]); parts.push({ i: Math.floor(rnd() * CT.length), from, to: from + Math.floor(rnd() * 10), a: pick([300, 1500, 4000]), p: pick(["", 60]), hang: pick(["A", "C", "E"]) }); }
      const m = { h: pick([9, 25, 45, 60, 90, 130]), n: N2, nb: pick([0, 1, 2, 3]), sp: rnd() > .5, deep: rnd() > .5, v: pick(["", 50000]), parts };
      try { const r = mxEvaluate(m); check("mx", m, [...r.out, ...r.partSecs.flatMap(x => x.secs), ...r.common]); } catch (e) { bad.push({ kind: "mx", input: m, txt: "LỖI " + e.message }); }
    }
    const groups = ["F1.1", "F1.2", "F1.3", "F2.1", "F2.2", "F3.1", "F3.2", "F3.3", "F3.4", "F3.5", "F3.6", "F4.1", "F4.2", "F4.3", "F5.1", "F5.2"];
    for (let k = 0; k < N; k++) {
      const v = { g: pick(groups), k: Math.floor(rnd() * G9.length), a: pick([0, 10, 30, 120, 600, 1000, 1001, 5000, 20000]), ch: pick([2.5, 3, 6, 6.1, 9, 12, 18, 24, 30]), p: pick(["", 6, 16, 49, 50, 300]), bac: pick(["I", "II", "III", "IV", "V"]), ham: rnd() > .7, L: pick(["", 10, 60]), W: pick(["", 8, 30]), d: pick(["", 10, 26]), lane: rnd() > .5, f5h: pick(["A", "B", "C1", "C2", "C3", "C4", "D", "E", "C"]), f5s: pick(["S0", "S1", "S2", "S3"]), den: pick([0.5, 1, 2, 3, 3.5, 4.5, 5, 6]), pos: pick(["mid", "dead"]) };
      try { check("gp", v, gpEvaluate(v).out); } catch (e) { bad.push({ kind: "gp", input: v, txt: "LỖI " + e.message }); }
    }
    // gom lỗi theo nội dung
    const groupsBad = {}; bad.forEach(x => { const key = x.kind + ": " + x.txt.replace(/\d[\d.,]*/g, "#").slice(0, 120); (groupsBad[key] = groupsBad[key] || []).push(x.input); });
    return { items: n, kinds: Object.keys(groupsBad).length, sample: Object.entries(groupsBad).slice(0, 25).map(([k, v]) => ({ k, count: v.length, ex: JSON.stringify(v[0]).slice(0, 220) })), unresolved: [...unresolved] };
  }, +process.argv[3] || 2000);
  console.log(JSON.stringify({ errs, ...r }, null, 1));
  await b.close();
})();
