// Thử ngẫu nhiên + tính chất: (1) không lỗi, đủ 4 nhóm kết quả với mọi đầu vào;
// (2) đơn điệu: tăng n, a, h, vol, kids, seats, ppl, len, cho thì mức yêu cầu (không → TBĐL → phải) không giảm.
// Dùng: node qcvn10/tools/test-tinh-chat.js /tmp/q10.html 3000
const { chromium } = require("playwright");
(async () => {
  const N = +process.argv[3] || 2000;
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto("file://" + process.argv[2]);
  const r = await p.evaluate(N => {
    let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const pick = a => a[Math.floor(rnd() * a.length)];
    const rank = { none: -1, no: 0, info: 0, alt: 1, req: 2 };
    const keys = ["alarm", "spr", "hydr", "c1", "g1"];
    const pat = { alarm: /^\*\*Hệ thống báo cháy tự động/, spr: /^\*\*Hệ thống chữa cháy tự động/, hydr: /^\*\*Hệ thống họng nước/, c1: /^\*\*Hệ thống cấp nước chữa cháy ngoài nhà riêng/, g1: /^\*\*Loa thông báo/ };
    const lv = (out, k) => { const it = out.flatMap(s => s.items).find(i => pat[k].test(i.txt)); return it ? it.lv : "none"; };
    const errs = []; let checks = 0;
    for (let i = 0; i < N; i++) {
      const t = pick(T);
      const v = Object.assign({}, DEF, {
        n: 1 + Math.floor(rnd() * 40), a: Math.round(rnd() * 40000), vol: Math.round(rnd() * 800000), nb: Math.floor(rnd() * 5),
        kids: Math.floor(rnd() * 300), seats: Math.floor(rnd() * 1000), ppl: Math.floor(rnd() * 600), room: Math.floor(rnd() * 80),
        len: Math.round(rnd() * 1500), pcar: Math.floor(rnd() * 50), parea: Math.round(rnd() * 25000), phh: Math.round(rnd() * 60) / 10, pmoto: Math.round(rnd() * 3000), srv: Math.round(rnd() * 60), mba: Math.round(rnd() * 900) / 10, mbaKv: [0, 22, 35, 110, 220][Math.floor(rnd() * 5)], pdien: Math.round(rnd() * 150), ga: Math.round(rnd() * 5000), tmTr: Math.round(rnd() * 3000), tmHam: Math.round(rnd() * 800), bbi: rnd() < .1, kyNuoc: rnd() < .1, go: rnd() < .1, cho: Math.floor(rnd() * 60), bac: pick(["I", "II", "III", "IV", "V"]), S: pick(["S0", "S1", "S2", "S3"]),
        hang: pick(["A", "B", "C1", "C2", "C3", "C4", "D", "E"]), gara: pick(["kin", "ho"]),
        bas: rnd() < .3, hl: rnd() < .5, open12: rnd() < .5, xm: rnd() < .1, ngan: rnd() < .1, rural: rnd() < .2, deep: rnd() < .2, gia: rnd() < .2,
        special: rnd() < .1, lanh: rnd() < .1, direct: rnd() < .5, open: rnd() < .1, w60: rnd() < .3, roof: rnd() < .7, steel: rnd() < .2, combust: rnd() < .2, kara: rnd() < .2, inside: rnd() < .3, banHam: rnd() < .2
      });
      v.h = Math.round(v.n * (2.8 + rnd() * 2) * 10) / 10;
      let out;
      try { out = ctEvaluate(t, v); } catch (e) { errs.push(`${t.id}: lỗi ${e.message}`); continue; }
      if (out.length < 4 || out.length > 7) errs.push(`${t.id}: ${out.length} nhóm`);
      const all = out.flatMap(s => s.items);
      if (all.some(x => !x.txt || /undefined|NaN/.test(x.txt) || /undefined|NaN/.test(x.ref))) errs.push(`${t.id}: chữ lỗi ${JSON.stringify(all.find(x => /undefined|NaN/.test(x.txt + x.ref)))}`);
      // đơn điệu
      for (const f of ["n", "a", "h", "vol", "kids", "seats", "ppl", "len", "cho", "pcar", "parea", "pmoto", "srv", "mba", "pdien", "ga", "tmTr", "tmHam"]) {
        const w = Object.assign({}, v); w[f] = v[f] * 1.5 + 1; if (f === "n") w.h = v.h * 1.5 + 1; if (f === "h") w.n = v.n;
        const o2 = ctEvaluate(t, w);
        for (const k of keys) { checks++; const a = lv(out, k), c = lv(o2, k); if (rank[c] < rank[a]) errs.push(`${t.id}: tăng ${f} ${v[f]}→${w[f]} làm ${k} giảm ${a}→${c}`); }
      }
    }
    return { errs: [...new Set(errs)].slice(0, 30), nerr: errs.length, checks };
  }, N);
  r.errs.forEach(e => console.log("✗", e));
  console.log(`${N} bộ đầu vào ngẫu nhiên, ${r.checks} phép so đơn điệu, ${r.nerr} lỗi`);
  await b.close(); process.exit(r.nerr ? 1 : 0);
})();
