# Understanding Guardian Findings

## How to Read Guardian's Output

When Guardian detects secrets, you'll see:

### 1. In the Tree View (Activity Bar)

```
Guardian Security
├── 🔴 CRITICAL (5)
│   ├── 📄 config/aws.js (2)
│   │   ├── Line 42: AWS Access Key ID
│   │   └── Line 43: AWS Secret Access Key
│   └── 📄 .env (3)
├── 🟠 HIGH (3)
│   ├── 📄 auth.ts (2)
│   ├── 📄 api.py (1)
└── 🟡 MEDIUM (12)
```

**What it means:**
- 🔴 **5 Critical findings** - Fix immediately
- 🟠 **3 High findings** - Fix today
- 🟡 **12 Medium findings** - Fix this week

### 2. In the Code (Red/Yellow Squiggles)

```javascript
const password = "mySecurePassword123";  // 🟡 Yellow squiggle
                  ↑
             Hover to see details
```

**Hover to see:**
```
Guardian: Medium - Potential Secret Detected
File: config.js, Line 42
Pattern: Generic Password
Entropy: 4.2 (High randomness)
Severity: Medium
```

### 3. In the Dashboard

```
Guardian Security Dashboard
┌─────────────────────────────────────┐
│ 28 CRITICAL | 28 HIGH | 34 MEDIUM | 0 LOW │
└─────────────────────────────────────┘

Findings by Category:
  Entropy Analysis: 21 ⚠️ 
  Tokens: 14 ⚠️
  Generic Secrets: 13 ⚠️
  Payment: 12 🔴
  ...
```

---

## Severity Levels Explained

### 🔴 CRITICAL
**Fix immediately - today**

**What triggers it:**
- AWS Access Keys (AKIA*, ASIA*)
- AWS Secret Access Keys
- Private Keys (RSA, SSH, PGP)
- Database Connection Strings with passwords
- GitHub/GitLab PAT tokens
- Stripe Secret Keys

**Example:**
```
const awsKey = "AKIAIOSFODNN7EXAMPLE";  // 🔴 CRITICAL
const dbUrl = "postgres://admin:password@db.com/app";  // 🔴 CRITICAL
```

**Action:**
1. Rotate the credential (delete old, create new)
2. Remove from code immediately
3. Use environment variable instead
4. Clean Git history

---

### 🟠 HIGH
**Fix today - within 24 hours**

**What triggers it:**
- API Keys (most types)
- Bearer Tokens
- OAuth Tokens
- Slack Webhooks
- Twilio Auth Tokens
- SendGrid API Keys
- Mailgun API Keys

**Example:**
```
const token = "ghp_1234567890abcdefghijklmnopqrstuv";  // 🟠 HIGH (GitHub PAT)
const slackWebhook = "https://hooks.slack.com/services/...";  // 🟠 HIGH
```

**Action:**
1. Rotate credential (revoke old token)
2. Remove from code today
3. Use environment variable
4. Deploy within 24 hours

---

### 🟡 MEDIUM
**Review and fix - within a week**

**What triggers it:**
- High-entropy strings (randomness > 4.5)
- Placeholder-like values that might be real
- Potential secrets (context-based detection)

**Example:**
```
const config = "xKj9mP2qL7nR4sT8vW3xY1zA5bC6dE0f";  // 🟡 MEDIUM (high entropy)
const token = "YOUR_API_KEY_HERE";                   // Usually ignored
```

**Action:**
1. Review: Is it a real secret? Check context
2. If real: Remove and use env variable
3. If test data: Document as false positive
4. Fix within the week

---

### 🔵 LOW
**Review when convenient**

**What triggers it:**
- Low-confidence detections
- Potential secrets with lower entropy
- Context-unclear strings

**Example:**
```
const simple = "TestPassword123";  // 🔵 LOW
```

**Action:**
1. Review if it's sensitive
2. Fix if needed (move to env)
3. Or ignore if it's test data

---

## Taking Action: Step by Step

### Step 1: Identify the Secret

```
Guardian Finding:
File: config.js, Line 42
Pattern: AWS Access Key ID
Severity: 🔴 CRITICAL
```

**Ask yourself:**
- What is this? (AWS key, database password, etc.)
- Is it real or a placeholder?
- Could it be exposed?

### Step 2: Check Severity

| Severity | Timeline | Criticality |
|----------|----------|-------------|
| 🔴 CRITICAL | Today | Immediate threat |
| 🟠 HIGH | 24 hours | High risk |
| 🟡 MEDIUM | This week | Medium risk |
| 🔵 LOW | When possible | Low risk |

### Step 3: Locate Origin

```bash
# Open the file
config.js:42

# View the secret
const apiKey = "AKIAIOSFODNN7EXAMPLE";

# Search for other instances
Ctrl+Shift+F → "AKIAIOSFODNN7EXAMPLE"
```

### Step 4: Remove & Replace

**BEFORE:**
```javascript
const apiKey = "AKIAIOSFODNN7EXAMPLE";
```

