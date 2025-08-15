# 🛠️ GitHub Setup Guide

Hướng dẫn chi tiết để setup GitHub Project Board, Wiki, và Issue Templates cho dự án Internal Chat App.

## 📋 Tổng Quan Setup

### ✅ Đã tạo sẵn
- [x] Issue Templates (Feature, Bug, Task)
- [x] Project Board configuration template
- [x] Wiki structure template
- [x] Labels configuration
- [x] Automation workflows

### 🎯 Cần thực hiện
- [ ] Tạo GitHub Project Board
- [ ] Setup Wiki pages
- [ ] Tạo labels
- [ ] Import initial issues
- [ ] Configure automation

## 🚀 Hướng Dẫn Setup

### 1. 📋 Setup Project Board

#### Bước 1: Tạo Project Board
1. Truy cập: https://github.com/ptnghia/internal-chat
2. Click tab **"Projects"**
3. Click **"Link a project"** → **"Create new project"**
4. Chọn **"Board"** template
5. Tên project: **"Internal Chat App Development"**

#### Bước 2: Cấu hình Columns
Tạo các columns theo thứ tự:
1. **📋 Backlog** - Tasks chưa bắt đầu
2. **🎯 Sprint Planning** - Tasks cho sprint hiện tại
3. **🟡 In Progress** - Tasks đang thực hiện
4. **👀 In Review** - Tasks đang review
5. **✅ Done** - Tasks đã hoàn thành
6. **🚫 Blocked** - Tasks bị block

#### Bước 3: Setup Automation
- **In Progress**: Auto-move khi issue được assign
- **In Review**: Auto-move khi PR ready for review
- **Done**: Auto-move khi issue closed hoặc PR merged

### 2. 🏷️ Setup Labels

Truy cập **Issues** → **Labels** → **New label** và tạo:

#### Priority Labels
```
priority: critical - #d73a4a - Critical priority
priority: high - #ff6b35 - High priority  
priority: medium - #fbca04 - Medium priority
priority: low - #0e8a16 - Low priority
```

#### Type Labels
```
type: feature - #a2eeef - New feature
type: bug - #d73a4a - Bug fix
type: enhancement - #84b6eb - Enhancement
type: documentation - #0075ca - Documentation
type: task - #7057ff - Development task
```

#### Component Labels
```
component: backend - #1d76db - Backend API
component: frontend - #e99695 - Frontend Web
component: mobile - #f9d0c4 - Mobile App
component: database - #c2e0c6 - Database
component: infrastructure - #bfd4f2 - Infrastructure
```

#### Phase Labels
```
phase: 1-planning - #0052cc - Phase 1: Planning & Research
phase: 2-mvp - #5319e7 - Phase 2: MVP Development
phase: 3-advanced - #b60205 - Phase 3: Advanced Features
phase: 4-mobile-ai - #0e8a16 - Phase 4: Mobile & AI
```

### 3. 📚 Setup Wiki

#### Bước 1: Enable Wiki
1. Repository **Settings**
2. **Features** section
3. Check **"Wikis"**

#### Bước 2: Tạo Wiki Pages
Sử dụng templates từ [wiki-template.md](./wiki-template.md):

1. **Home** - Trang chủ wiki
2. **Project-Overview** - Tổng quan dự án
3. **Getting-Started** - Hướng dẫn bắt đầu
4. **Architecture** - Kiến trúc hệ thống
5. **API-Documentation** - Tài liệu API
6. **Design-System** - Hệ thống thiết kế
7. **Testing-Guide** - Hướng dẫn testing
8. **Deployment** - Hướng dẫn deployment

#### Bước 3: Tạo Navigation
Tạo `_Sidebar.md` cho navigation menu và `_Footer.md` cho footer.

### 4. 📝 Import Initial Issues

#### Phase 1 Issues
```bash
# Tạo issues từ planning documents
- Setup development environment
- Design system architecture  
- Create database schema
- Design UI/UX mockups
- Setup CI/CD pipeline
```

#### Sử dụng GitHub CLI (Optional)
```bash
# Install GitHub CLI
brew install gh

# Create issues from template
gh issue create --title "[TASK] Setup development environment" \
  --body-file .github/ISSUE_TEMPLATE/task.md \
  --label "type: task,component: infrastructure,phase: 1-planning"
```

### 5. 🔄 Setup Automation

#### GitHub Actions Workflows
Tạo `.github/workflows/project-automation.yml`:

```yaml
name: Project Board Automation
on:
  issues:
    types: [opened, closed, assigned]
  pull_request:
    types: [opened, ready_for_review, closed]

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v0.4.0
        with:
          project-url: https://github.com/users/ptnghia/projects/1
          github-token: ${{ secrets.ADD_TO_PROJECT_PAT }}
```

#### Personal Access Token
1. GitHub **Settings** → **Developer settings** → **Personal access tokens**
2. Generate token với **project** permissions
3. Add to repository secrets as `ADD_TO_PROJECT_PAT`

### 6. 📊 Setup Milestones

Tạo milestones cho từng phase:

1. **Phase 1: Planning & Research**
   - Due: Feb 28, 2025
   - Description: Complete project planning và system design

2. **Phase 2: MVP Development**
   - Due: May 31, 2025
   - Description: Develop core features for MVP

3. **Phase 3: Advanced Features**
   - Due: Aug 31, 2025
   - Description: Advanced features và analytics

4. **Phase 4: Mobile & AI**
   - Due: Dec 31, 2025
   - Description: Mobile app và AI features

## ✅ Verification Checklist

### Project Board
- [ ] Project board created với đúng tên
- [ ] 6 columns được tạo đúng thứ tự
- [ ] Automation rules được setup
- [ ] Initial issues được add vào board

### Labels
- [ ] Priority labels (4 labels)
- [ ] Type labels (5 labels)
- [ ] Component labels (5 labels)
- [ ] Phase labels (4 labels)
- [ ] Status labels (4 labels)

### Wiki
- [ ] Wiki được enable
- [ ] 8 main pages được tạo
- [ ] Sidebar navigation
- [ ] Footer với contact info

### Issues
- [ ] Issue templates hoạt động
- [ ] Initial issues được tạo
- [ ] Labels được assign đúng
- [ ] Milestones được setup

### Automation
- [ ] GitHub Actions workflow
- [ ] Personal Access Token
- [ ] Auto-assign to project
- [ ] Auto-move cards

## 🎯 Next Steps

Sau khi setup xong:

1. **Import Planning Issues**
   - Tạo issues từ planning documents
   - Assign to appropriate phases
   - Add to project board

2. **Team Onboarding**
   - Share project board link
   - Train team on workflow
   - Setup notification preferences

3. **Regular Maintenance**
   - Weekly board review
   - Update wiki documentation
   - Monitor automation

## 📞 Support

Nếu gặp vấn đề trong quá trình setup:

1. Check GitHub documentation
2. Review automation logs
3. Contact project maintainers
4. Create support issue

---

**Templates Location**:
- [Project Board Template](./project-board-template.md)
- [Wiki Template](./wiki-template.md)

**Last Updated**: [Date]  
**Updated By**: [Name]
