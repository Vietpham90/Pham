// Kiểm tra tính chất (bất biến) của bộ quy tắc
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + process.argv[2] + '#cong-trinh'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const fails = [];
    const txt = o => o.out.map(s => s.items.map(x => x.txt).join("\n")).join("\n");
    const feasible = o => { const s = o.out.find(s => s.t === "Bậc chịu lửa và khoang cháy"); return s && !s.items.some(x => x.lv === "bad" && /Không có dòng nào|vượt/.test(x.txt)); };
    const road = o => { const m = txt(o).match(/Mép đường cách tường nhà \*\*≤ (\d+) m/); return m ? +m[1] : null; };
    const hs = [3, 9, 12, 15, 20, 28, 29, 40, 50, 60, 75, 90];
    CT.forEach((c, i) => {
      const isF13 = c.g === "F1.3", isF5 = c.g.startsWith("F5");
      let prevRoad = 0;
      hs.forEach(h => {
        const n = Math.max(1, Math.round(h / 3.3) + 1);
        const base = { i, h, n, nb: 1, a: 1000, sp: false, hang: "C", v: 20000 };
        const o = ctEvaluate(base), t = txt(o);
        // 1. Thang máy chữa cháy bắt buộc khi > 28 m (F1.3: > 50 m)
        const needLift = isF13 ? h > 50 : h > 28;
        if (needLift !== /\*\*Thang máy chữa cháy\*\*/.test(t)) fails.push(`${c.n} ${h} m: thang máy chữa cháy ${needLift ? "thiếu" : "thừa"}`);
        // 2. Buồng thang không nhiễm khói khi > 28 m
        if (h > 28 && !/không nhiễm khói, trong đó phải có N1|Nhà F5 được thay N1/.test(t)) fails.push(`${c.n} ${h} m: thiếu yêu cầu N1`);
        // 3. Khoảng cách đường xe không giảm khi nhà cao lên
        const rd = road(o); if (rd != null && rd < prevRoad) fails.push(`${c.n} ${h} m: khoảng cách đường xe giảm`); if (rd) prevRoad = rd;
        // 4. Sprinkler không làm kết quả xấu đi
        const withSp = ctEvaluate({ ...base, sp: true });
        if (feasible(o) && !feasible(withSp)) fails.push(`${c.n} ${h} m: có sprinkler lại không đạt`);
        // 5. Diện tích nhỏ hơn không làm kết quả xấu đi
        const big = ctEvaluate({ ...base, a: 4000 });
        if (feasible(big) && !feasible(o)) fails.push(`${c.n} ${h} m: 1 000 m² không đạt nhưng 4 000 m² đạt`);
        // 6. Thấp hơn không làm kết quả xấu đi (cùng diện tích, cùng số tầng)
        const lower = ctEvaluate({ ...base, h: Math.max(0, h - 3) });
        if (feasible(o) && !feasible(lower) && !(isF5 && h <= 3)) fails.push(`${c.n}: đạt ở ${h} m nhưng không đạt ở ${h - 3} m`);
        // 7. Có ít nhất 1 dòng trong mỗi nhóm chính
        ["Phạm vi áp dụng", "Thoát nạn", "Tiếp cận chữa cháy và cứu nạn"].forEach(st => { const s = o.out.find(x => x.t === st); if (!s || !s.items.length) fails.push(`${c.n} ${h} m: nhóm "${st}" trống`); });
      });
    });
    // 8. Gian phòng: số người tăng thì số lối ra không giảm, chiều rộng không giảm
    ["F3.1", "F4.3", "F2.1", "F1.1", "F5.1"].forEach(g => {
      let prevExits = 0, prevW = 0;
      [5, 16, 30, 50, 120, 400, 1200].forEach(P => {
        const o = gpEvaluate({ g, k: 2, a: 800, ch: 4, p: P, bac: "I", f5h: "C2", f5s: "S0", den: 1, lane: true });
        const t = o.out.map(s => s.items.map(x => x.txt).join("\n")).join("\n");
        const ex = /≥ 2 lối ra/.test(t) ? 2 : 1; if (ex < prevExits) fails.push(`gian ${g}: ${P} người số lối ra giảm`); prevExits = ex;
        const m = t.match(/mỗi lối ≥ ([\d,]+) m|Lối ra ≥ ([\d,]+) m/); const w = m ? +(m[1] || m[2]).replace(",", ".") : 0; if (w + 1e-9 < prevW) fails.push(`gian ${g}: ${P} người chiều rộng giảm`); prevW = Math.max(prevW, w);
      });
    });
    // 9. G.3: mật độ tăng thì khoảng cách không tăng; khối tích tăng thì khoảng cách không giảm
    ["A", "C1", "C4", "E"].forEach(hg => ["S0", "S1"].forEach(S => {
      let prev = Infinity;
      [0.5, 2, 4].forEach(den => { const t = gpEvaluate({ g: "F5.1", k: 12, a: 2000, ch: 5, bac: "III", f5h: hg, f5s: S, den }).out.map(s => s.items.map(x => x.txt).join(" ")).join(" "); const m = t.match(/lối ra thoát nạn gần nhất: \*\*≤ (\d+) m/); const d = m ? +m[1] : null; if (d != null && d > prev) fails.push(`G.3 ${hg} ${S}: mật độ ${den} khoảng cách tăng`); if (d != null) prev = d; });
      let pv = 0;
      [1000, 3000, 7000, 10000, 13000].forEach(a => { const t = gpEvaluate({ g: "F5.1", k: 12, a, ch: 5, bac: "II", f5h: hg, f5s: S, den: 1 }).out.map(s => s.items.map(x => x.txt).join(" ")).join(" "); const m = t.match(/lối ra thoát nạn gần nhất: \*\*≤ (\d+) m/); const d = m ? +m[1] : null; if (d != null && d < pv) fails.push(`G.3 ${hg} ${S}: ${a} m² khoảng cách giảm`); if (d != null) pv = d; });
    }));
    return fails;
  });
  console.log(r.length ? r.slice(0, 40).join("\n") + `\n(${r.length} lỗi)` : "Tất cả tính chất đều đúng");
  await b.close();
})();
