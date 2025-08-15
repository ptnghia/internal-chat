# Internal Chat App

Ứng dụng chat nội bộ toàn diện cho tổ chức với tính năng quản lý công việc và phân cấp quyền hạn.

## 📋 Tổng Quan Dự Án

### Mục Tiêu
Phát triển một hệ thống chat nội bộ tích hợp quản lý công việc, hỗ trợ:
- Chat real-time giữa các bộ phận
- Quản lý và phân công nhiệm vụ
- Phân cấp quyền hạn (Giám đốc → Trưởng phòng → Quản lý → Nhân viên)
- Dashboard báo cáo và analytics
- Tiện ích cá nhân (ghi chú, lưu trữ, calendar)

### Timeline
- **Phase 1**: Planning & Research (Tháng 1-2)
- **Phase 2**: MVP Development (Tháng 3-5)
- **Phase 3**: Advanced Features (Tháng 6-8)
- **Phase 4**: Mobile & AI Features (Tháng 9-12)

## 🏗️ Cấu Trúc Project

```
internal-chat/
├── backend/                 # Node.js API server
├── frontend/               # React.js web app
├── mobile/                 # React Native app
├── shared/                 # Shared TypeScript types
├── docker/                 # Docker configurations
├── docs/                   # Documentation & Planning
│   ├── planning/           # Kế hoạch chi tiết từng phase
│   ├── architecture/       # System design documents
│   ├── api/               # API documentation
│   └── deployment/        # Deployment guides
├── scripts/               # Build & deployment scripts
└── docker-compose.yml     # Local development setup
```

## 🛠️ Technology Stack

### Frontend
- React.js 18+ với TypeScript
- Material-UI (MUI) cho UI components
- Redux Toolkit cho state management
- Socket.io-client cho real-time

### Backend
- Node.js 18+ với TypeScript
- Express.js framework
- Prisma ORM
- Socket.io cho WebSocket
- PostgreSQL + Redis

### Mobile
- React Native với TypeScript
- Expo development workflow

### Infrastructure
- Docker & Docker Compose
- AWS (EC2, RDS, S3, CloudFront)
- GitHub Actions CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/ptnghia/internal-chat.git
cd internal-chat

# Start databases
docker-compose up -d

# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

## 📚 Documentation

- [📋 Planning Documents](./docs/planning/) - Kế hoạch chi tiết từng phase
- [🏗️ Architecture](./docs/architecture/) - System design và database schema
- [📡 API Documentation](./docs/api/) - REST API và WebSocket specs
- [🚀 Deployment Guide](./docs/deployment/) - Hướng dẫn deploy production

## 👥 Team

- **Project Manager**: Quản lý dự án và timeline
- **Tech Lead**: Architecture và technical decisions
- **Backend Developers** (2): API development
- **Frontend Developers** (2): Web UI development
- **Mobile Developers** (2): React Native app
- **DevOps Engineer**: Infrastructure và deployment
- **UI/UX Designer**: Interface design
- **QA Engineer**: Testing và quality assurance

## 📊 Progress Tracking

Theo dõi tiến độ chi tiết tại: [docs/planning/](./docs/planning/)

## 🔗 Links

- [GitHub Issues](https://github.com/ptnghia/internal-chat/issues)
- [Project Board](https://github.com/ptnghia/internal-chat/projects)
- [Wiki](https://github.com/ptnghia/internal-chat/wiki)

## 📄 License

Private - Internal use only
