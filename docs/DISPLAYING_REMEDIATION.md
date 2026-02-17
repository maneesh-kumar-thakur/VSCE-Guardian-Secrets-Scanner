# Displaying Remediation Guidance to Users

## User Experience Flow

### When User Finds a Secret

```
Extension detects secret
    ↓
Red squiggle under code
    ↓
User clicks in tree view
    ↓
Options:
  1. Click "View Remediation" → Opens REMEDIATION.md
  2. Click "Understand This Finding" → Opens UNDERSTANDING_FINDINGS.md
  3. Hover → Shows quick tip
```

---

## 🎯 Implementation Strategy

### Strategy 1: Tree View Context Menu

**User Experience:**
```
TreeView shows:
├── 🔴 CRITICAL (2)
│   ├── 📄 config.js (Line 42)
│   │   ├── AWS Access Key ID
│   │   │   └── [Right-click menu]
│   │   │       ├── Open File
│   │   │       └── 📖 View Remediation
│   │   │       └── ❓ Understand Finding
```

**When user clicks "View Remediation":**
1. Opens `REMEDIATION.md` in new tab
2. Scrolls to relevant section (🔴 CRITICAL Severity Secrets)
3. User reads guide while code is visible in another tab
4. Follows steps to fix

**TypeScript Implementation:**
```typescript
// In extension.ts or separate command file

// Command 1: Open Remediation Guide
vscode.commands.registerCommand('guardian.viewRemediationGuide', async (finding: Finding) => {
  const remediationPath = vscode.Uri.file(
    path.join(__dirname, '../REMEDIATION.md')
  );
  
  // Open in new tab
  const doc = await vscode.workspace.openTextDocument(remediationPath);
  await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  
  // Scroll to relevant section based on severity
  if (finding.severity === 'critical') {
    // Scroll to 🔴 CRITICAL section
  }
});

// Command 2: Open Understanding Guide
vscode.commands.registerCommand('guardian.understandingFindings', async () => {
  const docPath = vscode.Uri.file(
    path.join(__dirname, '../../docs/UNDERSTANDING_FINDINGS.md')
  );
  
  const doc = await vscode.workspace.openTextDocument(docPath);
  await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
});
```

---

### Strategy 2: Command Palette Access

**User Experience:**
```
User presses Ctrl+Shift+P
Types: "Guardian"
Shows commands:
├── Guardian: Scan Entire Workspace
├── Guardian: Show Security Dashboard
├── 📖 Guardian: View Remediation Guide
├── ❓ Guardian: Understanding Findings
├── ℹ️ Guardian: Security Best Practices
└── ...
```

**Implementation:**
```typescript
// Register commands in package.json
"contributes": {
  "commands": [
    {
      "command": "guardian.viewRemediationGuide",
      "title": "📖 View Remediation Guide",
      "category": "Guardian"
    },
    {
      "command": "guardian.viewUnderstandingFindings",
      "title": "❓ Understanding Findings",
      "category": "Guardian"
    }
  ]
}
```

---

### Strategy 3: Tree View Inline Actions

**User Experience:**
```
TreeView shows finding:
└── AWS Access Key ID (config.js:42)
    └── [Inline buttons]
        ├── 📖 Fix Guide
        └── 🔍 Learn More

User hovers over finding:
└── Tooltip shows:
    "Press Ctrl+K to open remediation guide"
```

---

## 📖 Implementation in VS Code

### Add to `extension.ts`:

```typescript
// Opening docs in new tab
async function openRemediationGuide(severity: string): Promise<void> {
  const remediationPath = vscode.Uri.file(
    path.join(__dirname, '../REMEDIATION.md')
  );
  
  const doc = await vscode.workspace.openTextDocument(remediationPath);
  
  // Show in new column for side-by-side view
  await vscode.window.showTextDocument(doc, {
    viewColumn: vscode.ViewColumn.Beside,
    preserveFocus: false
  });
  
  // Optional: Scroll to relevant section
  // Jump to section based on severity
  if (doc && doc.lineCount > 0) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      // Search for severity heading
      const searchTerm = severity === 'critical' ? '## 🔴 CRITICAL' : 
                        severity === 'high' ? '## 🟠 HIGH' :
                        severity === 'medium' ? '## 🟡 MEDIUM' : '';
      
      for (let i = 0; i < doc.lineCount; i++) {
        if (doc.lineAt(i).text.includes(searchTerm)) {
          const position = new vscode.Position(i, 0);
          editor.selection = new vscode.Selection(position, position);
          editor.revealRange(
            new vscode.Range(position, position),
            vscode.TextEditorRevealType.InCenter
          );
          break;
        }
      }
    }
  }
}

// Register commands
const remediationCommand = vscode.commands.registerCommand(
  'guardian.viewRemediationGuide',
  () => openRemediationGuide('current')
);

const understandingCommand = vscode.commands.registerCommand(
  'guardian.viewUnderstandingFindings',
  async () => {
    const docPath = vscode.Uri.file(
      path.join(__dirname, '../../docs/UNDERSTANDING_FINDINGS.md')
    );
    const doc = await vscode.workspace.openTextDocument(docPath);
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
  }
);

context.subscriptions.push(remediationCommand, understandingCommand);
```

