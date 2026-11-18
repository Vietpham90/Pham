// Kịch bản tổng hợp nhiều loại công trình (TTTM có hầm, rạp chưa nhập số người, nhiều tầng hầm để xe…).
// Dùng: node qcvn10/tools/test-kich-ban.js /tmp/q10.html
const { chromium } = require("playwright");
// [tên, loại, tham số, [[mẫu, "req" | "no" | "val" | "có" | "không có"]]]
const C = [
  ["TTTM 5 tầng có 2 hầm → sprinkler theo 15.2.2 (trên mặt đất ≥ 3 tầng)", "cho-tttm", { n: 5, h: 24, a: 40000, nb: 2, bas: true }, [[/^\*\*Hệ thống chữa cháy tự động\*\* — trên mặt đất ≥ 3 tầng.*15\.2\.2.*15\.1/, "req"]]],
  ["TTTM 2 tầng 3 000 m² có hầm → sprinkler do tầng hầm (15.1)", "cho-tttm", { n: 2, h: 9, a: 3000, nb: 1, bas: true }, [[/^\*\*Hệ thống chữa cháy tự động\*\* — tầng hầm, bán hầm: ≥ 200 m² \(15\.1\) — phần trên mặt đất 1 – 2 tầng/, "req"]]],
  ["TTTM 2 tầng 3 000 m² không hầm → không bắt buộc", "cho-tttm", { n: 2, h: 9, a: 3000, nb: 0 }, [[/^\*\*Hệ thống chữa cháy tự động\*\* — trên mặt đất 1 – 2 tầng: ≥ 3 500/, "no"]]],
  ["Rạp 3 tầng 800 chỗ, chưa nhập người/tầng → loa (ước 267 người)", "nha-hat", { n: 3, h: 12, a: 3000, nb: 0, seats: 800 }, [[/^\*\*Loa thông báo.*ước ≥ 267 người/, "req"]]],
  ["Rạp 2 tầng 80 chỗ → ước 40 người, không bắt buộc loa", "nha-hat", { n: 2, h: 8, a: 600, nb: 0, seats: 80 }, [[/^\*\*Loa thông báo/, "no"]]],
  ["Karaoke chưa nhập gì → nhắc nhập số người", "karaoke", { n: 2, h: 8, a: 300, nb: 0 }, [[/nhập số người trên 1 tầng để xét mục 2/, "no"]]],
  ["Văn phòng 3 hầm 2 500 m² để xe → khoang mỗi tầng 833 m²", "van-phong", { n: 25, h: 98, a: 50000, vol: 180000, nb: 3, bas: true, pcar: 250, parea: 2500, phh: 3.5 }, [[/Họng nước khu để xe.*833 m² \(2\.500 m² \/ 3 tầng hầm\).*2 lăng × 2,5 L\/s/, "val"]]],
  ["TTTM 2 hầm 8 000 m² để xe → khoang 4 000 m², 2 × 5 L/s", "cho-tttm", { n: 5, h: 24, a: 40000, vol: 200000, nb: 2, bas: true, pcar: 300, parea: 8000, phh: 3.5 }, [[/Họng nước khu để xe.*4\.000 m².*2 lăng × 5 L\/s/, "val"]]],
  ["Bệnh viện 9 tầng 32 m → báo cháy địa chỉ, sprinkler, ống khô, nước ngoài nhà 30 L/s", "benh-vien", { n: 9, h: 32, a: 22500, vol: 80000, nb: 0 }, [
    [/Báo cháy địa chỉ/, "req"], [/^\*\*Hệ thống chữa cháy tự động/, "req"], [/Đường ống khô/, "req"], [/Lưu lượng ngoài nhà 30 L\/s/, "val"]]],
  ["Mầm non 2 tầng 150 cháu → báo cháy, họng nước; không sprinkler", "mam-non", { n: 2, h: 7, a: 1200, vol: 4500, nb: 0, kids: 150 }, [
    [/^\*\*Hệ thống báo cháy tự động/, "req"], [/^\*\*Hệ thống họng nước/, "req"], [/^\*\*Hệ thống chữa cháy tự động/, "no"]]],
  ["Chung cư 30 tầng, hành lang > 10 m → H.5 tối thiểu 3 × 2,5 L/s", "chung-cu", { n: 30, h: 99, a: 30000, vol: 100000, nb: 0, hl: true }, [[/Số tia × lưu lượng\*\*: 3 × 2,5 L\/s.*chỉ quy định chung cư đến 25 tầng/, "val"]]],
  ["Nhà để xe hở 5 tầng → báo cháy (≥ 4 tầng), không sprinkler", "de-xe", { n: 5, h: 15, a: 15000, vol: 50000, nb: 0, gara: "ho", cho: 500 }, [[/^\*\*Hệ thống báo cháy tự động\*\* — dạng hở/, "req"], [/^\*\*Hệ thống chữa cháy tự động\*\* — dạng hở/, "no"]]],
  ["Chung cư 9 tầng 30 m → H.7: tia 6 m, lăng 16 mm 2,6 L/s > 2,5", "chung-cu", { n: 9, h: 30, a: 9000, vol: 30000, nb: 0 }, [[/Lưu lượng mỗi tia theo Bảng H\.7\*\* \(DN 50, tia đặc ≥ 6 m.*lăng 16 mm → 2,6 L\/s, 0,100 MPa.*\*\*2,6 L\/s\/tia\*\*/, "val"]]],
  ["Văn phòng 95 m → tia 16 m: lăng 13 mm 3,2 L/s, tổng 4 × 3,2 = 12,8", "van-phong", { n: 25, h: 95, a: 50000, vol: 180000, nb: 0 }, [[/tia đặc ≥ 16 m.*lăng 13 mm → 3,2 L\/s.*4 × 3,2 = \*\*12,8 L\/s/, "val"]]],
  ["Rạp 800 chỗ 5 L/s → H.7 không làm tăng", "nha-hat", { n: 3, h: 12, a: 3000, vol: 15000, seats: 800, nb: 0 }, [[/Lăng nhỏ nhất đạt tia: \*\*2,6 L\/s\*\* ≤ 5 L\/s → giữ 5 L\/s\/tia/, "val"]]],
  ["Kho 1 tầng cao 12 m → thêm dòng tia ≥ 12 m", "kho", { n: 1, h: 12, a: 6000, vol: 72000, nb: 0, hang: "C1" }, [[/Nhà 1 tầng: nếu gian cao \*\*12 m\*\*.*tia đặc ≥ 12 m.*lăng 13 mm → 2,6 L\/s/, "val"]]],
  ["Khách sạn 3 tầng 900 m² → TBĐL, mặt nạ, không họng nước", "khach-san", { n: 3, h: 10, a: 900, vol: 3000, nb: 0 }, [[/^\*\*Hệ thống báo cháy tự động/, "alt"], [/Mặt nạ lọc độc/, "req"], [/^\*\*Hệ thống họng nước/, "no"]]]
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto("file://" + process.argv[2]);
  const res = await p.evaluate(C => C.map(([ten, id, v0, ex]) => {
    const v = Object.assign({}, DEF, v0); ["n", "h", "a", "vol", "nb"].forEach(k => v[k] = +v[k] || 0);
    const all = ctEvaluate(TI[id], v).flatMap(s => s.items).map(i => ({ lv: i.lv, txt: i.txt }));
    const bad = [];
    for (const [src, want] of ex) {
      const re = new RegExp(src.source || src); const it = all.find(i => re.test(i.txt));
      const got = !it ? "không có" : want === "có" ? "có" : it.lv;
      if (got !== want) bad.push(`${src}: mong đợi ${want}, nhận ${got}${it ? " — " + it.txt.slice(0, 90) : ""}`);
    }
    return { ten, bad };
  }), C.map(([a, b, c, d]) => [a, b, c, d.map(([r, w]) => [r.source, w])]));
  const fail = res.filter(r => r.bad.length);
  fail.forEach(r => console.log("✗", r.ten, "\n   " + r.bad.join("\n   ")));
  console.log(`${res.length - fail.length}/${res.length} kịch bản tổng hợp đạt`);
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
