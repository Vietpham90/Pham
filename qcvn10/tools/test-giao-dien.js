// Kiểm thử giao diện: nhập số kiểu Việt Nam, tràn ngang ở 320 px, chế độ tối, tìm kiếm, liên kết số điều, lưu mục.
// Dùng: node qcvn10/tools/test-giao-dien.js /tmp/q10.html [thư-mục-ảnh]
const { chromium } = require("playwright");
(async () => {
  const file = "file://" + process.argv[2], shots = process.argv[3];
  const b = await chromium.launch(); const errs = []; const ok = [];
  const check = (cond, msg) => (cond ? ok : errs).push(msg);
  // 1. Nhập số
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on("pageerror", e => errs.push("pageerror " + e));
  await p.goto(file + "#cong-trinh"); await p.waitForTimeout(100);
  await p.selectOption("#ct-id", "chung-cu"); await p.waitForTimeout(50);
  await p.fill("#ct-n", "5"); await p.fill("#ct-a", "1.500"); await p.fill("#ct-h", "16,5");
  await p.waitForTimeout(50);
  let txt = await p.innerText("#ctres");
  check(txt.includes("1.500 m²") && txt.includes("16,5 m"), "nhập 1.500 và 16,5 hiểu đúng");
  check(/Hệ thống báo cháy tự động — ≥ 5 tầng/.test(txt), "chung cư 5 tầng → báo cháy");
  await p.fill("#ct-a", "1 200"); await p.waitForTimeout(50); txt = await p.innerText("#ctres");
  check(txt.includes("1.200 m²"), "nhập 1 200 (có dấu cách)");
  await p.fill("#ct-a", "-50"); await p.waitForTimeout(50); txt = await p.innerText("#ctres");
  check(!txt.includes("-50"), "số âm bị chặn về 0");
  await p.fill("#ct-a", "abc"); await p.waitForTimeout(50); txt = await p.innerText("#ctres");
  check(txt.includes("0 m²"), "chữ không phải số → 0");
  // 2. Ô nhập không mất tiêu điểm khi gõ
  await p.fill("#ct-vol", ""); await p.click("#ct-vol"); await p.keyboard.type("12000"); await p.waitForTimeout(50);
  check(await p.evaluate(() => document.activeElement.id) === "ct-vol" && await p.inputValue("#ct-vol") === "12000", "gõ liên tục không mất tiêu điểm");
  // 3. Đổi loại nhà bằng ô gõ
  await p.fill("#ctq", "karaoke"); await p.waitForTimeout(50);
  await p.click("#ctlist .pick"); await p.waitForTimeout(80);
  check(await p.inputValue("#ct-id") === "karaoke", "chọn loại nhà từ ô gõ");
  check(await p.$("#ct-room") !== null, "karaoke có ô người trong phòng lớn nhất");
  // 4. Lưu trạng thái qua tải lại
  await p.reload(); await p.waitForTimeout(100);
  check(await p.inputValue("#ct-id") === "karaoke", "nhớ loại nhà sau khi tải lại");
  // 5. Tìm kiếm + liên kết số điều
  await p.fill("#q", "dn65"); await p.waitForTimeout(250);
  check(/kết quả/i.test(await p.innerText("#view")), "tìm không dấu 'dn65'");
  await p.fill("#q", "khach san"); await p.waitForTimeout(250);
  check(await p.$("#view .pick[data-ct='khach-san']") !== null, "tìm 'khach san' gợi ý tra công trình");
  await p.click("#view .pick[data-ct='khach-san']"); await p.waitForTimeout(100);
  check(await p.inputValue("#ct-id") === "khach-san" && (await p.evaluate(() => location.hash)) === "#cong-trinh", "bấm gợi ý mở Tra theo công trình");
  await p.click("#ctres .ref >> nth=0"); await p.waitForTimeout(200);
  check(/kết quả/i.test(await p.innerText("#view")), "bấm số điều → tìm thấy trong sổ tay");
  const refs = await p.evaluate(() => {
    const bad = [], all = new Set();
    T.forEach(t => [{ n: 12, h: 40, a: 6000, vol: 30000, len: 600, ppl: 60 }, { n: 2, h: 6, a: 200, vol: 500, bas: true }].forEach(x => {
      const v = Object.assign({}, DEF, x);
      ctEvaluate(t, v).forEach(s => s.items.forEach(i => i.ref.split(/\s*;\s*/).forEach(r => all.add(r.replace(/\s+(mục|CT|chú thích|ghi chú|⁽).*$/i, "").trim()))));
    }));
    [...all].forEach(r => { if (!refFound(resolveRef(r))) bad.push(r); });
    return { n: all.size, bad };
  });
  check(!refs.bad.length, `mọi số điều trong kết quả đều tìm thấy (${refs.n} mã)` + (refs.bad.length ? ": thiếu " + refs.bad.join(", ") : ""));
  // 6. Lưu mục
  await p.fill("#q", ""); await p.evaluate(() => { location.hash = "pl-a"; }); await p.waitForTimeout(150);
  await p.click("details[open] .star"); await p.evaluate(() => { location.hash = "da-luu"; }); await p.waitForTimeout(100);
  check((await p.$$("#view .results li")).length === 1, "lưu mục vào Đã lưu");
  // 7. Tính nước
  await p.evaluate(() => { location.hash = "tinh-nuoc"; }); await p.waitForTimeout(80);
  await p.fill("#w-pop", "30.000"); await p.waitForTimeout(80);
  const w = await p.innerText("#w-out");
  check(w.includes("25 L/s") && w.includes("50 L/s"), "khu dân cư 30 000 người, ≥ 3 tầng → 2 × 25 = 50 L/s");
  check(await p.evaluate(() => document.activeElement.id) === "w-pop", "ô dân số giữ tiêu điểm khi gõ");
  await p.evaluate(() => { location.hash = "h7"; }); await p.waitForTimeout(80);
  await p.selectOption("[data-h7=dn]", "65"); await p.selectOption("[data-h7=tip]", "19"); await p.selectOption("[data-h7=jet]", "16"); await p.selectOption("[data-h7=hose]", "20"); await p.waitForTimeout(60);
  const h7 = await p.innerText("#view");
  check(h7.includes("6,3 L/s") && h7.includes("0,28 MPa"), "H.7: DN65, lăng 19, tia 16 m, vòi 20 m → 6,3 L/s, 0,28 MPa");
  await p.evaluate(() => { location.hash = "cong-truong"; }); await p.waitForTimeout(80);
  await p.fill("#cs-floors", "1200; 450; 1000"); await p.waitForTimeout(60);
  check((await p.innerText("#cs-out")).includes("6 bình"), "công trường 1200; 450; 1000 m² → 3 + 1 + 2 = 6 bình");
  await p.uncheck("#cs-road"); await p.waitForTimeout(60);
  check((await p.innerText("#cs-out")).includes("12 bình"), "không có đường xe → gấp đôi 12 bình");
  // 7b. Gian phòng
  await p.evaluate(() => { location.hash = "gian-phong"; }); await p.waitForTimeout(80);
  await p.fill("#gp-q", "máy chủ"); await p.waitForTimeout(60);
  await p.fill("#gp-x", "30"); await p.waitForTimeout(60);
  let g = await p.innerText("#gpres");
  check(/Phòng máy chủ/.test(g) && (g.match(/Phải trang bị/g) || []).length === 2, "phòng máy chủ 30 m² → báo cháy và chữa cháy");
  await p.fill("#gp-x", "20"); await p.waitForTimeout(60); g = await p.innerText("#gpres");
  check(!/Phải trang bị/.test(g), "phòng máy chủ 20 m² → không bắt buộc");
  await p.fill("#gp-q", "may bien ap 220"); await p.waitForTimeout(60);
  check((await p.innerText("#gp-k")).includes("220 kV") && (await p.innerText("#view")).includes("MVA"), "lọc không dấu 'may bien ap 220', đơn vị MVA");
  await p.fill("#q", "kho tien"); await p.waitForTimeout(250);
  await p.click("#view .pick[data-gp]"); await p.waitForTimeout(100);
  check((await p.evaluate(() => location.hash)) === "#gian-phong" && (await p.innerText("#gpres")).includes("Kho tiền"), "tìm 'kho tien' → mở gian phòng kho tiền");
  // 7c. Quy tắc 70 %
  await p.evaluate(() => { location.hash = "cong-trinh"; }); await p.waitForTimeout(80);
  await p.selectOption("#ct-id", "hon-hop"); await p.waitForTimeout(80);
  await p.fill("#mix-a0", "3000"); await p.fill("#mix-a1", "0"); await p.fill("#mix-a2", "7000"); await p.waitForTimeout(60);
  check((await p.innerText("#mixres")).includes("nhà hỗn hợp"), "70 % đúng ngưỡng (7 000 / 10 000) → vẫn là nhà hỗn hợp");
  await p.fill("#mix-a2", "7001"); await p.waitForTimeout(60);
  check((await p.innerText("#mixres")).includes("> 70 %"), "70,0x % → áp dụng theo công năng chiếm ưu thế");
  await p.click("#mixres [data-ct]"); await p.waitForTimeout(80);
  check(await p.inputValue("#ct-id") === "chung-cu", "bấm nút chuyển sang tra chung cư");
  // 7d. Nút loại hay tra, mục tùy chọn thu gọn, thanh kết quả nổi
  await p.evaluate(() => { location.hash = "home"; }); await p.waitForTimeout(80);
  await p.click('.pop button[data-ct="kho"]'); await p.waitForTimeout(120);
  check(await p.inputValue("#ct-id") === "kho" && (await p.evaluate(() => location.hash)) === "#cong-trinh", "trang chủ: bấm 'Nhà kho' → tra công trình kho");
  await p.click('.pop button[data-ct="chung-cu"]'); await p.waitForTimeout(120);
  check(await p.inputValue("#ct-id") === "chung-cu" && await p.$('.pop button[data-ct="chung-cu"][aria-pressed="true"]') !== null, "trong form: bấm 'Chung cư' → đổi loại, nút được đánh dấu");
  await p.evaluate(() => { ["pcar", "parea", "phh", "pmoto", "tmTr", "tmHam", "srv", "pdien", "mba", "mbaKv"].forEach(k => ctV[k] = 0); ctAdvOpen = false; renderCT(); }); await p.waitForTimeout(60);
  check(await p.$eval("details.adv", d => !d.open), "mục để xe, phòng kỹ thuật thu gọn khi chưa nhập");
  await p.click("details.adv > summary"); await p.fill("#ct-pcar", "120"); await p.waitForTimeout(60);
  await p.selectOption("#ct-nb", "2"); await p.waitForTimeout(80);
  check(await p.$eval("details.adv", d => d.open) && (await p.innerText("details.adv > summary")).includes("1 ô đã nhập"), "đã nhập → mục mở sẵn, ghi số ô đã nhập");
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(80);
  const barTxt = await p.$eval("#ctbar", b => b.hidden ? "" : b.innerText);
  check(/\d+\s*mục phải trang bị/.test(barTxt), "thanh 'Xem kết quả' nổi khi đang ở form: " + barTxt.replace(/\s+/g, " "));
  await p.click("#ctbar"); await p.waitForTimeout(700);
  check(await p.$eval("#ctbar", b => b.hidden), "bấm thanh → cuộn tới kết quả, thanh ẩn");
  // 7e. Hình minh họa mặt cắt khớp kết quả
  const fig = await p.evaluate(() => {
    const r = [];
    for (const x of [{ id: "khach-san", n: 14, h: 46, a: 16800, vol: 60000, nb: 1, bas: true, pcar: 60, parea: 1200 }, { id: "chung-cu", n: 5, h: 17, a: 1500, vol: 5000, nb: 0, pcar: 0, parea: 0 }, { id: "ham", n: 1, h: 0, a: 0, len: 800, nb: 0 }]) {
      Object.assign(ctV, DEF, x); renderCT();
      const f = document.querySelector(".ctfig"), on = f ? [...f.querySelectorAll(".fg-leg .on")].map(e => e.textContent.split(" ")[0]) : null;
      r.push({ id: x.id, has: !!f, on, floors: f ? f.querySelectorAll(".fg-fl").length : 0, cars: f ? f.querySelectorAll(".fg-car").length : 0, brk: f ? !!f.querySelector(".fg-brk") : false });
    }
    return r;
  });
  check(fig[0].has && fig[0].brk && fig[0].floors === 7 && fig[0].cars === 4 && ["Báo", "Sprinkler", "Họng", "Ống", "Loa", "Nước"].every(k => fig[0].on.includes(k)), "hình khách sạn 14 tầng: 7 tầng vẽ + ngắt, hầm có xe, đủ 6 hệ thống " + JSON.stringify(fig[0]));
  check(fig[1].has && fig[1].floors === 5 && !fig[1].brk && fig[1].on.includes("Báo") && !fig[1].on.includes("Sprinkler"), "hình chung cư 5 tầng: 5 tầng, báo cháy có, sprinkler gạch " + JSON.stringify(fig[1]));
  check(!fig[2].has, "hầm đường bộ: không vẽ mặt cắt nhà");
  const ic = await p.evaluate(() => {
    const r = [];
    for (const x of [{ id: "nha-hat", n: 3, h: 12, a: 3000, vol: 15000, seats: 800, nb: 0 }, { id: "khach-san", n: 3, h: 10, a: 900, vol: 3000, nb: 0 }]) {
      Object.assign(ctV, DEF, x); renderCT();
      r.push({ dt: !!document.querySelector(".dt"), leg: document.querySelector(".fg-leg").innerText.replace(/\s+/g, " ") });
    }
    return r;
  });
  check(!ic[0].dt && /Báo cháy \+ nút ấn/.test(ic[0].leg) && /Họng nước 2 × 5 L\/s/.test(ic[0].leg), "rạp 800 chỗ: không còn khung chi tiết; chú giải 'Báo cháy + nút ấn', 'Họng nước 2 × 5 L/s' " + ic[0].leg);
  const tu = await p.evaluate(() => {
    const r = [];
    for (const x of [{ id: "chung-cu", n: 20, h: 65, a: 30000, vol: 100000, nb: 0, hlLen: 60, vong: 20 }, { id: "chung-cu", n: 12, h: 40, a: 12000, vol: 40000, nb: 0, hlLen: 8, vong: 20 }, { id: "khach-san", n: 6, h: 20, a: 6000, vol: 20000, nb: 0, hlLen: 100, vong: 15 }, { id: "khach-san", n: 8, h: 28, a: 6000, vol: 20000, nb: 0, hlLen: 0 }]) {
      Object.assign(ctV, DEF, x); renderCT();
      const it = [...document.querySelectorAll("#ctres li")].map(l => l.innerText.replace(/\s+/g, " "));
      r.push({ tia: (it.find(t => /Số tia × lưu lượng/.test(t)) || "").slice(0, 40), tu: (it.find(t => /Số tủ họng nước mỗi tầng|Nhập chiều dài hành lang/.test(t)) || "").slice(0, 60), cab: document.querySelectorAll(".ctfig svg > rect[rx='1.2']").length });
    }
    return r;
  });
  check(/3 × 2,5/.test(tu[0].tia) && /≈ 4/.test(tu[0].tu), "chung cư 20 tầng hành lang 60 m: 3 tia (hành lang > 10 m), 4 tủ/tầng " + JSON.stringify(tu[0]));
  check(/1 × 2,5/.test(tu[1].tia) && /≈ 1/.test(tu[1].tu), "chung cư 12 tầng hành lang 8 m: 1 tia, 1 tủ/tầng " + JSON.stringify(tu[1]));
  check(/≈ 4/.test(tu[2].tu), "khách sạn hành lang 100 m, vòi 15 m: 4 vị trí → 4 tủ/tầng " + JSON.stringify(tu[2]));
  check(/Nhập chiều dài hành lang/.test(tu[3].tu), "chưa nhập hành lang → nhắc nhập " + JSON.stringify(tu[3]));
  check(/Báo cháy độc lập/.test(ic[1].leg), "khách sạn 3 tầng: chú giải 'Báo cháy độc lập' " + ic[1].leg);
  await p.close();
  // 8. Tràn ngang ở 320 px, sáng và tối
  for (const scheme of ["light", "dark"]) {
    const c = await b.newContext({ viewport: { width: 320, height: 640 }, colorScheme: scheme }); const q = await c.newPage();
    for (const h of ["home", "cong-trinh", "tinh-nuoc", "h7", "cong-truong", "so-sanh", "gian-phong", "co-so", "nhieu-khoi", "kx06", "gara13", "pl-a", "h1", "h2"]) {
      await q.goto(file + "#" + h); await q.waitForTimeout(80);
      const over = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(over <= 0, `${scheme} ${h}: không tràn ngang (${over}px)`);
    }
    await q.goto(file + "#home"); await q.waitForTimeout(80);
    const bg = await q.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check(bg === "rgb(244, 236, 218)", `${scheme}: mặc định nền be (${bg})`);
    await q.click('.mau button[data-mau="may"]'); await q.waitForTimeout(50);
    const bg2 = await q.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check(scheme === "dark" ? bg2 !== "rgb(244, 236, 218)" : bg2 === "rgb(244, 236, 218)", `${scheme}: "Theo máy" → ${bg2}`);
    await q.reload(); await q.waitForTimeout(80);
    check(await q.evaluate(() => document.documentElement.dataset.mau) === "may", `${scheme}: nhớ lựa chọn màu nền`);
    await q.click('.mau button[data-mau="be"]'); await q.waitForTimeout(50);
    if (shots) { await q.goto(file + "#cong-trinh"); await q.waitForTimeout(100); await q.screenshot({ path: `${shots}/ct-${scheme}.png` }); }
    await c.close();
  }
  errs.forEach(e => console.log("✗", e));
  console.log(`${ok.length}/${ok.length + errs.length} kiểm tra giao diện đạt`);
  await b.close(); process.exit(errs.length ? 1 : 0);
})();
