# Changelog

All notable changes to the Guardian Secrets Scanner extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-17

### ✨ Initial Public Release

**Guardian Secrets Scanner v1.0.0** - Professional-grade secrets detection for VS Code with comprehensive security features, audit logging, and false positive management.

### 🔍 Core Scanning Features
- **Advanced Secret Detection**: 36 patterns for detecting passwords, API keys, tokens, and sensitive data
  - Cloud credentials (AWS, Azure, Google Cloud, Alibaba)
  - API keys and bearer tokens (Generic, JWT, OAuth)
  - Database credentials (MongoDB, MySQL, PostgreSQL, Redis, SQL Server)
  - Private cryptographic keys (RSA, SSH, PGP, EC, DSA)
  - Payment service credentials (Stripe, PayPal, Square, Twilio)
  - Communication tokens (Slack, Discord, TeamSpeak)
  - AWS, Azure, GCP tokens, keys, and connection strings
  
- **Entropy-Based Detection**: Shannon entropy calculation to identify high-randomness strings
- **Multi-File Type Support**: Scans code files, configs, environment files, scripts, and text files
- **Real-Time Scanning**: Automatic scanning on file save and optional scanning on file open
- **In-Editor Diagnostics**: Real-time inline security warnings with severity levels

### 🎨 User Interface
- **Security Dashboard**: Visual overview of findings with severity grouping
  - Real-time summary statistics (critical, high, medium, low)
  - Grouped findings by severity and file
  - One-click actions and detailed context
  - Smooth animations and professional styling
  
- **Settings UI**: Intuitive light-themed configuration interface
  - Detection strategies and pattern configuration
  - Scanning behavior and performance tuning
  - Custom pattern management
  - Git integration settings
  
- **Tree View Integration**: Security findings organized in VS Code sidebar
  - Hierarchical organization by severity and file
  - Quick navigation to source locations
  - Context menu for actions

### 🔐 False Positive Management
- **Suppression System**: Mark findings as false positives with audit trail
  - Tree view context menu: Right-click → "Suppress Finding"
  - Command palette: `Guardian: Suppress Finding`
  - Human-readable reason entry
  - Persistent, workspace-specific suppression rules
  
- **Comprehensive Audit Logging**
  - `SUPPRESSIONS_AUDIT.md`: Git-trackable audit trail with all suppressions
  - `SUPPRESSIONS.log`: Structured JSON log with full metadata
  - Automatic user tracking (auto-detected from environment)
  - Timestamp tracking (date, time, epoch)
  - Project name and machine hostname logging
  
- **Suppression Management Commands**
  - View Suppressed Findings: Browse and manage all suppressions
  - Suppression Report: Statistics by user, file, and severity
  - Review Pending: Alert for suppressions older than 30 days
  - View Suppression Log: Formatted markdown report with activity history

### 🔗 Git Integration
- **Pre-Commit Hook**: Automatically block commits containing secrets
  - Critical findings: Hard block
  - High findings: Configurable (warn or block)
  - Medium/Low: Info only
  
- **Staged File Scanning**: `Guardian: Scan Staged Files` command
  - Check for secrets before committing
  - Works with git staging workflow
  
- **Git Ignore Management**: `Guardian: Add Secret Patterns to .gitignore`

### ⚙️ Configuration
- **Guardian Settings**: Full control over scanning behavior
  - `guardian.scanOnSave`: Real-time scanning (default: true)
  - `guardian.scanOnOpen`: Scan when opening files (default: false)
  - `guardian.enableEntropyAnalysis`: Use entropy detection (default: true)
  - `guardian.minEntropyScore`: Minimum entropy threshold (default: 3.5)
  - Pre-commit hook integration with severity-based blocking
  - Custom pattern definition and management
  
- **Command Palette Integration**: 20+ commands for all operations
  - Scanning, reporting, configuration, and management commands
  - Settings access and installation commands

### 📊 Reporting & Analysis
- **Security Reports**: Export findings as structured reports
  - `Guardian: Export Security Report` command
  - Markdown format with severity breakdown
  - Remediation guidance included
  
- **Suppression Analytics**
  - Summary statistics (total, by action type)
  - Activity breakdown by user and project
  - Recent activity table
  - Export to CSV for external analysis

### 📚 Documentation
- **Comprehensive Documentation**
  - README.md: Features, setup, and quick start
  - USAGE.md: Detailed usage guide and configuration
  - SUPPRESSION_AUDIT_GUIDE.md: Audit logging and compliance
  - TEST_SUPPRESSION.md: Testing guide with examples
  - REPOSITORY_PROTECTION.md: Branch protection and release guidelines
  - REMEDIATION.md: Fix guidance for detected secrets
  - BUILD.md: Development setup

