// Tình huống thực tế cho chung cư và nhà kho, nhà xưởng — đáp án tính tay từ QCVN 10:2025/BCA.
// Mỗi kỳ vọng: [biểu thức tìm dòng kết quả, mức mong đợi ("req" | "alt" | "no" | "info" | "val" | "có" | "không có")]
// Dùng: node qcvn10/tools/test-chung-cu-kho.js /tmp/q10.html
const { chromium } = require("playwright");
const C = [
  // ---------- CHUNG CƯ ----------
  ["Chung cư mini 6 tầng, 900 m², cao 19 m", "chung-cu", { n: 6, h: 19, a: 900, vol: 2700 }, [
    [/^\*\*Hệ thống báo cháy tự động/, "req"], [/^\*\*Hệ thống chữa cháy tự động/, "no"], [/^\*\*Hệ thống họng nước/, "req"],
    [/^\*\*Số tia × lưu lượng\*\*: 1 × 2,5/, "val"], [/^\*\*Lưu lượng ngoài nhà 15 L\/s/, "val"], [/^\*\*Đường ống khô/, "không có"],
    [/^\*\*Loa thông báo và hướng dẫn/, "no"], [/Dụng cụ phá dỡ/, "req"], [/họng kép/, "không có"]]],
  ["Chung cư 4 tầng, 1 200 m² — được dùng thiết bị báo cháy độc lập", "chung-cu", { n: 4, h: 12, a: 1200 }, [
    [/^\*\*Hệ thống báo cháy tự động/, "alt"], [/^\*\*Hệ thống họng nước/, "no"]]],
  ["Chung cư 15 tầng, cao 45 m, hành lang 40 m, 2 hầm 120 xe, khối đế TM 1 200 m²", "chung-cu", { n: 15, h: 45, a: 15000, vol: 48000, nb: 2, hl: true, pcar: 120, parea: 6000, tmTr: 1200 }, [
    [/^\*\*Hệ thống chữa cháy tự động/, "req"], [/sprinkler tại cửa căn hộ/, "info"], [/^\*\*Số tia × lưu lượng\*\*: 2 × 2,5/, "val"],
    [/họng kép/, "info"], [/^\*\*Đường ống khô/, "không có"], [/^\*\*Loa thông báo và hướng dẫn/, "req"], [/^\*\*Chữa cháy tự động\*\* cho phần để xe/, "req"],
    [/^\*\*Báo cháy và chữa cháy tự động\*\* gian thương mại trên mặt đất/, "req"], [/điều khiển bằng tay tại phòng bơm/, "req"], [/^\*\*Lưu lượng ngoài nhà 25 L\/s/, "val"], [/≥ 02 trụ/, "req"]]],
  ["Chung cư 25 tầng, cao 78 m — báo cháy địa chỉ, ống khô", "chung-cu", { n: 25, h: 78, a: 30000, vol: 95000, hl: false }, [
    [/^\*\*Báo cháy địa chỉ/, "req"], [/^\*\*Đường ống khô/, "req"], [/^\*\*Số tia × lưu lượng\*\*: 2 × 2,5/, "val"], [/Tia nước đặc tối thiểu 8 m/, "val"],
    [/vùng theo chiều cao \*\*≤ 50 m\*\*/, "val"], [/^\*\*Lưu lượng ngoài nhà 30 L\/s/, "val"]]],
  ["Chung cư 12 tầng, cao 40 m — chưa cần ống khô (F1.3: > 50 m)", "chung-cu", { n: 12, h: 40, a: 10000 }, [[/^\*\*Đường ống khô/, "không có"]]],
  ["Chung cư 12 tầng, hầm sâu 10 m — cần ống khô", "chung-cu", { n: 12, h: 40, a: 10000, deep: true }, [[/^\*\*Đường ống khô/, "req"]]],
  ["Chung cư 8 tầng có TM tầng hầm 150 m²", "chung-cu", { n: 8, h: 25, a: 6000, tmHam: 150 }, [
    [/^\*\*Báo cháy tự động\*\* gian thương mại tầng hầm/, "req"], [/^\*\*Chữa cháy tự động\*\* gian thương mại tầng hầm/, "no"]]],
  ["Chung cư 8 tầng có TM tầng hầm 200 m², trên mặt đất 450 m²", "chung-cu", { n: 8, h: 25, a: 6000, tmHam: 200, tmTr: 450 }, [
    [/^\*\*Chữa cháy tự động\*\* gian thương mại tầng hầm/, "req"], [/^\*\*Báo cháy và chữa cháy tự động\*\* gian thương mại trên mặt đất/, "no"]]],
  ["Chung cư 3 tầng nông thôn, 2 000 m³", "chung-cu", { n: 3, h: 9, a: 600, vol: 2000, rural: true }, [[/^\*\*Lưu lượng ngoài nhà 5 L\/s/, "val"], [/^\*\*Thời gian chữa cháy 1 h/, "val"]]],
  ["Chung cư 20 tầng, hành lang ngắn ≤ 10 m", "chung-cu", { n: 20, h: 62, a: 16000, vol: 50000, hl: false }, [[/^\*\*Số tia × lưu lượng\*\*: 2 × 2,5/, "val"], [/từ một ống đứng/, "info"]]],
  ["Chung cư 7 tầng < 28 m, sàn 3 000 m², tầng 1 gara xe máy 3 000 m²", "chung-cu", { n: 7, h: 24, a: 21000, vol: 69300, hl: true, pmoto: 3000 }, [
    [/^\*\*Hệ thống báo cháy tự động/, "req"], [/^\*\*Hệ thống chữa cháy tự động/, "no"], [/phòng lưu giữ \*\*xe máy/, "req"], [/họng lấy nước hai cửa DN65/, "req"],
    [/^\*\*Hệ thống họng nước/, "req"], [/^\*\*Số tia × lưu lượng\*\*: 2 × 2,5/, "val"], [/^\*\*Lưu lượng ngoài nhà 20 L\/s/, "val"], [/^\*\*Đường ống khô/, "không có"],
    [/^\*\*Loa thông báo\*\* — nhà để xe/, "no"], [/^\*\*Loa thông báo và hướng dẫn/, "no"]]],
  ["Chung cư 7 tầng, gara xe máy 900 m² — chưa bắt buộc", "chung-cu", { n: 7, h: 24, a: 21000, pmoto: 900 }, [[/phòng lưu giữ \*\*xe máy/, "no"], [/họng lấy nước hai cửa/, "không có"]]],
  ["Chung cư 7 tầng, xe máy 10 000 + ô tô 8 000 m² — loa phần để xe", "chung-cu", { n: 7, h: 24, a: 30000, pmoto: 10000, parea: 8000, pcar: 200 }, [[/^\*\*Loa thông báo\*\* — nhà để xe/, "req"]]],
  // ---------- KHÁCH SẠN có gara hầm (tình huống hỏi đáp) ----------
  ["Khách sạn 14 tầng, 46 m, gara hầm 1 200 m² cao 3,3 m", "khach-san", { n: 14, h: 46, a: 18000, vol: 59400, nb: 1, pcar: 30, parea: 1200, phh: 3.3 }, [
    [/^\*\*Hệ thống chữa cháy tự động/, "req"], [/^\*\*Số tia × lưu lượng\*\*: 3 × 2,5/, "val"], [/Họng nước khu để xe.*2 lăng × 2,5/, "val"],
    [/Lưu lượng thiết kế bơm họng nước = 7,5 L\/s/, "val"], [/^\*\*Lưu lượng ngoài nhà 35 L\/s/, "val"], [/^\*\*Bếp\*\*/, "info"], [/Trần giả, sàn nâng/, "info"],
    [/^\*\*Loa thông báo và hướng dẫn/, "req"], [/Mặt nạ lọc độc/, "req"], [/^\*\*Đường ống khô/, "req"]]],
  ["Khách sạn, gara hầm 1 600 m² cao 3,5 m — gara quyết định bơm 10 L/s", "khach-san", { n: 14, h: 46, a: 18000, vol: 59400, nb: 1, pcar: 40, parea: 1600, phh: 3.5 }, [
    [/Họng nước khu để xe.*2 lăng × 5/, "val"], [/Lưu lượng thiết kế bơm họng nước = 10 L\/s.*khu để xe quyết định/, "val"]]],
  ["Gara hầm 120 m² cao 3 m — dưới 500 m³", "van-phong", { n: 6, h: 20, a: 3000, vol: 9000, pcar: 4, parea: 120, phh: 3 }, [[/dưới 500 m³/, "val"]]],
  ["Bến xe khách 2 tầng 3 000 m² — không bắt buộc bơm tay + tự động", "ben-xe", { n: 2, h: 9, a: 3000 }, [[/điều khiển bằng tay tại phòng bơm/, "không có"], [/^\*\*Hệ thống họng nước/, "req"]]],
  ["Nhà dịch vụ cảng biển 2 tầng 3 000 m² — bắt buộc bơm tay + tự động", "dv-cang", { n: 2, h: 9, a: 3000 }, [[/điều khiển bằng tay tại phòng bơm/, "req"]]],
  // ---------- NHÀ KHO ----------
  ["Kho C2 1 tầng 6 000 m², gian lớn nhất 900 m²", "kho", { n: 1, h: 12, a: 6000, ga: 900, vol: 72000, hang: "C2" }, [
    [/^\*\*Hệ thống báo cháy tự động/, "no"], [/^\*\*Hệ thống chữa cháy tự động/, "no"], [/gian lớn nhất 900/, "info"], [/^\*\*Hệ thống họng nước/, "req"],
    [/^\*\*Số tia × lưu lượng\*\*: 2 × 2,5/, "val"], [/^\*\*Lưu lượng ngoài nhà 30 L\/s/, "val"]]],
  ["Kho C2 1 tầng 6 000 m², một gian 6 000 m²", "kho", { n: 1, h: 12, a: 6000, vol: 72000, hang: "C2" }, [
    [/^\*\*Hệ thống báo cháy tự động/, "req"], [/^\*\*Hệ thống chữa cháy tự động/, "req"], [/diện tích gian phòng/, "info"]]],
  ["Kho C1 giá cao 8 m — mục 30, TCVN 14496", "kho", { n: 1, h: 12, a: 300, hang: "C1", gia: true }, [
    [/^\*\*Hệ thống chữa cháy tự động/, "req"], [/TCVN 14496/, "info"]]],
  ["Kho B 2 tầng — mục 31", "kho", { n: 2, h: 10, a: 400, hang: "B" }, [[/^\*\*Hệ thống chữa cháy tự động/, "req"]]],
  ["Kho hàng không cháy trong bao bì dễ cháy 350 m²", "kho", { n: 1, h: 8, a: 350, hang: "C3", bbi: true }, [
    [/^\*\*Hệ thống báo cháy tự động/, "req"], [/^\*\*Hệ thống chữa cháy tự động/, "no"]]],
  ["Kho lạnh 2 000 m², 20 000 m³, bậc II — nước ngoài nhà như hạng C", "kho", { n: 1, h: 10, a: 2000, vol: 20000, bac: "II", S: "S0", hang: "D", lanh: true }, [
    [/^\*\*Hệ thống báo cháy tự động/, "req"], [/^\*\*Lưu lượng ngoài nhà 15 L\/s/, "val"]]],
  ["Kho D bậc I 8 000 m³ — 1 h, không cần bơm dự phòng", "kho", { n: 1, h: 8, a: 1000, vol: 8000, bac: "I", S: "S0", hang: "D" }, [
    [/^\*\*Lưu lượng ngoài nhà 10 L\/s/, "val"], [/^\*\*Thời gian chữa cháy 1 h/, "val"], [/không trang bị máy bơm dự phòng/, "info"]]],
  ["Kho D bậc I 300 000 m³ — 2 h", "kho", { n: 1, h: 15, a: 20000, vol: 300000, bac: "I", S: "S0", hang: "D" }, [
    [/^\*\*Lưu lượng ngoài nhà 20 L\/s/, "val"], [/^\*\*Thời gian chữa cháy 1 h/, "val"]]],
  ["Kho D bậc I 500 000 m³ — 25 L/s, 2 h", "kho", { n: 1, h: 15, a: 30000, vol: 500000, bac: "I", S: "S0", hang: "D" }, [
    [/^\*\*Lưu lượng ngoài nhà 25 L\/s/, "val"], [/^\*\*Thời gian chữa cháy 2 h/, "val"], [/≥ 02 trụ/, "req"]]],
  ["Kho gỗ — thời gian ≥ 5 h", "kho", { n: 1, h: 10, a: 3000, vol: 30000, hang: "C1", go: true }, [[/^\*\*Thời gian chữa cháy 5 h/, "val"]]],
  ["Kho có chất kỵ nước — không họng nước", "kho", { n: 1, h: 8, a: 2000, hang: "B", kyNuoc: true }, [[/^\*\*Hệ thống họng nước/, "no"]]],
  ["Kho A — bơm điều khiển tay + tự động", "kho", { n: 1, h: 8, a: 600, hang: "A" }, [[/điều khiển bằng tay tại phòng bơm/, "req"]]],
  ["Kho C2 — không bắt buộc bơm tay + tự động", "kho", { n: 1, h: 8, a: 600, hang: "C2" }, [[/điều khiển bằng tay tại phòng bơm/, "không có"]]],
  // ---------- NHÀ XƯỞNG ----------
  ["Xưởng C2 1 tầng 12 000 m², 3 gian 4 000 m², 150 000 m³", "san-xuat", { n: 1, h: 10, a: 12000, ga: 4000, vol: 150000, hang: "C2" }, [
    [/^\*\*Hệ thống báo cháy tự động/, "req"], [/^\*\*Hệ thống chữa cháy tự động/, "req"], [/^\*\*Số tia × lưu lượng\*\*: 2 × 2,5/, "val"], [/^\*\*Lưu lượng ngoài nhà 30 L\/s/, "val"]]],
  ["Xưởng C2 gian 800 m² — báo cháy có, sprinkler chưa", "san-xuat", { n: 1, h: 8, a: 2400, ga: 800, hang: "C2" }, [
    [/^\*\*Hệ thống báo cháy tự động/, "req"], [/^\*\*Hệ thống chữa cháy tự động/, "no"]]],
  ["Xưởng C3 gian 290 m² — chưa bắt buộc", "san-xuat", { n: 1, h: 8, a: 290, hang: "C3" }, [[/^\*\*Hệ thống báo cháy tự động/, "no"], [/^\*\*Hệ thống họng nước/, "no"]]],
  ["Xưởng C1 gian 250 m²", "san-xuat", { n: 1, h: 8, a: 250, hang: "C1" }, [[/^\*\*Hệ thống báo cháy tự động/, "req"], [/^\*\*Hệ thống chữa cháy tự động/, "no"]]],
  ["Xưởng sơn 40 m²", "san-xuat", { n: 1, h: 6, a: 40, hang: "B", special: true }, [[/^\*\*Hệ thống chữa cháy tự động/, "req"]]],
  ["Xưởng IV S2 C1 160 000 m³ — 4 × 2,5; 65 L/s", "san-xuat", { n: 1, h: 10, a: 16000, vol: 160000, bac: "IV", S: "S2", hang: "C1" }, [
    [/^\*\*Số tia × lưu lượng\*\*: 4 × 2,5/, "val"], [/^\*\*Lưu lượng ngoài nhà 65 L\/s/, "val"]]],
  ["Xưởng thép không bảo vệ bậc IV S2 — +5 L/s", "san-xuat", { n: 1, h: 10, a: 5000, vol: 60000, bac: "IV", S: "S2", hang: "C2", steel: true }, [[/= \*\*12,5 L\/s\*\*/, "val"]]],
  ["Xưởng 20 000 m², 400 người/tầng — loa", "san-xuat", { n: 2, h: 12, a: 20000, ppl: 400, hang: "D" }, [[/^\*\*Loa thông báo và hướng dẫn/, "req"]]],
  ["Xưởng cao 55 m hạng C — 4 × 5", "san-xuat", { n: 10, h: 55, a: 20000, vol: 120000, hang: "C2" }, [[/^\*\*Số tia × lưu lượng\*\*: 4 × 5/, "val"]]],
  ["Xưởng D gian hầm có lối ra trực tiếp", "san-xuat", { n: 1, h: 6, a: 900, hang: "D", bas: true, direct: true }, [[/^\*\*Hệ thống báo cháy tự động/, "no"]]]
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
  console.log(`${res.length - fail.length}/${res.length} tình huống chung cư, kho, xưởng đạt`);
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
