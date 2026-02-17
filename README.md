# 🛡️ Guardian - Secrets Scanner for VS Code

> **SECURITY FIRST · PRIVACY PROTECTED · ZERO TRUST**

**Advanced security extension that detects passwords, API keys, tokens, and sensitive data in code, configuration, and text files with entropy analysis and custom pattern detection.**

---

## 🔒 Our Core Principles

### SECURITY FIRST
Guardian was built from the ground up with a **security-first philosophy**. We don't just detect secrets—we prevent them from ever reaching your repository through multiple layers of defense:

- **🛡️ Multi-Layer Defense**: Real-time scanning → IDE diagnostics → Pre-commit blocking (with hook installed)
- **🚨 Zero-Tolerance for Critical Secrets** (when pre-commit hook enabled): AWS keys, private keys, and database passwords automatically block commits
- **⚡ Shift-Left Security**: Catch secrets **before** they're committed, not after they're exposed
- **🎯 Proactive, Not Reactive**: Built-in prevention mechanisms, not just detection

### PRIVACY BY DESIGN
Your code and data privacy is **non-negotiable**:

- **🔐 100% Local Processing**: All scanning happens on your machine—nothing is ever sent to external servers
- **🚫 Zero Telemetry**: We don't collect, transmit, or store any of your code or findings
- **🎭 Secret Masking**: All detected secrets are automatically masked in UI and logs (e.g., `AKIA****MPLE`)
- **📜 Open Source**: Complete transparency—audit our code yourself
- **🏠 Your Data Stays Yours**: No cloud dependencies, no API calls, no data leakage

### RESPONSIBILITY & COMPLIANCE
We take our responsibility seriously:

- **✅ Compliance Support**: Helps support SOC 2, PCI DSS, GDPR, and HIPAA requirements (see Compliance Support section for details)
- **📊 Audit Trail**: Detailed reports and logs for security audits
- **👥 Team Protection**: Shared security standards across your organization
- **📚 Security Education**: Comprehensive documentation and best practices

---

## 🚀 Key Features

### What Makes Guardian Different?

1. **Entropy Analysis** - Uses Shannon entropy calculation to detect high-randomness strings that traditional pattern matching might miss
2. **Multi-Language Support** - Scans code files (.js, .ts, .py, .go, etc.), config files (.env, .yaml, etc.), and text files
3. **Context Preservation** - Includes surrounding code context with each finding for manual review
4. **Real-Time Scanning** - Automatically scans files on save (enabled by default); on-open scanning available (disabled by default)
5. **Comprehensive Pattern Library** - Detects 40+ types of secrets including:
   - Cloud credentials (AWS, Azure, GCP)
   - API keys and tokens
   - Database connection strings
   - Private cryptographic keys
   - Payment service credentials
   - Source control tokens
   - And many more...

6. **Custom Pattern Support** - Add your own regex patterns for organization-specific secrets
7. **False Positive Suppression** - Mark findings as false positives with justification; manage suppressions easily
8. **Security Dashboard** - Visual dashboard showing security overview and findings summary
9. **Export to Markdown or CSV** - Export reports for external analysis and compliance
10. **Severity-Based Filtering** - Focus on critical issues first
11. **Git Commit Blocking** - Pre-commit hooks (when installed) to prevent secrets from being committed

## 📦 Installation

