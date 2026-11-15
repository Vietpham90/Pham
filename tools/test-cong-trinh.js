const { chromium } = require('playwright');
const T = (name, v, must, mustNot) => ({ name, v, must: must || [], mustNot: mustNot || [] });
// i: 0 chung cư,2 riêng lẻ,3 khách sạn,6 bệnh viện,8 mầm non,11 karaoke,15 bảo tàng,17 TTTM,19 nhà ga,20 phòng khám,23 trường,25 văn phòng,27 xưởng,29 kho,31 lưu trữ,14 thư viện
const cases = [
  T("Riêng lẻ 5 tầng 4 800 m³", {i:2,h:16,n:5,nb:1,a:200,v:4800}, [/không thuộc\*\* phạm vi/], [/Trong phạm vi áp dụng/]),
  T("Riêng lẻ 5 tầng 5 200 m³", {i:2,h:16,n:5,nb:1,a:250,v:5200}, [/thuộc phạm vi\*\*.*khối tích/]),
  T("Riêng lẻ 7 tầng", {i:2,h:22,n:7,a:120}, [/thuộc phạm vi\*\*.*từ 7 tầng/], [/Lối vào từ trên cao ở/ , /Bảng B\.8/]),
  T("Riêng lẻ 5 tầng chưa nhập khối tích", {i:2,h:16,n:5,a:120}, [/nhập khối tích/]),
  T("Văn phòng nhỏ 3 tầng 3 000 m³", {i:25,h:8,n:3,a:300,v:3000}, [/Nhà đứng độc lập dưới 7 tầng/]),
  T("Xưởng F5 không áp 1.1.2 nhà nhỏ", {i:27,h:6,n:2,a:800,v:4000,hang:"D"}, [], [/Nhà đứng độc lập dưới 7 tầng/]),
  T("Kho C 30 000 m³ không sprinkler", {i:29,h:10,n:1,a:3000,v:30000,hang:"C"}, [/30\.000 m³ → chiều dài \*\*1\/4 chu vi/]),
  T("Kho C 30 000 m³ có sprinkler", {i:29,h:10,n:1,a:3000,v:30000,hang:"C",sp:true}, [/→ chiều dài \*\*1\/6 chu vi, ≥ 15 m/]),
  T("Kho C 200 000 m³ sprinkler", {i:29,h:12,n:1,a:16000,v:200000,hang:"C",sp:true}, [/→ chiều dài \*\*3\/4 chu vi/]),
  T("Xưởng A 250 m² nhỏ", {i:27,h:4,n:1,a:250,hang:"A"}, [/tổng diện tích sàn ≤ 300 m²/]),
  T("Xưởng F5 1 tầng có lối lên mái", {i:27,h:0,n:1,a:5000,hang:"D"}, [/40 000 m²/]),
  T("Chung cư 520 m²/tầng 25 m", {i:0,h:25,n:9,a:520}, [/500 – 550 m²/, /buồng thang thông thường/, /≥ \*\*2 lối ra/]),
  T("Chung cư 450 m² 20 m", {i:0,h:20,n:7,a:450}, [/≤ 500 m²: được 1 lối ra/]),
  T("Chung cư 40 m 480 m² → N2", {i:0,h:40,n:14,a:480,sp:true}, [/thay N1 bằng N2/, /phải có N1/]),
  T("Chung cư 40 m: không có thang máy chữa cháy", {i:0,h:40,n:14,a:800}, [/Chưa bắt buộc thang máy chữa cháy.*> 50 m/]),
  T("Chung cư 55 m: thang máy 60 m, không A.2.4", {i:0,h:55,n:18,a:900,sp:true}, [/bán kính phục vụ ≤ 60 m/, /tải ≥ 630 kg/], [/Gian đông người: 300/, /hành lang cụt \*\*≤ 15 m/]),
  T("Chung cư 80 m: Phụ lục A.3", {i:0,h:80,n:26,a:1500,sp:true}, [/Nhà cao trên 75 m/, /N1, N3: 1,20 m/, /hành lang cụt \*\*≤ 15 m/, /REI 150 \+ sàn ngăn cháy loại 1/]),
  T("Chung cư 110 m có sprinkler: chưa cần lánh nạn", {i:0,h:110,n:35,a:1500,sp:true}, [/100 – 120 m.*chưa bắt buộc/]),
  T("Chung cư 125 m: lánh nạn", {i:0,h:125,n:40,a:1500,sp:true}, [/Khu vực lánh nạn tạm thời/, /R 180/]),
  T("Chung cư 160 m vượt phạm vi", {i:0,h:160,n:50,a:1500,sp:true}, [/Vượt phạm vi/]),
  T("Văn phòng 60 m: A.2", {i:25,h:60,n:16,a:2400,sp:true}, [/bán kính phục vụ ≤ 45 m/, /≤ 2\.500 m²/, /Gian đông người/]),
  T("Văn phòng 60 m 2 800 m² vượt", {i:25,h:60,n:16,a:2800,sp:true}, [/\*\*vượt\*\*/]),
  T("Khách sạn 60 m: F1.2 1 500 m²", {i:3,h:60,n:18,a:1400,sp:true}, [/≤ 1\.500 m²/]),
  T("Bệnh viện 10 tầng 27 m → bậc I", {i:6,h:27,n:10,a:1500,sp:true}, [/tối thiểu \*\*bậc I, S0/, /1,35 m/]),
  T("Bệnh viện 4 tầng", {i:6,h:12,n:4,a:1500}, [/cao ≤ 28 m \(9 tầng\)/], [/1,35 m/]),
  T("Phòng khám 2 tầng", {i:20,h:4,n:2,a:600}, [/bậc II, S0/]),
  T("Mầm non 2 tầng 4 m", {i:8,h:4,n:2,a:600}, [/Bảng H\.5/, /cột > 5 người/]),
  T("Mầm non 10 m vượt", {i:8,h:10,n:4,a:600}, [/Bảng H\.5 cho phép chiều cao PCCC lớn nhất \*\*9 m/]),
  T("Nhà hát 2 tầng 6000 m² không sprinkler: vượt H.2 (≤ 5.000)", {i:10,h:12,n:2,a:6000}, [/theo Bảng H\.2 \(bậc I, S0, 2 tầng\): \*\*≤ 5\.000 m²\*\*\. Diện tích nhập 6\.000 m² \*\*vượt/, /≥ R 45\*\*/]),
  T("Nhà hát 2 tầng 6000 m² có sprinkler: H.2 × 2 = 10.000 đạt", {i:10,h:12,n:2,a:6000,sp:true}, [/≤ 10\.000 m²\*\*\. Diện tích nhập 6\.000 m² đạt/]),
  T("Trường học 4 tầng 3000 m²: H.2 bậc I 4 tầng ≤ 5.000", {i:23,h:14,n:4,a:3000}, [/theo Bảng H\.2 \(bậc I, S0, 4 tầng\): \*\*≤ 5\.000 m²/]),
  T("Trường 18 m", {i:23,h:18,n:5,a:1200,sp:true}, [/I – S0/, /3\.2\.6\.2 d\)|Trường học: cột 2 – 3/]),
  T("Thư viện 30 m", {i:14,h:30,n:8,a:1000,sp:true}, [/Thư viện không cao quá 28 m/]),
  T("Lưu trữ 30 m", {i:31,h:30,n:8,a:1000,hang:"C",sp:true}, [/Nhà lưu trữ không cao quá 28 m/]),
  T("TTTM 35 m", {i:17,h:35,n:7,a:3000,sp:true}, [/Bảng H\.4 chỉ cho nhà thương mại đến 28 m/]),
  T("TTTM 5 tầng 18 m 4 000 m² sprinkler", {i:17,h:18,n:5,a:4000,sp:true}, [/I, II – S0\*\* \(≤ 5\.000 m²\)/]),
  T("Karaoke 9 m 3 tầng 150 m² 15 người", {i:11,h:8,n:3,a:150,p:15}, [/được phép 1 lối ra/, /bắt buộc\*\* bao che/]),
  T("Karaoke 12 m 4 tầng 60 người", {i:11,h:12,n:4,a:250,p:60}, [/Phòng trực/], [/được phép 1 lối ra/]),
  T("Nhà ga 20 m", {i:19,h:20,n:3,a:8000,sp:true}, [/không hạn chế diện tích giữa các tường ngăn cháy/, /phạm vi áp dụng \(giới hạn 50 m/]),
  T("Văn phòng 2 hầm: N3, phòng trực", {i:25,h:20,n:6,nb:2,a:1000,sp:true}, [/N3/, /Phòng trực/, /6\.18/]),
  T("Văn phòng 3 tầng ≤ 9 m không cần lối ra mái", {i:25,h:5,n:2,a:500}, [], [/Lối ra mái/]),
  T("Văn phòng 12 m không sprinkler: đai ngăn cháy không bắt buộc (<15 m)", {i:25,h:12,n:4,a:800}, [/Không bắt buộc đai ngăn cháy/]),
  T("Văn phòng 20 m 6 tầng không sprinkler: đai ngăn cháy", {i:25,h:20,n:6,a:800}, [/\*\*Đai ngăn cháy giữa các tầng\*\*/]),
  T("Nhà 4 tầng 18 m: vật liệu B.8 nhóm 1 ≤ 9 tầng", {i:25,h:18,n:4,a:800}, [/sảnh thang máy \*\*CV2\*\*/]),
  T("Nhà 12 tầng 40 m: B.8 CV1", {i:25,h:40,n:12,a:800,sp:true}, [/sảnh thang máy \*\*CV1\*\*/]),
  T("Đường xe: 11 m → 5 m", {i:25,h:11,n:4,a:800}, [/≤ 5 m\*\*/]),
  T("Đường xe: 12 m → 8 m", {i:25,h:12,n:4,a:800}, [/≤ 8 m\*\*/]),
  T("Đường xe: 29 m → 10 m", {i:25,h:29,n:9,a:800,sp:true}, [/≤ 10 m\*\*/]),
];

