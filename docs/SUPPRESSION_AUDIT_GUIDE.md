# Suppression & Audit System Documentation

## Overview

Guardian now includes a **comprehensive suppression and audit tracking system** for managing false positives with full compliance and record-keeping capabilities.

---

## Storage & Record Keeping

### 1. **Workspace-Specific Storage** (`.vscode/guardian-suppressions.json`)
- **Location:** `.vscode/guardian-suppressions.json` (workspace local, gitignored)
- **Purpose:** Working suppression rules for current development session
- **Contains:** File path, line number, pattern, reason, timestamp, username, review status

**Format:**
```json
[
  {
    "id": "path/to/file.js:45:password",
    "filePath": "path/to/file.js",
    "lineNumber": 45,
    "pattern": "password",
    "reason": "Mock data for testing",
    "timestamp": 1708123456789,
    "severity": "high",
    "suppressedBy": "maneesh_thakur",
    "reviewStatus": "pending",
    "expiryDate": null
  }
]
```

### 2. **Audit Log** (`SUPPRESSIONS_AUDIT.md`)
- **Location:** `SUPPRESSIONS_AUDIT.md` (can be committed to git)
- **Purpose:** Historical record of ALL suppression actions (suppress/unsuppress/review)
- **Format:** Markdown for easy reading and git tracking

**Example Audit Log:**
```markdown
# Guardian Suppressions Audit Log

This file tracks all finding suppressions for security and compliance purposes.

- **SUPPRESS** | path/to/file.js:45 | 2026-02-17T10:30:00Z | User: maneesh_thakur | Reason: Mock data for testing
- **SUPPRESS** | config/db.js:12 | 2026-02-17T10:31:15Z | User: john_doe | Reason: Localhost dev credentials
- **UNSUPPRESS** | path/to/file.js:45 | 2026-02-17T11:00:00Z | User: maneesh_thakur | Comment: Fixed in code review
- **REVIEW** | config/db.js:12 | 2026-02-17T15:30:00Z | User: security_reviewer | Comment: Approved for dev environment
```

---

## Complete Workflow

### Step 1: Suppress a Finding

**Via Tree View (Recommended):**
1. Right-click finding in **Guardian Security** sidebar
2. Click **"Suppress Finding (Mark as False Positive)"**
3. Enter reason: `"Mock data for auth tests"`
4. ✅ Stored with:
   - Your username (auto-detected from `$env:USERNAME`)
   - Current timestamp
   - Review status: `pending`

**Via Command Palette:**
- `Ctrl+Shift+P` → `Guardian: Suppress Finding`

### Step 2: Audit Log Auto-Created

When you suppress, the system:
1. ✅ Saves to `.vscode/guardian-suppressions.json` (working file)
2. ✅ Appends to `SUPPRESSIONS_AUDIT.md` (permanent record)
3. Tracks: username, timestamp, file, reason, action type

### Step 3: View & Manage

**All Suppressions:**
- `Ctrl+Shift+P` → `Guardian: View Suppressed Findings`
- Shows: pattern, file, reason
- Options: View File, Unsuppress

**Suppression Report:**
- `Ctrl+Shift+P` → `Guardian: View Suppression Report`
- Shows: Statistics by severity, by user, by file
- Use for compliance/auditing

**Pending Review (30+ days):**
- `Ctrl+Shift+P` → `Guardian: Review Pending Suppressions`
- Alerts if any suppressions older than 30 days need review
- Check `SUPPRESSIONS_AUDIT.md` for historical record

### Step 4: Review Status Tracking

Each suppression has a status:
- ✅ **pending** - Newly suppressed, awaiting review
- ✅ **reviewed** - Verified by team/security
- ✅ **expired** - Scheduled for removal

---

## Data Stored Per Suppression

```typescript
{
  id: string;              // Unique identifier: file:line:pattern
  filePath: string;        // Path to file with false positive
  lineNumber: number;      // Line number of finding
  pattern: string;         // Security pattern matched
  reason: string;          // Why it's suppressed (user provided)
  timestamp: number;       // When suppressed (milliseconds)
  severity: string;        // critical, high, medium, low
  suppressedBy: string;    // Username who suppressed it
  reviewStatus: string;    // pending, reviewed, expired
  expiryDate?: number;     // Optional expiration date
}
```