**AFTER:**
```javascript
const apiKey = process.env.AWS_ACCESS_KEY;
```

### Step 5: Add to .env

```bash
# .env (❌ NOT in Git!)
AWS_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
```

### Step 6: Add to .env.example

```bash
# .env.example (✅ In Git for reference)
AWS_ACCESS_KEY=your_aws_access_key_here
```

### Step 7: Update .gitignore

```bash
# .gitignore
.env
.env.local
secrets.json
*.key
```

### Step 8: Test

```bash
# Verify code works with env variable
npm start

# Run Guardian again
Ctrl+Shift+P → "Guardian: Scan Current File"

# Should see: ✅ Clean
```

### Step 9: Commit

```bash
git add .
git commit -m "fix: Remove hardcoded secrets, use environment variables"
git push
```

---

## Pattern Types Explained

### 1. Cloud Credentials 🌐

**AWS:**
- `AKIA*` - Access Key ID (🔴 CRITICAL)
- `ASIA*` - Temporary Security Credentials (🔴 CRITICAL)
- Pattern: `aws_secret_access_key = "..."` (🔴 CRITICAL)

**Azure:**
- Connection strings with passwords (🔴 CRITICAL)
- Storage account keys (🔴 CRITICAL)

**Google Cloud:**
- Service account keys (🔴 CRITICAL)
- API keys (🟠 HIGH)

### 2. Tokens 🎫

**GitHub:**
- `ghp_*` - Personal Access Token (🔴 CRITICAL)
- `ghs_*` - Server-to-server token (🔴 CRITICAL)
- `ghu_*` - User-to-server token (🔴 CRITICAL)

**GitLab:**
- `glpat-*` - Personal access token (🟠 HIGH)

### 3. Database Credentials 🗄️

**Connection Strings:**
```
postgresql://user:password@host:5432/db  (🔴 CRITICAL)
mongodb://admin:password@host:27017/db   (🔴 CRITICAL)
mysql://root:password@host:3306/db       (🔴 CRITICAL)
```

### 4. Payment Services 💳

**Stripe:**
- `sk_live_*` - Secret Live Key (🔴 CRITICAL)
- `rk_live_*` - Restricted Live Key (🟠 HIGH)
- `pk_live_*` - Publishable Live Key (Usually OK public)

### 5. Communication Services 💬

**Slack:**
- Webhook URL (🟠 HIGH)
- Bot Token (🟠 HIGH)

**Twilio:**
- Auth Token (🟠 HIGH)
- API Key (🟠 HIGH)

### 6. Private Keys 🔑

**Formats:**
```
-----BEGIN RSA PRIVATE KEY-----
-----BEGIN SSH PRIVATE KEY-----
-----BEGIN PGP PRIVATE KEY-----
```

**Severity:** 🔴 CRITICAL - Never hardcode!

### 7. Entropy-Based 📊

**Shannon Entropy:**
When a string has high randomness, Guardian flags it as potential secret.

```
"aaaaaaaaaaaaa" → Entropy: 0 → Not a secret ✓
"myPassword123" → Entropy: 3.5 → Maybe a secret
"xKj9mP2qL7nR" → Entropy: 5.2 → Likely a secret ⚠️
```

---

## DecisionFlows

### "Is This a Real Secret?"

```
Don't know? → YES (Assume real, be safe)
             ↓
Is it hardcoded? → YES
             ↓
Remove it now!
             ↓
Use .env instead
```

### "What if I Already Pushed It?"

```
Is it in Git history?
├─ NO (only local)
│  └─ Just fix and commit
├─ YES but not in public repo
│  └─ Clean history: git filter-repo
└─ YES and pushed to public repo
   ├─ ROTATE credential IMMEDIATELY
   ├─ Assume it's compromised
   └─ Clean history + force push
```

---

## FAQ

**Q: Can I ignore Medium findings?**
A: Review first to be sure. If it looks like a test value, you can document as false positive.

**Q: What if it's just a test/example?**
A: Move it to `.env.example` or `.env.test` instead.

**Q: Already pushed a secret to GitHub?**
A: Rotate credential IMMEDIATELY. GitHub may cache files, and historical commits can still be accessed.

**Q: How many secrets are too many?**
A: Any hardcoded secret is too many. Fix all of them.

**Q: Is environment variable storage safe?**
A: Much safer than hardcoded. For production, use secret management systems (AWS Secrets Manager, HashiCorp Vault, etc.).

---

## ✅ Checklist: Did I Fix It Correctly?

- [ ] Secret removed from code
- [ ] Replaced with `process.env.VARIABLE_NAME`
- [ ] Value added to `.env`
- [ ] Placeholder added to `.env.example`
- [ ] `.env` added to `.gitignore`
- [ ] Code tested and works
- [ ] Guardian scan shows clean
- [ ] Commit message is clear
- [ ] Pushed to repository
- [ ] Old credential rotated (if exposed)

---

**Remember:** Better to be safe than sorry. When in doubt, remove the hardcoded secret and use environment variables! 🛡️
