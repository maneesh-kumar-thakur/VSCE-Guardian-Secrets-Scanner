# Secret Remediation Workflow

## What to Do When Guardian Finds Secrets

When Guardian detects secrets in your code, follow this workflow:

---

## 🔴 CRITICAL Severity Secrets

**⚠️ Immediate Action Required - Today**

### Severity: AWS Keys, Private Keys, Database Passwords

**Step 1: Isolate & Assess**
```
Time: Immediately
1. Do NOT push this code
2. Identify what credential it is
3. Determine potential damage
4. Check if already in Git history
```

**Step 2: Rotate the Credential**
```
1. Go to the service (AWS, database, etc.)
2. Delete/revoke the exposed credential
3. Generate new credential
4. Verify new credential works
```

**Step 3: Remove from Code**
```
DO THIS:
- Open file with secret
- Delete the secret value
- Replace with environment variable reference

BEFORE (❌ WRONG):
const password = "myRealPassword123";

AFTER (✅ CORRECT):
const password = process.env.DB_PASSWORD;
```

**Step 4: Add to `.env`**
```bash
# .env (NEVER commit this file)
DB_PASSWORD=myNewPassword123
API_KEY=new_api_key_here
AWS_ACCESS_KEY=AKIA...
```

**Step 5: Update `.env.example`**
```bash
# .env.example (SAFE to commit - no real values)
DB_PASSWORD=your_password_here
API_KEY=your_api_key_here
AWS_ACCESS_KEY=your_aws_key_here
```

**Step 6: Add to `.gitignore`**
```bash
# .gitignore
.env
.env.local
.env.*.local
*.key
*.pem
secrets.json
```

**Step 7: Clean Git History**
```bash
# If already committed:
git filter-repo --path-match secrets.json --invert-paths

# Force push (coordinate with team!)
git push --force-with-lease
```

**Step 8: Audit & Communicate**
```
1. Check if secret was pushed to GitHub
2. Review access logs (AWS, DB, etc.)
3. Notify security team
4. Document incident
5. Inform team members to re-pull
```

---

## 🟠 HIGH Severity Secrets

**⚠️ Urgent - Within 24 Hours**

### Severity: API Keys, Tokens, Slack Webhooks

**Step 1-2: Same as Critical**
- Rotate credential
- Remove from code

**Step 3-4: Immediate Fix**
```
1. Replace with env variable
2. Commit fix
3. Deploy new version
4. Monitor for misuse
```

**Step 5: History Cleanup**
```bash
# If in recent commits:
git filter-repo --path-match config.json --invert-paths
git push --force-with-lease
```

---

## 🟡 MEDIUM Severity Secrets

**ℹ️ Review & Fix - Within a Week**

### Severity: High-Entropy Strings, Potential Secrets

**Step 1: Validate**
```
1. Is this a real secret? Check context.
2. Could be: test data, example, legitimate value
3. If unsure: treat as real secret
```

**Step 2: Decision Tree**
```
Is it a real secret?
├─ YES → Remove and use env variable
└─ NO → Add to exclude patterns or mark as false positive
```

**Step 3: Fix **
```
Follow same process as HIGH severity
```

---

## 🔵 LOW Severity Secrets

**ℹ️ Review When Convenient**

### Severity: Lower Confidence Detections

**Step 1: Review Context**
```
1. Understand what it is
2. Probably safe, but verify
```

**Step 2: Fix if Real**
```
If it looks like a secret: remove it
If it's safe: document it
```

---

## ✅ Complete Remediation Checklist

For each secret found:

- [ ] **Understand** - What is this secret? How critical?
- [ ] **Locate** - Find all instances in codebase
- [ ] **Extract** - Move to appropriate location
- [ ] **Rotate** - If already exposed, revoke credential
- [ ] **Update** - Replace with environment variable
- [ ] **Document** - Update .env.example with placeholder
- [ ] **Exclude** - Add patterns to .gitignore
- [ ] **Commit** - Stage and commit the fix
- [ ] **Clean** - Remove from Git history if needed
- [ ] **Verify** - Code still works with env variables
- [ ] **Monitor** - Check for unauthorized access
- [ ] **Communicate** - Tell team about changes

---

## 📁 Correct Project Structure After Fix

```
MyProject/
├── .env              (❌ NOT in Git)
├── .env.example      (✅ In Git - safe template)
├── .gitignore        (✅ Includes .env)
├── config.js         (✅ Uses process.env)
├── secrets.json      (❌ NOT in Git - add to .gitignore)
└── src/
    └── (no hardcoded secrets)
```

---

## 🔄 Development Workflow with Guardian

### Every Day

```
1. Write code
   ↓
2. Save file
   ↓
3. Guardian scans automatically
   ↓
4. See red squiggles if secrets detected
   ↓
5. Fix immediately (don't commit with secrets!)
   ↓
6. Secrets removed, code clean
   ↓
7. Commit only clean code
```