---

## Audit Trail Example

When you suppress a finding:

```
✓ Action: SUPPRESS
  ├─ File: src/auth/oauth.js
  ├─ Line: 23
  ├─ Pattern: api_key
  ├─ Reason: "Mock OAuth key for tests"
  ├─ Timestamp: 2026-02-17T10:30:45Z
  ├─ User: maneesh_thakur
  ├─ Severity: critical
  └─ Review Status: pending → [30 days] → needs review
```

---

## Best Practices

### 1. **Provide Clear Reasons**
- ❌ Bad: "test data"
- ✅ Good: "Mock AWS key used in unit tests - not production"

### 2. **Review Regularly**
- Long-lived suppressions > 30 days trigger alerts
- Use `Guardian: Review Pending Suppressions` command
- Update review status in audit log

### 3. **Commit Audit Log**
- ✅ DO commit `SUPPRESSIONS_AUDIT.md` to git
- ✅ Shows team what was suppressed and why
- ❌ DON'T commit `.vscode/guardian-suppressions.json` (it's gitignored)

### 4. **Remove Stale Suppressions**
- Regularly unsuppress findings that were fixed in code
- This keeps the audit log clean
- When unsuppressing, add comment: `"Fixed in PR #123"`

### 5. **Team Visibility**
- Team members see suppression history in git
- Suppressions tied to username automatically
- Enables accountability and security reviews

---

## Commands Reference

| Command | Purpose | Output |
|---------|---------|--------|
| Guardian: Suppress Finding | Suppress single finding | Stores in JSON + Audit Log |
| Guardian: View Suppressed Findings | List all suppressions | Quick pick interface |
| Guardian: View Suppression Report | Statistics dashboard | Markdown report |
| Guardian: Review Pending Suppressions | Check 30+ day old suppressions | Alert message |

---

## Compliance & Auditing

### For Security Reviews:
1. Check `SUPPRESSIONS_AUDIT.md` in git history
2. Verify all suppressions have clear reasons
3. Review who suppressed what and when
4. Identify suppressions needing re-evaluation

### For Release Management:
1. Generate suppression report: `Guardian: View Suppression Report`
2. Ensure critical/high suppressions are reviewed
3. Document in release notes any active suppressions
4. Archive audit log for compliance

---

## Example Use Cases

### Scenario A: Mock Authentication Keys
```
File: test/fixtures/oauth-keys.json
Reason: "Mock keys for integration tests - not production use"
Status: pending → reviewed after security check
Audit: Shows suppression date and reviewer
```

### Scenario B: Development Database Credentials
```
File: .env.development
Reason: "Local dev environment on 127.0.0.1 - no external access"
Status: pending → reviewed by DevOps team
Audit: Documents team review and approval
```

### Scenario C: Legacy Code with Hardcoded Values
```
File: legacy/config.js
Reason: "Scheduled for refactoring in Q2 - ticket #456"
Status: pending → needs review after 30 days
Audit: Tracks when refactoring deadline should be checked
```

---

## Technical Details

### Username Detection
- Automatically reads from `$env:USERNAME` (Windows)
- Falls back to `$env:USER` (Linux/Mac)
- Enables personal accountability for suppressions

### Timestamp Format
- Stored as milliseconds since epoch
- Displayed as ISO 8601 in audit log
- Enables 30-day review tracking

### Audit Log Append-Only
- Never overwrites, only appends
- Preserves complete history
- Each action is immutable record
- Perfect for compliance audits

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Audit log not created | Check write permissions in project root |
| Suppressions not persisting | Verify `.vscode/` directory exists and is writable |
| Username showing as "unknown" | Check `$env:USERNAME` environment variable |
| Can't find SUPPRESSIONS_AUDIT.md | Generate it by suppressing first finding |

---

## Next Steps

1. **Start suppressing** false positives using the tree view
2. **Monitor** the audit log file for compliance
3. **Review** pending suppressions at 30-day intervals
4. **Commit** audit log to preserve team history
5. **Audit** regularly for security best practices
