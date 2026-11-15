// Đối chiếu bảng số trong mã (H.2, H.3, H.4, H.6, H.7, H.1) với bảng Markdown trong noi-dung.
// Dùng: node qcvn10/tools/test-doi-chieu.js /tmp/q10.html qcvn10/noi-dung
const { chromium } = require("playwright"); const fs = require("fs"); const path = require("path");
const dir = process.argv[3];
function tables(file) {
  const L = fs.readFileSync(path.join(dir, file), "utf8").split("\n"); const out = []; let cur = null;
  for (const l of L) { if (/^\|/.test(l)) { if (!cur) { cur = []; out.push(cur); } if (!/^\|\s*---/.test(l)) cur.push(l.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim().replace(/\*\*/g, ""))); } else cur = null; }
  return out;
}
const num = c => c === "—" ? null : +c.replace(/⁽.*$/, "").replace(",", ".");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto("file://" + process.argv[2]);
  const J = await p.evaluate(() => ({ H2, H3, H4, H6, H7, H1 }));
  const err = [];
  const h1 = tables("06-h1-nuoc-ngoai-nha.md");
  // Bảng H.1
  const tH1 = h1.find(t => t[0][0].startsWith("Dân số"));
  tH1.slice(1).forEach((r, i) => { const j = J.H1[i]; if (+r[1] !== j[1] || num(r[2]) !== j[2] || num(r[3]) !== j[3]) err.push(`H.1 dòng ${i + 1}: md ${r.join(" | ")} ≠ js ${j}`); });
  // Bảng H.2
  const tH2 = h1.find(t => t[0][0].startsWith("Loại nhà / số tầng"));
  tH2.slice(1).forEach((r, i) => { const g = i < 4 ? "F13" : "F", row = J.H2[g][i % 4]; r.slice(1).forEach((c, k) => { if (num(c) !== row[k]) err.push(`H.2 ${g} dòng ${i % 4} cột ${k}: md ${c} ≠ js ${row[k]}`); }); });
  // Bảng H.3, H.4
  for (const [name, T] of [["H.3", J.H3], ["H.4", J.H4]]) {
    const md = h1.find(t => t[0][0] === "Bậc chịu lửa" && t[0].length === (name === "H.3" ? 11 : 12));
    md.slice(1).forEach((r, i) => { const j = T[i]; const bac = r[0].split(/,\s*/), hang = r[2].split(/,\s*/);
      if (bac.join() !== j[0].join()) err.push(`${name} dòng ${i}: bậc ${r[0]} ≠ ${j[0]}`);
      if (hang.join() !== j[2].join()) err.push(`${name} dòng ${i}: hạng ${r[2]} ≠ ${j[2]}`);
      r.slice(3).forEach((c, k) => { if (num(c) !== j[3][k]) err.push(`${name} dòng ${i} cột ${k}: md ${c} ≠ js ${j[3][k]}`); }); });
  }
  // Bảng H.6
  const h2 = tables("07-h2-hong-nuoc.md");
  const tH6 = h2.find(t => t[0].join() === "Bậc chịu lửa,Hạng,Cấp S,≤ 150,> 150");
  tH6.slice(1).forEach((r, i) => { const j = J.H6[i]; const f = x => x[0] + " × " + String(x[1]).replace(".", ",");
    if (f(j[4]) !== r[3] || f(j[5]) !== r[4]) err.push(`H.6 dòng ${i}: md ${r[3]} / ${r[4]} ≠ js ${f(j[4])} / ${f(j[5])}`); });
  // Bảng H.7
  for (const dn of ["50", "65"]) {
    const t = h2.filter(t => t[0][0] === "Tia đặc (m)")[dn === "50" ? 0 : 1];
    t.slice(1).forEach(r => { const hi = [6, 8, 10, 12, 14, 16, 18, 20].indexOf(+r[0]);
      [13, 16, 19].forEach((tip, k) => { const qc = r[1 + 2 * k], pc = r[2 + 2 * k], j = J.H7[dn][tip][hi];
        if (qc === "—") { if (j) err.push(`H.7 DN${dn} ${tip}mm ${r[0]} m: md — ≠ js ${j}`); return; }
        const ps = pc.split("/").map(x => num(x.trim()));
        if (!j || num(qc) !== j[0] || ps.some((x, m) => x !== j[m + 1])) err.push(`H.7 DN${dn} ${tip}mm ${r[0]} m: md ${qc} ${pc} ≠ js ${j}`); }); });
  }
  // Bảng A.2, A.3, A.4 ↔ danh mục gian phòng GP
  const GP = await p.evaluate(() => GP);
  const L = fs.readFileSync(path.join(dir, "03-phu-luc-a.md"), "utf8").split("\n");
  let tb = null; const mdRows = {};
  for (const l of L) {
    const h = l.match(/^## 3\.(\d+) Bảng (A\.\d)/); if (h) { tb = h[2]; continue; }
    if (/^## /.test(l)) { tb = null; continue; }
    if (!tb || tb === "A.1" || !/^\| \d/.test(l)) continue;
    const c = l.replace(/^\||\|$/g, "").split("|").map(x => x.trim());
    mdRows[tb + " " + c[0]] = [c[2], c[3]];
  }
  const th = cell => { const t = cell.replace(/\*\*/g, ""); if (/^—/.test(t)) return null; if (/Không phụ thuộc/.test(t)) return 0; const m = t.match(/≥ ([\d ]+)/); return m ? +m[1].replace(/ /g, "") : "?"; };
  let nGP = 0;
  for (const r of GP) {
    const md = mdRows[r[0]]; if (!md) { err.push(`${r[0]}: không có trong 03-phu-luc-a.md`); continue; }
    nGP++;
    if (th(md[0]) !== r[3]) err.push(`${r[0]} báo cháy: md "${md[0]}" ≠ js ${r[3]}`);
    if (th(md[1]) !== r[4]) err.push(`${r[0]} chữa cháy: md "${md[1]}" ≠ js ${r[4]}`);
  }
  const missing = Object.keys(mdRows).filter(k => !GP.some(r => r[0] === k));
  missing.forEach(k => err.push(`${k}: có trong md nhưng thiếu trong GP`));
  console.log(`Bảng A.2 – A.4: so ${nGP} dòng`);
  // QCVN 13: Bảng 4, 5, 6, 7 trong mã ↔ mục 11-gara-qcvn13.md
  const G = await p.evaluate(() => ({ KIN: G13_KIN, HO: G13_HO, NGAM: G13_NGAM, B7: G13_B7 }));
  const t13 = tables("11-gara-qcvn13.md");
  const nn = c => c === "—" ? null : +c.replace(/\*\*/g, "").replace(/[ .]/g, "").replace(" m²", "").replace(/[^\d]/g, "");
  const bacs = c => c.split(/,\s*/).map(x => x.trim());
  const b4 = t13.find(t => t[0].join("|").startsWith("Bậc chịu lửa|Cấp S|Số tầng ngầm"));
  b4.slice(1).forEach((r, i) => { const j = G.NGAM[i]; if (!j || r[0] !== j[0] || r[1] !== j[1] || +r[2] !== j[2] || nn(r[3]) !== j[3]) err.push(`QCVN 13 Bảng 4 dòng ${i}: md ${r.join(" | ")} ≠ js ${j}`); });
  const b56 = t13.filter(t => t[0].join("|").startsWith("Bậc chịu lửa|Cấp S|Số tầng tối đa"));
  [["Bảng 5", b56[0], G.KIN], ["Bảng 6", b56[1], G.HO]].forEach(([nm, tb, J]) => tb.slice(1).forEach((r, i) => { const j = J[i];
    const sOk = r[1] === "Không quy định" ? j[1].length === 4 : bacs(r[1]).join() === j[1].join();
    if (!j || bacs(r[0]).join() !== j[0].join() || !sOk || +r[2] !== j[2] || nn(r[3]) !== j[3] || nn(r[4]) !== j[4]) err.push(`QCVN 13 ${nm} dòng ${i}: md ${r.join(" | ")} ≠ js ${JSON.stringify(j)}`); }));
  const b7 = t13.find(t => t[0].join("|").startsWith("Bậc chịu lửa|Cấp S|≤ 5"));
  b7.slice(1).forEach((r, i) => { const j = G.B7[i]; const sOk = r[1] === "Không quy định" ? j[1].length === 4 : bacs(r[1]).join() === j[1].join();
    if (!j || bacs(r[0]).join() !== j[0].join() || !sOk || r.slice(2).some((c, k) => nn(c) !== j[2][k])) err.push(`QCVN 13 Bảng 7 dòng ${i}: md ${r.join(" | ")} ≠ js ${JSON.stringify(j)}`); });
  console.log(`QCVN 13: so Bảng 4 (${b4.length - 1}), Bảng 5 (${b56[0].length - 1}), Bảng 6 (${b56[1].length - 1}), Bảng 7 (${b7.length - 1}) dòng`);
  err.forEach(e => console.log("✗", e));
  console.log(err.length ? `${err.length} chỗ lệch` : "Bảng trong mã khớp bảng trong noi-dung (H.1, H.2, H.3, H.4, H.6, H.7)");
  await b.close(); process.exit(err.length ? 1 : 0);
})();
