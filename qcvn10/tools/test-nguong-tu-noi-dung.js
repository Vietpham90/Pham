// Kiểm thử độc lập: đọc ngưỡng từ bảng Markdown (Bảng A.1, B.1 trong noi-dung — đã đối chiếu OCR với bản scan),
// rồi thử bộ quy tắc ở sát dưới và đúng bằng ngưỡng. Hai nguồn lập riêng: lệch nhau là có chỗ sai.
// Chỉ xét ô có điều kiện đơn ("≥ X đơn vị", hoặc "≥ X hoặc ≥ Y"); ô có "và", "TBĐL", dòng tầng hầm/mặt đất xét riêng.
// Dùng: node qcvn10/tools/test-nguong-tu-noi-dung.js /tmp/q10.html qcvn10/noi-dung
const { chromium } = require("playwright"); const fs = require("fs"); const path = require("path");
const dir = process.argv[3];
// mục Bảng A.1 → loại nhà trong công cụ (một loại đại diện)
const A1T = { "1": "nha-o-kd", "2": "nha-o-sx", "3": "chung-cu", "4": "mam-non", "5": "truong-hoc", "6": "benh-vien", "7": "duong-lao", "8": "the-thao", "9": "nha-hat", "10": "thu-vien",
  "12": "van-hoa", "14": "ton-giao", "16": "nha-hang", "17.2": "cua-hang", "18": "khach-san", "19": "buu-dien", "20": "van-phong", "21": "hon-hop", "22": "ga-ds", "24": "dang-kiem", "26": "gara-ck", "27": "ky-thuat-mb", "28": "ham", "29": "nong-san" };
// dòng tách theo vị trí: [loại nhà, điều kiện nền]
const A1X = { "11.1": ["bao-tang", { bas: true }], "11.2.1": ["bao-tang", { n: 2 }], "11.2.2": ["bao-tang", { n: 3 }], "13.1": ["karaoke", { bas: true }], "13.2.1": ["karaoke", { n: 2 }], "13.2.2": ["karaoke", { n: 3 }],
  "15.1": ["cho-tttm", { bas: true }], "15.2.1": ["cho-tttm", { n: 2 }], "15.2.2": ["cho-tttm", { n: 3 }], "17.1": ["cua-hang", { bas: true }], "17.3": ["chat-long", {}], "23": ["kslk", {}], "30": ["kho", { gia: true, hang: "C2" }], "31": ["kho", { n: 2, hang: "B" }] };
