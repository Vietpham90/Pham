// Kiểm thử phần ghép QCVN 06 vào sổ tay QCVN 10.
// 1) Mọi loại nhà (trừ hầm đường bộ) có dòng tương ứng trong danh mục QCVN 06.
// 2) Q06.ctEvaluate trong sổ tay QCVN 10 cho kết quả giống hệt ctEvaluate của sổ tay QCVN 06 (cùng đầu vào).
// 3) Sprinkler toàn nhà theo QCVN 10 được truyền sang QCVN 06 (ảnh hưởng khoang cháy H.4.1).
// Dùng: node qcvn10/tools/test-q06.js /tmp/q10.html /tmp/so-tay.html
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const errs = []; let ok = 0;
  const p10 = await b.newPage(); await p10.goto("file://" + process.argv[2]);
  const p06 = await b.newPage(); await p06.goto("file://" + process.argv[3]);
  // 1
  const miss = await p10.evaluate(() => T.filter(t => t.og !== "ham" && !q06Eval(t, Object.assign({}, DEF, { n: 3, h: 10, a: 1500 }))).map(t => t.id));
  if (miss.length) errs.push("Thiếu ánh xạ QCVN 06: " + miss.join(", ")); else ok++;
  // 2 — so 400 bộ đầu vào ngẫu nhiên trên 33 dòng QCVN 06
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const inputs = [];
  for (let k = 0; k < 400; k++) inputs.push({ i: Math.floor(rnd() * 33), h: Math.round(rnd() * 1600) / 10, n: 1 + Math.floor(rnd() * 40), nb: Math.floor(rnd() * 5), a: Math.round(rnd() * 30000), p: Math.floor(rnd() * 800), v: Math.round(rnd() * 400000), sp: rnd() < .5, deep: rnd() < .2, hh: rnd() < .2, hang: ["A", "B", "C", "D", "E"][Math.floor(rnd() * 5)], c1: rnd() < .2 });
  const a = await p10.evaluate(I => I.map(v => JSON.stringify(Q06.ctEvaluate(v).out)), inputs);
  const c = await p06.evaluate(I => I.map(v => JSON.stringify(ctEvaluate(v).out)), inputs);
  const diff = a.map((x, k) => x === c[k] ? null : k).filter(x => x !== null);
  if (diff.length) errs.push(`${diff.length}/400 đầu vào cho kết quả QCVN 06 khác nhau, ví dụ ${JSON.stringify(inputs[diff[0]])}`); else ok++;
  // 3 — truyền sprinkler
  const sp = await p10.evaluate(() => {
    const r1 = q06Eval(TI["khach-san"], Object.assign({}, DEF, { n: 14, h: 46, a: 16800, vol: 55000 }));
    const r2 = q06Eval(TI["khach-san"], Object.assign({}, DEF, { n: 4, h: 13, a: 2400, vol: 8000 }));
    const r3 = q06Eval(TI["san-xuat"], Object.assign({}, DEF, { n: 8, h: 29, a: 86400, dt1: 10800, ga: 10800, vol: 311040, hang: "C3" }));
    const txt = r => r.out.flatMap(s => s.items).map(i => i.txt).join(" | ");
    return { r1: r1.sp, r2: r2.sp, r3sp: r3.sp, r3: /I, II – S0/.test(txt(r3)) && /tăng 2 lần/.test(txt(r3)) };
  });
  if (sp.r1 !== true || sp.r2 !== false) errs.push("Truyền sprinkler sai: " + JSON.stringify(sp)); else ok++;
  if (!sp.r3sp || !sp.r3) errs.push("Nhà xưởng C3 8 tầng 10 800 m²/tầng phải đạt bậc I, II – S0 nhờ sprinkler: " + JSON.stringify(sp)); else ok++;
  // 4 — giao diện: bỏ chọn thì ẩn, ô tóm tắt, sao chép kèm QCVN 06
  await p10.goto("file://" + process.argv[2] + "#cong-trinh"); await p10.waitForTimeout(100);
  await p10.selectOption("#ct-id", "chung-cu"); await p10.waitForTimeout(60);
  if (!(await p10.$("#q06")) || !(await p10.$(".tile.t06"))) errs.push("Không thấy phần QCVN 06 hoặc ô tóm tắt"); else ok++;
  await p10.uncheck("#ct-show06"); await p10.waitForTimeout(60);
  if (await p10.$("#q06")) errs.push("Bỏ chọn mà phần QCVN 06 vẫn hiện"); else ok++;
  await p10.check("#ct-show06"); await p10.waitForTimeout(60);
  const txt = await p10.evaluate(() => ctText());
  if (!/KIẾN TRÚC THEO QCVN 06/.test(txt) || !/QCVN 06: /.test(txt)) errs.push("Sao chép thiếu phần QCVN 06"); else ok++;
  await p10.selectOption("#ct-id", "ham"); await p10.waitForTimeout(60);
  if (await p10.$("#ct-show06")) errs.push("Hầm đường bộ không có trong QCVN 06 mà vẫn hiện ô chọn"); else ok++;
  errs.forEach(e => console.log("✗", e));
  console.log(`${ok}/${ok + errs.length} kiểm tra ghép QCVN 06 đạt (so 400 đầu vào ngẫu nhiên với sổ tay QCVN 06)`);
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
