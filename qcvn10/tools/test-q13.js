// Kiểm thử bộ quy tắc QCVN 13:2018/BXD (gara ô tô) — đáp án tính tay theo từng bảng, điều.
// Dùng: node qcvn10/tools/test-q13.js /tmp/q10.html
const { chromium } = require("playwright");
// [tên, loại, tham số, kỳ vọng: [mẫu chữ, mức] | ["không có QCVN 13"]]
const C = [
  ["Ngầm 1 tầng 10 000 m², I S0, 300 chỗ, dưới nhà khác", "de-xe", { bas: true, nb: 1, dt1: 10000, cho: 300, bac: "I", S: "S0", inside: true, phh: 3.5 }, [
    [/Diện tích 1 tầng 10\.000 m² > \*\*3 000 m²\*\*.*\*\*4 khoang/, "bad"], [/^\*\*Chữa cháy tự động\*\*.*gara ngầm/, "req"], [/2 lăng × 5 L\/s/, "val"],
    [/QCVN 13 không quy định riêng cho gara ngầm 1 tầng/, "val"], [/tạo áp suất dương/, "req"], [/1 dốc đôi hoặc 2 dốc đơn/, "val"], [/Hệ thống báo cháy loại/, "không có"], [/Thang máy chở lực lượng/, "không có"]]],
  ["Ngầm 3 tầng 2 500 m², I S0, 250 chỗ", "de-xe", { bas: true, nb: 3, dt1: 2500, cho: 250, bac: "I", S: "S0" }, [
    [/Diện tích 1 tầng 2\.500 m² ≤/, "ok"], [/Số tầng ngầm 3 ≤ 5/, "ok"], [/Hệ thống báo cháy loại 4 và 5/, "req"], [/Thang máy chở lực lượng chữa cháy/, "req"],
    [/Nước ngoài nhà 20 L\/s/, "val"], [/riêng biệt/, "req"], [/khoang đệm áp suất dương\*\* ở từng tầng hầm/, "req"]]],
  ["Ngầm 2 tầng, 40 chỗ → báo cháy loại 2", "de-xe", { bas: true, nb: 2, dt1: 1500, cho: 40, bac: "I", S: "S0" }, [[/Hệ thống báo cháy loại 2/, "req"], [/Thang máy chở lực lượng/, "không có"]]],
  ["Ngầm 2 tầng, 120 chỗ → loại 3", "de-xe", { bas: true, nb: 2, dt1: 2500, cho: 120, bac: "I", S: "S0" }, [[/Hệ thống báo cháy loại 3/, "req"]]],
  ["Ngầm bậc II S0, 4 tầng → vượt (≤ 3)", "de-xe", { bas: true, nb: 4, dt1: 2000, bac: "II", S: "S0" }, [[/Số tầng ngầm 4 > 3/, "bad"]]],
  ["Ngầm bậc III → không đáp ứng Bảng 4", "de-xe", { bas: true, nb: 1, dt1: 1000, bac: "III", S: "S0" }, [[/Bảng 4 chỉ cho gara ngầm/, "bad"]]],
  ["Ngầm 1 tầng 20 chỗ trên đất trống → miễn sprinkler", "de-xe", { bas: true, nb: 1, dt1: 600, cho: 20, bac: "I", S: "S0" }, [[/^\*\*Chữa cháy tự động\*\*.*≤ 25 chỗ/, "no"]]],
  ["Kín nổi 3 tầng 4 000 m², I S0, 120 chỗ", "de-xe", { n: 3, dt1: 4000, a: 12000, cho: 120, bac: "I", S: "S0", phh: 3.3, vol: 39600 }, [
    [/Diện tích 1 tầng 4\.000 m² ≤ \*\*5\.200 m²/, "ok"], [/^\*\*Chữa cháy tự động\*\*.*từ 2 tầng/, "req"], [/Hệ thống báo cháy loại 2/, "req"], [/Nước ngoài nhà 20 L\/s/, "val"], [/khí CO/, "req"]]],
  ["Kín nổi 2 tầng, 80 chỗ → loại 1", "de-xe", { n: 2, dt1: 2000, cho: 80, bac: "I", S: "S0" }, [[/Hệ thống báo cháy loại 1/, "req"]]],
  ["Kín 1 tầng IV S1 2 500 m² → sprinkler (≥ 2 000)", "de-xe", { n: 1, dt1: 2500, bac: "IV", S: "S1" }, [[/Diện tích 1 tầng 2\.500 m² ≤ \*\*3\.600/, "ok"], [/^\*\*Chữa cháy tự động\*\*.*2\.500 m² ≥ 2\.000/, "req"]]],
  ["Kín 1 tầng I 6 500 m² → phát hiện cháy", "de-xe", { n: 1, dt1: 6500, bac: "I", S: "S0" }, [[/^\*\*Chữa cháy tự động\*\*/, "no"], [/Phát hiện cháy tự động/, "req"]]],
  ["Kín 1 tầng bậc II S1 4 000 m² → QCVN 10 chặt hơn (3 600)", "de-xe", { n: 1, dt1: 4000, a: 4000, bac: "II", S: "S1" }, [[/^\*\*Chữa cháy tự động\*\*/, "no"], [/QCVN 10:2025 yêu cầu chữa cháy tự động/, "bad"]]],
  ["Kín 1 tầng bậc I S0 6 500 m² → cả hai không bắt buộc", "de-xe", { n: 1, dt1: 6500, a: 6500, bac: "I", S: "S0" }, [[/QCVN 10:2025 yêu cầu/, "không có"]]],
  ["Kín 1 tầng I 7 000 m² → sprinkler", "de-xe", { n: 1, dt1: 7000, bac: "I", S: "S0" }, [[/^\*\*Chữa cháy tự động\*\*/, "req"]]],
  ["Kín IV S0 2 tầng → chỉ cho 1 tầng", "de-xe", { n: 2, dt1: 1000, bac: "IV", S: "S0" }, [[/Số tầng 2 > 1/, "bad"], [/chỉ cho gara \*\*1 tầng/, "bad"]]],
  ["Hở 4 tầng I S0 6 000 m² → vượt 5 200", "de-xe", { n: 4, dt1: 6000, gara: "ho", bac: "I", S: "S0", vol: 79200 }, [
    [/Diện tích 1 tầng 6\.000 m² > \*\*5\.200/, "bad"], [/^\*\*Chữa cháy tự động\*\*.*dạng hở/, "no"], [/Ống khô/, "req"], [/Hút khói/, "không có"], [/Nước ngoài nhà 30 L\/s/, "val"]]],
  ["Hở IV S1 3 tầng → vượt (≤ 2)", "de-xe", { n: 3, dt1: 500, gara: "ho", bac: "IV", S: "S1" }, [[/Số tầng 3 > 2/, "bad"]]],
  ["Dạng ngăn 2 tầng → miễn sprinkler, họng nước", "de-xe", { n: 2, dt1: 800, ngan: true, bac: "I", S: "S0" }, [[/^\*\*Chữa cháy tự động\*\*.*dạng ngăn/, "no"], [/Họng nước bên trong: được không đặt/, "no"]]],
  ["Cơ khí 80 xe → vượt 50 xe/khối", "gara-ck", { n: 6, h: 18, cho: 80 }, [[/Gara cơ khí: mỗi khối/, "bad"], [/^\*\*Chữa cháy tự động\*\*.*cơ khí/, "req"], [/Nước ngoài nhà 10 L\/s/, "val"], [/Ống khô/, "req"]]],
  ["Chung cư có hầm 2 tầng 10 000 m², 200 xe", "chung-cu", { n: 20, h: 60, a: 20000, nb: 2, pcar: 200, parea: 10000 }, [
    [/F1\.3 được dùng \*\*sàn ngăn cháy loại 2/, "warn"], [/Diện tích 1 tầng 5\.000 m² >/, "bad"], [/Hệ thống báo cháy loại 3/, "req"], [/Nước ngoài nhà 20 L\/s/, "val"], [/tạo áp suất dương/, "req"]]],
  ["Mầm non có gara → không được bố trí", "mam-non", { n: 3, h: 10, a: 1500, pcar: 10, parea: 300 }, [[/\*\*Không được\*\* bố trí gara/, "bad"]]],
  ["Nhà để xe máy → không thuộc QCVN 13", "de-xe", { n: 2, dt1: 800, xm: true }, [["không có QCVN 13"]]]
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto("file://" + process.argv[2]);
  const res = await p.evaluate(C => C.map(([ten, id, v0, ex]) => {
    const v = Object.assign({}, DEF, { n: 1, h: 0, a: 0, nb: 0 }, v0);
    const r = q13Eval(TI[id], v), bad = [];
    for (const e of ex) {
      if (e[0] === "không có QCVN 13") { if (r) bad.push("lẽ ra không có QCVN 13"); continue; }
      if (!r) { bad.push("không có kết quả QCVN 13"); break; }
      const re = new RegExp(e[0]), it = r.items.find(i => re.test(i.txt)), got = it ? it.lv : "không có";
      if (got !== e[1]) bad.push(`${e[0]}: mong đợi ${e[1]}, nhận ${got}${it ? " — " + it.txt.slice(0, 100) : ""}`);
    }
    return { ten, bad };
  }), C.map(([a, b, c, d]) => [a, b, c, d.map(x => x.length === 1 ? x : [x[0].source, x[1]])]));
  const fail = res.filter(r => r.bad.length);
  fail.forEach(r => console.log("✗", r.ten, "\n   " + r.bad.join("\n   ")));
  console.log(`${res.length - fail.length}/${res.length} tình huống QCVN 13 đạt`);
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
