// Kiểm thử tính năng Dự án nhiều khối — đáp án tính tay.
// Dùng: node qcvn10/tools/test-nhieu-khoi.js /tmp/q10.html
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  const errs = [], ok = []; const check = (c, m) => (c ? ok : errs).push(m);
  p.on("pageerror", e => errs.push("pageerror " + e.message));
  await p.goto("file://" + process.argv[2]);
  await p.evaluate(() => localStorage.clear());
  await p.goto("file://" + process.argv[2] + "#nhieu-khoi"); await p.waitForTimeout(150);
  // 1. Mẫu: 3 tòa chung cư + tầng hầm gara 10 000 m²
  const R = await p.evaluate(() => { const r = mkEval(mkV); return { n: r.rows.length, hyd: r.hydrMax.q, who: r.hydrMax.r.x.ten, q: r.qOut, t: r.tOut, two: r.two, pump: r.pump, h219: r.anySpr && r.anyHydr,
    rows: r.rows.map(x => [x.alarm, x.spr, x.jets, x.od && x.od.q, x.dry, x.loa, x.bad6]) }; });
  check(R.n === 4, "mẫu có 4 khối");
  check(JSON.stringify(R.rows[0]) === JSON.stringify(["req", "req", "3 × 2,5 L/s", 30, true, "req", 0]), "Tòa A 17 tầng: báo cháy, sprinkler, 3 × 2,5, 30 L/s, ống khô, loa, QCVN 06 đạt — " + JSON.stringify(R.rows[0]));
  check(JSON.stringify(R.rows[3]) === JSON.stringify(["req", "req", "2 × 5 L/s", 20, false, "no", 0]), "Tầng hầm gara: báo cháy, sprinkler, 2 × 5, 20 L/s, không ống khô, không loa — " + JSON.stringify(R.rows[3]));
  check(R.hyd === 10 && R.who === "Tầng hầm gara", "bơm họng nước 10 L/s do tầng hầm gara quyết định (H.2.5)");
  check(R.q === 30 && R.t === 3 && R.two, "ngoài nhà 30 L/s × 3 h, ≥ 2 trụ (1 đám cháy)");
  check(R.pump && R.h219, "bơm tay + tự động; họng lấy nước hai cửa DN65");
  // 2. Dân số → 2 đám cháy: cộng 2 khối lớn nhất (30 + 30)
  await p.fill("#mk-pop", "20000"); await p.waitForTimeout(60);
  let q = await p.evaluate(() => { const r = mkEval(mkV); return [r.fires, r.qOut]; });
  check(q[0] === 2 && q[1] === 60, "20 000 người → 2 đám cháy, 30 + 30 = 60 L/s — " + q);
  // khu dân cư lớn hơn: 300 000 người → 3 đám cháy × 55 = 165 L/s > 60
  await p.fill("#mk-pop", "300000"); await p.waitForTimeout(60);
  q = await p.evaluate(() => { const r = mkEval(mkV); return [r.fires, r.qOut]; });
  check(q[0] === 3 && q[1] === 165, "300 000 người → 3 đám cháy × 55 L/s = 165 L/s — " + q);
  await p.fill("#mk-pop", ""); await p.waitForTimeout(60);
  // 3. Sửa khối: tòa A còn 15 tầng 48 m → không ống khô (chung cư ≤ 50 m)
  await p.fill("#mk-0-n", "15"); await p.fill("#mk-0-h", "48"); await p.waitForTimeout(60);
  const a = await p.evaluate(() => mkEval(mkV).rows[0]).then(r => [r.dry, r.jets]);
  check(a[0] === false && a[1] === "2 × 2,5 L/s", "Tòa A 15 tầng 48 m: không ống khô, 2 × 2,5 — " + a);
  check(await p.evaluate(() => document.activeElement.id) === "mk-0-h", "gõ không mất tiêu điểm");
  // 4. Thêm, xóa khối, đổi loại
  await p.click("#mkadd"); await p.waitForTimeout(80);
  check((await p.$$(".mkpart")).length === 5, "thêm khối");
  await p.selectOption("#mk-4-id", "san-xuat"); await p.waitForTimeout(80);
  check(!!(await p.$("#mk-4-hang")), "đổi sang nhà sản xuất có ô hạng");
  await p.click("[data-mkdel='4']"); await p.waitForTimeout(80);
  check((await p.$$(".mkpart")).length === 4, "xóa khối");
  // 5. Nhớ sau khi tải lại; sao chép
  await p.reload(); await p.waitForTimeout(150);
  check(await p.inputValue("#mk-0-n") === "15", "nhớ dữ liệu sau khi tải lại");
  const txt = await p.evaluate(() => mkText());
  check(/Tổng hợp/.test(txt) && /Tòa A/.test(txt) && /Lưu lượng bơm họng nước/.test(txt), "sao chép có đủ các khối và phần tổng hợp");
  await p.click("#mkreset"); await p.waitForTimeout(80);
  check(await p.inputValue("#mk-0-n") === "17", "về mẫu");
  // 6. Dữ liệu lưu hỏng
  await p.evaluate(() => localStorage.setItem("q10-mk", JSON.stringify({ parts: [{ id: "khong-co" }] })));
  await p.reload(); await p.waitForTimeout(150);
  check((await p.$$(".mkpart")).length === 4, "dữ liệu lưu hỏng → dùng mẫu");
  errs.forEach(e => console.log("✗", e));
  console.log(`${ok.length}/${ok.length + errs.length} kiểm tra dự án nhiều khối đạt`);
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
