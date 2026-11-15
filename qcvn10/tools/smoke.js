// Kiểm thử khói: mở trang, đi qua mọi mục, mọi loại nhà, ghi lỗi console.
const { chromium } = require("playwright");
(async () => {
  const file = process.argv[2], shots = process.argv[3];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto("file://" + file);
  const ids = ["kx06", "nhanh", "co-so", "gian-phong", "tong-quan","chung","trang-bi","pl-a","pl-bc","pl-dg","h1","h2","h34","cong-trinh","tinh-nuoc","h7","cong-truong","so-sanh","da-luu"];
  for (const id of ids) { await p.evaluate(h => location.hash = h, id); await p.waitForTimeout(60); const n = await p.evaluate(() => document.getElementById("view").innerText.length); if (n < 50) errs.push("trống: " + id); }
  await p.evaluate(() => location.hash = "cong-trinh"); await p.waitForTimeout(80);
  const types = await p.$$eval("#ct-id option", o => o.map(x => x.value));
  for (const t of types) { await p.selectOption("#ct-id", t); await p.waitForTimeout(30); const txt = await p.evaluate(() => document.getElementById("ctres").innerText); if (!/Báo cháy/.test(txt)) errs.push("thiếu kết quả: " + t); }
  if (shots) {
    await p.selectOption("#ct-id", "khach-san"); await p.waitForTimeout(60);
    await p.screenshot({ path: shots + "/ct.png", fullPage: true });
    await p.evaluate(() => location.hash = "home"); await p.waitForTimeout(60); await p.screenshot({ path: shots + "/home.png" });
    await p.evaluate(() => location.hash = "pl-a"); await p.waitForTimeout(60); await p.screenshot({ path: shots + "/pla.png" });
  }
  console.log(JSON.stringify({ types: types.length, errs }, null, 1));
  await b.close();
})();
