#!/bin/sh
# Chạy toàn bộ kiểm thử sổ tay QCVN 10 (từ thư mục gốc repo). Cần Node.js + Playwright.
# Tùy chọn: OCR=<thư mục p-NN.txt> để đối chiếu số liệu với bản scan.
set -e
T=${TMPDIR:-/tmp}
python3 qcvn10/tools/build.py qcvn10/noi-dung "$T/q10.html" >/dev/null
python3 tools/build.py noi-dung tools/template.html "$T/so-tay.html" >/dev/null
for t in test-quy-tac test-chung-cu-kho test-co-so test-giao-dien; do node qcvn10/tools/$t.js "$T/q10.html" | tail -1; done
node qcvn10/tools/test-q06.js "$T/q10.html" "$T/so-tay.html" | tail -1
node qcvn10/tools/test-nguong-tu-noi-dung.js "$T/q10.html" qcvn10/noi-dung | tail -1
node qcvn10/tools/test-doi-chieu.js "$T/q10.html" qcvn10/noi-dung | tail -1
node qcvn10/tools/test-tinh-chat.js "$T/q10.html" 3000 | tail -1
node qcvn10/tools/test-fuzz-giao-dien.js "$T/q10.html" 2 | tail -1
[ -f so-tay-qcvn10-offline.html ] && node qcvn10/tools/test-offline.js so-tay-qcvn10-offline.html | tail -1
[ -n "$OCR" ] && python3 qcvn10/tools/doi-chieu-ocr.py "$OCR" qcvn10/noi-dung | tail -1
node tools/test-cong-trinh.js "$T/so-tay.html" | tail -1
echo "Xong."
