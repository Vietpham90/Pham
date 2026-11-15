#!/bin/sh
# Tạo lại mọi bản của sổ tay QCVN 10 từ qcvn10/noi-dung. Chạy từ thư mục gốc repo.
set -e
TMP=${TMPDIR:-/tmp}/q10.html
python3 qcvn10/tools/build.py qcvn10/noi-dung "$TMP"
python3 qcvn10/tools/standalone.py "$TMP" pwa docs/qcvn10/index.html
python3 qcvn10/tools/standalone.py "$TMP" ios so-tay-qcvn10-mobile.html
# Bản offline nhúng phông: cần FONTS trỏ tới thư mục đã giải nén
#   npm pack @fontsource/be-vietnam-pro@5.0.8 @fontsource/jetbrains-mono@5.0.18 (rồi tar xzf từng gói, đổi tên package → tên gói)
if [ -n "$FONTS" ]; then
  python3 qcvn10/tools/offline.py "$TMP" "$FONTS" so-tay-qcvn10-offline.html
  cp so-tay-qcvn10-offline.html qcvn10/ios/SoTayPCCC/Web/index.html
  node qcvn10/tools/static.js so-tay-qcvn10-offline.html so-tay-qcvn10-iphone.html
fi
echo "Nhớ tăng VERSION trong docs/qcvn10/sw.js"
