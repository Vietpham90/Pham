#!/bin/sh
# Tạo lại mọi bản của sổ tay QCVN 10 từ qcvn10/noi-dung. Chạy từ thư mục gốc repo.
set -e
TMP=${TMPDIR:-/tmp}/q10.html
python3 qcvn10/tools/build.py qcvn10/noi-dung "$TMP"
python3 qcvn10/tools/standalone.py "$TMP" pwa docs/qcvn10/index.html
python3 qcvn10/tools/standalone.py "$TMP" ios so-tay-qcvn10-mobile.html
echo "Nhớ tăng VERSION trong docs/qcvn10/sw.js"
