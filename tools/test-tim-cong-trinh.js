// Kiểm thử tìm công trình theo tên: cách gõ thực tế → công trình đúng ở vị trí đầu; đọc quy mô trong câu gõ
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const f = 'file://' + process.argv[2];
  const res = []; const ok = (name, cond, info) => res.push((cond ? 'ĐẠT  ' : 'LỖI  ') + name + (cond ? '' : ' → ' + String(JSON.stringify(info)).slice(0, 300)));
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p.setDefaultTimeout(4000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(f); await p.waitForTimeout(300);
  const cases = [
    ["chung cư", "Nhà chung cư"], ["chung cu cao tang", "Nhà chung cư"], ["căn hộ", "Nhà chung cư"], ["nhà phố", "Nhà ở riêng lẻ"], ["biệt thự", "Nhà ở riêng lẻ"],
    ["khach san", "Khách sạn"], ["hotel", "Khách sạn"], ["resort", "Khách sạn"], ["homestay", "Khách sạn"], ["nhà nghỉ", "Khách sạn"],
    ["ký túc xá", "Ký túc xá, nhà ở tập thể"], ["ktx", "Ký túc xá, nhà ở tập thể"], ["condotel", "Căn hộ cho thuê"],
    ["bệnh viện", "Bệnh viện"], ["benh vien da khoa", "Bệnh viện"], ["phòng khám", "Phòng khám"], ["nha khoa", "Phòng khám"], ["spa", "Phòng khám"],
    ["mầm non", "Nhà trẻ"], ["nha tre", "Nhà trẻ"], ["trường học", "Trường tiểu học"], ["thpt", "Trường tiểu học"], ["đại học", "Trường đại học"], ["cao đẳng", "Trường đại học"],
    ["rạp chiếu phim", "Nhà hát"], ["cinema", "Nhà hát"], ["hội trường", "Nhà hát"], ["karaoke", "Karaoke"], ["quán bar", "Karaoke"], ["vũ trường", "Karaoke"],
    ["sân vận động", "Nhà thi đấu"], ["thư viện", "Thư viện"], ["bảo tàng", "Bảo tàng"], ["triển lãm", "Bảo tàng"], ["công viên nước", "Khu vui chơi"],
    ["siêu thị", "Trung tâm thương mại"], ["trung tâm thương mại", "Trung tâm thương mại"], ["tttm", "Trung tâm thương mại"], ["chợ", "Trung tâm thương mại"], ["showroom", "Trung tâm thương mại"], ["mall", "Trung tâm thương mại"],
    ["nhà hàng", "Nhà hàng"], ["quán cà phê", "Nhà hàng"], ["cafe", "Nhà hàng"], ["tiệc cưới", "Nhà hàng"],
    ["sân bay", "Nhà ga"], ["bến xe", "Nhà ga"], ["gym", "Phòng tập"], ["bể bơi", "Phòng tập"],
    ["văn phòng", "Văn phòng"], ["tòa nhà văn phòng", "Văn phòng"], ["cao ốc", "Văn phòng"], ["ngân hàng", "Văn phòng"], ["trụ sở", "Văn phòng"],
    ["nhà xưởng", "Nhà sản xuất"], ["nhà máy", "Nhà sản xuất"], ["xưởng sản xuất", "Nhà sản xuất"], ["kho", "Nhà kho"], ["kho hàng", "Nhà kho"], ["logistics", "Nhà kho"],
    ["bãi xe", "Gara để xe"], ["nhà để xe", "Gara để xe"], ["parking", "Gara để xe"], ["gara sửa chữa", "Gara có sửa chữa"], ["rửa xe", "Gara có sửa chữa"],
    ["data center", "Kho lưu trữ"], ["trung tâm dữ liệu", "Kho lưu trữ"], ["trang trại", "Nhà phục vụ nông nghiệp"], ["dưỡng lão", "Nhà dưỡng lão"],
    ["rạp xiếc", "Nhà hát"], ["nhà văn hóa", "Nhà hát"], ["Chung cư 25 tầng cao 80m", "Nhà chung cư"], ["khách sạn 15 tầng 50 m 1200m2", "Khách sạn"], ["F1.3", "Nhà chung cư"], ["F5.2", "Nhà kho"], ["nhà xưởng hạng C 2 tầng 12m", "Nhà sản xuất"], ["kho hàng hạng B 1 tầng có sprinkler", "Nhà kho"], ["văn phòng 20 tầng có chữa cháy tự động", "Văn phòng"]
  ];
  const got = await p.evaluate(cs => cs.map(([q]) => { const r = ctFind(q, 3); return r.length ? r[0].c.n : "(không có)"; }), cases);
  const bad = cases.map(([q, exp], k) => got[k].startsWith(exp) ? null : `${q} → ${got[k]} (cần ${exp})`).filter(Boolean);
  ok(`${cases.length} cách gõ tên thực tế: công trình đúng đứng đầu`, bad.length === 0, bad); if (bad.length) console.log(bad.join('\n'));
  const none = await p.evaluate(() => ["REI 150", "buồng thang N1", "khoang đệm", "hành lang cụt", "đai ngăn cháy"].map(q => [q, ctFind(q, 3).map(x => x.c.n)]).filter(([, r]) => r.length));
  ok('Gõ thuật ngữ (REI 150, buồng thang, khoang đệm…) không gợi ý nhầm công trình', none.length === 0, none);
  const qt = await p.evaluate(() => [ctQty("Chung cư 25 tầng cao 80m 2 hầm 1500m2"), ctQty("khách sạn 15 tầng 50,5 m"), ctQty("kho 1 tầng 9m 12000 m3"), ctQty("nhà xưởng")]);
  ok('Đọc quy mô: "25 tầng cao 80m 2 hầm 1500m2"', JSON.stringify(qt[0]) === JSON.stringify({ nb: 2, n: 25, a: 1500, h: 80 }), qt[0]);
  ok('Đọc quy mô: "15 tầng 50,5 m"', qt[1].n === 15 && qt[1].h === 50.5, qt[1]);
  ok('Đọc quy mô: "1 tầng 9m 12000 m3"', qt[2].n === 1 && qt[2].h === 9 && qt[2].v === 12000, qt[2]);
  const q5 = await p.evaluate(() => ctQty("nhà xưởng hạng C 2 tầng 12m có sprinkler"));
  ok('Đọc "hạng C" và "sprinkler" → điền sẵn hạng C, có sprinkler', q5.hang === 'C' && q5.sp === true && q5.n === 2 && q5.h === 12, q5);
  const outs = await p.evaluate(() => [["cây xăng", "xăng dầu"], ["kho xăng dầu", "Kho chứa dầu"], ["ga tàu điện ngầm", "tàu điện ngầm"], ["nhà thờ", "thờ cúng"], ["chùa", "thờ cúng"], ["nhà kính trồng rau", "nhà kính"], ["nhà máy thủy điện", "năng lượng"], ["hầm chui", "hầm giao thông"]].filter(([q, w]) => { const o = ctOut(q); return !o || !o.what.includes(w) || ctFind(q, 3).length; }));
  ok('Công trình QCVN 06 không áp dụng (cây xăng, kho xăng dầu, ga ngầm, nơi thờ cúng, nhà kính, thủy điện, hầm chui) → báo đúng, không gợi ý nhầm', outs.length === 0, outs);
  const keep = await p.evaluate(() => ["trạm chữa cháy", "khách sạn", "chung cư", "nhà chăn nuôi", "trang trại", "gara sửa chữa", "phòng khám chữa bệnh", "xưởng sửa chữa ô tô"].filter(q => ctOut(q) || !ctFind(q, 1).length));
  ok('Tên có chữ "chữa cháy", "chăn nuôi" vẫn ra công trình (không bị coi là ngoài phạm vi)', keep.length === 0, keep);
  await p.fill('#q', 'cây xăng'); await p.waitForTimeout(250);
  ok('Ô tìm chính: gõ "cây xăng" → khung "QCVN 06 không áp dụng" (1.1.5)', /QCVN 06 không áp dụng/.test(await p.innerText('#view')) && /1\.1\.5/.test(await p.innerText('#view')));
  await p.fill('#q', '');
  ok('Không có số → không điền gì', Object.keys(qt[3]).length === 0, qt[3]);
  // Giao diện: ô tìm chính → chọn → mở Toàn nhà đã điền sẵn
  await p.fill('#q', 'khach san 15 tang 50m 1200m2'); await p.waitForTimeout(300);
  ok('Ô tìm chính: gợi ý "Khách sạn" đầu tiên, có dòng "điền sẵn"', /Khách sạn/.test(await p.innerText('.ct-sug .pick.best')) && /điền sẵn: cao 50 m · 15 tầng · 1\.200 m²/.test(await p.innerText('.ct-sug .pick.best')), await p.innerText('.ct-sug'));
  await p.click('.ct-sug .pick.best'); await p.waitForTimeout(300);
  ok('Chọn → mở Toàn nhà, đã điền 50 m, 15 tầng, 1.200 m²', await p.inputValue('#cth') === '50' && await p.inputValue('#ctn') === '15' && await p.inputValue('#cta') === '1200' && /Khách sạn/.test(await p.innerText('.ct-form .sel')), [await p.inputValue('#cth'), await p.inputValue('#ctn'), await p.inputValue('#cta')]);
  await p.fill('#ctq', 'bai xe 6 tang'); await p.waitForTimeout(200);
  ok('Ô đổi công trình trong form: "bai xe" → Gara để xe đầu tiên', /Gara để xe/.test(await p.innerText('#ctlist .pick.best')));
  await p.click('#ctlist .pick.best'); await p.waitForTimeout(250);
  ok('Chọn → điền 6 tầng', await p.inputValue('#ctn') === '6' && /Gara để xe/.test(await p.innerText('.ct-form .sel')));
  await p.fill('#ctq', 'rap xiec'); await p.waitForTimeout(200);
  ok('"rap xiec" (có trong Bảng 6) → Nhà hát F2.1', /Nhà hát/.test(await p.innerText('#ctlist .pick.best')));
  await p.fill('#ctq', 'xyzabc'); await p.waitForTimeout(200);
  ok('Không thấy → hướng dẫn gõ tên khác', /Không thấy/.test(await p.innerText('#ctlist')));
  // Đã gỡ bảng tính thoát nạn
  ok('Không còn tab/ô công cụ Tính thoát nạn', await p.evaluate(() => !document.querySelector('[data-go="tinh-thoat-nan"]') && typeof renderTN === 'undefined'));
  await p.goto(f + '#tinh-thoat-nan'); await p.waitForTimeout(200);
  ok('Địa chỉ cũ #tinh-thoat-nan về trang chủ', await p.evaluate(() => !!document.querySelector('.toc')));
  const t0 = await p.evaluate(() => { const t = performance.now(); for (let i = 0; i < 200; i++) ctFind("khach san 15 tang", 8); return (performance.now() - t) / 200; });
  ok(`Tốc độ tìm: ${t0.toFixed(2)} ms/lần`, t0 < 5, t0);
  ok('Không lỗi JS', errs.length === 0, errs);
  await b.close();
  console.log(res.join('\n')); console.log(`${res.filter(r => r.startsWith('ĐẠT')).length}/${res.length}`);
})();