---

### Add to `package.json`:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "guardian.viewRemediationGuide",
        "title": "📖 View Remediation Guide",
        "category": "Guardian",
        "icon": "$(book)"
      },
      {
        "command": "guardian.viewUnderstandingFindings",
        "title": "❓ Understanding Findings Guide",
        "category": "Guardian",
        "icon": "$(info)"
      },
      {
        "command": "guardian.viewSecurityBestPractices",
        "title": "🛡️ Security Best Practices",
        "category": "Guardian",
        "icon": "$(shield)"
      }
    ],
    "menus": {
      "commandPalette": [
        {
          "command": "guardian.viewRemediationGuide",
          "when": "resourceScheme == file"
        },
        {
          "command": "guardian.viewUnderstandingFindings",
          "when": "resourceScheme == file"
        }
      ]
    }
  }
}
```

---

## 🎨 User Interface Mockup

### Tree View with Quick Actions

```
Guardian Security
├── 🔴 CRITICAL (2)
│   ├── 📄 config.js (2)
│   │   ├── Line 42: AWS Access Key ID
│   │   │   └── Actions:
│   │   │       ├── [Jump to Code] (Ctrl+Click)
│   │   │       ├── [📖 Fix Guide]
│   │   │       └── [🔍 About This]
│   │   │
│   │   └── Line 43: AWS Secret Key
│   │       └── Actions: [Jump], [Fix], [Learn]
│   │
│   └── 📄 .env (3 findings)
│
├── 🟠 HIGH (1)
└── 🟡 MEDIUM (5)

Status Bar:
🛡️ Guardian: 8 issues (2 critical, 1 high, 5 medium)
[Quick Fix] [View Report] [📖 Remediation]
```

---

## 📱 Hover Tooltips

When user hovers over finding:

```
AWS Access Key ID
config.js:42
Severity: 🔴 CRITICAL
Pattern: AWS Access Key ID (AKIA*....)
Entropy: 4.87 (high randomness)

Quick Fix:
1. Rotate credential immediately
2. Remove from code
3. Use process.env.AWS_KEY instead

💡 Tip: Press Ctrl+K for full remediation guide
```

---

## 🔗 Links in Dashboard

Dashboard webview can have embedded links:

```html
<div class="finding-card critical">
  <h3>AWS Access Key Detected</h3>
  <p>This is a critical security issue</p>
  
  <div class="actions">
    <a href="command:guardian.viewRemediationGuide">
      📖 How to Fix
    </a>
    <a href="command:guardian.viewUnderstandingFindings">
      ❓ Learn More
    </a>
  </div>
</div>
```

---

## ✅ Implementation Checklist

- [ ] Add commands to `package.json` (commandPalette)
- [ ] Register commands in `extension.ts`
- [ ] Add "View Remediation" to tree view context menu
- [ ] Add "About Finding" action to findings
- [ ] Add documentation links to dashboard
- [ ] Add hover tooltips to findings
- [ ] Add keyboard shortcuts (Ctrl+K for remediation)
- [ ] Test opening docs in new tab
- [ ] Test scrolling to relevant section
- [ ] Test on different file paths

---

## 🎯 Quick Reference

| User Action | Result | Doc Opened |
|-------------|--------|-----------|
| Click "View Remediation" in tree | New tab, side-by-side | REMEDIATION.md |
| `Ctrl+Shift+P` → "Understanding" | New tab, side-by-side | docs/UNDERSTANDING_FINDINGS.md |
| Ctrl+K on finding | Quick tip shown | (inline) |
| Click link in dashboard | Opens in browser/command | Based on link |
| Hover over finding | Tooltip shows summary | (inline) |

---

## 💡 Why This Approach Works

✅ **VS Code editor** - Native experience, no context switching  
✅ **Side-by-side** - See code and guide together  
✅ **Command palette** - Discoverability for experienced users  
✅ **Multiple entry points** - Casual (hover) and power user (commands)  
✅ **Seamless workflow** - Read guide → Fix code → Done  
✅ **No external tools** - Everything in VS Code  

---

**Result:** User always has guidance at their fingertips, right where they need it! 🛡️
