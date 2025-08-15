#!/bin/bash

# Internal Chat App - Setup Script
# This script sets up the development environment for the Internal Chat App

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_VERSION="18.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is not compatible. Required: $REQUIRED_VERSION+"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to check Docker
check_docker() {
    if command_exists docker; then
        if docker --version >/dev/null 2>&1; then
            print_success "Docker is installed and running"
            return 0
        else
            print_error "Docker is installed but not running"
            return 1
        fi
    else
        print_error "Docker is not installed"
        return 1
    fi
}

# Function to check Docker Compose
check_docker_compose() {
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose is available"
        return 0
    else
        print_error "Docker Compose is not available"
        return 1
    fi
}

# Function to setup environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/internal_chat"
REDIS_URL="redis://localhost:6379"

# JWT Secrets (Change these in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"

# File Upload
FILE_UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760

# Email Configuration (Optional)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# AWS Configuration (Optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""
EOF
        print_success "Created backend/.env"
    else
        print_warning "backend/.env already exists"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# App Configuration
VITE_APP_NAME="Internal Chat App"
VITE_APP_VERSION="1.0.0"
VITE_APP_DESCRIPTION="Internal Chat App with Task Management"

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# Development
VITE_DEBUG=true
EOF
        print_success "Created frontend/.env"
    else
        print_warning "frontend/.env already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend && npm install && cd ..
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi
    
    # Shared dependencies
    if [ -d "shared" ]; then
        print_status "Installing shared dependencies..."
        cd shared && npm install && cd ..
    fi
    
    print_success "All dependencies installed"
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start database services
    print_status "Starting database services..."
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run database migrations (if backend is set up)
    if [ -f "backend/package.json" ] && [ -d "backend/prisma" ]; then
        print_status "Running database migrations..."
        cd backend && npm run db:migrate && cd ..
        
        # Seed database (if seed script exists)
        if npm run --silent db:seed >/dev/null 2>&1; then
            print_status "Seeding database..."
            cd backend && npm run db:seed && cd ..
        fi
    fi
    
    print_success "Database setup completed"
}

# Function to setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    if [ -d ".git" ]; then
        npx husky install
        print_success "Git hooks setup completed"
    else
        print_warning "Not a Git repository, skipping Git hooks setup"
    fi
}

# Function to verify setup
verify_setup() {
    print_status "Verifying setup..."
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Docker services are running"
    else
        print_warning "Some Docker services may not be running"
    fi
    
    # Check if ports are available
    if lsof -i :3000 >/dev/null 2>&1; then
        print_warning "Port 3000 is already in use"
    fi
    
    if lsof -i :3001 >/dev/null 2>&1; then
        print_warning "Port 3001 is already in use"
    fi
    
    print_success "Setup verification completed"
}

# Main setup function
main() {
    echo "=========================================="
    echo "  Internal Chat App - Setup Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    if ! check_node_version; then
        print_error "Please install Node.js 18+ and try again"
        exit 1
    fi
    
    if ! check_docker; then
        print_error "Please install and start Docker and try again"
        exit 1
    fi
    
    if ! check_docker_compose; then
        print_error "Please install Docker Compose and try again"
        exit 1
    fi
    
    print_success "All prerequisites are met"
    echo ""
    
    # Setup process
    setup_env_files
    echo ""
    
    install_dependencies
    echo ""
    
    setup_database
    echo ""
    
    setup_git_hooks
    echo ""
    
    verify_setup
    echo ""
    
    # Final instructions
    echo "=========================================="
    echo "  Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Review and update environment files:"
    echo "   - backend/.env"
    echo "   - frontend/.env"
    echo ""
    echo "2. Start the development servers:"
    echo "   npm run dev"
    echo ""
    echo "3. Access the application:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:3001"
    echo "   - Database Admin: http://localhost:5050 (pgAdmin)"
    echo ""
    echo "4. View documentation:"
    echo "   - Planning: docs/planning/"
    echo "   - Architecture: docs/architecture/"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"
