#!/usr/bin/env node

/**
 * Progress Tracking Script for Internal Chat App
 * Syncs GitHub issues with local documentation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  owner: 'ptnghia',
  repo: 'internal-chat',
  progressFile: 'docs/planning/progress-tracking.md',
  phases: [
    { label: 'phase: 1-planning', name: 'Phase 1: Planning & Research' },
    { label: 'phase: 2-mvp', name: 'Phase 2: MVP Development' },
    { label: 'phase: 3-advanced', name: 'Phase 3: Advanced Features' },
    { label: 'phase: 4-mobile-ai', name: 'Phase 4: Mobile & AI' }
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

// Check if GitHub CLI is available
function checkGitHubCLI() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    execSync('gh auth status', { stdio: 'ignore' });
    return true;
  } catch (error) {
    log('❌ GitHub CLI is not installed or not authenticated', 'red');
    log('Please install GitHub CLI and run: gh auth login', 'yellow');
    return false;
  }
}

// Get issues from GitHub
function getIssues(label = '', state = 'all') {
  try {
    let command = `gh issue list --repo ${CONFIG.owner}/${CONFIG.repo} --state ${state} --limit 1000 --json number,title,state,labels,assignees,createdAt,closedAt`;
    
    if (label) {
      command += ` --label "${label}"`;
    }
    
    const output = execSync(command, { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    log(`❌ Error fetching issues: ${error.message}`, 'red');
    return [];
  }
}

// Calculate progress statistics
function calculateProgress() {
  log('📊 Calculating project progress...', 'blue');
  
  const allIssues = getIssues();
  const totalIssues = allIssues.length;
  const closedIssues = allIssues.filter(issue => issue.state === 'CLOSED').length;
  const overallProgress = totalIssues > 0 ? Math.round((closedIssues / totalIssues) * 100) : 0;
  
  log(`📈 Overall Progress: ${overallProgress}% (${closedIssues}/${totalIssues} issues)`, 'green');
  
  // Calculate progress by phase
  const phaseProgress = CONFIG.phases.map(phase => {
    const phaseIssues = getIssues(phase.label);
    const phaseTotal = phaseIssues.length;
    const phaseClosed = phaseIssues.filter(issue => issue.state === 'CLOSED').length;
    const phasePercent = phaseTotal > 0 ? Math.round((phaseClosed / phaseTotal) * 100) : 0;
    
    log(`  ${phase.name}: ${phasePercent}% (${phaseClosed}/${phaseTotal})`, 'cyan');
    
    return {
      ...phase,
      total: phaseTotal,
      closed: phaseClosed,
      progress: phasePercent
    };
  });
  
  // Get issues by status
  const inProgress = getIssues('status: in-progress', 'open').length;
  const inReview = getIssues('status: in-review', 'open').length;
  const blocked = getIssues('status: blocked', 'open').length;
  
  log(`🔄 Current Status:`, 'yellow');
  log(`  In Progress: ${inProgress}`, 'cyan');
  log(`  In Review: ${inReview}`, 'cyan');
  log(`  Blocked: ${blocked}`, 'cyan');
  
  return {
    overall: {
      total: totalIssues,
      closed: closedIssues,
      progress: overallProgress
    },
    phases: phaseProgress,
    status: {
      inProgress,
      inReview,
      blocked
    }
  };
}

// Update progress tracking documentation
function updateProgressDoc(stats) {
  log('📝 Updating progress documentation...', 'blue');
  
  const progressFilePath = path.join(process.cwd(), CONFIG.progressFile);
  
  if (!fs.existsSync(progressFilePath)) {
    log(`❌ Progress file not found: ${progressFilePath}`, 'red');
    return false;
  }
  
  let content = fs.readFileSync(progressFilePath, 'utf8');
  
  // Update overall progress
  content = content.replace(
    /\*\*Progress\*\*: \d+\/\d+%/g,
    `**Progress**: ${stats.overall.closed}/${stats.overall.total} (${stats.overall.progress}%)`
  );
  
  // Update phase progress
  stats.phases.forEach(phase => {
    const phaseRegex = new RegExp(`(### ${phase.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?\\*\\*Progress\\*\\*: )\\d+\\/\\d+%`, 'g');
    content = content.replace(phaseRegex, `$1${phase.closed}/${phase.total} (${phase.progress}%)`);
  });
  
  // Update status counts
  content = content.replace(
    /- \[ \] \*\*In Progress\*\*: \d+ issues/g,
    `- [ ] **In Progress**: ${stats.status.inProgress} issues`
  );
  content = content.replace(
    /- \[ \] \*\*In Review\*\*: \d+ issues/g,
    `- [ ] **In Review**: ${stats.status.inReview} issues`
  );
  content = content.replace(
    /- \[ \] \*\*Blocked\*\*: \d+ issues/g,
    `- [ ] **Blocked**: ${stats.status.blocked} issues`
  );
  
  // Update last updated timestamp
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  content = content.replace(
    /\*\*Last Updated\*\*: .*/g,
    `**Last Updated**: ${now}`
  );
  
  fs.writeFileSync(progressFilePath, content);
  log('✅ Progress documentation updated', 'green');
  return true;
}

