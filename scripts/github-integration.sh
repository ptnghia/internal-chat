#!/bin/bash

# GitHub Integration Script for Internal Chat App
# Requires GitHub CLI (gh) to be installed and authenticated

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Repository info
OWNER="ptnghia"
REPO="internal-chat"

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

# Check if GitHub CLI is installed and authenticated
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI is not installed. Please install it first:"
        echo "  brew install gh"
        echo "  or visit: https://cli.github.com/"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI is not authenticated. Please run:"
        echo "  gh auth login"
        exit 1
    fi
    
    print_success "GitHub CLI is ready"
}

# Create issues from planning documents
create_phase1_issues() {
    print_status "Creating Phase 1 issues..."
    
    # Project Setup Issues
    gh issue create \
        --title "[TASK] Setup development environment" \
        --body "Setup Node.js, Docker, and development tools according to documentation" \
        --label "type: task,component: infrastructure,phase: 1-planning,priority: high" \
        --milestone "Phase 1: Planning & Research"
    
    gh issue create \
        --title "[TASK] Design system architecture" \
        --body "Create detailed system architecture diagrams and documentation" \
        --label "type: task,component: infrastructure,phase: 1-planning,priority: high" \
        --milestone "Phase 1: Planning & Research"
    
    gh issue create \
        --title "[TASK] Create database schema" \
        --body "Design and implement PostgreSQL database schema with Prisma" \
        --label "type: task,component: database,phase: 1-planning,priority: high" \
        --milestone "Phase 1: Planning & Research"
    
    gh issue create \
        --title "[TASK] Design UI/UX mockups" \
        --body "Create wireframes and high-fidelity mockups for all major screens" \
        --label "type: task,component: design,phase: 1-planning,priority: medium" \
        --milestone "Phase 1: Planning & Research"
    
    gh issue create \
        --title "[TASK] Setup CI/CD pipeline" \
        --body "Configure GitHub Actions for automated testing and deployment" \
        --label "type: task,component: infrastructure,phase: 1-planning,priority: medium" \
        --milestone "Phase 1: Planning & Research"
    
    print_success "Phase 1 issues created"
}

# Create Phase 2 issues
create_phase2_issues() {
    print_status "Creating Phase 2 issues..."
    
    gh issue create \
        --title "[FEATURE] Implement authentication system" \
        --body "JWT-based authentication with login, register, and refresh token functionality" \
        --label "type: feature,component: backend,phase: 2-mvp,priority: critical" \
        --milestone "Phase 2: MVP Development"
    
    gh issue create \
        --title "[FEATURE] Create real-time chat functionality" \
        --body "Socket.io implementation for real-time messaging between users" \
        --label "type: feature,component: backend,component: frontend,phase: 2-mvp,priority: critical" \
        --milestone "Phase 2: MVP Development"
    
    gh issue create \
        --title "[FEATURE] Build user management interface" \
        --body "Admin interface for managing users, roles, and permissions" \
        --label "type: feature,component: frontend,phase: 2-mvp,priority: high" \
        --milestone "Phase 2: MVP Development"
    
    gh issue create \
        --title "[FEATURE] Develop task assignment system" \
        --body "Basic task creation, assignment, and status tracking functionality" \
        --label "type: feature,component: backend,component: frontend,phase: 2-mvp,priority: high" \
        --milestone "Phase 2: MVP Development"
    
    gh issue create \
        --title "[FEATURE] Setup file sharing" \
        --body "File upload, storage, and sharing functionality in chat" \
        --label "type: feature,component: backend,component: frontend,phase: 2-mvp,priority: medium" \
        --milestone "Phase 2: MVP Development"
    
    print_success "Phase 2 issues created"
}

# List project status
show_project_status() {
    print_status "Current project status:"
    
    echo ""
    echo "📋 Open Issues by Phase:"
    gh issue list --label "phase: 1-planning" --state open --json title,number,labels | \
        jq -r '.[] | "  #\(.number) - \(.title)"'
    
    echo ""
    echo "🚀 Phase 2 Issues:"
    gh issue list --label "phase: 2-mvp" --state open --json title,number,labels | \
        jq -r '.[] | "  #\(.number) - \(.title)"'
    
    echo ""
    echo "📊 Issues by Status:"
    echo "  In Progress: $(gh issue list --label "status: in-progress" --state open | wc -l)"
    echo "  In Review: $(gh issue list --label "status: in-review" --state open | wc -l)"
    echo "  Blocked: $(gh issue list --label "status: blocked" --state open | wc -l)"
}

# Update issue status
update_issue_status() {
    local issue_number=$1
    local status=$2
    
    if [ -z "$issue_number" ] || [ -z "$status" ]; then
        print_error "Usage: update_issue_status <issue_number> <status>"
        echo "Available statuses: in-progress, in-review, blocked, done"
        return 1
    fi
    
    # Remove old status labels
    gh issue edit $issue_number --remove-label "status: in-progress,status: in-review,status: blocked"
    
    # Add new status label
    case $status in
        "in-progress")
            gh issue edit $issue_number --add-label "status: in-progress"
            print_success "Issue #$issue_number moved to In Progress"
            ;;
        "in-review")
            gh issue edit $issue_number --add-label "status: in-review"
            print_success "Issue #$issue_number moved to In Review"
            ;;
        "blocked")
            gh issue edit $issue_number --add-label "status: blocked"
            print_success "Issue #$issue_number moved to Blocked"
            ;;
        "done")
            gh issue close $issue_number
            print_success "Issue #$issue_number closed (Done)"
            ;;
        *)
            print_error "Invalid status: $status"
            return 1
            ;;
    esac
}

# Sync progress with documentation
sync_progress() {
    print_status "Syncing progress with documentation..."
    
    # Get issue counts
    local total_issues=$(gh issue list --state all | wc -l)
    local closed_issues=$(gh issue list --state closed | wc -l)
    local progress=$((closed_issues * 100 / total_issues))
    
    print_status "Overall progress: $progress% ($closed_issues/$total_issues issues completed)"
    
    # Update progress in documentation (would need to modify files)
    echo "Progress: $progress%" > .progress
    print_success "Progress synced"
}

# Main menu
show_menu() {
    echo ""
    echo "🛠️  GitHub Integration Menu"
    echo "================================"
    echo "1. Create Phase 1 issues"
    echo "2. Create Phase 2 issues"
    echo "3. Show project status"
    echo "4. Update issue status"
    echo "5. Sync progress"
    echo "6. Exit"
    echo ""
}

# Main function
main() {
    echo "=========================================="
    echo "  GitHub Integration for Internal Chat"
    echo "=========================================="
    echo ""
    
    check_gh_cli
    
    if [ $# -eq 0 ]; then
        # Interactive mode
        while true; do
            show_menu
            read -p "Choose an option (1-6): " choice
            
            case $choice in
                1)
                    create_phase1_issues
                    ;;
                2)
                    create_phase2_issues
                    ;;
                3)
                    show_project_status
                    ;;
                4)
                    read -p "Enter issue number: " issue_num
                    read -p "Enter status (in-progress/in-review/blocked/done): " status
                    update_issue_status $issue_num $status
                    ;;
                5)
                    sync_progress
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
            "create-phase1")
                create_phase1_issues
                ;;
            "create-phase2")
                create_phase2_issues
                ;;
            "status")
                show_project_status
                ;;
            "update")
                update_issue_status $2 $3
                ;;
            "sync")
                sync_progress
                ;;
            *)
                echo "Usage: $0 [create-phase1|create-phase2|status|update|sync]"
                exit 1
                ;;
        esac
    fi
}

# Run main function
main "$@"
