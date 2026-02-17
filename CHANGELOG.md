# Changelog

All notable changes to the Guardian Secrets Scanner extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-17

### Added
- **False Positive Suppression System** - Mark findings as false positives and manage suppressions
  - Suppress individual findings with human-readable reason
  - View suppressed findings with filtering and unsuppress options
  - Suppressions stored in `.vscode/guardian-suppressions.json` (persists across sessions)
  - Commands: `Guardian: Suppress Finding` and `Guardian: View Suppressed Findings`
  - Suppression metadata includes: file path, line number, pattern, reason, timestamp
  - Statistics tracking for suppressed findings by severity

## [1.1.0] - 2026-02-17

### Added
- **Custom Light-Themed Settings UI** - Intuitive settings interface matching the dashboard
  - Organized into 4 main sections: Detection, Scanning, Custom Patterns, Git Security
  - Interactive controls: checkboxes, sliders, array inputs, severity selector
  - Real-time inline help and descriptions
  - Global VS Code configuration persistence

### Improved
- **UI Animations and Polish** - Smooth transitions and visual feedback
  - Cascading animations for settings sections
  - Enhanced hover states with better shadows
  - Cubic-bezier transitions for smoother motion
  - Better button feedback and visual hierarchy

### Improved
- **Dashboard Text Contrast** - Fixed all gray text issues for better readability on light backgrounds
- **Documentation** - Updated all user-facing docs with new settings UI instructions

## [1.0.0] - 2026-02-17

### Added
- **Initial Release** of Guardian Secrets Scanner for VS Code
- **40+ Secret Detection Patterns** including:
  - AWS credentials (Access Keys, Secret Keys, Session Tokens)
  - Cloud provider secrets (Azure, Google Cloud, Alibaba)
  - API keys and tokens (Generic, Bearer, JWT)
  - Database credentials (MongoDB, MySQL, PostgreSQL, Redis)
  - Private cryptographic keys (RSA, SSH, PGP)
  - Payment service credentials (Stripe, PayPal, Square)
  - Communication service tokens (Slack, Twilio, Discord)
  - Email service keys (SendGrid, Mailgun, Mailchimp)
  - Package manager tokens (NPM, PyPI, Gem, Maven)
  - Source control tokens (GitHub, GitLab, Bitbucket)
  - And many more...

- **Shannon Entropy Analysis** for detecting high-randomness strings that pattern matching might miss
- **Real-Time Scanning** on file save (enabled by default)
- **Context-Aware Detection** to reduce false positives
- **Security Dashboard** with beautiful visual findings display
- **Git Pre-Commit Integration** to block commits containing secrets
- **Custom Pattern Support** for organization-specific secret formats
- **Multiple Export Formats** (JSON, Markdown, CSV) for reports
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