const GP = (name, v, must, mustNot) => ({ name, kind: "gp", v, must: must || [], mustNot: mustNot || [] });
const MX = (name, v, must, mustNot) => ({ name, kind: "mx", v, must: must || [], mustNot: mustNot || [] });
// G9 index: 0 hội trường(1,0) 1 sảnh(3) 2 phòng họp/ăn/học(1,5) 3 TTTM(3) 7 văn phòng(6) 10 phòng ngủ(8) 12 kho(30)
cases.push(
  GP("Gian TTTM 600 m²: 200 người, 2 lối ra, 165 người/m", {g:"F3.1",k:3,a:600,ch:4.5,bac:"I",lane:true,L:40,W:15}, [/= \*\*200 người\*\*/, /≥ 2 lối ra/, /165 người\/m/, /1,21 m/, /≤ 50 m\*\*/]),
  GP("Phòng ngủ F1.1 30 m²: 1 lối ra", {g:"F1.1",k:10,a:30,ch:3,bac:"I"}, [/= \*\*4 người\*\*/, /1 lối ra thoát nạn\*\*/], [/≥ 2 lối ra/]),
  GP("Hội trường F1.1 150 m²: > 15 người", {g:"F1.1",k:0,a:150,ch:4,bac:"I"}, [/gian F1\.1 > 15 người/, /≥ 1,2 m\*\*/]),
  GP("Gian trong hầm 20 người", {g:"F3.2",k:2,a:30,ch:3,bac:"I",ham:true}, [/tầng hầm > 15 người/]),
  GP("Văn phòng 200 m², đường đi 30 m", {g:"F4.3",k:7,a:200,ch:3.3,bac:"I",d:30}, [/34 người/, /30 m > 25 m/], [/Bảng G\.2b\)/]),
  GP("Kho F5.2 hạng C 1 200 m²", {g:"F5.2",k:12,a:1200,ch:6,bac:"II",f5h:"C"}, [/F5 hạng C > 25 người hoặc > 1 000 m²/, /Bảng G\.7/, /Bảng G\.3/]),
  GP("Xưởng F5.1 hạng A 6 người", {g:"F5.1",k:12,a:100,ch:5,bac:"I",f5h:"A",p:6}, [/F5 hạng A, B > 5 người/, /45 người\/m/]),
  GP("Phòng chờ bậc I 3 000 m³: 30 m", {g:"F3.3",k:1,a:600,ch:5,bac:"I"}, [/≤ 30 m\*\*/]),
  GP("Phòng học F4.1 > 15 học sinh: cửa ≥ 0,9", {g:"F4.1",k:2,a:60,ch:3.3,bac:"II"}, [/G\.2\.1\.3/]),
  MX("Hỗn hợp 90 m: A.3.1.10, bậc I", {h:90,n:30,nb:3,sp:true,deep:true,parts:[{i:30,from:-3,to:-1,a:3000},{i:17,from:1,to:4,a:2800},{i:0,from:5,to:30,a:1100}]}, [/REI 150 \+ sàn ngăn cháy loại 1/, /\*\*bậc I\*\*/, /≤ 3\.000 m² \(khối đế\)/, /Phần nằm hoàn toàn trong tầng hầm/, /6\.2\.2\.4 a\)|chiều cao PCCC của phần không để ở/]),
  MX("Khối đế từ tầng hầm lên tầng 3: vẫn là khối đế ≤ 3.000 m²", {h:70,n:22,nb:2,sp:true,parts:[{i:17,from:-2,to:3,a:2800},{i:3,from:4,to:22,a:1400}]}, [/≤ 3\.000 m² \(khối đế\)/], [/2\.800 m² \*\*vượt/]),
  MX("Hỗn hợp 30 m: vách loại 1 + sàn loại 3", {h:30,n:10,nb:1,sp:true,parts:[{i:17,from:1,to:2,a:1500},{i:0,from:3,to:10,a:900}]}, [/vách ngăn cháy loại 1 \+ sàn ngăn cháy loại 3/, /ước tính \*\*6 m\*\*/], [/A\.3\.1\.10/]),
  MX("Chung cư ở tầng hầm: không cho phép", {h:20,n:6,nb:1,parts:[{i:0,from:-1,to:6,a:800}]}, [/không cho phép/]),
  MX("Hỗn hợp không có F1.3: Bảng 15 vs 16", {h:20,n:5,nb:0,parts:[{i:25,from:3,to:5,a:1200},{i:29,from:1,to:2,a:1500,hang:"C"}]}, [/giá trị lớn hơn/, /≤ 50 m, ≤ 1 tầng hầm/])
);