// Generate weekly report
function generateWeeklyReport() {
  log('📋 Generating weekly report...', 'blue');
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekAgoStr = oneWeekAgo.toISOString().split('T')[0];
  
  // Get issues closed this week
  const closedThisWeek = getIssues('', 'closed').filter(issue => {
    return issue.closedAt && new Date(issue.closedAt) > oneWeekAgo;
  });
  
  // Get currently active issues
  const inProgress = getIssues('status: in-progress', 'open');
  const inReview = getIssues('status: in-review', 'open');
  const blocked = getIssues('status: blocked', 'open');
  
  const reportDate = new Date().toISOString().split('T')[0];
  const reportDir = path.join(process.cwd(), 'docs', 'reports');
  const reportFile = path.join(reportDir, `weekly-report-${reportDate}.md`);
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = `# Weekly Report - ${reportDate}

## 📊 Progress Summary
- **Completed This Week**: ${closedThisWeek.length} issues
- **Currently In Progress**: ${inProgress.length} issues
- **In Review**: ${inReview.length} issues
- **Blocked**: ${blocked.length} issues

## ✅ Completed Issues
${closedThisWeek.map(issue => `- #${issue.number}: ${issue.title}`).join('\n') || 'No issues completed this week'}

## 🚧 In Progress
${inProgress.map(issue => {
  const assignee = issue.assignees.length > 0 ? issue.assignees[0].login : 'Unassigned';
  return `- #${issue.number}: ${issue.title} (${assignee})`;
}).join('\n') || 'No issues in progress'}

## 👀 In Review
${inReview.map(issue => `- #${issue.number}: ${issue.title}`).join('\n') || 'No issues in review'}

## 🚫 Blocked Issues
${blocked.map(issue => `- #${issue.number}: ${issue.title}`).join('\n') || 'No blocked issues'}

## 📅 Next Week Goals
- Continue current development tasks
- Address blocked issues
- Review and merge pending pull requests
- Plan next sprint activities

---
*Generated automatically on ${new Date().toISOString()}*
`;
  
  fs.writeFileSync(reportFile, report);
  log(`✅ Weekly report generated: ${reportFile}`, 'green');
  return reportFile;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'progress';
  
  log('🚀 Internal Chat App - Progress Tracker', 'magenta');
  log('=====================================', 'magenta');
  
  if (!checkGitHubCLI()) {
    process.exit(1);
  }
  
  switch (command) {
    case 'progress':
    case 'p':
      const stats = calculateProgress();
      updateProgressDoc(stats);
      break;
      
    case 'report':
    case 'r':
      generateWeeklyReport();
      break;
      
    case 'status':
    case 's':
      calculateProgress();
      break;
      
    case 'help':
    case 'h':
      log('Available commands:', 'yellow');
      log('  progress, p  - Calculate and update progress', 'cyan');
      log('  report, r    - Generate weekly report', 'cyan');
      log('  status, s    - Show current status only', 'cyan');
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
  calculateProgress,
  updateProgressDoc,
  generateWeeklyReport
};
