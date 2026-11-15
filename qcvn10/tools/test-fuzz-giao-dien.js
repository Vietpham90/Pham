// Thử giao diện bằng thao tác ngẫu nhiên: mọi loại nhà, mọi ô nhập (giá trị kỳ quặc), mọi ô chọn.
// Bắt: lỗi JavaScript, kết quả trống, chữ "undefined"/"NaN"/"Infinity", tràn ngang ở 360 px.
// Dùng: node qcvn10/tools/test-fuzz-giao-dien.js /tmp/q10.html [số vòng mỗi loại]
const { chromium } = require("playwright");
const VALS = ["", "0", "-5", "abc", "1,5", "1.500", "2 000", "999999999", "0,0001", "12e3", "  7  ", "1.000.000", "3,", ",5", "١٢"];
(async () => {
  const rounds = +process.argv[3] || 3;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 800 } });
  const errs = []; p.on("pageerror", e => errs.push("pageerror: " + e.message));
  await p.goto("file://" + process.argv[2] + "#cong-trinh"); await p.waitForTimeout(100);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const types = await p.$$eval("#ct-id option", o => o.map(x => x.value));
  let steps = 0;
  for (const t of types) {
    await p.selectOption("#ct-id", t); await p.waitForTimeout(20);
    for (let r = 0; r < rounds; r++) {
      const inputs = await p.$$eval(".ct-form input[data-k]:not([type=checkbox]), .ct-form input[data-mix]", els => els.map(e => e.id));
      for (const id of inputs) { await p.fill("#" + id, VALS[Math.floor(rnd() * VALS.length)]); steps++; }
      const boxes = await p.$$eval(".ct-form input[type=checkbox]", els => els.map(e => e.id));
      for (const id of boxes) if (rnd() < 0.5) { const el = await p.$("#" + id); if (el) { await el.click(); steps++; } }
      const sels = await p.$$eval(".ct-form select[data-k]:not(#ct-id), .ct-form select[data-mix]", els => els.map(e => [e.id || null, e.dataset.k || "", e.dataset.mix || "", [...e.options].map(o => o.value)]));
      for (const [id, k, mx, opts] of sels) { const sel = id ? "#" + id : `select[data-mix="${mx}"]`; if (await p.$(sel)) { await p.selectOption(sel, opts[Math.floor(rnd() * opts.length)]); steps++; } }
      await p.waitForTimeout(10);
      const st = await p.evaluate(() => ({ txt: (document.getElementById("ctres") || {}).innerText || "", over: document.documentElement.scrollWidth - innerWidth, cur: document.getElementById("ct-id").value }));
      if (!/Báo cháy/.test(st.txt)) errs.push(`${t} vòng ${r}: kết quả trống`);
      const bad = st.txt.match(/undefined|NaN|Infinity|\[object/);
      if (bad) errs.push(`${t} vòng ${r}: chữ lỗi "${bad[0]}" — …${st.txt.slice(Math.max(0, bad.index - 60), bad.index + 30).replace(/\n/g, " ")}`);
      if (st.over > 0) errs.push(`${t} vòng ${r}: tràn ngang ${st.over}px`);
      if (st.cur !== t) { await p.selectOption("#ct-id", t); }
    }
  }
  // các thẻ khác
  // thẻ Nhiều khối: mọi ô của mọi khối
  await p.evaluate(() => { location.hash = "nhieu-khoi"; }); await p.waitForTimeout(80);
  for (let r = 0; r < 6; r++) {
    const ids = await p.$$eval("#mkform input[data-mk]:not([type=checkbox]), #mk-pop", els => els.map(e => e.id));
    for (const id of ids) { await p.fill("#" + id, VALS[Math.floor(rnd() * VALS.length)]); steps++; }
    const boxes = await p.$$eval("#mkform input[type=checkbox]", els => els.map(e => e.id));
    for (const id of boxes) if (rnd() < 0.4) { const el = await p.$("#" + id); if (el) { await el.click(); steps++; } }
    const sels = await p.$$eval("#mkform select", els => els.map(e => [e.id, [...e.options].map(o => o.value)]));
    for (const [id, opts] of sels) if (rnd() < 0.3 && await p.$("#" + id)) { await p.selectOption("#" + id, opts[Math.floor(rnd() * opts.length)]); steps++; }
    const txt = await p.innerText("#mkres"); const bad = txt.match(/undefined|NaN|Infinity|\[object/);
    if (bad) errs.push(`nhieu-khoi vòng ${r}: chữ lỗi "${bad[0]}" — …${txt.slice(Math.max(0, bad.index - 60), bad.index + 30).replace(/\n/g, " ")}`);
    if (!/Tổng hợp dự án/.test(txt)) errs.push(`nhieu-khoi vòng ${r}: thiếu phần tổng hợp`);
  }
  for (const [hash, ids] of [["gian-phong", ["#gp-x", "#gp-q"]], ["co-so", ["#csx-x"]], ["tinh-nuoc", ["#w-pop", "#w-ac"]], ["cong-truong", ["#cs-floors"]]]) {
    await p.evaluate(h => { location.hash = h; }, hash); await p.waitForTimeout(60);
    for (let r = 0; r < 20; r++) for (const id of ids) {
      if (!(await p.$(id))) continue;
      await p.fill(id, VALS[Math.floor(rnd() * VALS.length)]); steps++;
      const txt = await p.innerText("#view");
      const bad = txt.match(/undefined|NaN|Infinity|\[object/); if (bad) errs.push(`${hash} ${id}: chữ lỗi "${bad[0]}" — …${txt.slice(Math.max(0, bad.index - 60), bad.index + 30).replace(/\n/g, " ")}`);
    }
    if (hash === "co-so") for (let i = 0; i < 11; i++) { await p.selectOption("#csx-i", String(i)); await p.waitForTimeout(10); const txt = await p.innerText("#view"); if (/undefined|NaN/.test(txt)) errs.push(`co-so ${i}: chữ lỗi`); }
  }
  const uniq = [...new Set(errs)];
  uniq.slice(0, 40).forEach(e => console.log("✗", e));
  console.log(`${steps} thao tác ngẫu nhiên, ${uniq.length} lỗi`);
  await b.close(); process.exit(uniq.length ? 1 : 0);
})();
