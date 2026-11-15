"""Đối chiếu số liệu trong qcvn10/noi-dung với văn bản OCR của bản scan QCVN 10:2025/BCA.
Mỗi con số (≥ 2 chữ số hoặc có dấu phẩy thập phân) trong nội dung phải xuất hiện ở đâu đó trong văn bản gốc.
Dùng: python3 qcvn10/tools/doi-chieu-ocr.py <thư-mục-ocr-có-p-NN.txt> qcvn10/noi-dung
Tạo OCR: pdftoppm -r 200 -gray -png QCVN10.pdf p && for f in p-*.png; do tesseract $f ${f%.png} -l vie --psm 6; done"""
import pathlib, re, sys

ocr_dir, md_dir = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
# Mục "10-…" lấy từ QCVN 06: đối chiếu với văn bản QCVN 06 (pdftotext của QCVN-06_2022-SUA-DOI-1_2023_BXD.pdf), tham số thứ 3
q06_txt = pathlib.Path(sys.argv[3]).read_text() if len(sys.argv) > 3 else None
raw = "\n".join(p.read_text() for p in sorted(ocr_dir.glob("p-*.txt")))

def norm_nums(text, ocr=False):
    t = text.replace(" ", " ")
    t = re.sub(r"(?<=\d)[ .](?=\d{3}\b)", "", t)        # 1 500 / 1.500 → 1500
    if ocr:
        t = re.sub(r"(?<=\d)\s*,\s*(?=\d)", ",", t)      # OCR hay chèn dấu cách: 2, 5 → 2,5
    return set(re.findall(r"\d+(?:,\d+)?", t))

src = norm_nums(raw, ocr=True)
src06 = norm_nums(q06_txt, ocr=True) if q06_txt else None
# Số do sổ tay tự tính / tự đặt, không có trong văn bản (đánh số mục sổ tay, ví dụ minh họa…)
ALLOW = {"3,6", "10,8", "64"}
# Ô bảng OCR không đọc được nhưng đã đối chiếu bằng ảnh phân giải cao (tệp: các số)
SEEN = {"03-phu-luc-a.md": {"7000", "3600"}, "06-h1-nuoc-ngoai-nha.md": {"85", "90"}, "07-h2-hong-nuoc.md": {"5,0"},
        # QCVN 06 Bảng G.3 ghi khối tích theo đơn vị 1 000 m³ (30, ≥ 60, ≥ 80); sổ tay viết 30 000 m³…
        "10-kho-xuong-qcvn06.md": {"30000", "60000", "80000"}}
H7_LINES = range(95, 120)   # Bảng H.7 trong 07-h2-hong-nuoc.md: đã đối chiếu từng ô bằng ảnh 160 dpi
miss = []
for f in sorted(md_dir.glob("*.md")):
    if f.name.startswith("10-") and src06 is None:
        print(f"(bỏ qua {f.name}: cần tham số thứ 3 là văn bản QCVN 06)"); continue
    ref = src06 if f.name.startswith("10-") else src
    for ln, line in enumerate(f.read_text().splitlines(), 1):
        if re.match(r"^#{1,3} ", line):          # tiêu đề mục của sổ tay đánh số riêng
            line = re.sub(r"^#{1,3} [\d.]+ ", "", line)
        body = re.sub(r"\]\([^)]*\)", "]", line)  # bỏ đường dẫn liên kết
        for n in sorted(norm_nums(body)):
            if len(n.replace(",", "")) < 2 or n in ALLOW or n in SEEN.get(f.name, ()):
                continue
            if f.name == "07-h2-hong-nuoc.md" and ln in H7_LINES:
                continue
            if n not in ref:
                miss.append((f.name, ln, n, line.strip()[:110]))
for m in miss:
    print(f"{m[0]}:{m[1]}  {m[2]:>8}  {m[3]}")
print(f"\n{len(miss)} con số không tìm thấy trong OCR (cần xem lại bằng mắt; OCR bảng có thể đọc sai)")
