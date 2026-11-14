# Sổ tay PCCC — QCVN 06:2022/BXD và Sửa đổi 1:2023

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
