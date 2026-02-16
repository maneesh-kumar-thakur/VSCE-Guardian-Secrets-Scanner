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

### Access Settings
1. Press `Ctrl+,` (or `Cmd+,` on Mac)
2. Search for "Guardian"
3. Adjust settings

### Key Configuration Options

#### Entropy Analysis
```json
{
  "guardian.enableEntropyAnalysis": true,
  "guardian.entropyThreshold": 4.5
}
```

#### Severity Filtering
```json
{
  "guardian.severityLevel": "medium"
}
```

#### File Exclusions
```json
{
  "guardian.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/test/**",
    "**/*.min.js"
  ]
}
```

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

**JSON** - For automation/parsing
**Markdown** - For documentation
**CSV** - For spreadsheet analysis

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