### From VSIX
1. Download the `.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Install from VSIX"
5. Select the downloaded file

### From Source
```bash
git clone https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner.git
cd VSCE-Guardian-Secrets-Scanner
npm install
npm run compile
# Press F5 in VS Code to debug
```

## 🎯 Usage

### Commands

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and search for:

- **Guardian: Scan Entire Workspace** - Scan all files in your workspace
- **Guardian: Scan Current File** - Scan only the active file
- **Guardian: Show Security Dashboard** - Open the visual security dashboard
- **Guardian: Clear All Findings** - Clear all detected findings
- **Guardian: Export Security Report** - Export findings as Markdown or CSV
- **Guardian: Add Custom Pattern** - Add organization-specific detection patterns
- **Guardian: Install Pre-commit Hook** - Block commits containing secrets
- **Guardian: Scan Staged Files** - Check files before committing
- **Guardian: View Suppression Report** - See audit of all suppressions
- **Guardian: Open Settings** - Configure Guardian options

### Activity Bar

Click the **Guardian Shield** icon in the Activity Bar to see:
- Security findings grouped by severity
- Statistics and overview
- Quick navigation to issues

### Status Bar

The bottom status bar shows real-time security status:
- 🛡️ **Guardian: Clean** - No issues detected
- ⚠️ **Guardian: X Critical** - Critical issues found
- ℹ️ **Guardian: X** - Lower severity issues

## ⚙️ Configuration

Guardian provides an intuitive settings UI for easy configuration.

### Opening Settings

**Option 1: Via Command Palette**
```
Ctrl+Shift+P (or Cmd+Shift+P on Mac)
→ "Guardian: Show Settings"
```

**Option 2: Via Dashboard**
- Click the **Settings** button on the Guardian Security Dashboard

**Option 3: Via Standard Settings** 
```
Ctrl+, (or Cmd+, on Mac)
→ Search for "Guardian"
```

### Settings Categories

#### 🔍 Detection Settings
- **Entropy Analysis** - Detect secrets by analyzing character randomness (enabled by default)
- **Entropy Threshold** - Configure sensitivity (3.0 = catch more, 6.0 = strict, default 4.5)
- **Minimum Severity Level** - Only report Critical, High, Medium, or Low severity findings

#### 📁 Scanning Settings
- **Exclude Patterns** - Folders to skip (node_modules, dist, build, .git by default)
- **Scan On Save** - Enable automatic scanning when files are saved (default: true)
- **Scan On Open** - Enable automatic scanning when files are opened (default: false)

#### 🎯 Custom Patterns
- Add your own regex patterns for organization-specific secrets
- Useful for detecting company-specific API key formats or internal tokens

#### 🔐 Git Security Settings
- **Block Critical Secrets** - Prevent commits with critical secrets (default: enabled when hook is installed)
- **Block High Severity** - Optionally block high severity secrets too
- **Auto-scan Staged** - Automatically scan staged files before each commit

### Advanced Configuration (settings.json)

You can also edit settings directly in `settings.json`:

```json
{
  // Detection
  "guardian.enableEntropyAnalysis": true,
  "guardian.entropyThreshold": 4.5,
  "guardian.severityLevel": "medium",
  
  // Scanning
  "guardian.scanOnSave": true,
  "guardian.scanOnOpen": false,
  "guardian.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**"
  ],
  
  // Custom patterns
  "guardian.customPatterns": [],
  
  // Git integration
  "guardian.git.blockOnCritical": true,
  "guardian.git.blockOnHigh": false,
  "guardian.git.autoScanStaged": false
}
```

## 🔍 Detection Categories

Guardian detects secrets in the following categories:

### Cloud Credentials
- AWS Access Keys, Secret Keys, Session Tokens
- Google Cloud API Keys, Service Accounts, OAuth
- Azure Storage Keys, Client Secrets

### API Keys & Tokens
- Generic API keys
- Bearer tokens
- Authorization headers
- JSON Web Tokens (JWT)

### Source Control
- GitHub Personal Access Tokens, OAuth, App Tokens
- GitLab Personal Access Tokens

### Database
- Connection strings (MongoDB, MySQL, PostgreSQL)
- Database passwords

### Cryptographic Keys
- RSA Private Keys
- SSH Private Keys
- PGP Private Keys

### Payment Services
- Stripe API Keys
- PayPal/Braintree Tokens

### Communication
- Slack Tokens and Webhooks
- Twilio API Keys

### Email Services
- SendGrid API Keys
- Mailgun API Keys
- Mailchimp API Keys

### Package Managers
- NPM Tokens
- PyPI API Tokens

### Generic Secrets
- Passwords in code
- Secret keys
- High-entropy strings near sensitive keywords

## 🧮 Entropy Analysis

Guardian uses **Shannon entropy** to detect potential secrets that don't match known patterns:

```
Entropy = -Σ(p(x) * log₂(p(x)))
```

- **Low entropy** (~2.0): "aaaaaaa" or "1111111"
- **Medium entropy** (~3.5): "password123"
- **High entropy** (~4.5+): "K7x9Mq2Wp5Nz8Rt3" ← Likely a secret!

Strings with high entropy (randomness) + variety of character types are flagged as potential secrets.

## 📊 Security Dashboard

The visual dashboard provides:
- **Statistics**: Count of findings by severity and category
- **Overview**: Quick view of security status
- **Navigation**: Click findings to jump to exact locations in code
- **Filtering**: Focus on specific severity levels or types

## 🛡️ Best Practices

### Git Commit Protection

**Install Pre-commit Hook**:
```bash
# Via Command Palette
Ctrl+Shift+P → "Guardian: Install Pre-commit Hook"
```

This automatically blocks commits containing secrets:
- ✅ Critical secrets → Commit blocked
- ⚠️ High secrets → Warning (configurable)
- ℹ️ Medium/Low → Info only

**Manual Verification**:
```bash
# Before committing
Ctrl+Shift+P → "Guardian: Scan Staged Files"
```

See [GIT_BLOCKING_STRATEGY.md](GIT_BLOCKING_STRATEGY.md) for complete details.

### Prevention
1. **Use Environment Variables**: Store secrets in `.env` files (add to `.gitignore`)
2. **Secret Management**: Use AWS Secrets Manager, HashiCorp Vault, or similar
3. **Pre-commit Hooks**: Add Guardian to pre-commit to prevent secrets from being committed
4. **Regular Scans**: Schedule periodic workspace scans

### Remediation
If Guardian finds secrets:

1. **Critical/High Severity**:
   - ✅ Immediately rotate the credential
   - ✅ Review access logs for unauthorized use
   - ✅ Remove from repository history (use `git-filter-repo`)
   - ✅ Update all systems using the credential

2. **Medium/Low Severity**:
   - ✅ Review if it's a real secret or false positive
   - ✅ Move to environment variables or secret manager
   - ✅ Update `.gitignore` to prevent future commits

### Managing False Positives

Guardian provides a **comprehensive suppression system with audit tracking**:

**Suppress a Finding**:
```bash
# Via Tree View (Recommended)
Right-click finding in Guardian Security sidebar 
→ "Suppress Finding (Mark as False Positive)"

