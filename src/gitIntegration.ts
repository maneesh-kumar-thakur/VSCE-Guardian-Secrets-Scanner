/**
 * Git Integration Module
 * Provides pre-commit hook functionality to block commits with secrets
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ScannerEngine, Finding } from './scanner';

export class GitIntegration {
  private scanner: ScannerEngine;

  constructor(scanner: ScannerEngine) {
    this.scanner = scanner;
  }

  /**
   * Install pre-commit hook in the current workspace
   */
  async installPreCommitHook(): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found');
      return false;
    }

    const gitHooksDir = path.join(workspaceFolder.uri.fsPath, '.git', 'hooks');
    const preCommitPath = path.join(gitHooksDir, 'pre-commit');

    // Check if .git exists
    if (!fs.existsSync(gitHooksDir)) {
      vscode.window.showErrorMessage('No .git directory found. Is this a Git repository?');
      return false;
    }

    // Create pre-commit hook
    const hookContent = this.generatePreCommitHook();

    try {
      // Backup existing hook if present
      if (fs.existsSync(preCommitPath)) {
        const backup = `${preCommitPath}.backup-${Date.now()}`;
        fs.copyFileSync(preCommitPath, backup);
        vscode.window.showInformationMessage(`Existing pre-commit hook backed up to ${path.basename(backup)}`);
      }

      // Write new hook
      fs.writeFileSync(preCommitPath, hookContent, { mode: 0o755 });
      vscode.window.showInformationMessage('✅ Pre-commit hook installed successfully!');
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to install pre-commit hook: ${error}`);
      return false;
    }
  }

  /**
   * Uninstall pre-commit hook
   */
  async uninstallPreCommitHook(): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return false;
    }

    const preCommitPath = path.join(workspaceFolder.uri.fsPath, '.git', 'hooks', 'pre-commit');

    try {
      if (fs.existsSync(preCommitPath)) {
        fs.unlinkSync(preCommitPath);
        vscode.window.showInformationMessage('Pre-commit hook uninstalled');
      }
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to uninstall pre-commit hook: ${error}`);
      return false;
    }
  }

  /**
   * Generate pre-commit hook script
   */
  private generatePreCommitHook(): string {
    return `#!/bin/bash
# Guardian Secrets Scanner Pre-commit Hook
# Auto-generated - DO NOT EDIT MANUALLY

echo "🛡️  Guardian: Scanning staged files for secrets..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
  echo "No files to scan"
  exit 0
fi

# Create temporary directory for scan results
TEMP_DIR=$(mktemp -d)
REPORT_FILE="$TEMP_DIR/guardian-report.json"

# Scan staged files
HAS_SECRETS=false
CRITICAL_COUNT=0
HIGH_COUNT=0

echo "Scanning $(echo "$STAGED_FILES" | wc -l) files..."

# Simple pattern matching in bash for common secrets
for FILE in $STAGED_FILES; do
  if [ -f "$FILE" ]; then
    # AWS Keys
    if grep -qE "AKIA[0-9A-Z]{16}" "$FILE" 2>/dev/null; then
      echo "❌ CRITICAL: AWS Access Key found in $FILE"
      HAS_SECRETS=true
      CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
    fi
    
    # GitHub Tokens
    if grep -qE "ghp_[0-9a-zA-Z]{36}" "$FILE" 2>/dev/null; then
      echo "❌ CRITICAL: GitHub Personal Access Token found in $FILE"
      HAS_SECRETS=true
      CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
    fi
    
    # Private Keys
    if grep -qE "BEGIN.*PRIVATE KEY" "$FILE" 2>/dev/null; then
      echo "❌ CRITICAL: Private Key found in $FILE"
      HAS_SECRETS=true
      CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
    fi
    
    # Generic API Keys
    if grep -qiE "api[_-]?key.*['\\\"][0-9a-zA-Z]{20,}['\\\"]" "$FILE" 2>/dev/null; then
      # Exclude placeholders
      if ! grep -qiE "YOUR_API_KEY|EXAMPLE|PLACEHOLDER|TEST" "$FILE" 2>/dev/null; then
        echo "⚠️  HIGH: Potential API Key found in $FILE"
        HAS_SECRETS=true
        HIGH_COUNT=$((HIGH_COUNT + 1))
      fi
    fi
    
    # Database Connection Strings
    if grep -qE "(mongodb|mysql|postgresql)://[^\\s]+:[^\\s]+@" "$FILE" 2>/dev/null; then
      echo "❌ CRITICAL: Database connection string with credentials found in $FILE"
      HAS_SECRETS=true
      CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
    fi
  fi
done

# Cleanup
rm -rf "$TEMP_DIR"

# Decision logic
if [ "$HAS_SECRETS" = true ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🚨 COMMIT BLOCKED: Secrets detected in staged files!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Summary:"
  echo "  - Critical issues: $CRITICAL_COUNT"
  echo "  - High issues: $HIGH_COUNT"
  echo ""
  echo "🔧 How to fix:"
  echo "  1. Remove secrets from the files"
  echo "  2. Use environment variables or secret managers"
  echo "  3. Add sensitive files to .gitignore"
  echo ""
  echo "⚠️  To bypass this check (NOT RECOMMENDED):"
  echo "     git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ No secrets detected - commit allowed"
exit 0
`;
  }

  /**
   * Check if pre-commit hook is installed
   */
  isPreCommitHookInstalled(): boolean {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return false;
    }

    const preCommitPath = path.join(workspaceFolder.uri.fsPath, '.git', 'hooks', 'pre-commit');
    
    if (!fs.existsSync(preCommitPath)) {
      return false;
    }

    // Check if it's our hook
    const content = fs.readFileSync(preCommitPath, 'utf8');
    return content.includes('Guardian Secrets Scanner Pre-commit Hook');
  }

  /**
   * Scan staged files before commit
   */
  async scanStagedFiles(): Promise<{ findings: Finding[]; blocked: boolean }> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return { findings: [], blocked: false };
    }

    // Get staged files using Git extension API
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    if (!gitExtension) {
      vscode.window.showWarningMessage('Git extension not available');
      return { findings: [], blocked: false };
    }

    const git = gitExtension.getAPI(1);
    const repo = git.repositories[0];
    
    if (!repo) {
      return { findings: [], blocked: false };
    }

    // Get staged changes
    const stagedChanges = repo.state.indexChanges;
    const allFindings: Finding[] = [];

    // Scan each staged file
    for (const change of stagedChanges) {
      const uri = change.uri;
      try {
        const findings = await this.scanner.scanFile(uri);
        allFindings.push(...findings);
      } catch (error) {
        console.error(`Error scanning ${uri.fsPath}:`, error);
      }
    }

    // Determine if commit should be blocked
    const config = vscode.workspace.getConfiguration('guardian');
    const blockOnCritical = config.get<boolean>('git.blockOnCritical', true);
    const blockOnHigh = config.get<boolean>('git.blockOnHigh', false);

    const hasCritical = allFindings.some(f => f.severity === 'critical');
    const hasHigh = allFindings.some(f => f.severity === 'high');

    const shouldBlock = (blockOnCritical && hasCritical) || (blockOnHigh && hasHigh);

    return { findings: allFindings, blocked: shouldBlock };
  }

  /**
   * Show commit warning dialog
   */
  async showCommitWarning(findings: Finding[]): Promise<'proceed' | 'cancel' | 'review'> {
    const critical = findings.filter(f => f.severity === 'critical').length;
    const high = findings.filter(f => f.severity === 'high').length;
    
    const message = `🚨 Secrets detected in staged files!\n\nCritical: ${critical}, High: ${high}\n\nThis commit may expose sensitive data.`;
    
    const choice = await vscode.window.showWarningMessage(
      message,
      { modal: true },
      'Review Findings',
      'Cancel Commit',
      'Proceed Anyway (Not Recommended)'
    );

    switch (choice) {
      case 'Review Findings':
        return 'review';
      case 'Cancel Commit':
        return 'cancel';
      case 'Proceed Anyway (Not Recommended)':
        return 'proceed';
      default:
        return 'cancel';
    }
  }

  /**
   * Create .gitignore entries for common secret files
   */
  async addGitignoreEntries(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }

    const gitignorePath = path.join(workspaceFolder.uri.fsPath, '.gitignore');
    
    const secretFilePatterns = [
      '',
      '# Guardian: Ignore common secret files',
      '.env',
      '.env.local',
      '.env.*.local',
      '*.pem',
      '*.key',
      '*.p12',
      '*.pfx',
      'secrets.yml',
      'secrets.yaml',
      'credentials.json',
      '*-credentials.json',
      'serviceAccount.json',
    ];

    try {
      let content = '';
      if (fs.existsSync(gitignorePath)) {
        content = fs.readFileSync(gitignorePath, 'utf8');
      }

      // Check if already has Guardian section
      if (content.includes('# Guardian:')) {
        vscode.window.showInformationMessage('.gitignore already has Guardian entries');
        return;
      }

      // Append entries
      const newContent = content + '\n' + secretFilePatterns.join('\n') + '\n';
      fs.writeFileSync(gitignorePath, newContent);
      
      vscode.window.showInformationMessage('✅ Added secret file patterns to .gitignore');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to update .gitignore: ${error}`);
    }
  }
}
