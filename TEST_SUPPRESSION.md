# Testing the Suppression Feature

## Quick Start

### Step 1: Create Test Files

Run this in the project root to create test secret files:

```powershell
# Create test directory
mkdir test_secrets -Force

# Create test files with intentional secrets
@"
// AWS credentials (will be detected)
const awsKey = 'AKIA2EXAMPLE1234567X';
const awsSecret = 'wJalrXUtnFEMI/K7MDENG+O9PBZEB1234EXAMPLEKEY';
"@ | Out-File "test_secrets/aws-keys.js"

@"
// Database password
const dbPassword = 'Super_Secret_P@ssw0rd_12345_abc';
const mongoUrl = 'mongodb+srv://admin:P@ssw0rd@cluster0.example.com';
"@ | Out-File "test_secrets/db-config.js"

@"
# API tokens
API_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz
SLACK_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
"@ | Out-File "test_secrets/.env"
```

### Step 2: Scan for Secrets

1. Open VS Code with the extension active
2. **Command Palette** → `Guardian: Scan Entire Workspace`
3. View findings in the **Guardian Security** sidebar
4. Dashboard shows detection summary

### Step 3: Suppress a Finding (Tree View Method - RECOMMENDED)

**Best User Experience:**

1. In **Guardian Security sidebar** → expand "CRITICAL" or findings
2. **Right-click any finding** → `Guardian: Suppress Finding (Mark as False Positive)`
3. Enter reason: `"Test data for security validation"`
4. ✅ Finding is suppressed and removed from view

### Step 4: Suppress via Command Palette (Alternative)

1. Open **Command Palette** (`Ctrl+Shift+P`)
2. Type `Guardian: Suppress Finding`
3. Enter reason when prompted
4. ✅ Finding is suppressed

### Step 5: View Suppressed Findings

1. **Command Palette** → `Guardian: View Suppressed Findings`
2. See all suppressed items with reasons
3. Can unsuppress from this view

### Step 6: Verify Persistent Storage

1. Check `.vscode/guardian-suppressions.json` in project root
   - Contains all suppressed findings
   - Workspace-specific (not shared across projects)
   - Re-added to repo if you rescan

### Step 7: Rescan & Verify

1. **Command Palette** → `Guardian: Clear All Findings`
2. **Command Palette** → `Guardian: Scan Entire Workspace`
3. ✅ Suppressed findings should NOT reappear

---

## Test Scenarios

### Scenario A: False Positive in Test Data
- **File:** `test_secrets/aws-keys.js`
- **Reason:** `"Mock AWS key for documentation"`
- **Verify:** Suppression persists across scans

### Scenario B: Intentional Hardcoded Value
- **File:** `test_secrets/db-config.js`
- **Reason:** `"Development database on localhost - not production"`
- **Verify:** Dashboard shows reduced critical count

### Scenario C: Environment File
- **File:** `.env`
- **Reason:** `"Example/test environment file"`
- **Verify:** Can suppress multiple findings in same file

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Findings don't appear** | Run full scan with `Guardian: Scan Entire Workspace` |
| **Suppress option missing** | Right-click on finding in tree (not dashboard) |
| **Suppressions not saved** | Check `.vscode/guardian-suppressions.json` exists |
| **Finding reappears after rescan** | Verify JSON file and restart VS Code |

---

## Success Checklist

- [ ] Created test files with mock secrets
- [ ] Scanned and found findings in dashboard
- [ ] Suppressed via right-click (tree view)
- [ ] Checked suppression stored in `.vscode/guardian-suppressions.json`
- [ ] Rescanned and verified suppression persisted
- [ ] Tested "View Suppressed" command
- [ ] Verified all features work smoothly

---

**User Experience Flow:**
```
Scan Workspace 
    ↓
See Findings in Sidebar 
    ↓
Right-click Finding 
    ↓
Click "Suppress Finding"
    ↓
Enter Reason 
    ↓
✅ Finding Removed + Auto-saved
    ↓
Rescan = Stays Suppressed
```
