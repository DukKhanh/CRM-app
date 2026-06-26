# 🚀 CRM Connect Mobile

Ứng dụng quản lý Khách hàng và Công việc (CRM) toàn diện dành cho thiết bị di động, được xây dựng với kiến trúc Fullstack hiện đại.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)

## ✨ Tính năng nổi bật
* **Bảo mật:** JWT Authentication với cơ chế tự động **Refresh Token** ngầm (Axios Interceptors).
* **Khôi phục tài khoản:** Gửi mã OTP xác thực qua Email (Nodemailer).
* **Quản lý dữ liệu (CRUD):** Tích hợp thao tác Nhấn giữ (Long Press) để xử lý dữ liệu Khách hàng và Công việc.
* **UX/UI Nâng cao:** 
  * Dark Mode (Chế độ nền tối).
  * Biểu đồ thống kê trực quan (Pie Chart).
  * Xử lý Camera & Upload Avatar bằng chuẩn Base64.
* **Offline Sync:** Ứng dụng vẫn đọc được dữ liệu mượt mà khi mất kết nối mạng (Redux Persist).
* **Cloud Database & Deployment:** Triển khai trên Supabase và Render.

## 🛠 Công nghệ sử dụng
**Frontend (Mobile App):**
* React Native (Expo SDK) + TypeScript
* Redux Toolkit & Redux Persist (Quản lý State & Lưu trữ Offline)
* React Navigation (Điều hướng đa màn hình)
* Axios (Giao tiếp API)

**Backend (RESTful API):**
* Node.js & Express.js + TypeScript
* Prisma ORM
* PostgreSQL (Hosted on Supabase)
* JSON Web Token (JWT) & Nodemailer

## 🚀 Hướng dẫn cài đặt (Chạy Local)

### 1. Backend
\`\`\`bash
cd crm-backend
npm install
# Khởi tạo file .env với DATABASE_URL và JWT_SECRET
npx prisma db push
npm run dev
\`\`\`

### 2. Mobile App
\`\`\`bash
cd crm-mobile
npm install
# Đổi địa chỉ BASE_URL trong src/api/axiosClient.ts thành IP mạng của bạn
npx expo start -c
\`\`\`

## 📸 Ảnh chụp màn hình
*(Bạn hãy chụp 3-4 tấm ảnh app của bạn: Màn hình Đăng nhập, Trang chủ (có biểu đồ), Danh sách, và màn hình Dark Mode rồi dán link ảnh vào đây nhé)*

---
*Dự án được phát triển theo tiêu chuẩn Production-ready với đầy đủ RESTful API và Business Logic chặt chẽ.*
