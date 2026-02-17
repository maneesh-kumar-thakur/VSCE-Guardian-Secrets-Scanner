# Guardian Secrets Scanner v1.0.0

🚀 **Production Release - Now on VS Code Marketplace!**

## Overview
Guardian Secrets Scanner is officially released on the VS Code Marketplace. This extension provides real-time, privacy-first secret detection with 40+ patterns covering major cloud providers, payment processors, and communication platforms.

## Key Features

### 🔐 40+ Detection Patterns
- **AWS**: Access Key, Secret Key, Session Token, Account ID
- **GitHub**: Personal Access Token, OAuth Token, App Token, Install Token
- **Stripe**: Secret Key, Publishable Key, Restricted API Key
- **Slack**: Bot Token, Incoming Webhook, User Token, App Token
- **Azure**: Connection String, Account Key, Service Principal
- **Google Cloud**: Service Account JSON, API Key
- **SendGrid, Mailchimp, Twilio, Auth0, GitLab, Bitbucket** and 20+ more

### ⚡ Smart Detection Engine
- Real-time scanning on file save and open
- Entropy analysis for high-entropy strings (>4.5 bits)
- Context-aware pattern matching
- False positive reduction with intelligent filtering
- Line number precision in findings

### 🎨 Developer Experience
- **Visual Dashboard**: Color-coded by severity (Critical/High/Medium)
- **Tree View**: Organized findings with quick access
- **Suppression System**: Suppress findings with reasons
- **Audit Logging**: Track all suppressions (who/when/why/where)
- **Export**: CSV and Markdown report generation
- **No Data Collection**: 100% local processing - privacy guaranteed

### 👥 Team Security
- **Git Pre-commit Hooks**: Prevent secrets from reaching repository
- **Suppression Audit Trail**: Full accountability trail
- **Custom Suppression Rules**: Project-specific overrides
- **Batch Operations**: Review and suppress multiple findings
- **Report Generation**: Statistics by user, project, date

### 🏢 Enterprise Ready
- Privacy-first architecture (no external services)
- OWASP compliance for secret detection
- MIT Licensed (open source, use commercially)
- No dependencies (lightweight - 1.29 MB)
- TypeScript strict mode for reliability

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Guardian Secrets Scanner"
4. Click Install

**Marketplace Link**: [Guardian Secrets Scanner](https://marketplace.visualstudio.com/items?itemName=mt-vsce-guardian-publisher.guardian-secret-scanner)

## Quick Start

1. **Scan a Project**: Open any workspace with source code
   - Automatic scanning starts on file open/save
   
2. **View Findings**: Open the Guardian panel in the sidebar
   - Click any finding to navigate to the exact line
   
3. **Suppress False Positives**: Right-click findings
   - Suppress with a reason for audit tracking
   
4. **Generate Reports**: Use commands (Ctrl+Shift+P):
   - `Guardian: View Suppression Report`
   - `Guardian: Export Suppressions as CSV`
   - `Guardian: Export Findings as Markdown`

## Commands Reference

| Command | Description |
|---------|-------------|
| `guardian.scan` | Run full workspace scan |
| `guardian.clearFindings` | Clear all findings |
| `guardian.viewDashboard` | Open visual findings dashboard |
| `guardian.openSettings` | Configure detection patterns |
| `guardian.suppress` | Suppress current finding |
| `guardian.unsuppress` | Unsuppress a finding |
| `guardian.reviewPending` | Review pending suppressions |
| `guardian.setupGitHook` | Install git pre-commit hook |
| `guardian.suppressionReport` | Generate suppression report |
| `guardian.exportFindings` | Export findings as markdown |
| `guardian.exportCSV` | Export findings as CSV |

## Documentation

- 📖 **[README](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner#readme)** - Full user guide
- 🔒 **[Security Policy](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/blob/main/SECURITY.md)** - Security considerations
- 📝 **[Usage Guide](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/blob/main/USAGE.md)** - Detailed features
- 🧪 **[Testing Guide](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/blob/main/TESTING.md)** - Test procedures
- ⚙️ **[Build Guide](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/blob/main/BUILD.md)** - Development setup

## Technical Details

### Release Package
- **File**: `guardian-secrets-scanner-1.0.0.vsix` (1.29 MB)
- **Modules**: 9 compiled TypeScript modules
- **Platform**: VS Code 1.90+
- **Node**: ES2020 compatible
- **Size**: Optimized with icon/dependencies included

### Compilation
- TypeScript strict mode enabled
- All tests passing ✅
- No compilation warnings
- Production ready

### Privacy & Security
- ✅ No telemetry or data collection
- ✅ No external API calls
- ✅ All processing local to your machine
- ✅ Suppressions stored locally in workspace
- ✅ Audit logs in readable JSON format

## Version History

### v1.0.0 - Production Release
- Initial marketplace release
- 40+ secret detection patterns
- Suppression & audit logging system
- Dashboard and tree view UI
- Git pre-commit integration
- CSV/Markdown export
- Full documentation

## Support & Feedback

- 📧 Report issues on [GitHub Issues](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/issues)
- 💬 Suggest features on [GitHub Discussions](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/discussions)
- ⭐ Star on [GitHub](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner) to show support

## License

MIT License - Use freely in personal and commercial projects.

---

**Stay Secure! 🔒** Let Guardian watch over your code for secrets.