const B1X = { "1.9.1": ["karaoke", { bas: true }], "1.9.2.1": ["karaoke", { n: 2 }], "1.9.2.2": ["karaoke", { n: 3 }], "1.10": ["cho-tttm", {}] };
const C1T = { "1": ["benh-vien", {}], "2": ["cho-tttm", {}], "3": ["ga-ds", {}], "4": ["ham", {}] };
const G1T = { "1": ["chung-cu", {}], "2": ["karaoke", {}], "3": ["de-xe", {}], "5": ["ham", {}], "6": ["ga-ds", {}] };
const B1T = { "1.1": "nha-o-kd", "1.2": "khach-san", "1.3": "mam-non", "1.4": "benh-vien", "1.5": "bao-tang", "1.6": "nha-hat", "1.7": "thu-vien", "1.8": "van-phong", "1.11": "nha-hang", "1.12": "ga-ds", "2": "san-xuat", "4": "ham", "5": "ky-thuat-mb" };
const UNIT = { "tầng": "n", "m²": "a", "m": "h", "cháu": "kids", "chỗ": "seats", "ô": "cho", "người": "ppl", "tầng hầm": "nb" };
function parseCell(c) {
  const t = c.replace(/\*\*/g, "").replace(/⁽.*?⁾/g, "").trim();
  if (/^—/.test(t)) return { never: true };
  if (/Không phụ thuộc/.test(t)) return { always: true };
  if (/ và |TBĐL|không tính|triệu|nghìn|tấn/.test(t)) return null;              // điều kiện kép: bỏ qua
  const conds = [...t.matchAll(/(≥|>) ([\d ]+)\s*(m²|m|tầng hầm|tầng|cháu|chỗ|ô|người)/g)].map(m => [/[Dd]ài/.test(t) && m[3] === "m" ? "len" : UNIT[m[3]], +m[2].replace(/ /g, "") + (m[1] === ">" ? 1 : 0)]);
  if (!conds.length) return null;
  return { any: conds };
}
function rows(file, header) {
  const L = fs.readFileSync(path.join(dir, file), "utf8").split("\n"); const out = [];
  let on = false;
  for (const l of L) {
    if (/^## /.test(l)) on = header.test(l);
    if (on && /^\| [\d.]+ \|/.test(l)) out.push(l.replace(/^\||\|$/g, "").split("|").map(x => x.trim()));
  }
  return out;
}
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto("file://" + process.argv[2]);
  const cases = [];
  for (const r of rows("03-phu-luc-a.md", /Bảng A\.1/)) {
    const id = A1T[r[0]]; if (!id) continue;
    [["alarm", r[2]], ["spr", r[3]]].forEach(([sys, cell]) => { const c = parseCell(cell); if (c) cases.push({ tb: "A.1", stt: r[0], id, sys, c, cell, x: {} }); });
  }
  for (const r of rows("03-phu-luc-a.md", /Bảng A\.1/)) {
    const m = A1X[r[0]]; if (!m) continue;
    [["alarm", r[2]], ["spr", r[3]]].forEach(([sys, cell]) => { const c = parseCell(cell); if (c) cases.push({ tb: "A.1", stt: r[0], id: m[0], sys, c, cell, x: m[1] }); });
  }
  for (const r of rows("04-phu-luc-b-c.md", /Bảng B\.1/)) { const m = B1X[r[0]]; if (!m) continue; const c = parseCell(r[2]); if (c) cases.push({ tb: "B.1", stt: r[0], id: m[0], sys: "hydr", c, cell: r[2], x: m[1] }); }
  for (const r of rows("04-phu-luc-b-c.md", /Bảng C\.1/)) { const m = C1T[r[0]]; if (!m) continue; const c = parseCell(r[2]); if (c) cases.push({ tb: "C.1", stt: r[0], id: m[0], sys: "c1", c, cell: r[2], x: m[1] }); }
  for (const r of rows("05-phu-luc-d-g.md", /Bảng G\.1/)) { const m = G1T[r[0]]; if (!m) continue; const c = parseCell(r[2]); if (c) cases.push({ tb: "G.1", stt: r[0], id: m[0], sys: "g1", c, cell: r[2], x: m[1] }); }
  for (const r of rows("04-phu-luc-b-c.md", /Bảng B\.1/)) {
    const id = B1T[r[0]]; if (!id) continue;
    const c = parseCell(r[2]); if (c) cases.push({ tb: "B.1", stt: r[0], id, sys: "hydr", c, cell: r[2], x: {} });
  }
  const res = await p.evaluate(cases => {
    const pat = { alarm: /^\*\*Hệ thống báo cháy tự động/, spr: /^\*\*Hệ thống chữa cháy tự động/, hydr: /^\*\*Hệ thống họng nước/, c1: /^\*\*Hệ thống cấp nước chữa cháy ngoài nhà riêng/, g1: /^\*\*Loa thông báo và hướng dẫn/ };
    const base = { n: 1, h: 3, a: 50, kids: 0, seats: 0, cho: 0, len: 0, hang: "C2" };
    let cur = {};
    const run = (id, x, sys) => { const v = Object.assign({}, DEF, base, cur, x); if (v.n * 2.8 < v.h) v.n = Math.ceil(v.h / 3); const it = ctEvaluate(TI[id], v).flatMap(s => s.items).find(i => pat[sys].test(i.txt)); return it ? it.lv : "none"; };
    const bad = []; let n = 0;
    for (const k of cases) { cur = k.x || {};
      const isReq = lv => lv === "req" || lv === "alt";
      if (k.c.always) { n++; const lv = run(k.id, { len: 600 }, k.sys); if (!isReq(lv)) bad.push(`${k.tb} mục ${k.stt} ${k.sys}: “${k.cell}” nhưng công cụ cho ${lv}`); continue; }
      if (k.c.never) { n++; const lv = run(k.id, { n: 40, h: 140, a: 900000, kids: 999, seats: 9999, cho: 99, len: 9999 }, k.sys); if (isReq(lv)) bad.push(`${k.tb} mục ${k.stt} ${k.sys}: “${k.cell}” nhưng công cụ cho ${lv}`); continue; }
      for (const [vr, thr] of k.c.any) {
        const field = vr === "h" ? "h" : vr;
        const below = Object.assign({}, { [field]: thr - (vr === "h" ? 0.1 : 1) }), at = { [field]: thr };
        if (vr === "h") { below.n = cur.n || 1; at.n = cur.n || 1; }   // tách ảnh hưởng của số tầng
        n += 2;
        const lb = run(k.id, below, k.sys), la = run(k.id, at, k.sys);
        if (!isReq(la)) bad.push(`${k.tb} mục ${k.stt} ${k.sys}: tại ${vr} = ${thr} (“${k.cell}”) công cụ cho ${la}`);
        if (isReq(lb)) bad.push(`${k.tb} mục ${k.stt} ${k.sys}: dưới ngưỡng ${vr} = ${below[field]} (“${k.cell}”) công cụ đã cho ${lb}`);
      }
    }
    return { n, bad };
  }, cases);
  res.bad.forEach(x => console.log("✗", x));
  console.log(`${cases.length} ô bảng đọc từ nội dung, ${res.n} phép thử ngưỡng, ${res.bad.length} chỗ lệch`);
  await b.close(); process.exit(res.bad.length ? 1 : 0);
})();