cases.push(
  GP("G.3/G.7 C2 S0 12 000 m³", {g:"F5.1",k:12,a:2000,ch:6,bac:"II",f5h:"C2",f5s:"S0",den:1}, [/≤ 100 m\*\*/, /110 người\/m/]),
  GP("G.3/G.7 C1 S0 35 000 m³ cao 7 m: nội suy + tăng", {g:"F5.1",k:12,a:5000,ch:7,bac:"I",f5h:"C1",f5s:"S0",den:1}, [/≤ 184 m\*\*/, /đã tăng 20 %/, /171 người\/m/]),
  GP("G.3/G.7/G.8 hạng A S0 mật độ 2", {g:"F5.1",k:12,a:3000,ch:5,bac:"I",f5h:"A",f5s:"S0",den:2,p:20}, [/≤ 25 m\*\*/, /45 người\/m/, /≤ \*\*85 người\/m/], [/Bảng G\.4\)/]),
  GP("Hạng A cấp S1: không có trong bảng", {g:"F5.1",k:12,a:3000,ch:5,bac:"III",f5h:"A",f5s:"S1",den:1,p:20}, [/chỉ có dòng hạng A, B với bậc I – IV, cấp S0/, /Bảng G\.7 chỉ có dòng hạng A, B với cấp S0/]),
  GP("Hạng D S0 800 m²: G.3 không hạn chế, G.4 180 m", {g:"F5.2",k:12,a:800,ch:5,bac:"II",f5h:"D",f5s:"S0",den:1,pos:"mid"}, [/\*\*không hạn chế\*\*/, /260 người\/m/, /ở giữa hai lối ra\*\*.*≤ 180 m\*\*/]),
  GP("Hạng E S1 hành lang cụt mật độ 3,5: 15 m", {g:"F5.2",k:12,a:600,ch:4,bac:"III",f5h:"E",f5s:"S1",den:3.5,pos:"dead"}, [/hành lang cụt\*\*.*≤ 15 m\*\*/, /không hạn chế/]),
  GP("C3 bậc V 20 000 m³: ngoài bảng", {g:"F5.1",k:12,a:4000,ch:5,bac:"V",f5h:"C3",f5s:"S2",den:1}, [/chỉ áp dụng cho gian ≤ 15 000 m³/, /chỉ có dòng khối tích ≤ 15 000 m³/]),
  GP("C2 S0 90 000 m³ cao 9 m: giới hạn 240 m", {g:"F5.2",k:12,a:10000,ch:9,bac:"I",f5h:"C2",f5s:"S0",den:1}, [/≤ 240 m\*\*/, /giới hạn 240 m/, /286 người\/m/]),
  GP("Mật độ 6 người/m²: ngoài bảng", {g:"F5.1",k:12,a:800,ch:5,bac:"I",f5h:"C2",f5s:"S0",den:6}, [/> 5: ngoài Bảng G\.3, G\.4/, /mật độ > 5 người\/m² nằm ngoài bảng/])
);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://' + process.argv[2] + '#cong-trinh'); await p.waitForTimeout(300);
  let fail = 0;
  for (const c of cases) {
    const txt = await p.evaluate(([v, kind]) => { const fl = secs => secs.map(s => s.items.map(x => x.txt + ' (' + x.ref + ')').join('\n')).join('\n'); if (kind === 'gp') return fl(gpEvaluate(Object.assign({}, gpV, { p: '', d: '', ham: false, lane: false }, v)).out); if (kind === 'mx') { const r = mxEvaluate(v); return fl([...r.out, ...r.partSecs.flatMap(x => x.secs), ...r.common]); } const o = ctEvaluate(v); return fl(o.out); }, [c.v, c.kind]);
    const miss = c.must.filter(r => !r.test(txt)).map(String);
    const bad = c.mustNot.filter(r => r.test(txt)).map(String);
    if (miss.length || bad.length) { fail++; console.log('FAIL ' + c.name + (miss.length ? '\n  thiếu: ' + miss.join(' | ') : '') + (bad.length ? '\n  thừa: ' + bad.join(' | ') : '')); }
  }
  console.log(`${cases.length - fail}/${cases.length} đạt; lỗi JS: ${errs.length}`);
  await b.close();
})();
