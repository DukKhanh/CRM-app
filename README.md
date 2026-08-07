# CRM Connect

CRM Connect là ứng dụng CRM mobile dùng React Native + TypeScript, Express, PostgreSQL và Prisma. Phiên bản này triển khai Admin Lite cùng kiến trúc phân quyền hybrid: RBAC quyết định quyền chức năng, resource policy giới hạn dữ liệu theo owner/creator/assignee, còn business rules bảo vệ các bất biến quan trọng.

## Tính năng chính

- Quản lý khách hàng, công việc, ghi chú, hồ sơ và phiên đăng nhập.
- Ba vai trò: `ADMIN`, `MANAGER`, `EMPLOYEE` với permission catalog tập trung.
- Admin Lite trên mobile: tổng quan, quản lý người dùng, nhật ký bảo mật và lối vào vận hành CRM.
- Một màn hình đăng nhập duy nhất; backend trả về role/permissions và app tự chọn không gian Admin hoặc CRM.
- Access token bị vô hiệu hóa ngay sau thay đổi role, status hoặc mật khẩu nhờ `tokenVersion`.
- Refresh token được hash, rotate theo family, phát hiện reuse và quản lý theo thiết bị.
- Audit các lần từ chối truy cập, đổi quyền, đổi trạng thái và sự kiện session.
- Zod validation, error handler tập trung, request ID, Helmet, CORS và rate limit.
- Token mobile lưu trong Expo SecureStore; nhiều lỗi `401` đồng thời chỉ tạo một yêu cầu refresh.
- Backend trả `capabilities` theo từng resource để UI ẩn thao tác không khả dụng. Đây chỉ là UX; backend vẫn là security boundary.

## Kiến trúc thư mục

```text
crm-backend/
  docs/                 OpenAPI, kiến trúc và runbook RBAC
  prisma/               Schema, migration và admin seed
  src/modules/          Authorization, Admin, Users, CRM modules
crm-mobile/
  src/authorization/    Permission helpers và chọn trải nghiệm sau login
  src/navigation/       AdminNavigator và CrmNavigator
  src/screens/admin/    Overview, Users, Security Events
```

Thiết kế chi tiết nằm ở `crm-backend/docs/RBAC_ARCHITECTURE.md`; hướng dẫn vận hành và bootstrap Admin nằm ở `crm-backend/docs/RBAC_OPERATIONS.md`.

## Chạy backend

```bash
cd crm-backend
cp .env.example .env
npm ci
npm run prisma:generate
npm run migrate:deploy
npm run seed:admin
npm run dev
```

`JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` phải là hai giá trị độc lập, dài tối thiểu 32 ký tự. Admin/mailer credentials phải nằm trong secret manager hoặc biến môi trường, không commit vào Git.

Sau khi backend chạy:

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api/openapi.json`
- Liveness: `http://localhost:3000/health/live`
- Readiness: `http://localhost:3000/health/ready`

## Chạy mobile

```bash
cd crm-mobile
npm ci
```

Đặt `EXPO_PUBLIC_API_URL`, ví dụ `http://10.0.2.2:3000/api` trên Android emulator, rồi chạy:

```bash
npx expo start -c
```

Ứng dụng dùng Redux Persist làm cache cục bộ, không phải cơ chế đồng bộ offline hoàn chỉnh. Access/refresh token không nằm trong Redux mà chỉ lưu bằng Expo SecureStore.

### Đăng nhập Admin trên điện thoại

1. Tạo/nâng cấp tài khoản Admin bằng `npm run seed:admin` ở backend.
2. Mở app và đăng nhập bằng màn hình thông thường; không có ô chọn vai trò.
3. Backend xác thực và trả `permissions`. Permission `admin:overview:read` khiến app mở `AdminNavigator`.
4. Role/status thay đổi sẽ thu hồi session; người bị thay đổi phải đăng nhập lại để nhận permission mới.

## Kiểm tra chất lượng

```bash
cd crm-backend
npm run typecheck
npm test

cd ../crm-mobile
npm run typecheck
npm test
```

Các test bao phủ permission matrix, resource scope, permission middleware/audit, bất biến quản trị Admin, tổng hợp dashboard, route protection, health, Swagger/OpenAPI và logic chọn giao diện Admin phía mobile.

## Permission nổi bật

| Nhóm | Employee | Manager | Admin |
| --- | --- | --- | --- |
| Khách hàng | Dữ liệu sở hữu | Toàn bộ | Toàn bộ |
| Công việc | Được giao/đã tạo | Toàn bộ, được phân công | Toàn bộ, được phân công |
| Danh sách người dùng | Không | Có | Có |
| Đổi role/status | Không | Không | Có |
| Dashboard và security audit | Không | Không | Có |

Không chỉnh permission trực tiếp ở client. Nguồn sự thật thực thi là `crm-backend/src/modules/authorization/permissions.ts`.
