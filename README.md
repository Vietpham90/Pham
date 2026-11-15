# Sổ tay PCCC — QCVN 06:2022/BXD và QCVN 10:2025/BCA

Repo gồm hai sổ tay:

- **QCVN 06:2022/BXD + SĐ1:2023** — yêu cầu kiến trúc – kết cấu về an toàn cháy (phần đầu tài liệu này).
- **QCVN 10:2025/BCA** — trang bị, bố trí phương tiện PCCC và CNCH (Thông tư 103/2025/TT-BCA, hiệu lực 30/12/2025). Xem mục [Sổ tay QCVN 10:2025/BCA](#sổ-tay-qcvn-102025bca) ở cuối.

Sổ tay tra cứu các yêu cầu **kiến trúc – kết cấu** về an toàn cháy, đối chiếu với bản hợp nhất `QCVN-06_2022-SUA-DOI-1_2023_BXD.pdf`.

| Thư mục / tệp | Nội dung |
| --- | --- |
| `noi-dung/` | Nội dung gốc dạng Markdown (9 mục). **Sửa nội dung ở đây.** |
| `docs/` | Bản web cài được lên màn hình chính (PWA), chạy offline. Dùng cho GitHub Pages |
| `ios/` | Dự án Xcode ứng dụng iOS — xem `ios/README.md` |
| `so-tay-pccc-mobile.html` | Một tệp HTML duy nhất, mở trực tiếp bằng trình duyệt điện thoại |
| `tools/` | Mẫu giao diện và script tạo các bản trên từ `noi-dung/` |

## Dùng trên iPhone không cần Mac (PWA)

1. Trên GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, chọn nhánh chứa sổ tay và thư mục **`/docs`**, bấm **Save**. (Tài khoản GitHub miễn phí yêu cầu repository công khai.)
2. Sau 1–2 phút, mở địa chỉ Pages bằng **Safari** trên iPhone.
3. Bấm **Chia sẻ → Thêm vào MH chính**. Sổ tay có biểu tượng riêng, mở toàn màn hình và dùng được khi không có mạng.

## Tạo lại các bản sau khi sửa nội dung

```bash
python3 tools/build.py noi-dung tools/template.html /tmp/so-tay.html
```

```bash
python3 tools/standalone.py /tmp/so-tay.html pwa docs/index.html
```

```bash
python3 tools/standalone.py /tmp/so-tay.html ios ios/SoTayPCCC/Web/index.html
```

```bash
python3 tools/standalone.py /tmp/so-tay.html ios so-tay-pccc-mobile.html
```

Sau đó tăng `VERSION` trong `docs/sw.js` để máy đã cài nhận bản mới.

> Sổ tay là tài liệu tóm tắt để tra cứu, không thay thế văn bản quy chuẩn. Mỗi giá trị kèm số điều, số bảng để đối chiếu nguyên văn.

## Kiểm thử công cụ "Tra theo công trình"

Bộ kiểm thử có đáp án (67 trường hợp: toàn nhà, nhà hỗn hợp, gian phòng, Bảng G.3 – G.8) nằm ở `tools/test-cong-trinh.js`. Cần Node.js và Playwright:

```bash
python3 tools/build.py noi-dung tools/template.html /tmp/so-tay.html
```

```bash
node tools/test-cong-trinh.js /tmp/so-tay.html
```

Ba bộ kiểm tra bổ sung (chạy sau khi tạo `/tmp/so-tay.html`):

```bash
node tools/test-ngau-nhien.js /tmp/so-tay.html 3000
```

```bash
node tools/test-doi-chieu-bang.js /tmp/so-tay.html noi-dung
```

```bash
node tools/test-tinh-chat.js /tmp/so-tay.html
```

```bash
node tools/test-tinh-nang.js /tmp/so-tay.html /tmp/anh
```

```bash
node tools/test-bam-sau-khi-go.js /tmp/so-tay.html
```

```bash
node tools/test-do-ben.js /tmp/so-tay.html /tmp/anh
```

## Sổ tay QCVN 10:2025/BCA

Tra cứu trang bị phương tiện PCCC và CNCH: báo cháy, chữa cháy tự động (Phụ lục A), họng nước trong nhà (B), cấp nước ngoài nhà (C), xe – tàu – bơm (D), phá dỡ (E), mặt nạ (F), loa (G), thiết kế hệ thống nước và trạm bơm (H). Nội dung đối chiếu bản scan văn bản ban hành kèm Thông tư 103/2025/TT-BCA.

| Thư mục / tệp | Nội dung |
| --- | --- |
| `qcvn10/noi-dung/` | Nội dung gốc Markdown (10 mục, gồm trang tra nhanh chung cư, kho, xưởng). **Sửa nội dung ở đây.** |
| `qcvn10/tools/` | Giao diện (`head.html`, `app.html`), script tạo bản, bộ kiểm thử |
| `docs/qcvn10/` | Bản web cài được (PWA), chạy offline — trên GitHub Pages ở địa chỉ `…/qcvn10/` |
| `so-tay-qcvn10-mobile.html` | Một tệp HTML, mở trực tiếp bằng trình duyệt điện thoại |
| `so-tay-qcvn10-offline.html` | Một tệp HTML **chạy hoàn toàn không cần mạng**, đã nhúng phông chữ (570 KB) |
| `so-tay-qcvn10-iphone.html` | Bản **đọc tĩnh** không cần JavaScript — tải về iPhone, mở bằng ứng dụng Tệp là đọc được (không có công cụ tra) |
| `qcvn10/ios/` | Dự án Xcode ứng dụng iOS “QCVN 10”, chạy offline — xem `qcvn10/ios/README.md` |

Công cụ trong sổ tay:

- **Tra theo công trình** — 42 loại nhà; nhập số tầng (1.4.24), chiều cao PCCC, diện tích sàn, khối tích → báo cháy (kể cả khi được dùng thiết bị báo cháy độc lập), chữa cháy tự động, họng nước (số tia × L/s theo Bảng H.5, H.6), lưu lượng ngoài nhà (Bảng H.2 – H.4), đường ống khô, loa, phá dỡ, mặt nạ — kèm số bảng, số điều bấm được.
- **Kèm kiểm tra kiến trúc theo QCVN 06** trong cùng một lần nhập: phạm vi, bậc chịu lửa, khoang cháy, thoát nạn, ngăn cháy lan, tiếp cận chữa cháy. Bộ quy tắc lấy nguyên từ sổ tay QCVN 06 lúc dựng (`build.py` trích từ `tools/template.html`), sprinkler toàn nhà theo QCVN 10 được truyền sang QCVN 06.
- **Nhà hỗn hợp**: kiểm tra quy tắc 70 % (1.5.8) từ diện tích từng công năng. **Phần để xe trong nhà** (Bảng A.3 mục 4.4, G.1 mục 3, H.5 CT2).
- **Cơ sở, khu** — kho dầu, cảng hàng không, cảng biển, LNG, nhiệt điện, thủy điện, dệt, lọc dầu, chế biến khí, KCN, CCN: số xe, tàu, bơm chữa cháy (Bảng D.1), mặt nạ cách ly (F.1), cấp nước ngoài nhà (C.1).
- **Gian phòng, hạng mục, thiết bị** — 69 dòng Bảng A.2, A.3, A.4 (phòng máy chủ, kho tiền, máy biến áp dầu, hầm cáp…): nhập quy mô → báo cháy, chữa cháy tự động kèm ghi chú.
- **Tính nước** — khu dân cư (Bảng H.1), bãi công-ten-nơ; áp suất họng theo tia nước đặc (Bảng H.7); số bình chữa cháy cho công trình đang thi công (2.6.5).

### Xem offline trên điện thoại

- **Android**: tải `so-tay-qcvn10-offline.html` về máy → mở bằng **Chrome** (trình quản lý tệp → Mở bằng → Chrome). Dùng được khi không có mạng; dữ liệu nhập được nhớ trên máy.
- **iPhone, chỉ đọc**: tải `so-tay-qcvn10-iphone.html` → mở trong ứng dụng Tệp. Đọc được toàn bộ nội dung, không cần mạng; không có công cụ tra.
- **iPhone, đầy đủ công cụ**: trình xem trước của ứng dụng Tệp không chạy JavaScript. Dùng ứng dụng iOS (`qcvn10/ios/`, cần Mac) hoặc bản web: bật GitHub Pages (như hướng dẫn ở đầu tài liệu), mở `…/qcvn10/` bằng Safari khi có mạng một lần → **Chia sẻ → Thêm vào MH chính**. Từ đó mở offline được.

Tạo lại các bản sau khi sửa nội dung (chạy từ thư mục gốc repo), rồi tăng `VERSION` trong `docs/qcvn10/sw.js`. Đặt biến `FONTS` tới thư mục phông fontsource để tạo cả bản offline:

```bash
sh qcvn10/tools/build-all.sh
```

Kiểm thử (cần Node.js và Playwright), sau khi đã tạo `/tmp/q10.html`:

```bash
node qcvn10/tools/test-quy-tac.js /tmp/q10.html
```

```bash
node qcvn10/tools/test-doi-chieu.js /tmp/q10.html qcvn10/noi-dung
```

```bash
node qcvn10/tools/test-tinh-chat.js /tmp/q10.html 3000
```

```bash
node qcvn10/tools/test-giao-dien.js /tmp/q10.html
```

```bash
node qcvn10/tools/smoke.js /tmp/q10.html
```

- `test-quy-tac.js` — 171 trường hợp có đáp án tính tay từ Bảng A.1, A.3, B.1, C.1, G.1, H.2 – H.6 (ngay trên và dưới từng ngưỡng).
- `test-chung-cu-kho.js` — 46 tình huống thiết kế (chung cư, gara xe máy, khách sạn có gara hầm, xưởng có phòng IT, máy biến áp, nhà kho).
- `test-fuzz-giao-dien.js` — thao tác ngẫu nhiên trên mọi loại nhà và mọi ô nhập (số âm, chữ, số rất lớn…), bắt lỗi JavaScript và chữ “NaN/undefined”.
- `test-q06.js` — phần ghép QCVN 06: kết quả giống hệt sổ tay QCVN 06 trên 400 đầu vào ngẫu nhiên; sprinkler được truyền đúng (`node qcvn10/tools/test-q06.js /tmp/q10.html /tmp/so-tay.html`).
- `test-co-so.js` — 31 trường hợp Bảng D.1, F.1, C.1 cho cơ sở, khu.
- `test-doi-chieu.js` — bảng số trong mã khớp bảng trong `noi-dung` (H.1 – H.4, H.6, H.7 và 69 dòng Bảng A.2 – A.4).
- `test-tinh-chat.js` — đầu vào ngẫu nhiên; tăng số tầng, diện tích, chiều cao không bao giờ làm giảm yêu cầu.
- `doi-chieu-ocr.py` — mọi con số trong `noi-dung` phải có trong văn bản OCR của bản scan (0 số lệch; các ô OCR không đọc được đã đối chiếu bằng ảnh và ghi trong script).
- `test-offline.js` — chặn mọi yêu cầu mạng, phông nhúng phải tải được và hiện đúng tiếng Việt (`node qcvn10/tools/test-offline.js so-tay-qcvn10-offline.html`).
- `test-giao-dien.js` — nhập số kiểu Việt Nam, tìm kiếm không dấu, liên kết số điều, không tràn ngang ở 320 px, chế độ tối.
