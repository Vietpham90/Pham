// Kiểm thử ô tìm kiếm: tách thông số quy mô, sửa lỗi gõ, gợi ý loại nhà, khớp theo từ; bấm thẻ "Tra ngay" điền sẵn thông số.
// Dùng: node qcvn10/tools/test-tim-kiem.js /tmp/q10.html
const { chromium } = require("playwright");
// [câu tìm, thẻ tra ngay (mẫu | null), loại gợi ý đầu (id | null), tiêu đề kết quả đầu (mẫu | null), có kết quả]
const C = [
  ["chung cư 20 tầng", /Chung cư.*20 tầng/, "chung-cu", null, true],
  ["kho 5000m2", /Nhà kho.*5\.000 m²/, "kho", null, true],
  ["kho 5.000 m²", /Nhà kho.*5\.000 m²/, "kho", null, true],
  ["khach san 10 tang 35m", /Khách sạn.*10 tầng · 35 m/, "khach-san", null, true],
  ["nhà xưởng 2 tầng 12000m2 hạng C3", /2 tầng · 12\.000 m² · hạng C3/, "san-xuat", null, true],
  ["nha xuong hang C", /hạng C2 \(hạng C tạm lấy C2/, "san-xuat", null, true],
  ["chung cu 25 tang 80m 2 ham 300 xe", /25 tầng · 80 m · 2 hầm · 300 xe/, "chung-cu", null, true],
  ["chung cư 1.500m2/tầng 20 tầng", /20 tầng · 1\.500 m²\/tầng · 30\.000 m²/, "chung-cu", null, true],
  ["gara ngầm 2 tầng 300 xe", /2 hầm · 300 xe/, "de-xe", null, true],
  ["chung cư 20 tầng 65m hành lang 60m", /hành lang 60 m · 20 tầng · 65 m/, "chung-cu", null, true],
  ["chua chay tu dong kho", null, "kho", null, true],
  ["phong may bien ap", null, null, null, true],
  ["tru nuoc", null, null, /Trụ nước/, true],
  ["den su co", null, null, /Chiếu sáng sự cố/, true],
  ["cap nuoc chua chay", null, null, /Cấp nước chữa cháy ngoài nhà/, true],
  ["ong kho", null, null, null, true],
  ["spinkler", null, null, null, true],
  ["bình chữa cháy", null, null, /Bình chữa cháy/, true],
  ["mat na loc doc", null, null, /Mặt nạ/, true],
  ["hut khoi", null, null, null, true],
  ["xyzw", null, null, null, false]
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(String(e)));
  await p.goto("file://" + process.argv[2]);
  const fail = [];
  for (const [q, pre, ty, first, has] of C) {
    await p.evaluate(q => renderSearch(q), q);
    const r = await p.evaluate(() => ({ pre: (document.querySelector("#view .precard") || {}).innerText || "", ty: (document.querySelector("#view .pick[data-ct]") || { dataset: {} }).dataset.ct || null, first: (document.querySelector("#view .results .ttl") || {}).textContent || "", n: document.querySelectorAll("#view .results li").length, note: (document.querySelector("#view .note") || {}).textContent || "" }));
    const bad = [];
    if (pre ? !pre.test(r.pre.replace(/\s+/g, " ")) : r.pre) bad.push("thẻ tra ngay: " + JSON.stringify(r.pre.replace(/\s+/g, " ")));
    if (ty !== undefined && (ty ? r.ty !== ty : r.ty)) bad.push(`loại gợi ý ${r.ty} ≠ ${ty}`);
    if (first && !first.test(r.first)) bad.push("kết quả đầu: " + r.first);
    if (has !== r.n > 0) bad.push(`số kết quả ${r.n}`);
    if (q === "spinkler" && !/sprinkler/.test(r.note)) bad.push("không báo sửa lỗi gõ");
    if (bad.length) fail.push(q + ": " + bad.join("; "));
  }
  // tô sáng không cắt giữa từ ("cư" không tô trong "cửa")
  const midWord = await p.evaluate(() => { renderSearch("chung cu"); return [...document.querySelectorAll("#view mark")].filter(m => /^[\p{L}]/u.test((m.nextSibling || {}).textContent || "") || /[\p{L}]$/u.test((m.previousSibling || {}).textContent || "")).length; });
  if (midWord) fail.push(`tô sáng cắt giữa từ: ${midWord} chỗ`);
  // bấm thẻ tra ngay → điền thông số, mở tra công trình
  await p.evaluate(() => { document.getElementById("q").value = "kho 5000m2"; renderSearch("kho 5000m2"); });
  await p.click("#view .precard"); await p.waitForTimeout(150);
  const st = await p.evaluate(() => ({ h: location.hash, id: ctV.id, a: ctV.a, n: ctV.n, q: document.getElementById("q").value, res: document.getElementById("ctres").innerText }));
  if (!(st.h === "#cong-trinh" && st.id === "kho" && st.a === 5000 && st.n === 1 && st.q === "" && /5\.000 m²/.test(st.res))) fail.push("bấm thẻ tra ngay: " + JSON.stringify(st).slice(0, 200));
  // thẻ tra ngay đặt lại số xe của lần trước; gara ngầm → số tầng hầm
  await p.evaluate(() => { renderSearch("gara ngầm 2 tầng 300 xe"); }); await p.click("#view .precard"); await p.waitForTimeout(100);
  const g1 = await p.evaluate(() => ({ nb: ctV.nb, bas: ctV.bas, cho: ctV.cho, n: ctV.n }));
  await p.evaluate(() => { location.hash = "home"; }); await p.waitForTimeout(100); await p.evaluate(() => renderSearch("chung cư 20 tầng 1500 m2 mỗi tầng")); await p.click("#view .precard"); await p.waitForTimeout(100);
  const g2 = await p.evaluate(() => ({ cho: ctV.cho, a: ctV.a, dt1: ctV.dt1 }));
  if (!(g1.nb === 2 && g1.bas && g1.cho === 300 && g1.n === 1 && g2.cho === 0 && g2.a === 30000 && g2.dt1 === 1500)) fail.push("gara ngầm / đặt lại số xe: " + JSON.stringify([g1, g2]));
  // gõ trong ô loại nhà của form
  await p.fill("#ctq", "chung cu 20 tang 60m"); await p.waitForTimeout(80);
  if (!/20 tầng · 60 m/.test(await p.innerText("#ctlist"))) fail.push("ô loại nhà trong form không hiện thẻ tra ngay");
  await p.click("#ctlist .precard"); await p.waitForTimeout(120);
  if (!(await p.evaluate(() => ctV.id === "chung-cu" && ctV.n === 20 && ctV.h === 60))) fail.push("thẻ trong form không điền thông số");
  fail.concat(errs).forEach(f => console.log("✗", f));
  console.log(`${C.length + 4 - fail.length}/${C.length + 4} kiểm tra tìm kiếm đạt`);
  await b.close(); process.exit(fail.length || errs.length ? 1 : 0);
})();
