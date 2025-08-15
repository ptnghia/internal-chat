# 📋 GitHub Project Board Setup Template

## Project Board Configuration

### Project Name
**Internal Chat App Development**

### Project Description
```
Quản lý phát triển ứng dụng chat nội bộ với tính năng task management và phân cấp quyền hạn.

Timeline: 12 tháng (Jan 2025 - Dec 2025)
Team: 8-12 developers
Budget: $569K - $741K
```

## 📊 Board Columns

### 1. 📋 Backlog
**Description**: Tất cả tasks chưa được assign hoặc chưa bắt đầu
**Automation**: None

### 2. 🎯 Sprint Planning
**Description**: Tasks được chọn cho sprint hiện tại
**Automation**: None

### 3. 🟡 In Progress
**Description**: Tasks đang được thực hiện
**Automation**: 
- Auto-move when issue/PR is assigned
- Auto-move when PR is opened

### 4. 👀 In Review
**Description**: Tasks đang được review (code review, testing)
**Automation**:
- Auto-move when PR is ready for review
- Auto-move when PR has requested reviewers

### 5. ✅ Done
**Description**: Tasks đã hoàn thành và được approve
**Automation**:
- Auto-move when issue is closed
- Auto-move when PR is merged

### 6. 🚫 Blocked
**Description**: Tasks bị block bởi dependencies hoặc issues
**ç**: Manual move only

## 🏷️ Labels Configuration

### Priority Labels
- `priority: critical` - 🔴 Critical (must fix immediately)
- `priority: high` - 🟠 High (important for current sprint)
- `priority: medium` - 🟡 Medium (normal priority)
- `priority: low` - 🟢 Low (nice to have)

### Type Labels
- `type: feature` - 🚀 New feature
- `type: bug` - 🐛 Bug fix
- `type: enhancement` - ✨ Enhancement
- `type: documentation` - 📚 Documentation
- `type: refactor` - 🔧 Code refactoring
- `type: test` - 🧪 Testing

### Component Labels
- `component: backend` - 🔙 Backend API
- `component: frontend` - 🎨 Frontend Web
- `component: mobile` - 📱 Mobile App
- `component: database` - 🗄️ Database
- `component: infrastructure` - 🏗️ Infrastructure
- `component: design` - 🎨 UI/UX Design

### Phase Labels
- `phase: 1-planning` - 📋 Phase 1: Planning & Research
- `phase: 2-mvp` - 🚀 Phase 2: MVP Development
- `phase: 3-advanced` - 🔧 Phase 3: Advanced Features
- `phase: 4-mobile-ai` - 📱 Phase 4: Mobile & AI

### Status Labels
- `status: blocked` - 🚫 Blocked
- `status: needs-review` - 👀 Needs Review
- `status: needs-testing` - 🧪 Needs Testing
- `status: ready-to-deploy` - 🚀 Ready to Deploy

## 📝 Issue Templates

### Feature Request Template
```markdown
## 🚀 Feature Description
Brief description of the feature

## 📋 Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## 🎯 Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## 📊 Priority
- [ ] Critical
- [ ] High
- [ ] Medium
- [ ] Low

## 🏷️ Labels
- Component: [backend/frontend/mobile/database/infrastructure]
- Phase: [1-planning/2-mvp/3-advanced/4-mobile-ai]
- Type: feature

## 📎 Additional Context
Any additional information, mockups, or references
```

### Bug Report Template
```markdown
## 🐛 Bug Description
Clear description of the bug

## 🔄 Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## ✅ Expected Behavior
What should happen

## ❌ Actual Behavior
What actually happens

## 🖼️ Screenshots
If applicable, add screenshots

## 🌍 Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

## 🏷️ Labels
- Component: [backend/frontend/mobile]
- Priority: [critical/high/medium/low]
- Type: bug
```

## 📈 Milestones

### Phase 1: Planning & Research
**Due Date**: Feb 28, 2025
**Description**: Complete project planning, requirements gathering, and system design

### Phase 2: MVP Development
**Due Date**: May 31, 2025
**Description**: Develop core features for MVP release

### Phase 3: Advanced Features
**Due Date**: Aug 31, 2025
**Description**: Implement advanced features and analytics

### Phase 4: Mobile & AI
**Due Date**: Dec 31, 2025
**Description**: Mobile app development and AI features

## 🔄 Automation Rules

### Auto-assign to Project
```yaml
# .github/workflows/auto-assign-project.yml
name: Auto-assign to project
on:
  issues:
    types: [opened]
  pull_request:
    types: [opened]

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v0.4.0
        with:
          project-url: https://github.com/users/ptnghia/projects/1
          github-token: ${{ secrets.ADD_TO_PROJECT_PAT }}
```

### Auto-move cards
```yaml
# .github/workflows/project-automation.yml
name: Project automation
on:
  pull_request:
    types: [opened, ready_for_review, closed]
  issues:
    types: [closed]

jobs:
  move-cards:
    runs-on: ubuntu-latest
    steps:
      - name: Move PR to In Review
        if: github.event.action == 'ready_for_review'
        uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: Internal Chat App Development
          column: In Review
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## 📊 Project Views

### 1. Board View (Default)
- Kanban-style board với columns
- Group by: Status
- Sort by: Priority, Created date

### 2. Sprint View
- Filter: Current sprint milestone
- Group by: Assignee
- Sort by: Priority

### 3. Phase View
- Group by: Phase labels
- Sort by: Due date
- Filter: Open issues only

### 4. Team View
- Group by: Assignee
- Filter: In Progress, In Review
- Sort by: Updated date

## 🎯 Quick Setup Steps

1. **Create Project Board**:
   - Go to repository → Projects → New project
   - Choose "Board" template
   - Name: "Internal Chat App Development"

2. **Add Columns**:
   - Backlog, Sprint Planning, In Progress, In Review, Done, Blocked

3. **Create Labels**:
   - Copy labels from template above
   - Go to Issues → Labels → New label

4. **Setup Issue Templates**:
   - Create `.github/ISSUE_TEMPLATE/` folder
   - Add feature.md and bug.md templates

5. **Create Milestones**:
   - Go to Issues → Milestones → New milestone
   - Add Phase 1-4 milestones

6. **Import Initial Issues**:
   - Create issues from planning documents
   - Assign to appropriate phases and components

## 📋 Initial Issues to Create

### Phase 1 Issues
- [ ] Setup development environment
- [ ] Design system architecture
- [ ] Create database schema
- [ ] Design UI/UX mockups
- [ ] Setup CI/CD pipeline

### Phase 2 Issues
- [ ] Implement authentication system
- [ ] Create real-time chat functionality
- [ ] Build user management interface
- [ ] Develop task assignment system
- [ ] Setup file sharing

### Phase 3 Issues
- [ ] Build dashboard and analytics
- [ ] Implement personal tools
- [ ] Create workflow automation
- [ ] Add reporting system

### Phase 4 Issues
- [ ] Develop mobile app
- [ ] Integrate AI chatbot
- [ ] Setup production deployment
- [ ] Conduct user training

---

**Next**: [Wiki Setup Template](./wiki-template.md)
