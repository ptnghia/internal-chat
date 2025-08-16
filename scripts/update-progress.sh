#!/bin/bash

# Progress Update Script for Internal Chat App
# Updates task status and progress tracking

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Function to show current tasks
show_current_tasks() {
    print_status "Current Development Tasks:"
    echo ""
    echo "🔧 1. Setup Backend API (0/5 completed)"
    echo "   1.1 [ ] Khởi tạo Backend Project"
    echo "   1.2 [ ] Setup Express Server"
    echo "   1.3 [ ] Setup Prisma ORM"
    echo "   1.4 [ ] Environment Configuration"
    echo "   1.5 [ ] Basic API Structure"
    echo ""
    echo "🎨 2. Setup Frontend (0/5 completed)"
    echo "   2.1 [ ] Khởi tạo React Project"
    echo "   2.2 [ ] Setup Material-UI"
    echo "   2.3 [ ] Setup Redux Toolkit"
    echo "   2.4 [ ] Setup Routing"
    echo "   2.5 [ ] Basic Layout Components"
    echo ""
    echo "🗄️ 3. Database Schema (0/5 completed)"
    echo "   3.1 [ ] User & Role Schema"
    echo "   3.2 [ ] Department & Team Schema"
    echo "   3.3 [ ] Chat & Message Schema"
    echo "   3.4 [ ] Task Management Schema"
    echo "   3.5 [ ] File & Notification Schema"
    echo ""
    echo "🔐 4. Authentication (0/5 completed)"
    echo "   4.1 [ ] JWT Setup & Configuration"
    echo "   4.2 [ ] Password Hashing"
    echo "   4.3 [ ] Auth API Endpoints"
    echo "   4.4 [ ] RBAC Middleware"
    echo "   4.5 [ ] Auth Frontend Integration"
    echo ""
    echo "⚡ 5. Real-time Chat (0/5 completed)"
    echo "   5.1 [ ] Socket.io Server Setup"
    echo "   5.2 [ ] Socket Authentication"
    echo "   5.3 [ ] Chat Room Management"
    echo "   5.4 [ ] Message Broadcasting"
    echo "   5.5 [ ] Frontend Socket Integration"
    echo ""
}

# Function to show recommended next task
show_next_task() {
    print_status "Recommended Next Task:"
    echo ""
    echo "📋 Start with: 3.1 User & Role Schema"
    echo "   - Thiết kế bảng Users, Roles và phân cấp quyền hạn"
    echo "   - Estimated time: 1 hour"
    echo "   - Dependencies: None (foundation task)"
    echo ""
    echo "Why this task first?"
    echo "   ✅ Database schema is the foundation"
    echo "   ✅ No dependencies on other tasks"
    echo "   ✅ Required for all other features"
    echo "   ✅ Can be tested immediately"
    echo ""
}

# Function to commit and push changes
commit_and_push() {
    local task_name="$1"
    local commit_message="$2"
    
    if [ -z "$task_name" ] || [ -z "$commit_message" ]; then
        print_error "Usage: commit_and_push <task_name> <commit_message>"
        return 1
    fi
    
    print_status "Committing changes for task: $task_name"
    
    # Add all changes
    git add .
    
    # Commit with conventional commit format
    git commit -m "$commit_message"
    
    # Push to remote
    git push origin main
    
    print_success "Changes committed and pushed successfully"
    
    # Update progress tracking
    update_progress_file "$task_name"
}

# Function to update progress tracking file
update_progress_file() {
    local task_name="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    print_status "Updating progress tracking..."
    
    # Update last updated timestamp
    sed -i '' "s/\*\*Last Updated\*\*: .*/\*\*Last Updated\*\*: $timestamp/" docs/planning/progress-tracking.md
    
    # Add to git
    git add docs/planning/progress-tracking.md
    git commit -m "docs: update progress tracking for $task_name"
    git push origin main
    
    print_success "Progress tracking updated"
}

# Function to start a new task
start_task() {
    local task_id="$1"

    if [ -z "$task_id" ]; then
        print_error "Usage: start_task <task_id>"
        echo "Example: start_task 3.1"
        return 1
    fi

    print_status "Starting task: $task_id"

    # Ensure we're on main branch and up to date
    git checkout main
    git pull origin main

    print_success "Ready to work on task $task_id on main branch"
    print_warning "Remember to:"
    echo "   1. Update task status to IN_PROGRESS"
    echo "   2. Implement the task"
    echo "   3. Test your changes"
    echo "   4. Commit and push when done"
    echo "   5. Update task status to COMPLETE"
}

# Function to complete a task
complete_task() {
    local task_id="$1"
    local description="$2"

    if [ -z "$task_id" ] || [ -z "$description" ]; then
        print_error "Usage: complete_task <task_id> <description>"
        echo "Example: complete_task 3.1 'implement user and role schema'"
        return 1
    fi

    local commit_message="feat: $description"

    # Commit and push changes directly to main
    commit_and_push "Task $task_id" "$commit_message"

    print_success "Task $task_id completed successfully!"

    # Show next recommended task
    show_next_task
}

# Main menu
show_menu() {
    echo ""
    echo "📋 Internal Chat App - Progress Manager"
    echo "======================================"
    echo "1. Show current tasks"
    echo "2. Show next recommended task"
    echo "3. Start a new task"
    echo "4. Complete current task"
    echo "5. Update progress manually"
    echo "6. Exit"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "  Internal Chat App - Progress Manager"
    echo "=========================================="
    echo ""
    
    if [ $# -eq 0 ]; then
        # Interactive mode
        while true; do
            show_menu
            read -p "Choose an option (1-6): " choice
            
            case $choice in
                1)
                    show_current_tasks
                    ;;
                2)
                    show_next_task
                    ;;
                3)
                    read -p "Enter task ID (e.g., 3.1): " task_id
                    start_task "$task_id"
                    ;;
                4)
                    read -p "Enter task ID: " task_id
                    read -p "Enter task description: " description
                    complete_task "$task_id" "$description"
                    ;;
                5)
                    update_progress_file "Manual update"
                    ;;
                6)
                    print_success "Goodbye!"
                    exit 0
                    ;;
                *)
                    print_error "Invalid option. Please choose 1-6."
                    ;;
            esac
            
            echo ""
            read -p "Press Enter to continue..."
        done
    else
        # Command line mode
        case $1 in
            "show")
                show_current_tasks
                ;;
            "next")
                show_next_task
                ;;
            "start")
                start_task "$2"
                ;;
            "complete")
                complete_task "$2" "$3"
                ;;
            "update")
                update_progress_file "Manual update"
                ;;
            *)
                echo "Usage: $0 [show|next|start|complete|update]"
                exit 1
                ;;
        esac
    fi
}

# Run main function
main "$@"
