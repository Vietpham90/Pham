// So dữ liệu bảng trong công cụ (JS) với bảng trong sổ tay (Markdown)
const { chromium } = require('playwright');
const fs = require('fs');
const md = fs.readFileSync(process.argv[3] + '/02-ngan-chay.md', 'utf8') + fs.readFileSync(process.argv[3] + '/03-thoat-nan.md', 'utf8');
function table(title) {
  const i = md.indexOf(title); if (i < 0) return null;
  const lines = md.slice(i).split('\n'); const rows = []; let started = false;
  for (const l of lines.slice(1)) { if (l.startsWith('|')) { started = true; if (!/^\|\s*-/.test(l)) rows.push(l.split('|').slice(1, -1).map(c => c.trim())); } else if (started) break; }
  return rows.slice(1);
}
const num = s => { s = String(s).replace(/\s/g, '').replace(/m$/, ''); if (/Khônghạnchế|Khônggiớihạn/.test(s)) return 'INF'; if (s === '—' || s === '-') return null; const m = s.match(/^\d+/); return m ? +m[0] : s; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + process.argv[2] + '#cong-trinh'); await p.waitForTimeout(300);
  const js = await p.evaluate(() => JSON.parse(JSON.stringify({ HT, H9, H11, G3T, G7T, G4T, G8T }, (k, v) => v === Infinity ? 'INF' : v)));
  const diffs = [];
  const cmp = (name, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push(`${name}: công cụ ${JSON.stringify(a)} ≠ sổ tay ${JSON.stringify(b)}`); };
  // H.1
  const h1 = table('**Bảng H.1'); const h1md = [];
  h1.forEach(r => { const hs = r[2].split('/').map(num), as = r[3].replace(/ m²/g, '').split('/').map(num); hs.forEach((h, k) => h1md.push([r[0], h, as[k]])); });
  cmp('H.1', js.HT.H1.rows.map(r => [r.b, r.h, r.a]), h1md);
  // H.2
  const h2 = table('**Bảng H.2'); cmp('H.2', js.HT.H2.rows.map(r => [r.h, ...r.f]), h2.map(r => [num(r[2]), ...r.slice(3).map(num)]));
  // H.3
  const h3 = table('**Bảng H.3'); cmp('H.3', js.HT.H3.rows.map(r => [r.h, ...r.f2]), h3.map(r => [num(r[2]), num(r[3]), num(r[4])]));
  // H.4
  const h4 = table('**Bảng H.4'); cmp('H.4', js.HT.H4.rows.map(r => [r.h, ...r.f3]), h4.map(r => [num(r[2]), num(r[3]), num(r[4]), num(r[5])]));
  // H.9 & H.11
  for (const [name, T, title] of [['H.9', js.H9, '**Bảng H.9'], ['H.11', js.H11, '**Bảng H.11']]) {
    const rows = table(title); let hang = null; const by = {};
    rows.forEach(r => { if (r[0]) hang = r[0]; (by[hang] = by[hang] || []).push([num(r[1]) ?? 'INF', ...r.slice(4, 7).map(c => num(c))]); });
    Object.keys(T).forEach(h => cmp(`${name} hạng ${h}`, T[h].map(r => [r.h, ...r.f3]), (by[h] || []).map(x => x)));
  }
  // G.3
  const g3 = table('**Bảng G.3 —'); const g3md = {}; let vol = null;
  g3.forEach(r => { if (r[0]) vol = r[0]; const key = `${vol}|${r[1]}|${r[2]}|${r[3]}`; g3md[key] = r.slice(4, 7).map(num); });
  const pick = (vol, h, b, s) => g3md[`${vol}|${h}|${b}|${s}`];
  const vols = ['≤ 15 000 m³', '30 000 m³', '40 000 m³', '50 000 m³', '≥ 60 000 m³', '≥ 80 000 m³'];
  cmp('G.3 AB S0', js.G3T.AB_S0.map(x => x.slice(1)), vols.slice(0, 5).map(v => pick(v, 'A, B', 'I – IV', 'S0')));
  cmp('G.3 C S0', js.G3T.C_S0.map(x => x.slice(1)), vols.map(v => pick(v, 'C1 – C3', 'I – IV', 'S0')));
  cmp('G.3 C S1', js.G3T.C_S1.map(x => x.slice(1)), vols.map(v => pick(v, 'C1 – C3', 'III, IV', 'S1')));
  cmp('G.3 C V', js.G3T.C_V.map(x => x.slice(1)), [pick(vols[0], 'C1 – C3', 'V', 'S2, S3')]);
  cmp('G.3 D S1', js.G3T.D_S1, pick('Không phụ thuộc', 'C4, D', 'III, IV', 'S1'));
  cmp('G.3 E S2S3', js.G3T.E_S23, Object.entries(g3md).find(([k]) => k.endsWith('|E|IV, V|S2, S3'))[1]);
  // G.7
  const g7 = table('**Bảng G.7 —'); let v7 = null; const g7md = [];
  g7.forEach(r => { if (r[0]) v7 = r[0]; g7md.push([v7, r[1], r[2], r[3], r[4]]); });
  const val7 = (vol, h, s) => { const row = g7md.find(x => x[0] === vol && x[1] === h && x[3].split(' / ').includes(s)); if (!row) return undefined; const idx = row[3].split(' / ').indexOf(s); return num(row[4].split(' / ')[idx]); };
  cmp('G.7 AB S0', js.G7T.AB_S0.map(x => x[1]), vols.slice(0, 5).map(v => val7(v, 'A, B', 'S0')));
  cmp('G.7 C S0', js.G7T.C_S0.map(x => x[1]), vols.map(v => val7(v, 'C1 – C3', 'S0')));
  cmp('G.7 C S1', js.G7T.C_S1.map(x => x[1]), vols.map(v => val7(v, 'C1 – C3', 'S1')));
  // G.4
  const g4 = table('**Bảng G.4 —'); const g4map = { 'A, B|S0': 'AB_S0', 'C1 – C3|S0': 'C_S0', 'C1 – C3|S1': 'C_S1', 'C1 – C3|S2, S3': 'C_S23', 'C4, D, E|S0': 'D_S0', 'C4, D, E|S1': 'D_S1', 'C4, D, E|S2, S3': 'D_S23' };
  g4.forEach(r => { const vals = r.slice(4, 8).map(num); if (r[1] === 'Mọi hạng') { const k = { S0: 'S0', S1: 'S1', 'S2, S3': 'S23' }[r[3]]; cmp('G.4 cụt ' + r[3], js.G4T.dead[k], vals); } else cmp('G.4 ' + r[1] + ' ' + r[3], js.G4T.mid[g4map[r[1] + '|' + r[3]]], vals); });
  // G.8
  const g8 = table('**Bảng G.8 —'); const g8map = { 'A, B|S0': 'AB_S0', 'C1 – C3|S0': 'C_S0', 'C1 – C3|S1': 'C_S1', 'C1 – C3|S2, S3': 'C_S23', 'C4, D, E|S0': 'D_S0', 'C4, D, E|S1': 'D_S1', 'C4, D, E|S2, S3': 'D_S23' };
  g8.forEach(r => cmp('G.8 ' + r[0] + ' ' + r[2], js.G8T[g8map[r[0] + '|' + r[2]]], num(r[3])));
  console.log(diffs.length ? diffs.join('\n') : 'Khớp toàn bộ: H.1, H.2, H.3, H.4, H.9, H.11, G.3, G.4, G.7, G.8');
  await b.close();
})();
