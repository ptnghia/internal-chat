#!/usr/bin/env node

/**
 * Wiki Content Generator for Internal Chat App
 * Generates wiki content from local documentation
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  docsDir: 'docs',
  outputDir: 'wiki-content',
  wikiPages: [
    {
      name: 'Home',
      source: 'README.md',
      template: 'home'
    },
    {
      name: 'Project-Overview',
      source: 'planning/progress-tracking.md',
      template: 'project-overview'
    },
    {
      name: 'Getting-Started',
      source: '../GETTING_STARTED.md',
      template: 'getting-started'
    },
    {
      name: 'Architecture',
      source: 'architecture/system-overview.md',
      template: 'architecture'
    },
    {
      name: 'API-Documentation',
      source: 'api',
      template: 'api-docs'
    },
    {
      name: 'Design-System',
      source: 'design',
      template: 'design-system'
    },
    {
      name: 'Testing-Guide',
      source: 'testing',
      template: 'testing'
    },
    {
      name: 'Deployment',
      source: 'deployment/local-development.md',
      template: 'deployment'
    }
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Generate Home page content
function generateHomePage() {
  return `# Internal Chat App Wiki

Chào mừng đến với Wiki của dự án Internal Chat App - Ứng dụng chat nội bộ với quản lý công việc và phân cấp quyền hạn.

## 🎯 Quick Links
- [📋 Project Overview](Project-Overview)
- [🚀 Getting Started](Getting-Started)
- [🏗️ Architecture](Architecture)
- [📖 API Documentation](API-Documentation)
- [🎨 Design System](Design-System)
- [🧪 Testing Guide](Testing-Guide)
- [🚀 Deployment](Deployment)

## 📊 Project Status
- **Timeline**: 12 tháng (Jan 2025 - Dec 2025)
- **Current Phase**: Phase 1 - Planning & Research
- **Team Size**: 8-12 developers
- **Technology**: React.js, Node.js, PostgreSQL, Redis

## 📈 Progress
- ✅ Project setup completed
- 🟡 Requirements gathering in progress
- ⚪ UI/UX design pending
- ⚪ Development starting soon

## 🔗 External Links
- [GitHub Repository](https://github.com/ptnghia/internal-chat)
- [Project Board](https://github.com/ptnghia/internal-chat/projects)
- [Issues](https://github.com/ptnghia/internal-chat/issues)
- [Live Demo](https://internal-chat-demo.com) (Coming soon)

## 🛠️ Technology Stack

### Frontend
- **React.js 18+** với TypeScript
- **Material-UI** cho UI components
- **Redux Toolkit** cho state management
- **Socket.io-client** cho real-time

### Backend
- **Node.js 18+** với TypeScript
- **Express.js** framework
- **Prisma** ORM
- **Socket.io** cho WebSocket
- **PostgreSQL + Redis**

### Infrastructure
- **Docker & Docker Compose**
- **AWS** (EC2, RDS, S3, CloudFront)
- **GitHub Actions** CI/CD

## 📚 Documentation Structure

### 📋 Planning Documents
- [Progress Tracking](https://github.com/ptnghia/internal-chat/blob/main/docs/planning/progress-tracking.md)
- [Phase 1: Planning & Research](https://github.com/ptnghia/internal-chat/blob/main/docs/planning/phase-1-planning-research.md)
- [Phase 2: MVP Development](https://github.com/ptnghia/internal-chat/blob/main/docs/planning/phase-2-mvp-development.md)
- [Web Platform Roadmap](https://github.com/ptnghia/internal-chat/blob/main/docs/planning/web-platform-roadmap.md)
- [Mobile Platform Roadmap](https://github.com/ptnghia/internal-chat/blob/main/docs/planning/mobile-platform-roadmap.md)

### 🏗️ Architecture Documents
- [System Overview](https://github.com/ptnghia/internal-chat/blob/main/docs/architecture/system-overview.md)
- [Database Schema](https://github.com/ptnghia/internal-chat/blob/main/docs/architecture/database-schema.md)
- [API Design](https://github.com/ptnghia/internal-chat/blob/main/docs/architecture/api-design.md)

### 🚀 Deployment Guides
- [Local Development](https://github.com/ptnghia/internal-chat/blob/main/docs/deployment/local-development.md)
- [Docker Setup](https://github.com/ptnghia/internal-chat/blob/main/docs/deployment/docker-setup.md)
- [AWS Deployment](https://github.com/ptnghia/internal-chat/blob/main/docs/deployment/aws-deployment.md)

## 👥 Team & Contact

### Core Team
- **Project Manager**: Timeline và resource management
- **Tech Lead**: Technical decisions và architecture
- **Backend Developers** (2): API development
- **Frontend Developers** (2): Web UI development
- **Mobile Developers** (2): React Native app
- **DevOps Engineer**: Infrastructure và deployment
- **UI/UX Designer**: Interface design
- **QA Engineer**: Testing và quality assurance

### Contact
- **GitHub Issues**: [Create new issue](https://github.com/ptnghia/internal-chat/issues/new)
- **Discussions**: [GitHub Discussions](https://github.com/ptnghia/internal-chat/discussions)
- **Email**: [Contact team](mailto:team@internal-chat.com)

---
📝 **Last Updated**: ${new Date().toISOString().split('T')[0]} | 👤 **Updated By**: Wiki Generator | 📧 **Contact**: [GitHub Issues](https://github.com/ptnghia/internal-chat/issues)`;
}

// Generate Project Overview page
function generateProjectOverview() {
  return `# Project Overview

## 🎯 Mission
Phát triển một ứng dụng chat nội bộ toàn diện cho tổ chức, tích hợp nhiều tính năng quản lý công việc và phân cấp quyền hạn.

## 🚀 Vision
Trở thành platform giao tiếp và quản lý công việc chính cho các tổ chức, nâng cao hiệu quả làm việc và collaboration.

## 🎯 Goals
- Cải thiện communication trong tổ chức
- Tăng hiệu quả quản lý công việc
- Cung cấp insights và analytics
- Hỗ trợ remote work và hybrid work

## 🏗️ Core Features

### 1. 💬 Chat & Communication
- **Real-time messaging**: Instant messaging với Socket.io
- **Group chats**: Chat theo department/project
- **File sharing**: Upload và share files trong chat
- **Voice messages**: Ghi âm và gửi voice messages
- **Video calls**: Tích hợp video conference
- **Message reactions**: React với emoji
- **Message threading**: Reply và thread conversations
- **Message search**: Tìm kiếm trong lịch sử chat

### 2. 📋 Task Management
- **Task assignment**: Phân công nhiệm vụ từ cấp trên xuống cấp dưới
- **Progress tracking**: Theo dõi tiến độ real-time
- **Deadline management**: Quản lý deadline với alerts
- **Workflow automation**: Tự động hóa quy trình approval
- **Task dependencies**: Quản lý dependencies giữa tasks
- **Gantt charts**: Visualization timeline projects
- **Task templates**: Templates cho recurring tasks
- **Bulk operations**: Thao tác hàng loạt với tasks

### 3. 👥 User Management
- **Role-based access control**: 4 cấp quyền hạn
  - **Giám đốc**: Toàn quyền, overview toàn công ty
  - **Trưởng phòng**: Quản lý bộ phận, approval
  - **Quản lý**: Điều phối nhóm, giao việc
  - **Nhân viên**: Nhận việc, báo cáo
- **Department hierarchy**: Cấu trúc tổ chức
- **User profiles**: Thông tin cá nhân và preferences
- **Permission management**: Quản lý quyền chi tiết

### 4. 📊 Analytics & Reporting
- **Performance dashboards**: Dashboard cho managers
- **Communication analytics**: Phân tích patterns giao tiếp
- **Task completion metrics**: Metrics hoàn thành công việc
- **Team performance**: Đánh giá hiệu suất team
- **Custom reports**: Tạo reports tùy chỉnh
- **Data export**: Export Excel, PDF
- **Scheduled reports**: Reports tự động theo lịch
- **Real-time insights**: Insights real-time

### 5. 🛠️ Personal Tools
- **Personal notes**: Ghi chú cá nhân riêng tư
- **Document library**: Thư viện tài liệu cá nhân
- **Bookmark manager**: Bookmark messages/files
- **Personal calendar**: Calendar tích hợp với tasks
- **Quick access**: Toolbar truy cập nhanh
- **Personal dashboard**: Workspace cá nhân

## 👥 Target Users

### Primary Users
- **Employees (Nhân viên)**: Daily communication và task management
- **Managers (Quản lý)**: Team coordination và progress tracking
- **Department Heads (Trưởng phòng)**: Department management và reporting
- **Executives (Giám đốc)**: High-level insights và decision making

### User Personas

#### 👨‍💻 Nguyễn Văn A - Developer (25 tuổi)
- **Role**: Nhân viên IT
- **Goals**: Nhận tasks, collaborate với team, track progress
- **Pain Points**: Scattered communication, unclear requirements
- **Features Used**: Chat, task management, file sharing

#### 👩‍💼 Trần Thị B - Team Lead (30 tuổi)
- **Role**: Team Lead Marketing
- **Goals**: Coordinate team, track deliverables, report progress
- **Pain Points**: Manual status updates, lack of visibility
- **Features Used**: Task assignment, dashboard, reporting

#### 👨‍💼 Lê Văn C - Department Head (35 tuổi)
- **Role**: Trưởng phòng HR
- **Goals**: Manage department, approve workflows, strategic planning
- **Pain Points**: Inefficient approval process, limited insights
- **Features Used**: Workflow automation, analytics, department management

#### 👩‍💼 Phạm Thị D - Director (45 tuổi)
- **Role**: Giám đốc
- **Goals**: Strategic oversight, performance monitoring, decision making
- **Pain Points**: Lack of real-time insights, manual reporting
- **Features Used**: Executive dashboard, analytics, high-level reports

## 📊 Success Metrics

### Technical KPIs
- **System uptime**: > 99.9%
- **Response time**: < 2 seconds
- **Concurrent users**: 500+ supported
- **Mobile app performance**: < 1% crash rate
- **Security**: Zero critical vulnerabilities

### Business KPIs
- **User adoption rate**: > 80% trong 3 tháng
- **Daily active users**: > 60%
- **Task completion improvement**: > 25%
- **Communication efficiency**: > 30% increase
- **User satisfaction**: > 4.5/5 rating

### Project KPIs
- **Timeline**: Deliver on time (±2 weeks tolerance)
- **Budget**: Within budget (±10% tolerance)
- **Quality**: Zero critical bugs trong production
- **Team velocity**: > 90% consistency
- **Code coverage**: > 80%

## 🗓️ Timeline Overview

### Phase 1: Planning & Research (Jan-Feb 2025)
- ✅ Project setup và documentation
- 🟡 Requirements gathering
- ⚪ System architecture design
- ⚪ UI/UX design và prototyping

### Phase 2: MVP Development (Mar-May 2025)
- ⚪ Authentication system
- ⚪ Real-time chat functionality
- ⚪ User management
- ⚪ Basic task assignment
- ⚪ File sharing

### Phase 3: Advanced Features (Jun-Aug 2025)
- ⚪ Dashboard và analytics
- ⚪ Personal tools
- ⚪ Workflow automation
- ⚪ Advanced reporting

### Phase 4: Mobile & AI (Sep-Dec 2025)
- ⚪ React Native mobile app
- ⚪ AI chatbot integration
- ⚪ Advanced analytics
- ⚪ Production launch

## 💰 Investment & ROI

### Budget Allocation
- **Development Team**: 60% ($350K-450K)
- **Infrastructure**: 20% ($115K-150K)
- **Design & UX**: 10% ($55K-75K)
- **Testing & QA**: 10% ($50K-65K)

### Expected ROI
- **Productivity Increase**: 25-30%
- **Communication Efficiency**: 30-40%
- **Task Completion Rate**: 20-25% improvement
- **Employee Satisfaction**: 15-20% increase

---
📝 **Last Updated**: ${new Date().toISOString().split('T')[0]} | 📋 **Source**: [Planning Documents](https://github.com/ptnghia/internal-chat/tree/main/docs/planning)`;
}

// Generate Getting Started page
function generateGettingStarted() {
  const gettingStartedPath = path.join(process.cwd(), 'GETTING_STARTED.md');
  
  if (fs.existsSync(gettingStartedPath)) {
    let content = fs.readFileSync(gettingStartedPath, 'utf8');
    
    // Add wiki-specific navigation
    const wikiHeader = `# Getting Started

> 📚 **Wiki Navigation**: [Home](Home) | [Project Overview](Project-Overview) | [Architecture](Architecture) | [API Docs](API-Documentation)

`;
    
    return wikiHeader + content;
  }
  
  return `# Getting Started

Trang này đang được cập nhật. Vui lòng xem [GETTING_STARTED.md](https://github.com/ptnghia/internal-chat/blob/main/GETTING_STARTED.md) trong repository.`;
}

// Generate all wiki pages
function generateAllPages() {
  log('📚 Generating Wiki content...', 'blue');
  
  const outputDir = path.join(process.cwd(), CONFIG.outputDir);
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate each page
  const pages = [
    { name: 'Home', content: generateHomePage() },
    { name: 'Project-Overview', content: generateProjectOverview() },
    { name: 'Getting-Started', content: generateGettingStarted() }
  ];
  
  pages.forEach(page => {
    const filePath = path.join(outputDir, `${page.name}.md`);
    fs.writeFileSync(filePath, page.content);
    log(`✅ Generated: ${page.name}.md`, 'green');
  });
  
  // Generate sidebar
  const sidebar = `## 📚 Navigation
- [🏠 Home](Home)
- [📋 Project Overview](Project-Overview)
- [🚀 Getting Started](Getting-Started)
- [🏗️ Architecture](Architecture)
- [📖 API Documentation](API-Documentation)
- [🎨 Design System](Design-System)
- [🧪 Testing Guide](Testing-Guide)
- [🚀 Deployment](Deployment)

## 🔗 Quick Links
- [GitHub Repo](https://github.com/ptnghia/internal-chat)
- [Project Board](https://github.com/ptnghia/internal-chat/projects)
- [Issues](https://github.com/ptnghia/internal-chat/issues)
- [Documentation](https://github.com/ptnghia/internal-chat/tree/main/docs)

## 📊 Current Phase
**Phase 1: Planning & Research**
- Timeline: Jan-Feb 2025
- Status: In Progress
- Progress: 25%

## 👥 Team
- Project Manager
- Tech Lead  
- 2 Backend Developers
- 2 Frontend Developers
- DevOps Engineer
- UI/UX Designer`;
  
  fs.writeFileSync(path.join(outputDir, '_Sidebar.md'), sidebar);
  log('✅ Generated: _Sidebar.md', 'green');
  
  // Generate footer
  const footer = `---
📝 **Last Updated**: ${new Date().toISOString().split('T')[0]} | 👤 **Updated By**: Wiki Generator | 📧 **Contact**: [GitHub Issues](https://github.com/ptnghia/internal-chat/issues)`;
  
  fs.writeFileSync(path.join(outputDir, '_Footer.md'), footer);
  log('✅ Generated: _Footer.md', 'green');
  
  log(`\n🎉 Wiki content generated in: ${outputDir}`, 'magenta');
  log('📋 Next steps:', 'yellow');
  log('1. Copy content from wiki-content/ folder', 'cyan');
  log('2. Paste into GitHub Wiki pages', 'cyan');
  log('3. Update navigation and links', 'cyan');
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';
  
  log('📚 Internal Chat App - Wiki Generator', 'magenta');
  log('===================================', 'magenta');
  
  switch (command) {
    case 'generate':
    case 'g':
      generateAllPages();
      break;
      
    case 'help':
    case 'h':
      log('Available commands:', 'yellow');
      log('  generate, g  - Generate all wiki pages', 'cyan');
      log('  help, h      - Show this help', 'cyan');
      break;
      
    default:
      log(`❌ Unknown command: ${command}`, 'red');
      log('Use "help" to see available commands', 'yellow');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateHomePage,
  generateProjectOverview,
  generateGettingStarted,
  generateAllPages
};
