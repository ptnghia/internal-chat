# 🚀 Production Deployment Guide

**Status**: Phase 1 Complete - Ready for Production Setup  
**Last Updated**: January 16, 2025

## 📋 Prerequisites

### ✅ Phase 1 Completed Components:
- Backend API with Express + Prisma
- Frontend React App with Material-UI
- PostgreSQL Database with complete schema
- Socket.io Real-time messaging
- JWT Authentication with RBAC
- Environment configuration

### 🛠️ Required Infrastructure:
- **Server**: AWS EC2 or similar (minimum 2GB RAM, 2 vCPU)
- **Database**: PostgreSQL 14+ (AWS RDS recommended)
- **Cache**: Redis 6+ (AWS ElastiCache recommended)
- **Storage**: AWS S3 for file uploads
- **Domain**: Custom domain with SSL certificate
- **Monitoring**: CloudWatch or similar

## 🐳 Docker Production Setup

### 1. Backend Dockerfile (Production)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### 2. Frontend Dockerfile (Production)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose (Production)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 🔧 Environment Configuration

### Production Environment Variables:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/internal_chat_prod"
DB_HOST="your-rds-endpoint.amazonaws.com"
DB_PORT="5432"
DB_NAME="internal_chat_prod"
DB_USER="your_db_user"
DB_PASSWORD="your_secure_password"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-256-bits"
JWT_EXPIRES_IN="24h"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://your-elasticache-endpoint:6379"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="internal-chat-files"

# Application
NODE_ENV="production"
PORT="3001"
FRONTEND_URL="https://your-domain.com"
CORS_ORIGIN="https://your-domain.com"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"
```

## 🌐 AWS Infrastructure Setup

### 1. VPC and Security Groups
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create Security Groups
aws ec2 create-security-group --group-name internal-chat-web --description "Web servers"
aws ec2 create-security-group --group-name internal-chat-db --description "Database servers"
```

### 2. RDS PostgreSQL Setup
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier internal-chat-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.9 \
  --allocated-storage 20 \
  --db-name internal_chat_prod \
  --master-username your_db_user \
  --master-user-password your_secure_password
```

### 3. ElastiCache Redis Setup
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id internal-chat-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

## 🔒 SSL Certificate Setup

### Using Let's Encrypt with Certbot:
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring Setup

### 1. Application Monitoring
```javascript
// Add to backend/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Health Check Endpoints
```javascript
// Backend health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});
```

## 🚀 Deployment Steps

### 1. Pre-deployment Checklist:
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates installed
- [ ] Monitoring setup complete
- [ ] Backup strategy implemented

### 2. Deployment Commands:
```bash
# 1. Clone repository
git clone https://github.com/your-org/internal-chat.git
cd internal-chat

# 2. Set environment variables
cp .env.example .env.production
# Edit .env.production with production values

# 3. Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# 4. Run database migrations
docker-compose exec backend npm run migrate:deploy

# 5. Verify deployment
curl https://your-domain.com/api/health
```

### 3. Post-deployment Verification:
- [ ] Application accessible via domain
- [ ] Database connections working
- [ ] Real-time messaging functional
- [ ] Authentication working
- [ ] SSL certificate valid
- [ ] Monitoring alerts configured

## 🔄 Maintenance

### Regular Tasks:
- **Daily**: Monitor application logs and performance
- **Weekly**: Review security alerts and updates
- **Monthly**: Database maintenance and optimization
- **Quarterly**: Security audit and dependency updates

### Backup Strategy:
- **Database**: Daily automated backups with 30-day retention
- **Files**: S3 versioning and cross-region replication
- **Code**: Git repository with tagged releases

---

**Next Steps**: Phase 2 development tasks for advanced features and optimizations.
