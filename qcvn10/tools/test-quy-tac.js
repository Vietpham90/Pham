// Bộ kiểm thử có đáp án: mỗi trường hợp tính tay từ bảng của QCVN 10:2025/BCA.
// Dùng: node qcvn10/tools/test-quy-tac.js /tmp/q10.html
const { chromium } = require("playwright");
const D = { n: 1, h: 3, a: 100, vol: 0, nb: 0, kids: 0, seats: 0, ppl: 0, room: 0, hl: false, bac: "I", S: "S0", hang: "C2", len: 0, cho: 0, gara: "kin", open12: false, xm: false, ngan: false, rural: false, bas: false, deep: false, gia: false, special: false, lanh: false, direct: false, open: false, roof: true, w60: false, wood: false, steel: false, combust: false, ceil10: false, kara: false, kc: 0 };
// key: id, v: tham số, expect: { alarm: "req|alt|no", spr, hydr, c1, g1, outQ, jets, dry, addr }
const C = [
  // Bảng A.1 mục 1
  ["nha-o-kd", { n: 6, h: 20, a: 600 }, { alarm: "no", spr: "no", hydr: "no" }],
  ["nha-o-kd", { n: 7, h: 24, a: 600 }, { alarm: "alt", spr: "no", hydr: "req" }],
  ["nha-o-kd", { n: 9, h: 30, a: 900 }, { alarm: "alt", spr: "req" }],
  // mục 2
  ["nha-o-sx", { n: 2, h: 7, a: 400 }, { alarm: "no" }],
  ["nha-o-sx", { n: 3, h: 10, a: 400 }, { alarm: "alt" }],
  ["nha-o-sx", { n: 2, h: 7, a: 500 }, { alarm: "req" }],
  ["nha-o-sx", { n: 5, h: 16, a: 450 }, { alarm: "req" }],
  // mục 3 chung cư
  ["chung-cu", { n: 4, h: 13, a: 650 }, { alarm: "no", hydr: "no" }],
  ["chung-cu", { n: 4, h: 13, a: 1000 }, { alarm: "alt", hydr: "no" }],
  ["chung-cu", { n: 4, h: 13, a: 1500 }, { alarm: "req", hydr: "req" }],
  ["chung-cu", { n: 5, h: 16, a: 600 }, { alarm: "req", hydr: "req" }],
  ["chung-cu", { n: 10, h: 29.9, a: 8000 }, { spr: "no", dry: false, g1: "no" }],
  ["chung-cu", { n: 11, h: 33, a: 9000 }, { spr: "req", dry: false, g1: "req" }],
  ["chung-cu", { n: 20, h: 60, a: 20000, vol: 60000, hl: true }, { spr: "req", dry: true, jets: [3, 2.5], outQ: 30 }],
  ["chung-cu", { n: 5, h: 16, a: 3000, nb: 2 }, { g1: "req" }],
  ["chung-cu", { n: 30, h: 80, a: 30000 }, { addr: true }],
  // mục 4 mầm non
  ["mam-non", { n: 2, h: 7, a: 250, kids: 80 }, { alarm: "no", hydr: "no" }],
  ["mam-non", { n: 2, h: 7, a: 250, kids: 100 }, { alarm: "alt", hydr: "req" }],
  ["mam-non", { n: 2, h: 7, a: 600 }, { alarm: "req", hydr: "no" }],
  ["mam-non", { n: 4, h: 13, a: 5000 }, { spr: "req" }],
  ["mam-non", { n: 3, h: 10, a: 6000 }, { spr: "no", hydr: "req" }],
  // mục 5
  ["truong-hoc", { n: 4, h: 13, a: 1400 }, { alarm: "no", hydr: "req" }],
  ["truong-hoc", { n: 5, h: 16, a: 600 }, { alarm: "alt" }],
  ["truong-hoc", { n: 5, h: 16, a: 800 }, { alarm: "req" }],
  ["truong-hoc", { n: 2, h: 7, a: 590 }, { hydr: "no" }],
  ["truong-hoc", { n: 8, h: 25, a: 9000 }, { spr: "req" }],
  // mục 6 bệnh viện
  ["benh-vien", { n: 2, h: 7, a: 299 }, { alarm: "no", c1: "no" }],
  ["benh-vien", { n: 3, h: 10, a: 299 }, { alarm: "req", hydr: "req" }],
  ["benh-vien", { n: 2, h: 7, a: 2000 }, { spr: "req", c1: "no" }],
  ["benh-vien", { n: 5, h: 18, a: 2500 }, { c1: "req", g1: "no" }],
  ["benh-vien", { n: 4, h: 14, a: 3000, ppl: 60 }, { c1: "req", g1: "req", addr: true }],
  ["benh-vien", { n: 1, h: 3, a: 250, bac: "IV" }, { alarm: "req" }],
  ["benh-vien", { n: 1, h: 3, a: 1200, bac: "V" }, { spr: "req" }],
  // mục 7 dưỡng lão
  ["duong-lao", { n: 2, h: 7, a: 200 }, { alarm: "alt", spr: "no" }],
  ["duong-lao", { n: 3, h: 10, a: 200 }, { alarm: "req" }],
  ["duong-lao", { n: 1, h: 3, a: 500 }, { alarm: "req", spr: "req" }],
  // mục 8, 9
  ["the-thao", { n: 1, h: 10, a: 400, seats: 200 }, { alarm: "alt" }],
  ["the-thao", { n: 1, h: 10, a: 1600 }, { alarm: "req", hydr: "req" }],
  ["nha-hat", { n: 2, h: 8, a: 900, seats: 250 }, { alarm: "alt", hydr: "no", jets: null }],
  ["nha-hat", { n: 2, h: 8, a: 900, seats: 350 }, { hydr: "req", jets: [2, 5] }],
  ["nha-hat", { n: 2, h: 8, a: 1000, seats: 250 }, { hydr: "req", jets: [2, 2.5] }],
  // mục 10 thư viện
  ["thu-vien", { n: 1, h: 3, a: 299 }, { alarm: "no" }],
  ["thu-vien", { n: 1, h: 3, a: 450 }, { alarm: "alt" }],
  ["thu-vien", { n: 3, h: 10, a: 5000 }, { alarm: "req", spr: "req", hydr: "req" }],
  // mục 11 bảo tàng
  ["bao-tang", { n: 1, h: 3, a: 150, bas: true }, { alarm: "req", spr: "no" }],
  ["bao-tang", { n: 1, h: 3, a: 200, bas: true }, { spr: "req" }],
  ["bao-tang", { n: 2, h: 7, a: 499 }, { alarm: "no" }],
  ["bao-tang", { n: 2, h: 7, a: 999 }, { alarm: "req", spr: "no" }],
  ["bao-tang", { n: 3, h: 10, a: 300 }, { alarm: "req", spr: "no" }],
  ["bao-tang", { n: 3, h: 10, a: 500 }, { spr: "req" }],
  // mục 13 karaoke
  ["karaoke", { n: 2, h: 7, a: 450 }, { alarm: "req", spr: "no", hydr: "req" }],
  ["karaoke", { n: 2, h: 7, a: 250 }, { hydr: "no" }],
  ["karaoke", { n: 2, h: 7, a: 500 }, { spr: "req" }],
  ["karaoke", { n: 3, h: 10, a: 100 }, { spr: "req", hydr: "req" }],
  ["karaoke", { n: 1, h: 3, a: 50, bas: true }, { spr: "req", hydr: "req" }],
  ["karaoke", { n: 2, h: 7, a: 300, ppl: 50 }, { g1: "req" }],
  ["karaoke", { n: 2, h: 7, a: 300, ppl: 49 }, { g1: "no" }],
  // mục 14
  ["ton-giao", { n: 3, h: 12, a: 3000 }, { alarm: "no" }],
  ["ton-giao", { n: 4, h: 14, a: 300 }, { alarm: "req" }],
  // mục 15
  ["cho-tttm", { n: 2, h: 9, a: 3400 }, { alarm: "req", spr: "no", hydr: "req", c1: "req" }],
  ["cho-tttm", { n: 2, h: 9, a: 3500 }, { spr: "req" }],
  ["cho-tttm", { n: 3, h: 12, a: 100 }, { spr: "req" }],
  ["sieu-thi", { n: 1, h: 3, a: 190, bas: true }, { spr: "no" }],
  ["sieu-thi", { n: 1, h: 3, a: 200, bas: true }, { spr: "req" }],
  // mục 16
  ["nha-hang", { n: 2, h: 7, a: 499 }, { alarm: "no" }],
  ["nha-hang", { n: 2, h: 7, a: 1000 }, { alarm: "alt" }],
  ["nha-hang", { n: 3, h: 10, a: 1000 }, { alarm: "req" }],
  ["nha-hang", { n: 2, h: 7, a: 400, bac: "IV" }, { alarm: "req" }],
  ["nha-hang", { n: 2, h: 7, a: 1499 }, { hydr: "no" }],
  ["nha-hang", { n: 6, h: 20, a: 1000 }, { hydr: "req" }],
  // mục 17
  ["cua-hang", { n: 2, h: 7, a: 290 }, { alarm: "no" }],
  ["cua-hang", { n: 2, h: 7, a: 400 }, { alarm: "alt" }],
  ["cua-hang", { n: 5, h: 16, a: 400 }, { alarm: "req" }],
  ["cua-hang", { n: 2, h: 7, a: 3500 }, { spr: "req" }],
  ["cua-hang", { n: 1, h: 3, a: 150, bas: true }, { alarm: "req", spr: "no" }],
  ["chat-long", { n: 1, h: 3, a: 50 }, { alarm: "req", spr: "req" }],
  // mục 18 khách sạn
  ["khach-san", { n: 2, h: 7, a: 690 }, { alarm: "no", hydr: "no" }],
  ["khach-san", { n: 3, h: 10, a: 600 }, { alarm: "alt" }],
  ["khach-san", { n: 4, h: 13, a: 1500 }, { alarm: "req", hydr: "req" }],
  ["khach-san", { n: 5, h: 16, a: 800 }, { alarm: "req", hydr: "req" }],
  ["khach-san", { n: 8, h: 25, a: 4000 }, { spr: "req" }],
  ["khach-san", { n: 11, h: 35, a: 6000, vol: 20000 }, { spr: "req", g1: "req", dry: true, jets: [2, 2.5], outQ: 20 }],
  // mục 20 văn phòng
  ["van-phong", { n: 4, h: 14, a: 450 }, { alarm: "no" }],
  ["van-phong", { n: 4, h: 14, a: 1000 }, { alarm: "alt" }],
  ["van-phong", { n: 4, h: 14, a: 1500 }, { alarm: "req" }],
  ["van-phong", { n: 12, h: 45, a: 15000, vol: 60000 }, { spr: "req", jets: [3, 2.5], outQ: 30, dry: true }],
  ["van-phong", { n: 20, h: 70, a: 30000, vol: 100000 }, { jets: [4, 2.5], outQ: 35 }],
  ["van-phong", { n: 6, h: 20, a: 3000, vol: 9000 }, { jets: [1, 2.5], outQ: 20 }],
  // mục 21 hỗn hợp
  ["hon-hop", { n: 4, h: 13, a: 450 }, { alarm: "alt" }],
  ["hon-hop", { n: 2, h: 7, a: 500 }, { alarm: "req" }],
  ["hon-hop", { n: 4, h: 13, a: 1000, kara: true }, { spr: "req", hydr: "req" }],
  // mục 22 – 24
  ["ga-hk", { n: 1, h: 8, a: 400 }, { alarm: "no", c1: "req", g1: "req" }],
  ["ga-hk", { n: 2, h: 12, a: 10000 }, { spr: "req" }],
  ["ga-cap-treo", { n: 1, h: 8, a: 2000 }, { alarm: "req", c1: "none", g1: "no" }],
  ["ga-hh", { n: 1, h: 8, a: 2000 }, { c1: "req", g1: "no" }],
  ["ga-ds", { n: 1, h: 8, a: 300 }, { alarm: "no", c1: "req", g1: "req" }],
  ["gara-ck", { n: 6, h: 18, a: 140 }, { hydr: "no" }],
  ["gara-ck", { n: 6, h: 18, a: 150 }, { hydr: "req" }],
  ["gara-ck", { n: 6, h: 18, a: 5000, gara: "ho" }, { hydr: "no" }],
  ["kslk", { n: 5, h: 30, a: 200 }, { alarm: "req", spr: "req" }],
  ["dang-kiem", { n: 1, h: 6, a: 600 }, { alarm: "req", spr: "no" }],
  // mục 25 nhà để xe
  ["de-xe", { n: 1, h: 0, a: 100, bas: true, nb: 1, cho: 20 }, { alarm: "req", spr: "no" }],
  ["de-xe", { n: 1, h: 0, a: 1000, bas: true, nb: 1, cho: 26 }, { spr: "req" }],
  ["de-xe", { n: 2, h: 6, a: 500 }, { alarm: "req", spr: "req" }],
  ["de-xe", { n: 1, h: 0, a: 6900, bac: "II", S: "S0" }, { alarm: "req", spr: "no" }],
  ["de-xe", { n: 1, h: 0, a: 7000, bac: "II", S: "S0" }, { spr: "req" }],
  ["de-xe", { n: 1, h: 0, a: 3600, bac: "III", S: "S1" }, { spr: "req" }],
  ["de-xe", { n: 1, h: 0, a: 3500, bac: "IV", S: "S0" }, { spr: "no" }],
  ["de-xe", { n: 1, h: 0, a: 2000, bac: "IV", S: "S1" }, { spr: "req" }],
  ["de-xe", { n: 1, h: 0, a: 1000, bac: "V", S: "S2" }, { spr: "req" }],
  ["de-xe", { n: 3, h: 6, a: 3000, gara: "ho" }, { alarm: "no", spr: "no", hydr: "req" }],
  ["de-xe", { n: 4, h: 9, a: 3000, gara: "ho" }, { alarm: "req", spr: "no" }],
  ["de-xe", { n: 3, h: 6, a: 3000, gara: "ho", open12: true }, { alarm: "req", spr: "no" }],
  ["de-xe", { n: 3, h: 6, a: 4000, gara: "ho", open12: true }, { spr: "req" }],
  ["de-xe", { n: 2, h: 3, a: 900, xm: true }, { alarm: "no", spr: "no" }],
  ["de-xe", { n: 2, h: 3, a: 900, ngan: true }, { alarm: "no", spr: "no", jets: 0 }],
  ["de-xe", { n: 1, h: 0, a: 140 }, { hydr: "no" }],
  ["de-xe", { n: 1, h: 0, a: 150, vol: 600 }, { hydr: "req", jets: [2, 2.5] }],
  ["de-xe", { n: 2, h: 3, a: 2000, vol: 8000 }, { jets: [2, 5] }],
  ["de-xe", { n: 1, h: 0, a: 18000, bas: true }, { g1: "req" }],
  ["gara-ck", { n: 5, h: 15, a: 500, cho: 3 }, { spr: "no" }],
  ["gara-ck", { n: 5, h: 15, a: 500, cho: 4 }, { spr: "req" }],
  // mục 27 – 29
  ["ky-thuat-mb", { n: 1, h: 15, a: 2700 }, { alarm: "req", spr: "no", c1: "req", hydr: "req" }],
  ["ham", { len: 499 }, { alarm: "no", hydr: "no", c1: "no", g1: "no" }],
  ["ham", { len: 500 }, { alarm: "req", spr: "no", hydr: "req", c1: "req", g1: "req", jets: [1, 5], outQ: 10 }],
  ["nong-san", { n: 1, h: 10, a: 2900, hang: "C1" }, { alarm: "req", spr: "no" }],
  ["nong-san", { n: 1, h: 10, a: 3000, hang: "C1" }, { spr: "req" }],
  ["nong-san", { n: 1, h: 10, a: 5000, open: true }, { alarm: "no", spr: "no" }],
  // kho
  ["kho", { n: 1, h: 10, a: 5000, hang: "C2", gia: true }, { alarm: "req", spr: "req" }],
  ["kho", { n: 2, h: 10, a: 200, hang: "B" }, { alarm: "req", spr: "req" }],
  ["kho", { n: 1, h: 8, a: 280, hang: "A" }, { alarm: "req", spr: "no", hydr: "no" }],
  ["kho", { n: 1, h: 8, a: 300, hang: "B" }, { spr: "req" }],
  ["kho", { n: 1, h: 8, a: 290, hang: "C1" }, { alarm: "no", spr: "no" }],
  ["kho", { n: 1, h: 8, a: 90, hang: "C1", bas: true }, { alarm: "req", spr: "no" }],
  ["kho", { n: 1, h: 8, a: 100, hang: "C1", bas: true }, { spr: "req" }],
  ["kho", { n: 1, h: 8, a: 990, hang: "C3" }, { alarm: "no", spr: "no", hydr: "req" }],
  ["kho", { n: 1, h: 8, a: 1000, hang: "C2" }, { alarm: "req", spr: "req" }],
  ["kho", { n: 1, h: 8, a: 300, hang: "C2", bas: true }, { alarm: "req", spr: "req" }],
  ["kho", { n: 1, h: 8, a: 5000, hang: "D" }, { alarm: "no", spr: "no", hydr: "req" }],
  ["kho", { n: 1, h: 8, a: 5000, hang: "E" }, { hydr: "no" }],
  ["kho", { n: 1, h: 8, a: 100, special: true }, { alarm: "req", spr: "req" }],
  ["kho", { n: 1, h: 8, a: 300, lanh: true }, { alarm: "req", spr: "no" }],
  // sản xuất
  ["san-xuat", { n: 1, h: 8, a: 200, hang: "A" }, { alarm: "req", spr: "no" }],
  ["san-xuat", { n: 1, h: 8, a: 200, hang: "C1", bas: true }, { alarm: "req", spr: "req" }],
  ["san-xuat", { n: 1, h: 8, a: 290, hang: "C1" }, { alarm: "req", spr: "no" }],
  ["san-xuat", { n: 1, h: 8, a: 699, hang: "C2", bas: true, direct: true }, { alarm: "no", spr: "no" }],
  ["san-xuat", { n: 1, h: 8, a: 700, hang: "C2", bas: true, direct: true }, { spr: "req" }],
  ["san-xuat", { n: 1, h: 8, a: 300, hang: "C3", bas: true }, { alarm: "req", spr: "req" }],
  ["san-xuat", { n: 1, h: 8, a: 999, hang: "C2" }, { alarm: "req", spr: "no" }],
  ["san-xuat", { n: 1, h: 8, a: 20, special: true }, { alarm: "req", spr: "req" }],
  ["san-xuat", { n: 2, h: 12, a: 18000, ppl: 300 }, { g1: "req" }],
  ["san-xuat", { n: 2, h: 12, a: 18000, ppl: 299 }, { g1: "no" }],
  // H.3 / H.6
  ["san-xuat", { n: 1, h: 10, a: 5000, vol: 60000, bac: "I", S: "S0", hang: "C2" }, { outQ: 30, jets: [2, 2.5] }],
  ["san-xuat", { n: 1, h: 10, a: 20000, vol: 200000, bac: "II", S: "S1", hang: "D" }, { outQ: 15, jets: [1, 2.5] }],
  ["san-xuat", { n: 1, h: 10, a: 20000, vol: 160000, bac: "IV", S: "S0", hang: "C2" }, { jets: [2, 5] }],
  ["san-xuat", { n: 1, h: 10, a: 20000, vol: 160000, bac: "IV", S: "S2", hang: "C1" }, { jets: [4, 2.5], outQ: 65 }],
  ["kho", { n: 1, h: 10, a: 30000, vol: 450000, bac: "I", S: "S0", hang: "C2", w60: true, roof: false }, { outQ: 70 }],
  ["kho", { n: 1, h: 10, a: 30000, vol: 450000, bac: "III", S: "S1", hang: "D", w60: true, roof: false }, { outQ: 45 }],
  // H.2 F1.3
  ["chung-cu", { n: 3, h: 9, a: 800, vol: 900 }, { outQ: 10 }],
  ["chung-cu", { n: 3, h: 9, a: 800, vol: 900, rural: true }, { outQ: 5 }],
  ["chung-cu", { n: 14, h: 45, a: 12000, vol: 40000 }, { outQ: 25, jets: [1, 2.5], dry: false }],
  ["chung-cu", { n: 18, h: 55, a: 20000, vol: 70000 }, { outQ: 30, jets: [2, 2.5], dry: true }],
  ["khach-san", { n: 3, h: 9, a: 800, vol: 4000 }, { outQ: 10 }],
  ["khach-san", { n: 3, h: 9, a: 800, vol: 4000, rural: true }, { outQ: 5 }],
  ["khach-san", { n: 4, h: 12, a: 800, vol: 4000, rural: true }, { outQ: 15 }],
  ["khach-san", { n: 3, h: 12, a: 800, vol: 4000, deep: true }, { dry: true }]
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto("file://" + process.argv[2]);
  const res = await p.evaluate(([C, D]) => C.map(([id, v0, ex]) => {
    const v = Object.assign({}, D, v0);
    const out = ctEvaluate(TI[id], v);
    const all = out.flatMap(s => s.items);
    const find = re => all.find(i => re.test(i.txt));
    const lv = x => x ? (x.lv === "info" ? "info" : x.lv) : "none";
    const got = {
      alarm: lv(find(/^\*\*Hệ thống báo cháy tự động/)), spr: lv(find(/^\*\*Hệ thống chữa cháy tự động/)), hydr: lv(find(/^\*\*Hệ thống họng nước/)),
      c1: lv(find(/^\*\*Hệ thống cấp nước chữa cháy ngoài nhà riêng/)), g1: lv(find(/^\*\*Loa thông báo/)),
      dry: !!find(/^\*\*Đường ống khô/), addr: !!find(/^\*\*Báo cháy địa chỉ/)
    };
    const oq = find(/^\*\*Lưu lượng ngoài nhà (\d+)/); got.outQ = oq ? +oq.txt.match(/ngoài nhà (\d+)/)[1] : null;
    const jt = find(/^\*\*Số tia/); got.jets = jt ? [+jt.txt.match(/: (\d+) ×/)[1], +jt.txt.match(/× ([\d,]+) L\/s/)[1].replace(",", ".")] : (find(/được không đặt đường ống họng/) ? 0 : null);
    const bad = [];
    for (const [k, e] of Object.entries(ex)) {
      const g = got[k];
      if (JSON.stringify(g) !== JSON.stringify(e)) bad.push(`${k}: mong đợi ${JSON.stringify(e)}, nhận ${JSON.stringify(g)}`);
    }
    return { id, v0, bad };
  }), [C, D]);
  const fail = res.filter(r => r.bad.length);
  fail.forEach(r => console.log("✗", r.id, JSON.stringify(r.v0), "\n   " + r.bad.join("\n   ")));
  console.log(`${res.length - fail.length}/${res.length} trường hợp đạt`);
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
