# Quick Start & Build Guide

## For End Users

### Installation

1. **From VSIX Package**:
   ```bash
   # Download the .vsix file
   # In VS Code:
   # - Press Ctrl+Shift+P
   # - Type "Extensions: Install from VSIX"
   # - Select the downloaded file
   ```

2. **From VS Code Marketplace** (when published):
   ```bash
   # Search for "Guardian Secrets Scanner" in Extensions
   # Click Install
   ```

### First-Time Setup

1. Open your project in VS Code
2. Look for the 🛡️ shield icon in the Activity Bar (left sidebar)
3. Run your first scan:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Guardian: Scan Entire Workspace"
   - Press Enter

4. Review findings in the Guardian panel

### Quick Configuration

Press `Ctrl+,` and search for "Guardian" to configure:

**Recommended Settings for New Users**:
```json
{
  "guardian.scanOnSave": true,
  "guardian.entropyThreshold": 4.5,
  "guardian.severityLevel": "medium",
  "guardian.enableEntropyAnalysis": true
}
```

## For Developers

### Prerequisites

- Node.js 18+ and npm
- VS Code 1.85.0+
- TypeScript 5.3+

### Building from Source

```bash
# 1. Clone the repository
git clone <repository-url>
cd guardian-secrets-scanner

# 2. Install dependencies
npm install

# 3. Compile TypeScript
npm run compile

# 4. Open in VS Code
code .

# 5. Press F5 to start debugging
```

### Development Workflow

```bash
# Watch mode (auto-compile on file changes)
npm run watch

# In VS Code:
# - Press F5 to start Extension Development Host
# - Make changes to code
# - Press Ctrl+R in the new window to reload
```

### Project Structure

```
src/
├── extension.ts       # Main entry point
├── patterns.ts        # Secret detection patterns
├── scanner.ts         # Scanning engine
├── treeProvider.ts    # Activity bar tree view
└── dashboard.ts       # Webview dashboard
```

### Adding New Patterns

Edit `src/patterns.ts` and add to patterns array:

```typescript
{
  name: 'My Custom Secret',
  pattern: /my-pattern-here/gi,
  severity: 'critical',
  description: 'Description',
  category: 'Category Name'
}
```

Then recompile:
```bash
npm run compile
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run watch
```

### Building VSIX Package

```bash
# 1. Install vsce (VS Code Extension CLI)
npm install -g @vscode/vsce

# 2. Package the extension
vsce package

# Creates: guardian-secrets-scanner-1.0.0.vsix

# 3. Test the package
code --install-extension guardian-secrets-scanner-1.0.0.vsix
```

### Publishing to VS Code Marketplace

```bash
# 1. Create publisher account at: marketplace.visualstudio.com/manage
# 2. Get Personal Access Token
# 3. Login
vsce login <publisher-name>

# 4. Publish
vsce publish
```

### Debugging

**Set breakpoints** in TypeScript files and press F5

**Debug Webview**:
- Open dashboard
- Press Ctrl+Shift+I
- Use Chrome DevTools

**View Extension Logs**:
- Help → Toggle Developer Tools
- Console tab

---

Happy coding! 🛡️
