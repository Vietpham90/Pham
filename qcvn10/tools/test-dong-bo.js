// Kiểm thử đồng bộ theo tài khoản Claude: giả lập claude.use("db"/"user") dùng chung một kho cho hai "máy" (hai trình duyệt riêng).
// Dùng: node qcvn10/tools/test-dong-bo.js /tmp/q10.html
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const ok = [], errs = [];
  const check = (c, m) => (c ? ok : errs).push(m);
  const cloud = {}; // path -> JSON
  const mock = () => {
    window.claude = { use: async name => {
      if (name === "user") return { id: async () => "u1" };
      if (name === "db") return { doc: path => ({
        get: async () => { const v = await window.__cloudGet(path); return { exists: v !== null, data: () => v === null ? undefined : JSON.parse(v) }; },
        set: async data => { await window.__cloudSet(path, JSON.stringify(data)); }
      }) };
      return null;
    } };
  };
  const machine = async () => {
    const c = await b.newContext({ viewport: { width: 390, height: 844 } });
    await c.exposeFunction("__cloudGet", p => (p in cloud ? cloud[p] : null));
    await c.exposeFunction("__cloudSet", (p, v) => { cloud[p] = v; });
    await c.addInitScript(mock);
    const p = await c.newPage(); p.on("pageerror", e => errs.push("pageerror " + e));
    return { c, p };
  };
  const file = "file://" + process.argv[2];
  // Máy A: lưu mục, nhập công trình, chọn nền tối
  const A = await machine();
  await A.p.goto(file + "#home"); await A.p.waitForTimeout(400);
  check(/Đồng bộ theo tài khoản Claude/.test(await A.p.innerText("#syncst")), "máy A: hiện trạng thái đồng bộ");
  await A.p.click('.pop button[data-ct="kho"]'); await A.p.waitForTimeout(100);
  await A.p.fill("#ct-a", "7500"); await A.p.waitForTimeout(100);
  await A.p.evaluate(() => { location.hash = "pl-a"; }); await A.p.waitForTimeout(150);
  await A.p.click("details[open] .star"); await A.p.waitForTimeout(50);
  await A.p.evaluate(() => { location.hash = "home"; }); await A.p.waitForTimeout(100);
  await A.p.click('.mau button[data-mau="toi"]');
  await A.p.waitForTimeout(2200);
  const doc = cloud["data/users/u1/q10"] && JSON.parse(cloud["data/users/u1/q10"]);
  check(doc && doc.data && /"kho"/.test(doc.data["q10-ct"]) && doc.data["q10-mau"] === "toi" && /--/.test(doc.data["q10-saved"]), "máy A: đã ghi lên tài khoản (công trình, mục lưu, màu nền)");
  // Máy B: mở lần đầu → nhận dữ liệu
  const B = await machine();
  await B.p.goto(file + "#cong-trinh"); await B.p.waitForTimeout(600);
  const st = await B.p.evaluate(() => ({ id: ctV.id, a: ctV.a, saved: saved.length, mau: document.documentElement.dataset.mau, sel: document.getElementById("ct-id") && document.getElementById("ct-id").value }));
  check(st.id === "kho" && st.a === 7500 && st.saved === 1 && st.mau === "toi" && st.sel === "kho", "máy B: nhận công trình kho 7 500 m², 1 mục lưu, nền tối " + JSON.stringify(st));
  // Máy B sửa → máy A nhận khi quay lại trang
  await B.p.fill("#ct-a", "9000"); await B.p.waitForTimeout(2200);
  await A.p.evaluate(() => document.dispatchEvent(new Event("visibilitychange"))); await A.p.waitForTimeout(400);
  check(await A.p.evaluate(() => ctV.a) === 9000, "máy A: nhận sửa đổi từ máy B khi quay lại trang");
  // Không có claude.use (bản offline) → không lỗi, không hiện trạng thái
  const C = await b.newContext(); const pc = await C.newPage(); pc.on("pageerror", e => errs.push("offline pageerror " + e));
  await pc.goto(file + "#home"); await pc.waitForTimeout(200);
  check((await pc.innerText("#syncst").catch(() => "")) === "", "không có tài khoản (offline): chạy bình thường, không hiện đồng bộ");
  errs.forEach(e => console.log("✗", e));
  console.log(`${ok.length}/${ok.length + errs.length} kiểm tra đồng bộ đạt`);
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
