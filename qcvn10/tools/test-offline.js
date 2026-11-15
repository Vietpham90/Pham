// Kiểm tra bản offline: chặn mọi yêu cầu mạng, phông nhúng phải tải được và hiển thị tiếng Việt.
// Dùng: node qcvn10/tools/test-offline.js so-tay-qcvn10-offline.html [ảnh.png]
const { chromium } = require("playwright"); const path = require("path");
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 390, height: 844 }, offline: true });
  const net = []; await c.route("**/*", r => { const u = r.request().url(); if (u.startsWith("file:") || u.startsWith("data:")) return r.continue(); net.push(u); return r.abort(); });
  const p = await c.newPage(); const errs = []; p.on("pageerror", e => errs.push(String(e)));
  await p.goto("file://" + path.resolve(process.argv[2]) + "#cong-trinh"); await p.waitForTimeout(400);
  const f = await p.evaluate(async () => { await document.fonts.ready; const used = [...document.fonts].filter(x => x.status === "loaded").map(x => x.family + " " + x.weight);
    return { used, vi: document.fonts.check('600 16px "Be Vietnam Pro"', "Phải trang bị hệ thống chữa cháy tự động"), mono: document.fonts.check('500 12px "JetBrains Mono"', "Bảng A.1") }; });
  const txt = await p.innerText("#ctres");
  if (process.argv[3]) await p.screenshot({ path: process.argv[3], fullPage: false });
  const ok = f.vi && f.mono && f.used.length >= 3 && !net.length && !errs.length && /Báo cháy/.test(txt);
  console.log(JSON.stringify({ phongDaTai: f.used, tiengViet: f.vi, mono: f.mono, yeuCauMang: net, loi: errs }, null, 1));
  console.log(ok ? "Bản offline đạt" : "Bản offline KHÔNG đạt");
  await b.close(); process.exit(ok ? 0 : 1);
})();
