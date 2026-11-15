"""Tạo trang sổ tay QCVN 10:2025 từ noi-dung/*.md.
Dùng: python3 qcvn10/tools/build.py qcvn10/noi-dung /tmp/q10.html"""
import json, pathlib, sys
here = pathlib.Path(__file__).parent
src = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
files = ["README.md", "01-quy-dinh-chung.md", "02-trang-bi.md", "03-phu-luc-a.md", "04-phu-luc-b-c.md",
         "05-phu-luc-d-g.md", "06-h1-nuoc-ngoai-nha.md", "07-h2-hong-nuoc.md", "08-h3-h4-bom-loa.md"]
data = {f: (src / f).read_text() for f in files}
js = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
page = (here / "head.html").read_text() + "\n" + (here / "app.html").read_text().replace("__DATA__", js)
out.write_text(page)
print(out, out.stat().st_size)
