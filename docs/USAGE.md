# Guardian Secrets Scanner - Usage Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Scanning Your Project](#scanning-your-project)
3. [Understanding Findings](#understanding-findings)
4. [Configuring Guardian](#configuring-guardian)
5. [Custom Patterns](#custom-patterns)
6. [Exporting Reports](#exporting-reports)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### First Scan
After installing Guardian:

1. Open your project in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Guardian: Scan Entire Workspace"
4. Wait for the scan to complete

Guardian will scan all files and show results in the **Guardian Security** panel.

### Understanding the Interface

**Activity Bar**: Click the shield icon to see:
- Security findings grouped by severity
- File locations
- Quick navigation

**Status Bar** (bottom right): Shows current security status
- `🛡️ Clean` = No issues
- `⚠️ X Critical` = Critical issues found
- Click to open dashboard

**Problems Panel**: Integrated with VS Code's problems view
- Shows inline diagnostics in code
- Red/yellow squiggly lines under detected secrets

## Scanning Your Project

### Scan Types

#### Full Workspace Scan
```
Command: Guardian: Scan Entire Workspace
```
- Scans all files in workspace
- Respects exclude patterns
- Shows progress notification
- Best for: Initial project audit

#### Current File Scan
```
Command: Guardian: Scan Current File
```
- Scans only the active file
- Instant results
- Best for: Quick checks while coding

#### Automatic Scanning
Configure in settings:
```json
{
  "guardian.scanOnSave": true,  // Scan when saving files
  "guardian.scanOnOpen": false  // Scan when opening files
}
```

### What Gets Scanned?

By default, Guardian scans:
- ✅ Source code files (.js, .ts, .py, .java, etc.)
- ✅ Configuration files (.json, .yaml, .toml, etc.)
- ✅ Environment files (.env, .env.local, etc.)
- ✅ Text files (.txt, .md, etc.)
- ✅ Shell scripts (.sh, .bash, etc.)

By default, Guardian **skips**:
- ❌ `node_modules/`
- ❌ `dist/`, `build/`, `out/`
- ❌ `.git/`
- ❌ Binary files (unless configured)

## Understanding Findings

### Severity Levels

**Critical** 🔴
- AWS credentials, private keys, database passwords
- **Action**: Rotate immediately, review access logs

**High** 🟠
- API keys, tokens, Slack webhooks
- **Action**: Rotate within 24 hours

**Medium** 🟡
- High-entropy strings, potential secrets
- **Action**: Review and rotate if confirmed

**Low** 🔵
- Lower confidence detections
- **Action**: Review when convenient

## Configuring Guardian

Guardian provides an easy-to-use settings interface with organized configuration categories.

### Quick Access to Settings

**Option 1: Command Palette** (Recommended)
```
Ctrl+Shift+P (or Cmd+Shift+P on Mac)
Type: "Guardian: Show Settings"
```
Opens the Guardian Settings UI with light theme

**Option 2: Dashboard**
- Click the **Settings** button on the Guardian Security Dashboard

**Option 3: Standard VS Code Settings**
```
Ctrl+, (or Cmd+, on Mac)
Search: "guardian"
```

### Settings UI Sections

#### 🔍 Detection Settings
Fine-tune how Guardian detects secrets:
- **Entropy Analysis** - Enable/disable randomness-based detection
- **Entropy Threshold** (3.0-6.0):
  - `3.0` = Catches more strings (e.g., "password123")
  - `4.5` = Balanced (recommended)
  - `6.0` = Strict (only highly random strings)
- **Minimum Severity Level** - Filter findings by severity

#### 📁 Scanning Settings
Control what Guardian scans:
- **Exclude Patterns** - Folders to skip (glob patterns)
  - Default: `**/node_modules/**`, `**/dist/**`, `**/build/**`, `**/.git/**`
  - Add custom: `**/test/**`, `**/*.min.js`, etc.
- **Scan Binary Files** - Optional: Scan Office/PDF files
  - ⚠️ Performance warning: Adds 10-30s overhead

#### 🎯 Custom Patterns
Add company-specific secret detection:
- Enter regex patterns for proprietary APIs, tokens, keys
- Example: `COMPANY_KEY_[A-Z0-9]{32}`

#### 🔐 Git Security Settings
Protect against accidental commits:
- **Block Critical Secrets** - Prevents committing critical secrets (default: ON)
- **Block High Severity** - Optionally block high severity secrets
- **Auto-scan Staged** - Scan files before each commit

### Advanced Configuration (settings.json)

For automated setup or workspace-specific configs:

```json
{
  // Detection settings
  "guardian.enableEntropyAnalysis": true,
  "guardian.entropyThreshold": 4.5,
  "guardian.severityLevel": "medium",
  
  // Scanning settings
  "guardian.scanBinaryFiles": false,
  "guardian.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**",
    "**/test/**"
  ],
  
  // Custom patterns
  "guardian.customPatterns": [
    {
      "name": "Internal API Key",
      "pattern": "INTERNAL_[A-Z0-9]{32}",
      "severity": "critical"
    }
  ],
  
  // Git security
  "guardian.git.blockOnCritical": true,
  "guardian.git.blockOnHigh": false,
  "guardian.git.autoScanStaged": false
}
```

### Recommended Configuration

**For Development Teams**:
- Entropy Threshold: `4.5` (balanced)
- Severity Level: `medium` (catch most issues)
- Block Critical: `true` (prevent credential leaks)
- Block High: `false` (avoid false positive blocks)
- Auto-scan Staged: `true` (additional safety)

**For CI/CD Integration**:
- Enable most restrictive settings
- Block Critical: `true`
- Block High: `true` (optional, depends on risk tolerance)

**For Individual Projects with High Risk**:
- Entropy Threshold: `4.0` (catch more)
- Severity Level: `low` (report everything)
- Block Critical: `true`
- Block High: `true`

## Custom Patterns

### Adding Organization-Specific Patterns

**Via Settings**:
```json
{
  "guardian.customPatterns": [
    {
      "name": "Internal API Key",
      "pattern": "INTERNAL_KEY_[A-Z0-9]{32}",
      "severity": "critical",
      "description": "Internal API key detected",
      "flags": "gi"
    }
  ]
}
```

## Exporting Reports

### Export Formats

**Markdown** - For documentation and readability
**CSV** - For spreadsheet analysis and external tools

## Best Practices

### 1. Scan Before Committing
Run Guardian checks before each commit

### 2. Regular Scheduled Scans
Weekly security audits

### 3. False Positive Management
For known false positives, add to exclude patterns

### 4. Team Configuration
Share Guardian settings via workspace config

### 5. Remediation Workflow

**Critical/High**:
1. Rotate credential immediately
2. Remove from code
3. Update environment variables

## Troubleshooting

### Issue: Too Many False Positives

**Solution 1**: Increase entropy threshold
```json
{
  "guardian.entropyThreshold": 5.0
}
```

**Solution 2**: Add exclusions
```json
{
  "guardian.excludePatterns": [
    "**/test/**",
    "**/*.example.*"
  ]
}
```

### Issue: Missing Known Secrets

**Solution 1**: Lower entropy threshold
**Solution 2**: Add custom pattern

### Issue: Slow Performance

**Solution 1**: Exclude large directories
**Solution 2**: Disable scan-on-open

---

**Need help?** Check the README for more information.
