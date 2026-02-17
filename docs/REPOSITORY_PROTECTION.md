# Repository Protection Guide

## Overview
This document outlines the recommended security measures to protect the Guardian Secrets Scanner repository and ensure code quality.

## Branch Protection Setup

To set up branch protection on GitHub:

### 1. Enable Main Branch Protection
1. Go to Repository Settings → Branches
2. Click "Add a rule" under "Branch protection rules"
3. Set Pattern name to: `main`

### 2. Required Settings

#### Code Review
- ✅ **Require pull request reviews before merging**
  - Required number of approvals: 1
  - Dismiss stale pull request approvals when new commits are pushed: Yes
  - Require review from code owners: Yes

#### Status Checks
- ✅ **Require status checks to pass before merging**
  - GitHub Actions workflow (if configured)
  - Code quality checks

#### Security
- ✅ **Require branches to be up to date before merging**
- ✅ **Require code quality analysis before merging** (if SonarQube/CodeQL enabled)
- ✅ **Require deployment to succeed before merging** (optional)

#### Restrictions
- ✅ **Restrict who can push to matching branches**
  - Allow: Repository administrators only
- ✅ **Require linear history**
- ✅ **Require branches to be up to date before merging**
- ✅ **Include administrators** - Apply same rules to admins

## CODEOWNERS Protection

The `CODEOWNERS` file ensures that:
- All code changes require review from designated owner(s)
- Critical files cannot be modified without approval
- Accountability is traced in git history

**Files Protected**:
- `src/scanner.ts` - Core scanning engine
- `src/patterns.ts` - Secret patterns library
- `src/suppressionLogger.ts` - Audit logging
- `package.json` - Dependencies & publishing
- `tsconfig.json` - Compilation settings
- Security & documentation files

## Workflow Protection

### 1. Release Process
```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Commit changes
git add .
git commit -m "feat: description"

# 3. Create Pull Request on GitHub
# - Add detailed description
# - Link related issues
# - Add labels (bug/feature/security)

# 4. Wait for review & approval
# - Address review comments
# - Update code if needed

# 5. Merge to main
# - Merge PR after approval
# - Delete branch

# 6. Create release tag
git tag -a vX.Y.Z -m "Release vX.Y.Z - description"
git push origin vX.Y.Z

# 7. Publish to marketplace
vsce publish --packagePath guardian-secrets-scanner-X.Y.Z.vsix
```

### 2. Commit Message Standards

Follow conventional commits:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore, security

**Examples**:
```
feat(scanner): add new pattern for JWT tokens
fix(suppression): correct audit log timestamp
docs(readme): update installation instructions
security(patterns): validate input before regex matching
```

## Security Scanning

### Pre-commit Checks
- ✅ TypeScript strict compilation
- ✅ No secrets in code (via extension itself)
- ✅ No large files (>1 MB in source)
- ✅ No undefined imports

### Before Publishing
- ✅ All tests passing
- ✅ No console.log() statements
- ✅ .vscodeignore excludes sensitive files
- ✅ CHANGELOG updated
- ✅ Version bumped in package.json

### GitHub Security Features (Recommended)
1. **Enable Dependabot**
   - Automated dependency updates
   - Security vulnerability alerts

2. **Enable Code Scanning**
   - CodeQL analysis
   - SAST scanning

3. **Enable Secret Scanning**
   - Detects credentials in commits
   - Alerts on detected secrets

4. **Signed Commits** (optional)
   - GPG sign all commits
   - Verify commit authenticity

## Release Checklist

Before creating a release:

- [ ] All tests passing (`npm test`)
- [ ] Code compiles without errors (`npm run compile`)
- [ ] docs/CHANGELOG.md updated with version & changes
- [ ] package.json version bumped
- [ ] VSIX package created and verified
- [ ] No breaking changes without major version bump
- [ ] Documentation updated (README, USAGE, etc.)
- [ ] Git tag created: `v1.0.0`
- [ ] GitHub release created with VSIX attached
- [ ] VS Code marketplace publication verified

## Maintenance

### Regular Tasks
- **Weekly**: Review open issues and PRs
- **Monthly**: Update dependencies (security updates first)
- **Quarterly**: Review and update security policy
- **As needed**: Respond to user feedback and bug reports

### Versioning (Semantic Versioning)
- **MAJOR**: Breaking changes (e.g., 2.0.0)
- **MINOR**: New features, backwards compatible (e.g., 1.1.0)
- **PATCH**: Bug fixes only (e.g., 1.0.1)

## Team Collaboration

If adding team members:

1. **Add to CODEOWNERS** - Define code ownership
2. **Configure branch protection** - Require reviews
3. **Grant appropriate permissions**:
   - Write: Can push directly to branches
   - Maintain: Can manage releases
   - Admin: Full control (careful with this!)

## Questions?

Refer to the SECURITY.md for security-specific questions and vulnerabilities reporting.