### Before Committing

```bash
# 1. Run Guardian scan
Ctrl+Shift+P → "Guardian: Scan Current File"

# 2. Fix all findings
# (Use this guide for steps)

# 3. Run Guardian again to verify clean
Ctrl+Shift+P → "Guardian: Scan Current File"

# 4. Should see: "🛡️ Guardian: Clean"

# 5. Safe to commit
git commit -m "Fix: Remove hardcoded secrets"
```

---

## ⚠️ If Secret Already in Git

**DO NOT PANIC** - You can fix it:

### Option 1: Local Repository Only (Not Yet Pushed)

```bash
# Remove from recent commits
git filter-repo --path-match filename.js --invert-paths

# Force push
git push --force-with-lease
```

### Option 2: Already Pushed to GitHub

```bash
# 1. Rotate the credential IMMEDIATELY
#    (Assume it's compromised)

# 2. Remove from history
git filter-repo --path-match filename.js --invert-paths

# 3. Force push
git push --force-with-lease

# 4. Notify GitHub to remove from cache
#    (GitHub may cache files)
```

### Option 3: In Merged PR (Complex)

```bash
# Contact your team/security
# May need to:
# - Rebase main branch
# - Force push
# - Rotate all credentials
# - Full audit of history
```

---

## 🚨 Prevention is Easier Than Cleanup

### Set Up Guardian Pre-Commit

```bash
# Install pre-commit hook
Ctrl+Shift+P → "Guardian: Install Pre-commit Hook"

# Now Guardian automatically blocks commits with secrets:
git commit -m "Add config"
↓
Guardian detects secret
↓
❌ Commit blocked
↓
Fix the secret
↓
Commit succeeds
```

### Use .env from Day One

```javascript
// GOOD - Day 1
const apiKey = process.env.API_KEY;

// BAD - Day 1 (causes cleanup headache later)
const apiKey = "actual_key_12345";
```

---

## 📝 Common Secrets & Where They Go

| Secret | Where Found | Where It Goes |
|--------|-------------|---------------|
| AWS Keys | `config.js` | `.env` → `process.env.AWS_KEY` |
| Database Password | `secrets.json` | `.env` → `process.env.DB_PASSWORD` |
| API Token | `.env` file | Good! Keep in `.env` only |
| Private Key | `auth.ts` | Never hardcode! Use `.env` |
| Stripe Key | `payment.js` | `.env` → `process.env.STRIPE_KEY` |
| Slack Webhook | `notifications.ts` | `.env` → `process.env.SLACK_WEBHOOK` |

---

## 🎓 Example: Fix a Real Secret

### BEFORE (❌ Wrong)
```typescript
// auth.ts - DETECTED BY GUARDIAN
const config = {
  apiKey: "ghp_1234567890abcdefghijklmnopqrstuv",  // 🔴 GitHub Token
  dbPassword: "mySecurePassword123",                // 🔴 Database Password
  stripeKey: "sk_live_1234567890abcdefghijklmnop"  // 🔴 Stripe Key
};

export const getConfig = () => config;
```

### AFTER (✅ Correct)
```typescript
// auth.ts - CLEAN - No secrets here
const config = {
  apiKey: process.env.GITHUB_API_KEY,
  dbPassword: process.env.DB_PASSWORD,
  stripeKey: process.env.STRIPE_KEY
};

export const getConfig = () => config;
```

```bash
# .env (❌ NOT in Git)
GITHUB_API_KEY=ghp_1234567890abcdefghijklmnopqrstuv
DB_PASSWORD=mySecurePassword123
STRIPE_KEY=sk_live_1234567890abcdefghijklmnop
```

```bash
# .env.example (✅ In Git - template only)
GITHUB_API_KEY=your_github_token_here
DB_PASSWORD=your_database_password_here
STRIPE_KEY=your_stripe_key_here
```

```bash
# .gitignore (✅ Prevents accidents)
.env
.env.local
.env.*
```

---

## 📞 When to Get Help

### Contact Security Team If:

- [ ] Secret was pushed to public repository
- [ ] Secret is in Git history of many commits
- [ ] Unsure if secret is exposed
- [ ] Secret is for critical infrastructure
- [ ] Multiple team members need coordination
- [ ] Major cleanup needed

### Use Guardian If:

- ✅ You just wrote code and need to check it
- ✅ Scanning existing project for secrets
- ✅ Quick verification before commit
- ✅ Learning to identify secrets

---

## ✨ Summary

When Guardian finds secrets:

1. **CRITICAL** → Rotate immediately, remove from code, clean history
2. **HIGH** → Rotate within 24 hours, fix today
3. **MEDIUM** → Review and fix within a week
4. **LOW** → Verify and fix when possible

**Key principle**: Environment variables are your friend! 🛡️

```
Secrets in Code ❌
Secrets in .env ✅
.env in .gitignore ✅
.env.example in Git ✅
```
