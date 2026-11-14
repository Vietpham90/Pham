import json, pathlib, sys
src = pathlib.Path(sys.argv[1]); tpl = pathlib.Path(sys.argv[2]).read_text(); out = pathlib.Path(sys.argv[3])
files = ["README.md","01-phan-loai.md","02-ngan-chay.md","03-thoat-nan.md","04-chay-lan.md","05-chua-chay-cuu-nan.md","06-sua-doi-1-2023.md","07-checklist.md","08-thuat-ngu.md"]
data = {f: (src/f).read_text() for f in files}
js = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
out.write_text(tpl.replace("__DATA__", js))
print(out.stat().st_size)
