# Sổ tay QCVN 06:2022

Tra cứu nhanh các yêu cầu **kiến trúc – kết cấu** về an toàn cháy theo **QCVN 06:2022/BXD** (Thông tư 06/2022/TT-BXD) và **Sửa đổi 1:2023** (Thông tư 09/2023/TT-BXD ngày 16/10/2023).

> **Nguồn đối chiếu**: bản hợp nhất "QCVN 06:2022/BXD – Sửa đổi 01-2023" (214 trang). Mọi giá trị trong sổ tay kèm số điều, số bảng để tra lại nguyên văn. Sổ tay là bản **tóm tắt**, không thay thế quy chuẩn: các chú thích, ngoại lệ dài chỉ được nêu ý chính.

## Cách dùng sổ tay — trình tự 7 bước

Mọi hồ sơ thiết kế PCCC phần kiến trúc đi theo cùng một chuỗi quyết định. Bước sau phụ thuộc kết quả bước trước:

| Bước | Câu hỏi cần trả lời | Mục tra cứu |
| --- | --- | --- |
| 1 | Công trình có thuộc phạm vi áp dụng? Thuộc **nhóm F** nào (Bảng 6)? Có phần nào khác nhóm không? | [Phân loại](01-phan-loai.md) |
| 2 | **Chiều cao PCCC**, số tầng, số tầng hầm? | [Thuật ngữ](08-thuat-ngu.md) |
| 3 | Chọn **bậc chịu lửa** (I – V) và **cấp S** (S0 – S3) → GHCL từng cấu kiện (Bảng 4, 5; > 50 m: Bảng A.1) | [Phân loại](01-phan-loai.md) |
| 4 | **Diện tích khoang cháy** cho phép (Phụ lục H)? Cần tường, sàn ngăn cháy ở đâu? | [Ngăn cháy](02-ngan-chay.md) |
| 5 | **Thoát nạn**: số lối ra, khoảng cách (Phụ lục G), chiều rộng, loại buồng thang | [Thoát nạn](03-thoat-nan.md) |
| 6 | **Ngăn cháy lan** mặt ngoài và giữa các nhà (4.32 – 4.35, Phụ lục E) | [Cháy lan](04-chay-lan.md) |
| 7 | **Tiếp cận chữa cháy**: đường xe, bãi đỗ, lối vào từ trên cao, lối ra mái, thang máy chữa cháy (Phần 6) | [Chữa cháy & cứu nạn](05-chua-chay-cuu-nan.md) |

Sau đó rà các điểm [Sửa đổi 1:2023](06-sua-doi-1-2023.md) và chạy [Checklist hồ sơ](07-checklist.md).

## Giọng văn của sổ tay

- **Một dòng – một yêu cầu – một con số – một điều khoản.** Ví dụ: *Bản thang ≥ 1,2 m khi nhà có tầng (trừ tầng 1) > 200 người (3.4.1).*
- Dùng đúng thuật ngữ của quy chuẩn: *lối ra thoát nạn*, *đường thoát nạn*, *chiều cao PCCC*, *khoang cháy*, *buồng thang bộ không nhiễm khói N1/N2/N3*, *lối vào từ trên cao*.
- Đơn vị viết theo TCVN: dấu phẩy thập phân (1,2 m); GHCL viết "REI 150".
- Không suy diễn: điều gì quy chuẩn không quy định thì ghi "không quy định".

## Nền tảng thị giác

Màu trong sổ tay mang nghĩa, không trang trí:

| Token | Nghĩa | Dùng cho |
| --- | --- | --- |
| `fire-600` | Ngăn cháy, chịu lửa | Tiêu đề bảng GHCL, nét tường ngăn cháy trên sơ đồ |
| `exit-600` | Thoát nạn | Lối ra, đường thoát nạn, buồng thang (theo màu xanh của biển EXIT) |
| `amber-500` / `amber-ink` | Lưu ý, sửa đổi | Nhãn ✱ SĐ1 và ghi chú cần đọc nguyên văn |
| `ink`, `muted` | Văn bản | Chữ chính / chú thích |
| `surface-100`, `surface-200`, `line` | Nền giấy | Nền trang, ô bảng xen kẽ, kẻ bảng |

Phân biệt "ngăn cháy" (đỏ) và "thoát nạn" (xanh) bằng **độ sáng** chứ không chỉ sắc độ, và luôn kèm chữ — người mù màu đỏ – lục không phân biệt được hai màu này.

Chữ: **Be Vietnam Pro** (đầy đủ dấu tiếng Việt) cho nội dung; **JetBrains Mono** cho số hiệu điều khoản, ký hiệu GHCL và số liệu.

## Ký hiệu

| Ký hiệu | Nghĩa |
| --- | --- |
| **R** | Khả năng chịu lực |
| **E** | Tính toàn vẹn |
| **I** | Khả năng cách nhiệt |
| **W** | Khả năng hạn chế bức xạ nhiệt (phần kính: EW, EIW) |
| **REI 120** | GHCL 120 phút theo cả R, E và I |
| **K0 … K3** | Cấp nguy hiểm cháy của cấu kiện |
| **S0 … S3** | Cấp nguy hiểm cháy kết cấu của nhà |
| **F1.1 … F5.3** | Nhóm nguy hiểm cháy theo công năng |
| **A, B, C1 – C4, D, E** | Hạng nguy hiểm cháy và cháy nổ (sản xuất, kho) |
| **CV0 … CV5** | Cấp nguy hiểm cháy của vật liệu |
| ✱ | Nội dung được sửa đổi, bổ sung tại Sửa đổi 1:2023 |

## Cấu trúc QCVN 06:2022/BXD

| Phần | Nội dung |
| --- | --- |
| 1 | Quy định chung — phạm vi, đối tượng, giải thích từ ngữ, quy định chung |
| 2 | Phân loại kỹ thuật về cháy — vật liệu, cấu kiện, bộ phận ngăn cháy, cầu thang và buồng thang, nhà |
| 3 | Bảo đảm an toàn cho người — lối ra, đường thoát nạn, cầu thang, vật liệu |
| 4 | Ngăn chặn cháy lan |
| 5 | Cấp nước chữa cháy (ngoài phạm vi sổ tay) |
| 6 | Chữa cháy và cứu nạn |
| 7 | Tổ chức thực hiện |
| PL A | Quy định bổ sung cho một số nhóm nhà cụ thể (nhà sản xuất, kho; nhà 50 – 150 m; chung cư 75 – 150 m) |
| PL B | Phân loại vật liệu theo đặc tính cháy; vật liệu hoàn thiện (Bảng B.8, B.9) |
| PL C | Hạng nguy hiểm cháy và cháy nổ |
| PL D | Bảo vệ chống khói |
| PL E | Khoảng cách phòng cháy chống cháy |
| PL F | Giới hạn chịu lửa danh định của một số cấu kiện |
| PL G | Khoảng cách đến lối ra thoát nạn và chiều rộng lối ra |
| PL H | Bậc chịu lửa và yêu cầu an toàn cháy cho nhà, khoang cháy |
| PL I | Hình minh họa (tham khảo) |

## Phạm vi sổ tay

Chỉ gồm nội dung **kiến trúc – kết cấu**: phân loại, GHCL, ngăn cháy, thoát nạn, cháy lan, tiếp cận chữa cháy. Không gồm: cấp nước chữa cháy (Phần 5), hệ thống báo cháy, chữa cháy tự động, chi tiết bảo vệ chống khói (Phụ lục D) — chỉ nêu khi ảnh hưởng tới giải pháp kiến trúc.
