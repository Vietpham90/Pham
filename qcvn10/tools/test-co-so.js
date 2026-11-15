// Bảng D.1, F.1, C.1 cho cơ sở, khu — đáp án tính tay từ bảng.
// Dùng: node qcvn10/tools/test-co-so.js /tmp/q10.html
const { chromium } = require("playwright");
const C = [
  // [mã, x, tùy chọn, xe, tàu, bơm, mặt nạ cách ly, nước ngoài nhà]
  ["kho-dau", 600000, { auto: true }, 2, 0, 0, true, true],
  ["kho-dau", 500000, { auto: true }, 1, 0, 0, true, true],
  ["kho-dau", 100000, { auto: true }, 1, 0, 0, true, true],
  ["kho-dau", 99999, { auto: true }, 0, 0, 1, false, true],
  ["kho-dau", 200000, { auto: false }, 2, 0, 0, true, true],
  ["kho-dau", 50000, { auto: false }, 0, 0, 2, false, true],
  ["cang-hk", 5, {}, 1, 0, 0, false, true], ["cang-hk", 6, {}, 2, 0, 0, false, true], ["cang-hk", 8, {}, 3, 0, 0, false, true],
  ["cang-bien", 0, { cap: "db" }, 2, 0, 0, true, true], ["cang-bien", 0, { cap: "1" }, 1, 0, 0, true, true], ["cang-bien", 0, { cap: "2" }, 0, 0, 1, false, false],
  ["lng", 8000, {}, 0, 1, 0, false, false], ["lng", 7999, {}, 0, 0, 0, false, false],
  ["nhiet-dien", 599, {}, 0, 0, 1, false, true], ["nhiet-dien", 600, {}, 1, 0, 0, true, true], ["nhiet-dien", 1199, {}, 1, 0, 0, true, true], ["nhiet-dien", 1200, {}, 2, 0, 0, true, true],
  ["thuy-dien", 999, {}, 0, 0, 1, false, false], ["thuy-dien", 1000, {}, 1, 0, 0, true, false],
  ["det", 25, {}, 1, 0, 0, true, false], ["det", 24, {}, 0, 0, 0, false, false],
  ["loc-dau", 0, {}, 2, 0, 0, true, true],
  ["che-bien-khi", 10, {}, 1, 0, 0, true, true], ["che-bien-khi", 9, {}, 0, 0, 0, false, true],
  ["kcn", 301, {}, 2, 0, 0, true, true], ["kcn", 300, {}, 1, 0, 0, true, true], ["kcn", 75, {}, 1, 0, 0, true, true], ["kcn", 74, {}, 0, 0, 1, false, true],
  ["ccn", 75, {}, 1, 0, 0, false, true], ["ccn", 74, {}, 0, 0, 1, false, true]
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto("file://" + process.argv[2]);
  const r = await p.evaluate(C => C.map(([id, x, o, xe, tau, bom, mn, nc]) => {
    const i = CS.findIndex(c => c.id === id); const it = csxEval(Object.assign({ i, x, cap: "1", auto: true }, o));
    const t0 = it[0].txt, g = re => { const m = t0.match(re); return m ? +m[1] : 0; };
    const got = [g(/(\d+) xe ô tô/), g(/(\d+) tàu/), g(/(\d+) máy bơm/), it.find(i => /Mặt nạ phòng độc cách ly/.test(i.txt)).lv === "req", it.find(i => /cấp nước|Cấp nước/.test(i.txt)).lv === "req"];
    const exp = [xe, tau, bom, mn, nc];
    return JSON.stringify(got) === JSON.stringify(exp) ? null : `${id} ${x} ${JSON.stringify(o)}: mong đợi ${JSON.stringify(exp)}, nhận ${JSON.stringify(got)}`;
  }), C);
  const bad = r.filter(Boolean); bad.forEach(x => console.log("✗", x));
  console.log(`${C.length - bad.length}/${C.length} trường hợp cơ sở, khu đạt`); await b.close(); process.exit(bad.length ? 1 : 0);
})();
