# 🛠️ Local Development Setup

## 📋 Prerequisites

### Required Software
- **Node.js**: Version 18.0.0 hoặc cao hơn
- **npm**: Version 9.0.0 hoặc cao hơn
- **Docker**: Latest stable version
- **Docker Compose**: Version 2.0+ 
- **Git**: Latest version

### Recommended Tools
- **VS Code**: Với extensions cho React, TypeScript, Prisma
- **Postman**: Để test APIs
- **pgAdmin**: Để quản lý PostgreSQL database
- **Redis Commander**: Để quản lý Redis cache

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/ptnghia/internal-chat.git
cd internal-chat
```

### 2. Run Setup Script
```bash
# Make setup script executable
chmod +x scripts/setup.sh

# Run setup script
./scripts/setup.sh
```

### 3. Start Development
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:backend    # Backend API server
npm run dev:frontend   # Frontend web app
```

## 📁 Project Structure

```
internal-chat/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── app.ts           # Express app setup
│   ├── prisma/              # Database schema & migrations
│   ├── uploads/             # File uploads (development)
│   └── package.json
├── frontend/                # React.js web app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Redux store
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main app component
│   ├── public/              # Static assets
│   └── package.json
├── shared/                  # Shared TypeScript types
├── docker/                  # Docker configurations
├── docs/                    # Documentation
└── scripts/                 # Build & deployment scripts
```

## 🐳 Docker Development

### Start Services
```bash
# Start all services in background
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database Management
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d internal_chat

# Access Redis CLI
docker-compose exec redis redis-cli

# Reset database
docker-compose down -v
docker-compose up -d postgres redis
```

## 🔧 Environment Configuration

### Backend Environment (.env)
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/internal_chat"
REDIS_URL="redis://localhost:6379"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Server
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"

# File Upload
FILE_UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760
```

### Frontend Environment (.env)
```bash
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# App Configuration
VITE_APP_NAME="Internal Chat App"
VITE_APP_VERSION="1.0.0"
```

## 📊 Database Setup

### Initial Setup
```bash
# Install dependencies
cd backend && npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### Database Commands
```bash
# Create new migration
npm run db:migrate:dev

# Reset database
npm run db:reset

# View database in Prisma Studio
npm run db:studio
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 🔍 Development Tools

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Database Tools
```bash
# Access pgAdmin
# URL: http://localhost:5050
# Email: admin@internal-chat.com
# Password: admin123

# Access Redis Commander
# URL: http://localhost:8081
# Username: admin
# Password: admin123
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill process using port
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clean all workspaces
npm run clean
npm run install:all
```

#### Docker Issues
```bash
# Clean Docker
docker-compose down -v --remove-orphans
docker system prune -f

# Rebuild containers
docker-compose build --no-cache
```

### Performance Issues

#### Slow Database Queries
```bash
# Enable query logging in PostgreSQL
# Add to docker/postgres/postgresql.conf:
log_statement = 'all'
log_duration = on
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory
```

## 📱 Mobile Development

### Setup React Native
```bash
# Install dependencies
cd mobile && npm install

# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Mobile Development Tools
```bash
# Install Expo CLI
npm install -g @expo/cli

# Start Expo development server
cd mobile && expo start

# Install on physical device
# Scan QR code with Expo Go app
```

## 🔄 Development Workflow

### Daily Development
1. **Pull latest changes**: `git pull origin main`
2. **Start services**: `npm run dev`
3. **Make changes**: Edit code
4. **Test changes**: `npm test`
5. **Commit changes**: `git commit -m "feat: description"`
6. **Push changes**: `git push origin feature-branch`

### Feature Development
1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Develop feature**: Make changes
3. **Write tests**: Add test coverage
4. **Update documentation**: Update relevant docs
5. **Create pull request**: Submit for review

### Database Changes
1. **Modify schema**: Edit `prisma/schema.prisma`
2. **Create migration**: `npm run db:migrate:dev`
3. **Test migration**: Verify changes work
4. **Update seed data**: If needed
5. **Commit changes**: Include migration files

## 📚 Useful Commands

### Development
```bash
# Start development servers
npm run dev

# Build for production
npm run build

# Install all dependencies
npm run install:all

# Clean all build artifacts
npm run clean
```

### Docker
```bash
# Start all services
docker-compose up -d

# View service status
docker-compose ps

# View logs
docker-compose logs -f [service]

# Stop all services
docker-compose down
```

### Database
```bash
# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Open Prisma Studio
npm run db:studio

# Generate Prisma client
npm run db:generate
```

---

**Next Steps**: [Docker Setup](./docker-setup.md)  
**Related**: [AWS Deployment](./aws-deployment.md)  
**Last Updated**: [Date]  
**Updated By**: [Name]