# Via Command Palette
Ctrl+Shift+P → "Guardian: Suppress Finding"
```
- Provide a reason (e.g., "Mock AWS key for unit tests")
- Suppression is stored with your username and timestamp
- Automatically logged to audit trail

**View All Suppressions**:
```bash
Ctrl+Shift+P → "Guardian: View Suppressed Findings"
```
- See all suppressed findings with reasons
- Option to view the file
- Option to unsuppress findings

**Audit & Compliance**:
```bash
# View suppression statistics and history
Ctrl+Shift+P → "Guardian: View Suppression Report"

# Review suppressions pending >30 days
Ctrl+Shift+P → "Guardian: Review Pending Suppressions"

# Export findings for external tools
Ctrl+Shift+P → "Guardian: Export Security Report"
```

**Storage & Audit Trail**:
- ✅ **Working storage**: `.vscode/guardian-suppressions.json` (workspace-local)
- ✅ **Audit log**: `SUPPRESSIONS_AUDIT.md` (git-trackable)
- ✅ **Metadata**: File path, line number, pattern, reason, timestamp, username
- ✅ **History**: Complete record of all suppress/unsuppress/review actions

**For Team & Compliance**:
- Commit `SUPPRESSIONS_AUDIT.md` to enable team visibility
- All suppressions tied to username for accountability
- Historical audit trail for security reviews
- See [SUPPRESSION_AUDIT_GUIDE.md](SUPPRESSION_AUDIT_GUIDE.md) for full details

## 🎨 Custom Patterns

Add organization-specific patterns:

```typescript
// Example: Detect custom API key format
{
  "name": "Acme Corp API Key",
  "pattern": "ACME_[A-Z]{4}_[0-9a-f]{32}",
  "severity": "critical",
  "description": "Acme Corp API key detected",
  "flags": "gi"
}
```

## 📈 Performance

- **Fast Scanning**: Uses optimized regex patterns
- **Smart Exclusions**: Automatically skips node_modules, dist, etc.
- **Incremental**: Scan-on-save only checks modified files
- **Configurable**: Control what gets scanned

## 🤝 Contributing

Contributions welcome! Please submit PRs for:
- New secret patterns
- Performance improvements
- UI/UX enhancements
- Documentation

## 📄 License

MIT License - See LICENSE file for details

## 🧪 Testing

Guardian includes comprehensive unit tests covering:
- Pattern detection accuracy
- Entropy calculation
- Scanner functionality
- Git integration

```bash
# Run tests
npm install
npm test
```

See [TESTING.md](TESTING.md) for detailed testing documentation.

## 🔒 Security & Privacy Guarantees

### What We Protect

**Your Code**:
- ✅ Never leaves your machine
- ✅ Never sent to external servers
- ✅ Never logged or stored remotely
- ✅ Never used for training or analysis

**Your Secrets**:
- ✅ Masked in all UI displays
- ✅ Masked in all log files
- ✅ Masked in exported reports
- ✅ Never exposed in error messages

**Your Privacy**:
- ✅ No user tracking
- ✅ No analytics collection
- ✅ No phone-home functionality
- ✅ No internet connectivity required

### Security Architecture

```
┌─────────────────────────────────────────┐
│  Your VS Code (Local Environment)      │
│                                         │
│  ┌───────────────────────────────┐    │
│  │ Guardian Extension            │    │
│  │                               │    │
│  │ • Scans locally               │    │
│  │ • Processes in-memory         │    │
│  │ • No network calls            │    │
│  │ • No external dependencies    │    │
│  └───────────────────────────────┘    │
│                                         │
│  ┌───────────────────────────────┐    │
│  │ Your Files                    │    │
│  │ (Never sent externally)       │    │
│  └───────────────────────────────┘    │
└─────────────────────────────────────────┘
         ↓
    Results stay local
         ↓
    You control everything
