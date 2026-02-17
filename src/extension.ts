/**
 * Guardian - Secrets Scanner Extension
 * Main extension entry point
 */

import * as vscode from 'vscode';
import { ScannerEngine, Finding } from './scanner';
import { FindingsTreeProvider } from './treeProvider';
import { DashboardProvider } from './dashboard';
import { SettingsProvider } from './settingsProvider';
import { GitIntegration } from './gitIntegration';
import { SuppressionManager } from './suppressionManager';

export function activate(context: vscode.ExtensionContext) {
  console.log('Guardian Secrets Scanner is now active');

  // Create diagnostic collection
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('guardian');
  context.subscriptions.push(diagnosticCollection);

  // Initialize suppression manager
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const suppressionManager = workspaceRoot ? new SuppressionManager(workspaceRoot) : undefined;

  // Initialize scanner
  const scanner = new ScannerEngine(diagnosticCollection, suppressionManager);

  // Initialize Git integration
  const gitIntegration = new GitIntegration(scanner);

  // Create tree view provider
  const findingsProvider = new FindingsTreeProvider(scanner);
  const treeView = vscode.window.createTreeView('guardianFindings', {
    treeDataProvider: findingsProvider,
  });
  context.subscriptions.push(treeView);

  // Register commands
  
  // Scan entire workspace
  const scanWorkspaceCommand = vscode.commands.registerCommand('guardian.scanWorkspace', async () => {
    try {
      const findings = await scanner.scanWorkspace();
      findingsProvider.refresh();
      
      const secretsText = findings.length > 1 ? 's' : '';
      const message = findings.length === 0
        ? '✓ No secrets detected in workspace'
        : `⚠️ Found ${findings.length} potential secret${secretsText} in workspace`;
      
      vscode.window.showInformationMessage(message, 'View Findings').then(selection => {
        if (selection === 'View Findings') {
          vscode.commands.executeCommand('guardianFindings.focus');
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Scan failed: ${error}`);
    }
  });

  // Scan current file
  const scanCurrentFileCommand = vscode.commands.registerCommand('guardian.scanCurrentFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active file to scan');
      return;
    }

    try {
      const findings = await scanner.scanFile(editor.document.uri);
      findingsProvider.refresh();
      
      const secretsText = findings.length > 1 ? 's' : '';
      const message = findings.length === 0
        ? '✓ No secrets detected in this file'
        : `⚠️ Found ${findings.length} potential secret${secretsText} in this file`;
      
      vscode.window.showInformationMessage(message);
    } catch (error) {
      vscode.window.showErrorMessage(`Scan failed: ${error}`);
    }
  });

  // Show dashboard
  const showDashboardCommand = vscode.commands.registerCommand('guardian.showDashboard', () => {
    DashboardProvider.createOrShow(context.extensionUri, scanner);
  });

  // Clear findings
  const clearFindingsCommand = vscode.commands.registerCommand('guardian.clearFindings', () => {
    scanner.clearFindings();
    findingsProvider.refresh();
    vscode.window.showInformationMessage('All findings cleared');
  });

  // Export report
  const exportReportCommand = vscode.commands.registerCommand('guardian.exportReport', async () => {
    const findings = scanner.getFindings();
    
    if (findings.length === 0) {
      vscode.window.showInformationMessage('No findings to export');
      return;
    }

    // Generate report
    const report = generateReport(findings);
    
    // Save to file
    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file('guardian-security-report.json'),
      filters: {
        'JSON': ['json'],
        'Markdown': ['md'],
        'CSV': ['csv'],
      },
    });

    if (uri) {
      const extension = uri.fsPath.split('.').pop()?.toLowerCase();
      let content: string;

      switch (extension) {
        case 'md':
          content = generateMarkdownReport(findings);
          break;
        case 'csv':
          content = generateCSVReport(findings);
          break;
        default:
          content = report;
      }

      await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
      vscode.window.showInformationMessage(`Report exported to ${uri.fsPath}`);
    }
  });

  // Add custom pattern
  const addCustomPatternCommand = vscode.commands.registerCommand('guardian.addCustomPattern', async () => {
    const name = await vscode.window.showInputBox({
      prompt: 'Enter pattern name',
      placeHolder: 'e.g., Custom API Key',
    });

    if (!name) return;

    const pattern = await vscode.window.showInputBox({
      prompt: 'Enter regex pattern',
      placeHolder: String.raw`e.g., custom[_-]?api[_-]?key[=:]\s*['"]([^'"]+)['"]`,
    });

    if (!pattern) return;

    const severity = await vscode.window.showQuickPick(
      ['critical', 'high', 'medium', 'low'],
      { placeHolder: 'Select severity level' }
    );

    if (!severity) return;

    const description = await vscode.window.showInputBox({
      prompt: 'Enter description',
      placeHolder: 'e.g., Custom API key detected',
    });

    // Add to configuration
    const config = vscode.workspace.getConfiguration('guardian');
    const customPatterns = config.get<any[]>('customPatterns') || [];
    
    customPatterns.push({
      name,
      pattern,
      severity,
      description: description || `${name} detected`,
      flags: 'gi',
    });

    await config.update('customPatterns', customPatterns, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`Custom pattern "${name}" added successfully`);
  });

  // Install pre-commit hook
  const installPreCommitHookCommand = vscode.commands.registerCommand('guardian.installPreCommitHook', async () => {
    const confirm = await vscode.window.showWarningMessage(
      '🛡️ Install Git Pre-commit Hook?\n\nThis will block commits containing secrets.',
      { modal: true },
      'Install',
      'Cancel'
    );

    if (confirm === 'Install') {
      const success = await gitIntegration.installPreCommitHook();
      if (success) {
        // Optionally add .gitignore entries
        const addIgnore = await vscode.window.showInformationMessage(
          'Also add common secret file patterns to .gitignore?',
          'Yes',
          'No'
        );
        
        if (addIgnore === 'Yes') {
          await gitIntegration.addGitignoreEntries();
        }
      }
    }
  });

  // Uninstall pre-commit hook
  const uninstallPreCommitHookCommand = vscode.commands.registerCommand('guardian.uninstallPreCommitHook', async () => {
    const confirm = await vscode.window.showWarningMessage(
      'Uninstall Pre-commit Hook?',
      { modal: true },
      'Uninstall',
      'Cancel'
    );

    if (confirm === 'Uninstall') {
      await gitIntegration.uninstallPreCommitHook();
    }
  });

  // Scan staged files
  const scanStagedFilesCommand = vscode.commands.registerCommand('guardian.scanStagedFiles', async () => {
    const result = await gitIntegration.scanStagedFiles();
    
    if (result.findings.length === 0) {
      vscode.window.showInformationMessage('✅ No secrets in staged files');
    } else {
      const critical = result.findings.filter(f => f.severity === 'critical').length;
      const high = result.findings.filter(f => f.severity === 'high').length;
      
      const message = `⚠️ Found ${result.findings.length} secret(s) in staged files\nCritical: ${critical}, High: ${high}`;
      
      vscode.window.showWarningMessage(message, 'View Findings').then(selection => {
        if (selection === 'View Findings') {
          vscode.commands.executeCommand('guardianFindings.focus');
        }
      });
    }
  });

  // Add .gitignore entries
  const addGitignoreEntriesCommand = vscode.commands.registerCommand('guardian.addGitignoreEntries', async () => {
    await gitIntegration.addGitignoreEntries();
  });

  // Open Guardian settings
  const openSettingsCommand = vscode.commands.registerCommand('guardian.openSettings', async () => {
    SettingsProvider.createOrShow(context.extensionUri);
  });

  // Suppress a finding
  const suppressFindingCommand = vscode.commands.registerCommand('guardian.suppressFinding', async (finding: Finding) => {
    if (!suppressionManager) {
      vscode.window.showErrorMessage('Suppression manager not available');
      return;
    }

    const reason = await vscode.window.showInputBox({
      title: 'Suppress Finding',
      placeHolder: 'e.g., "False positive in test data"',
      prompt: `Why are you suppressing this finding at ${finding.file}:${finding.line}?`,
    });

    if (reason) {
      suppressionManager.suppress(finding.file, finding.line, finding.pattern, reason, finding.severity);
      scanner.suppressFinding(finding, reason);
      findingsProvider.refresh();
      vscode.window.showInformationMessage('✓ Finding suppressed. Rescan workspace to update dashboard.');
    }
  });

  // View suppressed findings
  const viewSuppressedCommand = vscode.commands.registerCommand('guardian.viewSuppressed', async () => {
    if (!suppressionManager) {
      vscode.window.showErrorMessage('Suppression manager not available');
      return;
    }

    const suppressions = suppressionManager.getAllSuppressions();
    if (suppressions.length === 0) {
      vscode.window.showInformationMessage('No suppressed findings');
      return;
    }

    const items = suppressions.map(s => ({
      label: `${s.pattern} at ${s.filePath}:${s.lineNumber}`,
      description: s.reason,
      suppression: s,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      title: 'Suppressed Findings',
      canPickMany: false,
    });

    if (selected) {
      const action = await vscode.window.showQuickPick(['View File', 'Unsuppress'], {
        title: `${selected.label}`,
      });

      if (action === 'View File') {
        const uri = vscode.Uri.file(selected.suppression.filePath);
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc);
        const line = selected.suppression.lineNumber - 1;
        editor.revealRange(new vscode.Range(line, 0, line, 0));
      } else if (action === 'Unsuppress') {
        suppressionManager.unsuppress(
          selected.suppression.filePath,
          selected.suppression.lineNumber,
          selected.suppression.pattern
        );
        vscode.window.showInformationMessage('✓ Finding unsuppressed. Rescan to update findings.');
      }
    }
  });

  // Register all commands
  context.subscriptions.push(
    scanWorkspaceCommand,
    scanCurrentFileCommand,
    showDashboardCommand,
    clearFindingsCommand,
    exportReportCommand,
    addCustomPatternCommand,
    installPreCommitHookCommand,
    uninstallPreCommitHookCommand,
    scanStagedFilesCommand,
    addGitignoreEntriesCommand,
    openSettingsCommand,
    suppressFindingCommand,
    viewSuppressedCommand,
    addGitignoreEntriesCommand,
    openSettingsCommand,
    // Auto-scan on save if enabled
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const config = vscode.workspace.getConfiguration('guardian');
      if (config.get('scanOnSave')) {
        await scanner.scanFile(document.uri);
        findingsProvider.refresh();
      }
    }),
    // Auto-scan on open if enabled
    vscode.workspace.onDidOpenTextDocument(async (document) => {
      const config = vscode.workspace.getConfiguration('guardian');
      if (config.get('scanOnOpen')) {
        await scanner.scanFile(document.uri);
        findingsProvider.refresh();
      }
    })
  );

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'guardian.showDashboard';
  updateStatusBar(statusBarItem, scanner);
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Update status bar periodically
  setInterval(() => updateStatusBar(statusBarItem, scanner), 5000);
}

function updateStatusBar(statusBarItem: vscode.StatusBarItem, scanner: ScannerEngine) {
  const findings = scanner.getFindings();
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;

  if (findings.length === 0) {
    statusBarItem.text = '$(shield) Guardian: Clean';
    statusBarItem.tooltip = 'No secrets detected';
    statusBarItem.backgroundColor = undefined;
  } else if (criticalCount > 0) {
    statusBarItem.text = `$(alert) Guardian: ${criticalCount} Critical`;
    statusBarItem.tooltip = `${findings.length} total findings (${criticalCount} critical, ${highCount} high)`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
  } else if (highCount > 0) {
    statusBarItem.text = `$(warning) Guardian: ${highCount} High`;
    statusBarItem.tooltip = `${findings.length} total findings (${highCount} high)`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  } else {
    statusBarItem.text = `$(info) Guardian: ${findings.length}`;
    statusBarItem.tooltip = `${findings.length} findings`;
    statusBarItem.backgroundColor = undefined;
  }
}

function generateReport(findings: Finding[]): string {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: findings.length,
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
    },
    findings: findings.map(f => ({
      file: f.file,
      line: f.line,
      column: f.column,
      severity: f.severity,
      category: f.category,
      pattern: f.pattern,
      description: f.description,
      entropy: f.entropy,
    })),
  };

  return JSON.stringify(report, null, 2);
}

function generateMarkdownReport(findings: Finding[]): string {
  const critical = findings.filter(f => f.severity === 'critical').length;
  const high = findings.filter(f => f.severity === 'high').length;
  const medium = findings.filter(f => f.severity === 'medium').length;
  const low = findings.filter(f => f.severity === 'low').length;

  let md = '# Guardian Security Scan Report\n\n';
  md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  md += '## Summary\n\n';
  md += `- Total Findings: ${findings.length}\n`;
  md += `- Critical: ${critical}\n`;
  md += `- High: ${high}\n`;
  md += `- Medium: ${medium}\n`;
  md += `- Low: ${low}\n\n`;
  md += '## Findings\n\n';

  const groupedByFile = findings.reduce((acc, f) => {
    if (!acc[f.file]) acc[f.file] = [];
    acc[f.file].push(f);
    return acc;
  }, {} as Record<string, Finding[]>);

  for (const [file, fileFindings] of Object.entries(groupedByFile)) {
    md += `### ${file}\n\n`;
    for (const f of fileFindings) {
      md += `- **Line ${f.line}**: [${f.severity.toUpperCase()}] ${f.description}\n`;
      md += `  - Pattern: ${f.pattern}\n`;
      md += `  - Category: ${f.category}\n`;
      if (f.entropy) {
        md += `  - Entropy: ${f.entropy.toFixed(2)}\n`;
      }
      md += '\n';
    }
  }

  return md;
}

function generateCSVReport(findings: Finding[]): string {
  let csv = 'File,Line,Column,Severity,Category,Pattern,Description,Entropy\n';
  
  for (const f of findings) {
    csv += `"${f.file}",${f.line},${f.column},"${f.severity}","${f.category}","${f.pattern}","${f.description}",${f.entropy || ''}\n`;
  }

  return csv;
}

export function deactivate() {
  console.log('Guardian Secrets Scanner deactivated');
}
