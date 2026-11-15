"""Tạo trang sổ tay QCVN 10:2025 từ noi-dung/*.md.
Dùng: python3 qcvn10/tools/build.py qcvn10/noi-dung /tmp/q10.html"""
import json, pathlib, sys
here = pathlib.Path(__file__).parent
src = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
files = ["README.md", "01-quy-dinh-chung.md", "02-trang-bi.md", "03-phu-luc-a.md", "04-phu-luc-b-c.md",
         "05-phu-luc-d-g.md", "06-h1-nuoc-ngoai-nha.md", "07-h2-hong-nuoc.md", "08-h3-h4-bom-loa.md", "09-chung-cu-kho-xuong.md", "10-kho-xuong-qcvn06.md", "11-gara-qcvn13.md"]
data = {f: (src / f).read_text() for f in files}
js = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
# Bộ quy tắc QCVN 06 lấy nguyên từ sổ tay QCVN 06 (tools/template.html), đặt trong vùng tên Q06
t06 = (here.parent.parent / "tools" / "template.html").read_text()
q06 = t06[t06.index("const CT = ["):t06.index("let ctV = Object.assign(")]
q06 = "const Q06 = (function () {\n" + q06 + "\nreturn { CT, ctEvaluate };\n})();"
app = (here / "app.html").read_text()
assert "/*__Q06__*/" in app
import datetime, re as _re
sw = (here.parent.parent / "docs" / "qcvn10" / "sw.js").read_text()
ver = _re.search(r'VERSION = "sotay-qcvn10-(v\d+)"', sw).group(1)
app = app.replace("__VER__", ver).replace("__DATE__", datetime.date.today().strftime("%d/%m/%Y"))
page = (here / "head.html").read_text() + "\n" + app.replace("__DATA__", js).replace("/*__Q06__*/", q06.replace("</", "<\\/"))
out.write_text(page)
print(out, out.stat().st_size)