```

### Compliance Support

Guardian can **support your compliance efforts** for security frameworks:

**SOC 2 Type II**:
- Provides evidence of secret detection controls
- Generates audit trails of security scans
- Supports documented remediation processes
- *Note: Guardian is ONE control among many required for SOC 2 certification*

**PCI DSS**:
- Helps prevent credit card data in code
- Protects payment service credentials
- Supports secure development practices
- *Note: Guardian supports PCI DSS Requirement 6.2 (secure coding practices)*

**GDPR**:
- Helps prevent PII exposure in code
- Local data processing only (no cross-border transfer)
- No telemetry or data collection
- *Note: Guardian supports privacy by design, not GDPR certification*

**HIPAA**:
- Helps protect health data by preventing exposure in code
- Supports secure credential management
- Provides audit trail documentation
- *Note: HIPAA compliance requires comprehensive controls beyond Guardian*

**Important**: Use Guardian as part of a comprehensive compliance strategy. Guardian alone does NOT guarantee compliance - consult with your compliance/security teams for full requirements.

### Security Certifications

- ✅ No external API dependencies
- ✅ No telemetry or tracking
- ✅ Completely offline operation
- ✅ Open source for security audits
- ✅ No third-party data sharing

### Trust Model

**Zero Trust Architecture**:
1. Trust nothing by default
2. Verify everything locally
3. Assume breach (multi-layer defense)
4. Minimize blast radius (block before commit)
5. Continuous verification (real-time scanning)

Guardian helps you find secrets, but **never** becomes a vulnerability itself.

## 🛡️ Security Best Practices

Guardian is a **security tool**, not a security risk. Use it to:

- ✅ Prevent credential exposure
- ✅ Meet compliance requirements  
- ✅ Educate developers on security
- ✅ Build security-first culture

Always combine Guardian with:
- Secret management tools (AWS Secrets Manager, Vault)
- Code review processes
- Security training
- Incident response plans

**Remember**: No tool is perfect. Use Guardian as part of a comprehensive security strategy.

## ⚠️ Disclaimer

While Guardian is comprehensive, no automated tool catches 100% of secrets. Always:
- Review code manually for sensitive data
- Use proper secret management practices
- Follow your organization's security policies

## 📞 Support

### Getting Help

- **Documentation**: 
  - [README](README.md) - Feature overview (this file)
  - [Usage Guide](USAGE.md) - Complete usage instructions
  - [Security Policy](SECURITY.md) - Security vulnerabilities & reporting
  - [Testing Guide](TESTING.md) - Testing and validation
  - [Build Guide](BUILD.md) - Development and building

- **Report Bugs**: [GitHub Issues](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/issues)
  - Include Guardian version, VS Code version, file type
  - Provide minimal reproduction steps
  - Do NOT include actual secrets in bug reports

- **Feature Requests**: [GitHub Issues](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/issues) with `enhancement` label
  - Describe the use case
  - Explain how it improves security

- **Questions & Discussions**: [GitHub Discussions](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/discussions)
  - Ask questions about usage
  - Share tips and best practices

### Security Reporting

**IMPORTANT**: If you discover a vulnerability IN Guardian itself:

1. **Do NOT** open a public GitHub issue
2. Email security details to: [maneeshkumar.thakur@outlook.com](mailto:maneeshkumar.thakur@outlook.com)
3. Include description, reproduction steps, and potential impact
4. Allow 48 hours for acknowledgment
5. **Alternative**: Use [GitHub Security Advisory](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/security)

### Quick Troubleshooting

**Guardian not detecting secrets?**
- Verify `guardian.scanOnSave` is enabled in settings
- Check file type is supported (JavaScript, Python, Go, Java, TypeScript, etc.)
- Try manual scan: `Ctrl+Shift+P` → "Guardian: Scan Entire Workspace"
- Review entropy threshold setting

**Too many false positives?**
- Increase `guardian.entropyThreshold` (higher = stricter detection)
- Suppress findings with reasons for team visibility
- See [USAGE.md](USAGE.md) for detailed suppression options

**Pre-commit hook issues?**
- Verify Git is initialized in workspace
- Run: `Ctrl+Shift+P` → "Guardian: Install Pre-commit Hook"
- Check `.git/hooks/pre-commit` file permissions
- Verify hook is executable: `chmod +x .git/hooks/pre-commit`

**Performance concerns?**
- Disable `guardian.scanOnOpen` (only scans on save by default)
- Expand `guardian.excludePatterns` for large folders
- Use `guardian.severityLevel` to focus on critical issues

---

**Made with 🛡️ for developers who care about security**

**"Security First. Privacy Always. Trust Never."** - The Guardian Way
