# 🏗️ System Architecture Overview

**🎉 Phase 1 Complete!** All core components implemented and tested.

## 📋 Tổng Quan Hệ Thống

Internal Chat App là một hệ thống chat nội bộ với quản lý công việc, được thiết kế theo kiến trúc microservices với các thành phần chính (✅ **All Implemented**):

- **Frontend Web App**: ✅ React.js application (Complete with Material-UI, Redux, Router)
- **Mobile App**: 📱 React Native application (Phase 2)
- **Backend API**: ✅ Node.js/Express REST API (Complete with 50+ endpoints)
- **Real-time Service**: ✅ Socket.io WebSocket server (Complete with authentication)
- **Database**: ✅ PostgreSQL + Redis (Complete with 35+ tables)
- **File Storage**: ✅ Database schema ready (AWS S3 integration in Phase 2)
- **Infrastructure**: 🐳 Docker containers (Complete for development, AWS deployment in Phase 2)

## 🏛️ Kiến Trúc Tổng Thể

```
┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │
│   (React.js)    │    │ (React Native)  │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Nginx     │
              │ Load Balancer│
              └──────┬──────┘
                     │
         ┌───────────▼───────────┐
         │    Backend API        │
         │  (Node.js/Express)    │
         │                       │
         │  ┌─────────────────┐  │
         │  │  Socket.io      │  │
         │  │  WebSocket      │  │
         │  └─────────────────┘  │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼───┐    ┌──────▼──────┐    ┌────▼────┐
│ Redis │    │ PostgreSQL  │    │  AWS S3 │
│ Cache │    │  Database   │    │ Storage │
└───────┘    └─────────────┘    └─────────┘
```

## 🔧 Technology Stack

### Frontend Layer
- **Web**: React.js 18+ với TypeScript
- **Mobile**: React Native với Expo
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI (Web), React Native Elements (Mobile)
- **Real-time**: Socket.io-client

### Backend Layer
- **Runtime**: Node.js 18+ với TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Authentication**: JWT với refresh tokens
- **Real-time**: Socket.io
- **File Upload**: Multer + AWS S3

### Database Layer
- **Primary Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **File Storage**: AWS S3
- **Search**: PostgreSQL Full-Text Search

### Infrastructure Layer
- **Containerization**: Docker + Docker Compose
- **Cloud**: AWS (EC2, RDS, ElastiCache, S3)
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: CloudWatch, Sentry

## 📊 Data Flow

### 1. Authentication Flow
```
Client → API → JWT Validation → Database → Response
```

### 2. Real-time Chat Flow
```
Client A → Socket.io → Server → Socket.io → Client B
                    ↓
                Database (Message Storage)
```

### 3. File Upload Flow
```
Client → API → Validation → AWS S3 → Database (Metadata)
```

### 4. Task Management Flow
```
Client → API → Authorization → Business Logic → Database → Notifications
```

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Access tokens (15 min) + Refresh tokens (7 days)
- **Role-Based Access Control (RBAC)**: 4 levels hierarchy
- **Password Security**: bcrypt hashing với salt
- **Session Management**: Redis-based session storage

### Data Protection
- **Encryption in Transit**: HTTPS/WSS
- **Encryption at Rest**: Database encryption
- **File Security**: Signed URLs cho S3 access
- **Input Validation**: Joi/Zod validation
- **SQL Injection Prevention**: Prisma ORM

### Network Security
- **CORS**: Configured origins
- **Rate Limiting**: Express rate limiter
- **Helmet.js**: Security headers
- **CSP**: Content Security Policy

## 📈 Scalability Design

### Horizontal Scaling
- **Load Balancer**: Nginx với multiple backend instances
- **Database**: Read replicas cho PostgreSQL
- **Cache**: Redis cluster
- **File Storage**: CDN với S3

### Performance Optimization
- **Database Indexing**: Optimized queries
- **Caching Strategy**: Redis cho sessions, API responses
- **CDN**: Static assets delivery
- **Code Splitting**: Frontend lazy loading

### Monitoring & Observability
- **Application Monitoring**: Sentry error tracking
- **Performance Monitoring**: APM tools
- **Infrastructure Monitoring**: CloudWatch
- **Logging**: Structured logging với Winston

## 🔄 Development Workflow

### Environment Setup
```
Development → Staging → Production
     ↓           ↓         ↓
   Docker    Docker    AWS ECS
```

### CI/CD Pipeline
```
Git Push → GitHub Actions → Tests → Build → Deploy
```

### Database Management
```
Local Dev → Migrations → Staging → Production
```

## 📱 Mobile Architecture

### React Native Structure
```
┌─────────────────────────────────┐
│         React Native App        │
├─────────────────────────────────┤
│  Navigation (React Navigation)  │
├─────────────────────────────────┤
│   State Management (Redux)      │
├─────────────────────────────────┤
│     API Layer (RTK Query)       │
├─────────────────────────────────┤
│   Real-time (Socket.io)         │
├─────────────────────────────────┤
│  Local Storage (AsyncStorage)   │
└─────────────────────────────────┘
```

### Native Features Integration
- **Push Notifications**: Firebase Cloud Messaging
- **Biometric Auth**: Touch ID/Face ID
- **Camera/Gallery**: Expo ImagePicker
- **File System**: Expo FileSystem
- **Background Tasks**: Expo TaskManager

## 🎯 Performance Targets

### Response Time Targets
- **API Response**: < 200ms (95th percentile)
- **Page Load**: < 3 seconds
- **Real-time Message**: < 100ms latency
- **File Upload**: < 5 seconds cho 10MB

### Scalability Targets
- **Concurrent Users**: 500+ simultaneous
- **Database**: 10,000+ users
- **Messages**: 1M+ messages/day
- **Files**: 100GB+ storage

### Availability Targets
- **Uptime**: 99.9% (8.76 hours downtime/year)
- **Recovery Time**: < 15 minutes
- **Backup**: Daily automated backups
- **Disaster Recovery**: < 4 hours RTO

## 🔍 Monitoring Strategy

### Application Metrics
- **Error Rate**: < 1%
- **Response Time**: P95 < 200ms
- **Throughput**: Requests/second
- **User Sessions**: Active users

### Infrastructure Metrics
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Disk Usage**: < 85%
- **Network I/O**: Bandwidth utilization

### Business Metrics
- **User Adoption**: Daily/Monthly active users
- **Feature Usage**: Feature adoption rates
- **Task Completion**: Task completion rates
- **User Satisfaction**: App store ratings

---

**Related Documents**:
- [Database Schema](./database-schema.md)
- [API Design](./api-design.md)
- [Security Design](./security-design.md)
- [Scalability Plan](./scalability-plan.md)

**Last Updated**: [Date]  
**Updated By**: [Name]
