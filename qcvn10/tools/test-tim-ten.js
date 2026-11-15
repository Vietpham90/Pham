// Tìm công trình theo tên gọi thông dụng: loại đúng phải đứng đầu danh sách gợi ý.
// Dùng: node qcvn10/tools/test-tim-ten.js /tmp/q10.html
const { chromium } = require("playwright");
const C = { "gara ngầm": "de-xe", "hầm để xe": "de-xe", "bãi đỗ xe": "de-xe", "gara ô tô": "de-xe", "bãi xe thông minh": "gara-ck", "nhà xe": "de-xe",
  "kho": "kho", "kho lạnh": "kho", "xưởng": "san-xuat", "nhà xưởng": "san-xuat", "nhà máy": "san-xuat", "chung cư": "chung-cu", "chung cư mini": "chung-cu", "căn hộ": "chung-cu",
  "khách sạn": "khach-san", "nhà nghỉ": "khach-san", "nhà trọ": "khach-san", "homestay": "khach-san", "karaoke": "karaoke", "quán bar": "karaoke", "vũ trường": "karaoke",
  "văn phòng": "van-phong", "trường học": "truong-hoc", "mầm non": "mam-non", "bệnh viện": "benh-vien", "phòng khám": "phong-kham", "trạm y tế": "phong-kham",
  "siêu thị": "sieu-thi", "trung tâm thương mại": "cho-tttm", "chợ": "cho-tttm", "nhà hàng": "nha-hang", "quán ăn": "nha-hang", "cửa hàng tiện lợi": "cua-hang",
  "nhà phố": "nha-o-kd", "shophouse": "nha-o-kd", "sân bay": "ga-hk", "ga tàu": "ga-ds", "bến xe": "ben-xe", "rạp chiếu phim": "nha-hat", "nhà văn hóa": "van-hoa",
  "thư viện": "thu-vien", "bảo tàng": "bao-tang", "dưỡng lão": "duong-lao", "ký túc xá": "ktx", "nhà thi đấu": "the-thao", "chùa": "ton-giao", "chữa bệnh": "benh-vien", "khám chữa bệnh": "benh-vien", "hầm đường bộ": "ham" };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto("file://" + process.argv[2]);
  const r = await p.evaluate(C => Object.entries(C).map(([q, want]) => { const got = findTypes(norm(q).split(/\s+/).filter(Boolean), 3).map(t => t.id); return { q, want, got }; }), C);
  const bad = r.filter(x => x.got[0] !== x.want);
  bad.forEach(x => console.log(`✗ "${x.q}": mong đợi ${x.want} đứng đầu, nhận ${x.got.join(", ") || "(không thấy)"}`));
  console.log(`${r.length - bad.length}/${r.length} tên gọi tìm đúng loại công trình`);
  await b.close(); process.exit(bad.length ? 1 : 0);
})();
