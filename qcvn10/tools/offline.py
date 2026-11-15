"""Tạo bản HTML một tệp chạy hoàn toàn offline: nhúng phông Be Vietnam Pro và JetBrains Mono (base64).
Dùng: python3 qcvn10/tools/offline.py <trang-đã-build.html> <thư-mục-fontsource> <đầu-ra.html>
Thư mục fontsource chứa hai gói giải nén từ npm: @fontsource/be-vietnam-pro, @fontsource/jetbrains-mono
(npm pack @fontsource/be-vietnam-pro@5.0.8 @fontsource/jetbrains-mono@5.0.18)."""
import base64, pathlib, re, sys

src = pathlib.Path(sys.argv[1]).read_text()
fdir = pathlib.Path(sys.argv[2])
out = pathlib.Path(sys.argv[3])

def faces(pkg, family, weights, subsets):
    root = next(p for p in sorted(fdir.glob(pkg + "*")) if p.is_dir())
    css = []
    for w in weights:
        decl = (root / f"{w}.css").read_text()
        for sub in subsets:
            m = re.search(r"/\* [\w-]+-" + re.escape(sub) + r"-" + str(w) + r"-normal \*/\s*@font-face\s*{(.*?)}", decl, re.S)
            ur = re.search(r"unicode-range:\s*([^;]+);", m.group(1)).group(1) if m else None
            f = root / "files" / f"{root.name.split('-', 1)[1].rsplit('-', 1)[0]}-{sub}-{w}-normal.woff2"
            if not f.exists():
                continue
            b64 = base64.b64encode(f.read_bytes()).decode()
            css.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{w};font-display:swap;"
                       f"src:url(data:font/woff2;base64,{b64}) format('woff2');" + (f"unicode-range:{ur};" if ur else "") + "}")
    return css

css = faces("fontsource-be-vietnam-pro", "Be Vietnam Pro", [400, 500, 600, 700, 800], ["vietnamese", "latin-ext", "latin"])
css += faces("fontsource-jetbrains-mono", "JetBrains Mono", [500], ["latin-ext", "latin"])
if len(css) < 10:
    sys.exit(f"Chỉ tìm thấy {len(css)} phông — kiểm tra thư mục fontsource")

page = re.sub(r'<link rel="preconnect"[^>]*>\s*', "", src)
page = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>\s*', "", page)
page = page.replace("<style>", "<style>\n" + "\n".join(css) + "\n", 1)
assert "fonts.googleapis" not in page

meta = ['<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-title" content="QCVN 10">',
        '<meta name="format-detection" content="telephone=no">']
head_end = page.index("</style>") + len("</style>")
extra = "<style>\nhtml { padding-top: env(safe-area-inset-top, 0px); -webkit-tap-highlight-color: transparent; }\n[hidden] { display: none !important; }\nbody { margin: 0; overscroll-behavior-y: none; }\n</style>"
doc = ("<!doctype html>\n<html lang=\"vi\">\n<head>\n" + "\n".join(meta) + "\n" + page[:head_end] + "\n" + extra +
       "\n</head>\n<body>\n" + page[head_end:] + "\n</body>\n</html>\n")
out.write_text(doc)
print(out, f"{out.stat().st_size / 1024:.0f} KB, {len(css)} phông nhúng")