### 🛡️ Security & Privacy
- **100% Local Processing**: All scanning happens on your machine
- **Zero Telemetry**: No data collection or transmission
- **Open Source**: Complete transparency and auditability
- **Privacy by Design**: Secret masking in logs and UI

### ✅ Quality Assurance
- TypeScript with strict compilation
- Unit tests for core functionality
- Professional error handling
- Performance optimized for large codebases

## [1.0.0-beta] - Previous Development
- All features from development builds
- Ready for public release
  - Email service keys (SendGrid, Mailgun, Mailchimp)
  - Package manager tokens (NPM, PyPI, Gem, Maven)
  - Source control tokens (GitHub, GitLab, Bitbucket)
  - And many more...

- **Shannon Entropy Analysis** for detecting high-randomness strings that pattern matching might miss
- **Real-Time Scanning** on file save (enabled by default)
- **Multi-Pattern Detection** with entropy analysis to reduce false positives
- **Security Dashboard** with beautiful visual findings display
- **Git Pre-Commit Integration** to block commits containing secrets
- **Custom Pattern Support** for organization-specific secret formats
- **Multiple Export Formats** (Markdown, CSV) for reports
- **Severity-Based Filtering** (Critical, High, Medium, Low)
- **Activity Bar Integration** with findings tree view
- **Status Bar Updates** showing real-time security status

### Features
- **Multi-File Type Support**: Scans code, config files, env files, scripts, and text files
- **Configurable Settings**:
  - Entropy threshold adjustment (3.0-6.0)
  - Minimum severity level filtering
  - File exclusion patterns
  - On-save and on-open scanning options
  - Binary file scanning (optional)
  - Git security settings (block critical/high severity, auto-scan staged)
- **False Positive Management** with built-in filters
- **Quick Fix Suggestions** for each detected secret with remediation guidance
- **Performance Optimized**:
  - Incremental scanning
  - Smart exclusions (node_modules, dist, build, .git)
  - Efficient regex patterns

### Security & Privacy
- **100% Local Processing**: All scanning happens on your machine
- **Zero Telemetry**: No data collection or transmission
- **No External Dependencies**: No external API calls required
- **Open Source**: Complete code transparency for security audits
- **Secret Masking**: All detected secrets masked in UI and logs (e.g., AKIA****MPLE)
- **Zero Trust Architecture**: Multi-layer defense approach

### Documentation
- **Comprehensive README** with installation and usage instructions

- **Complete Usage Guide** covering all features and commands
- **Best Practices Documentation** for secure coding and privacy
- **Security & Privacy Guarantees** clearly outlined
- **Testing Guide** with examples and test infrastructure
- **Build Guide** for development and debugging
- **Compliance Information** for SOC 2, PCI DSS, GDPR, HIPAA

### Code Quality
- **Full TypeScript** with strict type checking
- **SonarQube Grade A** - Production ready
- **50+ Unit Tests** covering core functionality
- **ESLint Configuration** enforcing code standards
- **Zero Vulnerabilities** in security audit

### Commands Available
- Guardian: Scan Entire Workspace
- Guardian: Scan Current File
- Guardian: Show Security Dashboard
- Guardian: Clear All Findings
- Guardian: Export Security Report
- Guardian: Add Custom Pattern
- Guardian: Install Pre-commit Hook
- Guardian: Uninstall Pre-commit Hook
- Guardian: Scan Staged Files
- Guardian: Add Secret Patterns to .gitignore

### Known Limitations
- Binary file scanning is basic pattern matching (see configuration for details)
- Real-time scanning on large workspaces may have minor impact on IDE responsiveness
- Some dynamically generated secrets may not be detected (no data flow analysis)
- Custom patterns require valid regular expression syntax

### Future Roadmap
- v1.1.0: AI-powered pattern suggestions
- v1.2.0: Improved false positive filtering with ML
- v1.3.0: VS Code Remote Container support
- v2.0.0: Plugin architecture for custom scanners

### Contributors
- Maneesh Thakur - Initial development and design

### License
MIT License - See LICENSE file for details

---

## Support

- **Documentation**: See [USAGE.md](USAGE.md) and [docs/](docs/) folder
- **Issues**: Report bugs on [GitHub Issues](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/issues)
- **Security Vulnerabilities**: Email security@example.com (do not open public issues)
- **Questions**: Use [GitHub Discussions](https://github.com/Maneesh-Relanto/VSCE-Guardian-Secrets-Scanner/discussions)

---

**Made with 🛡️ for developers who care about security**

"Security First. Privacy Always. Trust Never." - The Guardian Way
