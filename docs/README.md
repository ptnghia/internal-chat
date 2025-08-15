# 📚 Documentation

Thư mục này chứa tất cả tài liệu kỹ thuật và kế hoạch cho dự án Internal Chat App.

## 📁 Cấu Trúc Thư Mục

### 📋 [planning/](./planning/)
Kế hoạch chi tiết và theo dõi tiến độ cho từng phase phát triển:
- `phase-1-planning-research.md` - Planning & Research (Tháng 1-2)
- `phase-2-mvp-development.md` - MVP Development (Tháng 3-5)
- `phase-3-advanced-features.md` - Advanced Features (Tháng 6-8)
- `phase-4-mobile-ai.md` - Mobile & AI Features (Tháng 9-12)
- `web-platform-roadmap.md` - Roadmap chi tiết cho web platform
- `mobile-platform-roadmap.md` - Roadmap chi tiết cho mobile platform
- `progress-tracking.md` - Tổng hợp tiến độ toàn dự án

### 🏗️ [architecture/](./architecture/)
Thiết kế hệ thống và kiến trúc kỹ thuật:
- `system-overview.md` - Tổng quan kiến trúc hệ thống
- `database-schema.md` - Thiết kế database schema
- `api-design.md` - Thiết kế REST API
- `websocket-design.md` - Thiết kế real-time communication
- `security-design.md` - Thiết kế bảo mật và phân quyền
- `scalability-plan.md` - Kế hoạch mở rộng hệ thống

### 📡 [api/](./api/)
Tài liệu API và integration:
- `rest-api-spec.md` - REST API specification
- `websocket-events.md` - WebSocket events documentation
- `authentication.md` - Authentication flow
- `file-upload.md` - File upload API
- `postman-collection.json` - Postman collection cho testing

### 🚀 [deployment/](./deployment/)
Hướng dẫn deployment và infrastructure:
- `local-development.md` - Setup môi trường development
- `docker-setup.md` - Docker configuration
- `aws-deployment.md` - AWS deployment guide
- `ci-cd-pipeline.md` - GitHub Actions CI/CD
- `monitoring-logging.md` - Monitoring và logging setup

### 🎨 [design/](./design/)
UI/UX design và style guide:
- `design-system.md` - Design system và component library
- `user-flows.md` - User journey và workflows
- `wireframes/` - Wireframes cho các screens
- `mockups/` - High-fidelity mockups
- `style-guide.md` - Colors, typography, spacing

### 🧪 [testing/](./testing/)
Testing strategy và test cases:
- `testing-strategy.md` - Overall testing approach
- `unit-testing.md` - Unit testing guidelines
- `integration-testing.md` - Integration testing
- `e2e-testing.md` - End-to-end testing
- `performance-testing.md` - Performance testing plan

## 📊 Cách Sử Dụng

### Theo Dõi Tiến Độ
1. Xem tổng quan tại `planning/progress-tracking.md`
2. Chi tiết từng phase tại `planning/phase-*.md`
3. Cập nhật checklist khi hoàn thành task

### Phát Triển Tính Năng
1. Đọc requirements tại `planning/`
2. Xem thiết kế tại `architecture/`
3. Implement theo API spec tại `api/`
4. Test theo guidelines tại `testing/`

### Deployment
1. Setup local theo `deployment/local-development.md`
2. Deploy production theo `deployment/aws-deployment.md`
3. Monitor theo `deployment/monitoring-logging.md`

## 🔄 Cập Nhật Tài Liệu

- **Developers**: Cập nhật API docs khi thay đổi endpoints
- **Designers**: Cập nhật design docs khi có thay đổi UI
- **PM**: Cập nhật planning docs và progress tracking
- **DevOps**: Cập nhật deployment docs khi thay đổi infrastructure

## 📝 Template

Sử dụng template sau cho tài liệu mới:

```markdown
# [Tiêu đề]

## Mục Đích
[Mô tả mục đích của tài liệu]

## Nội Dung
[Nội dung chính]

## Checklist
- [ ] Task 1
- [ ] Task 2

## Liên Quan
- [Link đến tài liệu liên quan]

## Cập Nhật
- [Date] - [Author] - [Changes]
```
