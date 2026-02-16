/**
 * Tree View Provider for Security Findings
 */

import * as vscode from 'vscode';
import * as path from 'node:path';
import { ScannerEngine, Finding } from './scanner';

type TreeDataChange = FindingTreeItem | undefined | null | void;

export class FindingsTreeProvider implements vscode.TreeDataProvider<FindingTreeItem> {
  private readonly _onDidChangeTreeData: vscode.EventEmitter<TreeDataChange> = new vscode.EventEmitter<TreeDataChange>();
  readonly onDidChangeTreeData: vscode.Event<TreeDataChange> = this._onDidChangeTreeData.event;

  constructor(private readonly scanner: ScannerEngine) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FindingTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: FindingTreeItem): Thenable<FindingTreeItem[]> {
    if (!element) {
      // Root level - group by severity
      return Promise.resolve(this.getSeverityGroups());
    } else if (element.contextValue === 'severityGroup') {
      // Severity level - group by file
      return Promise.resolve(this.getFileGroups(element.severity!));
    } else if (element.contextValue === 'fileGroup') {
      // File level - show individual findings
      return Promise.resolve(this.getFileFindings(element.filePath!, element.severity!));
    }

    return Promise.resolve([]);
  }

  private getSeverityGroups(): FindingTreeItem[] {
    const findings = this.scanner.getFindings();
    const groups: FindingTreeItem[] = [];

    const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
    
    for (const severity of severities) {
      const severityFindings = findings.filter(f => f.severity === severity);
      
      if (severityFindings.length > 0) {
        const item = new FindingTreeItem(
          `${this.getSeverityIcon(severity)} ${severity.toUpperCase()} (${severityFindings.length})`,
          vscode.TreeItemCollapsibleState.Expanded
        );
        item.contextValue = 'severityGroup';
        item.severity = severity;
        item.iconPath = new vscode.ThemeIcon(
          this.getSeverityIconName(severity),
          new vscode.ThemeColor(this.getSeverityColor(severity))
        );
        groups.push(item);
      }
    }

    if (groups.length === 0) {
      const item = new FindingTreeItem(
        '✓ No secrets detected',
        vscode.TreeItemCollapsibleState.None
      );
      item.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
      return [item];
    }

    return groups;
  }

  private getFileGroups(severity: string): FindingTreeItem[] {
    const findings = this.scanner.getFindings().filter(f => f.severity === severity);
    const fileGroups = new Map<string, Finding[]>();

    for (const finding of findings) {
      if (!fileGroups.has(finding.file)) {
        fileGroups.set(finding.file, []);
      }
      fileGroups.get(finding.file)!.push(finding);
    }

    const items: FindingTreeItem[] = [];
    for (const [file, fileFindings] of fileGroups) {
      const fileName = path.basename(file);
      const item = new FindingTreeItem(
        `${fileName} (${fileFindings.length})`,
        vscode.TreeItemCollapsibleState.Collapsed
      );
      item.contextValue = 'fileGroup';
      item.filePath = file;
      item.severity = severity;
      item.description = path.dirname(file);
      item.iconPath = vscode.ThemeIcon.File;
      items.push(item);
    }

    return items;
  }

  private getFileFindings(filePath: string, severity: string): FindingTreeItem[] {
    const findings = this.scanner.getFindings()
      .filter(f => f.file === filePath && f.severity === severity);

    return findings.map(finding => {
      const item = new FindingTreeItem(
        `Line ${finding.line}: ${finding.description}`,
        vscode.TreeItemCollapsibleState.None
      );
      item.contextValue = 'finding';
      item.finding = finding;
      item.description = finding.category;
      item.tooltip = this.createTooltip(finding);
      item.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [
          vscode.Uri.file(finding.file),
          {
            selection: new vscode.Range(
              new vscode.Position(finding.line - 1, finding.column - 1),
              new vscode.Position(finding.line - 1, finding.column + finding.match.length)
            ),
          },
        ],
      };
      item.iconPath = new vscode.ThemeIcon('warning');
      return item;
    });
  }

  private createTooltip(finding: Finding): vscode.MarkdownString {
    const tooltip = new vscode.MarkdownString();
    tooltip.appendMarkdown(`**${finding.description}**\n\n`);
    tooltip.appendMarkdown(`- **File:** ${finding.file}\n`);
    tooltip.appendMarkdown(`- **Line:** ${finding.line}\n`);
    tooltip.appendMarkdown(`- **Severity:** ${finding.severity}\n`);
    tooltip.appendMarkdown(`- **Category:** ${finding.category}\n`);
    tooltip.appendMarkdown(`- **Pattern:** ${finding.pattern}\n`);
    if (finding.entropy) {
      tooltip.appendMarkdown(`- **Entropy:** ${finding.entropy.toFixed(2)}\n`);
    }
    tooltip.appendMarkdown(`\n**Context:**\n\`\`\`\n${finding.context}\n\`\`\`\n`);
    return tooltip;
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  }

  private getSeverityIconName(severity: string): string {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'question';
      default: return 'circle-outline';
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'errorForeground';
      case 'high': return 'editorWarning.foreground';
      case 'medium': return 'editorInfo.foreground';
      case 'low': return 'foreground';
      default: return 'foreground';
    }
  }
}

class FindingTreeItem extends vscode.TreeItem {
  severity?: string;
  filePath?: string;
  finding?: Finding;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }
}
