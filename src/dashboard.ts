/**
 * Security Dashboard Webview Provider
 */

import * as vscode from 'vscode';
import { ScannerEngine, Finding } from './scanner';

export class DashboardProvider {
  public static currentPanel: DashboardProvider | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, scanner: ScannerEngine) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (DashboardProvider.currentPanel) {
      DashboardProvider.currentPanel._panel.reveal(column);
      DashboardProvider.currentPanel._update(scanner);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'guardianDashboard',
      'Guardian Security Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    DashboardProvider.currentPanel = new DashboardProvider(panel, extensionUri, scanner);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, scanner: ScannerEngine) {
    this._panel = panel;
    this._update(scanner);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private _update(scanner: ScannerEngine) {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview, scanner);
  }

  public dispose() {
    DashboardProvider.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview, scanner: ScannerEngine): string {
    const findings = scanner.getFindings();
    const stats = this._calculateStats(findings);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guardian Security Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 20px;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }

    .header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--vscode-panel-border);
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .shield-icon {
      font-size: 32px;
    }

    .subtitle {
      color: var(--vscode-descriptionForeground);
      font-size: 14px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: var(--vscode-editor-inactiveSelectionBackground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      padding: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .stat-card.critical {
      border-left: 4px solid #f44336;
    }

    .stat-card.high {
      border-left: 4px solid #ff9800;
    }

    .stat-card.medium {
      border-left: 4px solid #ffeb3b;
    }

    .stat-card.low {
      border-left: 4px solid #2196f3;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .category-section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }

    .category-card {
      background: var(--vscode-editor-inactiveSelectionBackground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 15px;
    }

    .category-name {
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 15px;
    }

    .category-count {
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
    }

    .severity-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 5px;
      text-transform: uppercase;
    }

    .severity-badge.critical {
      background: #f44336;
      color: white;
    }

    .severity-badge.high {
      background: #ff9800;
      color: white;
    }

    .severity-badge.medium {
      background: #ffeb3b;
      color: black;
    }

    .severity-badge.low {
      background: #2196f3;
      color: white;
    }

    .recommendations {
      background: var(--vscode-textBlockQuote-background);
      border-left: 4px solid var(--vscode-textLink-foreground);
      padding: 15px;
      margin-top: 20px;
      border-radius: 4px;
    }

    .recommendations h3 {
      margin-bottom: 10px;
      font-size: 16px;
    }

    .recommendations ul {
      list-style-position: inside;
      line-height: 1.8;
    }

    .recommendations li {
      margin-bottom: 5px;
    }

    .chart-container {
      margin-top: 30px;
      padding: 20px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
    }

    .progress-bar {
      height: 8px;
      background: var(--vscode-progressBar-background);
      border-radius: 4px;
      margin-top: 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--vscode-button-background);
      transition: width 0.3s ease;
    }

    .no-findings {
      text-align: center;
      padding: 60px 20px;
    }

    .no-findings-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .no-findings-text {
      font-size: 24px;
      font-weight: 600;
      color: #4caf50;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>
      <span class="shield-icon">🛡️</span>
      Guardian Security Dashboard
    </h1>
    <p class="subtitle">Real-time security monitoring for your workspace</p>
  </div>

  ${findings.length === 0 ? this._getNoFindingsHtml() : this._getFindingsHtml(stats)}

</body>
</html>`;
  }

  private _getNoFindingsHtml(): string {
    return `
      <div class="no-findings">
        <div class="no-findings-icon">✅</div>
        <div class="no-findings-text">No Security Issues Detected</div>
        <p style="margin-top: 10px; color: var(--vscode-descriptionForeground);">
          Your workspace is clean! No passwords, API keys, or tokens were found.
        </p>
      </div>
    `;
  }

  private _getFindingsHtml(stats: any): string {
    return `
      <div class="stats-grid">
        <div class="stat-card critical">
          <div class="stat-value">${stats.critical}</div>
          <div class="stat-label">Critical</div>
        </div>
        <div class="stat-card high">
          <div class="stat-value">${stats.high}</div>
          <div class="stat-label">High</div>
        </div>
        <div class="stat-card medium">
          <div class="stat-value">${stats.medium}</div>
          <div class="stat-label">Medium</div>
        </div>
        <div class="stat-card low">
          <div class="stat-value">${stats.low}</div>
          <div class="stat-label">Low</div>
        </div>
      </div>

      <div class="category-section">
        <h2 class="section-title">Findings by Category</h2>
        <div class="category-grid">
          ${this._getCategoriesHtml(stats.byCategory)}
        </div>
      </div>

      <div class="category-section">
        <h2 class="section-title">Top Affected Files</h2>
        <div class="category-grid">
          ${this._getTopFilesHtml(stats.byFile)}
        </div>
      </div>

      ${this._getRecommendationsHtml(stats)}
    `;
  }

  private _getCategoriesHtml(categories: Map<string, any>): string {
    const sorted = Array.from(categories.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);

    return sorted.map(([category, data]) => `
      <div class="category-card">
        <div class="category-name">${category}</div>
        <div class="category-count">
          ${data.count} finding${data.count > 1 ? 's' : ''}
          ${this._getSeverityBadges(data.severities)}
        </div>
      </div>
    `).join('');
  }

  private _getTopFilesHtml(files: Map<string, number>): string {
    const sorted = Array.from(files.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return sorted.map(([file, count]) => {
      const fileName = file.split('/').pop() || file;
      return `
        <div class="category-card">
          <div class="category-name">${fileName}</div>
          <div class="category-count">${count} finding${count > 1 ? 's' : ''}</div>
        </div>
      `;
    }).join('');
  }

  private _getSeverityBadges(severities: { critical: number; high: number; medium: number; low: number }): string {
    let badges = '';
    if (severities.critical > 0) badges += `<span class="severity-badge critical">${severities.critical}C</span>`;
    if (severities.high > 0) badges += `<span class="severity-badge high">${severities.high}H</span>`;
    if (severities.medium > 0) badges += `<span class="severity-badge medium">${severities.medium}M</span>`;
    if (severities.low > 0) badges += `<span class="severity-badge low">${severities.low}L</span>`;
    return badges;
  }

  private _getRecommendationsHtml(stats: any): string {
    const recommendations = [];

    if (stats.critical > 0) {
      recommendations.push(
        'Immediately rotate all critical credentials (AWS keys, private keys, database passwords)',
        'Review access logs for potential unauthorized access'
      );
    }

    if (stats.high > 0) {
      recommendations.push(
        'Review and rotate API keys and tokens marked as high severity',
        'Implement .gitignore rules to prevent future commits'
      );
    }

    recommendations.push(
      'Use environment variables or secret management tools (e.g., AWS Secrets Manager, HashiCorp Vault)',
      'Enable pre-commit hooks to scan for secrets before committing',
      'Review repository history and consider using tools like git-filter-repo to remove secrets'
    );

    return `
      <div class="recommendations">
        <h3>🔒 Security Recommendations</h3>
        <ul>
          ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  private _calculateStats(findings: Finding[]): any {
    const stats = {
      total: findings.length,
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      byCategory: new Map<string, any>(),
      byFile: new Map<string, number>(),
    };

    for (const finding of findings) {
      // By category
      if (!stats.byCategory.has(finding.category)) {
        stats.byCategory.set(finding.category, {
          count: 0,
          severities: { critical: 0, high: 0, medium: 0, low: 0 },
        });
      }
      const catData = stats.byCategory.get(finding.category)!;
      catData.count++;
      catData.severities[finding.severity]++;

      // By file
      stats.byFile.set(finding.file, (stats.byFile.get(finding.file) || 0) + 1);
    }

    return stats;
  }
}
