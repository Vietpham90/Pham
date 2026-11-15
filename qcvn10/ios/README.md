# Ứng dụng iOS — Sổ tay QCVN 10:2025/BCA

Ứng dụng SwiftUI hiển thị sổ tay (đóng gói sẵn trong `SoTayPCCC/Web/index.html`). Chạy **hoàn toàn offline**; mục đã lưu và số liệu đã nhập được giữ lại giữa các lần mở.

## Cần có

- Máy **Mac** cài **Xcode 15** trở lên (miễn phí trên Mac App Store).
- iPhone/iPad chạy **iOS 16** trở lên và cáp kết nối.
- **Apple ID** (miễn phí) để cài lên máy của mình. Muốn phát hành TestFlight/App Store cần tài khoản Apple Developer (99 USD/năm).

## Cài lên iPhone của bạn

1. Tải thư mục `qcvn10/ios/` về Mac (clone repository hoặc tải ZIP trên GitHub).
2. Mở `qcvn10/ios/SoTayPCCC.xcodeproj` bằng Xcode.
3. Chọn target **SoTayPCCC** → tab **Signing & Capabilities**:
   - Bật **Automatically manage signing**.
   - **Team**: chọn Apple ID của bạn (Xcode → Settings → Accounts → thêm Apple ID nếu chưa có).
   - Nếu báo trùng **Bundle Identifier**, đổi `vn.sotay.pccc.qcvn10` thành tên riêng, ví dụ `vn.tencuaban.sotaypccc`.
4. Cắm iPhone, chọn iPhone ở thanh thiết bị phía trên, bấm **Run (⌘R)**.
5. Lần đầu: trên iPhone vào **Cài đặt → Cài đặt chung → Quản lý VPN & thiết bị** → tin cậy Apple ID của bạn. Với iOS 16+, bật thêm **Cài đặt → Quyền riêng tư & Bảo mật → Chế độ nhà phát triển**.

Với Apple ID miễn phí, ứng dụng hết hạn sau **7 ngày**; chỉ cần cắm máy và bấm Run lại. Tài khoản Developer trả phí thì hạn 1 năm và phân phối được qua TestFlight.

## Nếu Xcode không mở được dự án

Tệp `project.pbxproj` được viết tay. Nếu Xcode báo lỗi, tạo lại bằng XcodeGen:

```bash
brew install xcodegen
```

```bash
cd qcvn10/ios && xcodegen generate
```

## Cập nhật nội dung

Nội dung nằm trong `noi-dung/*.md` ở thư mục gốc. Sau khi sửa, chạy các lệnh trong `README.md` gốc để tạo lại `qcvn10/ios/SoTayPCCC/Web/index.html`, rồi build lại ứng dụng.
