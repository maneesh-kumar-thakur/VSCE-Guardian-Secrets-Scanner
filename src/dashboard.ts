/**
 * Security Dashboard Webview Provider
 */

import * as vscode from 'vscode';
import { ScannerEngine, Finding } from './scanner';

export class DashboardProvider {
  public static currentPanel: DashboardProvider | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
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
    this._extensionUri = extensionUri;
    this._update(scanner);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        if (message.command === 'openSettings') {
          vscode.commands.executeCommand('guardian.openSettings');
        }
      },
      null,
      this._disposables
    );
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
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulseGlow {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.3);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(244, 67, 54, 0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 30px;
      background: #ffffff;
      color: #333333;
      animation: fadeIn 0.3s ease-in;
    }

    .header {
      margin-bottom: 40px;
      padding: 30px;
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2);
      color: white;
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }

    .shield-icon {
      font-size: 36px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      font-weight: 500;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: slideIn 0.4s ease-out;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: currentColor;
    }

    .stat-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
      border-color: currentColor;
    }

    .stat-card.critical {
      border-left: 6px solid #f44336;
      color: #f44336;
    }

    .stat-card.critical:hover {
      animation: pulseGlow 1s infinite;
    }

    .stat-card.high {
      border-left: 6px solid #ff9800;
      color: #ff9800;
    }

    .stat-card.medium {
      border-left: 6px solid #ffeb3b;
      color: #fbc02d;
    }

    .stat-card.low {
      border-left: 6px solid #2196f3;
      color: #2196f3;
    }

    .stat-value {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 8px;
      color: currentColor;
    }

    .stat-label {
      font-size: 13px;
      color: #666666;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-weight: 700;
    }

    .category-section {
      margin-bottom: 40px;
      animation: slideIn 0.5s ease-out;
    }

    .section-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 3px solid;
      border-image: linear-gradient(90deg, #667eea, #764ba2) 1;
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.02));
      padding-left: 12px;
      border-radius: 4px;
      color: #333333;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }

    .category-card {
      background: white;
      border: 1.5px solid #e0e0e0;
      border-radius: 10px;
      padding: 18px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .category-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
      border-color: #667eea;
      box-shadow: 0 8px 20px rgba(255, 107, 107, 0.15);
      border-color: rgba(255, 107, 107, 0.5);
    }

    .category-card:hover::after {
      transform: scaleX(1);
    }

    .category-name {
      font-weight: 700;
      margin-bottom: 10px;
      font-size: 15px;
      color: var(--vscode-editor-foreground);
    }

    .category-count {
      color: var(--vscode-descriptionForeground);
      font-size: 13px;
      font-weight: 500;
    }

    .severity-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      margin-left: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
    }

    .severity-badge.critical {
      background: linear-gradient(135deg, #f44336 0%, #e53935 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
    }

    .severity-badge.high {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4);
    }

    .severity-badge.medium {
      background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
      color: #333;
      box-shadow: 0 2px 8px rgba(251, 192, 45, 0.4);
    }

    .severity-badge.low {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
    }

    .recommendations {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
      border: 2px solid rgba(76, 175, 80, 0.3);
      border-left: 6px solid #4caf50;
      padding: 25px;
      margin-top: 30px;
      border-radius: 12px;
      animation: slideIn 0.6s ease-out;
    }

    .recommendations h3 {
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 700;
      color: #4caf50;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .recommendations ul {
      list-style-position: inside;
      line-height: 2;
      padding-left: 10px;
    }

    .recommendations li {
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 500;
      color: var(--vscode-editor-foreground);
      transition: all 0.2s;
    }

    .recommendations li:hover {
      padding-left: 8px;
      color: #4caf50;
    }

    .recommendations li::marker {
      color: #4caf50;
      font-weight: 700;
    }


    .chart-container {
      margin-top: 30px;
      padding: 20px;
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%);
      border: 1.5px solid rgba(76, 175, 80, 0.2);
      border-radius: 12px;
    }

    .progress-bar {
      height: 12px;
      background: var(--vscode-progressBar-background);
      border-radius: 6px;
      margin-top: 10px;
      overflow: hidden;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #45a049);
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    }

    .no-findings {
      text-align: center;
      padding: 80px 20px;
      animation: slideIn 0.4s ease-out;
    }

    .no-findings-icon {
      font-size: 80px;
      margin-bottom: 25px;
      animation: pulseGlow 2s infinite;
    }

    .no-findings-text {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #4caf50, #45a049);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 15px;
    }

    .no-findings-subtitle {
      font-size: 16px;
      color: var(--vscode-descriptionForeground);
      font-weight: 500;
      margin-top: 10px;
      line-height: 1.6;
    }

    .findings-details {
      margin-top: 40px;
      animation: slideIn 0.5s ease-out;
    }

    .findings-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 3px solid;
      border-image: linear-gradient(90deg, #ff6b6b, #ff9800) 1;
      color: var(--vscode-editor-foreground);
    }

    .finding-item {
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 152, 0, 0.02) 100%);
      border: 2px solid rgba(255, 107, 107, 0.2);
      border-left: 6px solid;
      border-radius: 10px;
      padding: 18px;
      margin-bottom: 16px;
      transition: all 0.3s ease;
    }

    .finding-item:hover {
      transform: translateX(6px);
      box-shadow: 0 8px 20px rgba(255, 107, 107, 0.15);
    }

    .finding-item.critical {
      border-left-color: #f44336;
    }

    .finding-item.high {
      border-left-color: #ff9800;
    }

    .finding-item.medium {
      border-left-color: #ffeb3b;
    }

    .finding-item.low {
      border-left-color: #2196f3;
    }

    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .finding-pattern {
      font-weight: 700;
      font-size: 15px;
      color: var(--vscode-editor-foreground);
    }

    .finding-location {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      font-family: monospace;
      background: rgba(0, 0, 0, 0.2);
      padding: 2px 6px;
      border-radius: 3px;
    }

    .finding-description {
      font-size: 14px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 12px;
    }

    .suggested-fix {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
      border-left: 4px solid #4caf50;
      padding: 12px;
      border-radius: 6px;
      margin-top: 12px;
    }

    .suggested-fix-label {
      font-weight: 700;
      color: #4caf50;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .suggested-fix-text {
      font-size: 14px;
      color: var(--vscode-editor-foreground);
      line-height: 1.6;
    }

    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .header-content {
      flex: 1;
    }

    .logo {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(244, 67, 54, 0.2));
      animation: slideIn 0.5s ease-out;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .btn-settings {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
    }

    .btn-settings:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4);
    }

    .btn-settings:active {
      transform: translateY(0);
    }

    .btn-icon {
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-container">
      <img src="${this._getLogoUri(webview)}" alt="Guardian Logo" class="logo">
      <div class="header-content">
        <h1>
          <span class="shield-icon">🛡️</span>
          Guardian Security Dashboard
        </h1>
        <p class="subtitle">Real-time security monitoring for your workspace</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-settings" onclick="openSettings()">
          <span class="btn-icon">⚙️</span>
          Settings
        </button>
      </div>
    </div>
  </div>

  ${findings.length === 0 ? this._getNoFindingsHtml() : this._getFindingsHtml(stats, findings)}

  <script>
    const vscode = acquireVsCodeApi();
    
    function openSettings() {
      vscode.postMessage({
        command: 'openSettings'
      });
    }
  </script>
</body>
</html>`;
  }

  private _getNoFindingsHtml(): string {
    return `
      <div class="no-findings">
        <div class="no-findings-icon">✨</div>
        <div class="no-findings-text">100% Secure</div>
        <p class="no-findings-subtitle">
          No secrets, API keys, or credentials detected.<br/>
          <strong>Your workspace is clean and ready to go!</strong>
        </p>
      </div>
    `;
  }

  private _getFindingsHtml(stats: any, findings: Finding[]): string {
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

      <div class="findings-details">
        <h2 class="findings-title">📋 Detailed Findings & Quick Fixes</h2>
        ${this._getDetailedFindingsHtml(findings)}
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
        '🚨 <strong>Immediately rotate all critical credentials</strong> (AWS keys, private keys, database passwords)',
        '🔍 Review access logs for potential unauthorized access'
      );
    }

    if (stats.high > 0) {
      recommendations.push(
        '🔑 Review and rotate API keys and tokens marked as high severity',
        '📝 Implement .gitignore rules to prevent future commits'
      );
    }

    recommendations.push(
      '🛡️ Use environment variables or secret management tools (AWS Secrets Manager, HashiCorp Vault)',
      '🪝 Enable pre-commit hooks to scan for secrets before committing',
      '🧹 Review repository history and remove secrets using tools like git-filter-repo'
    );

    return `
      <div class="recommendations">
        <h3>🔒 Security Action Items</h3>
        <ul>
          ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>

      <div class="recommendations" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%); border-left-color: #667eea;">
        <h3 style="color: #667eea;">📊 Understanding Entropy Detection</h3>
        <p style="font-size: 13px; line-height: 1.6; margin-bottom: 12px; color: #555;">
          Guardian uses <strong>Shannon entropy</strong> to detect high-randomness strings that might be hidden secrets:
        </p>
        <ul style="list-style-type: none; padding: 0;">
          <li style="margin-bottom: 8px; font-size: 13px;"><strong>Low Entropy (~2.0)</strong>: "aaaaaaa" - Obvious repetition, not a secret</li>
          <li style="margin-bottom: 8px; font-size: 13px;"><strong>Medium Entropy (~3.5)</strong>: "password123" - Predictable pattern</li>
          <li style="font-size: 13px;"><strong>High Entropy (~4.5+)</strong>: "K7x9Mq2Wp5Nz8Rt3" - ⚠️ Likely a secret!</li>
        </ul>
        <p style="font-size: 12px; margin-top: 12px; color: #666; font-style: italic;">
          💡 Adjust entropy threshold in Settings (3.0-6.0) to control sensitivity
        </p>
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

  private _getDetailedFindingsHtml(findings: Finding[]): string {
    // Group findings by severity for display (critical first)
    const sorted = [...findings].sort((a, b) => {
      const severityOrder: { [k: string]: number } = { critical: 0, high: 1, medium: 2, low: 3 };
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    });

    // Show top 15 findings with suggestions (most critical first)
    return sorted.slice(0, 15).map(finding => {
      const fileName = finding.file.split(/[/\\]/).pop() || finding.file;
      return `
        <div class="finding-item ${finding.severity}">
          <div class="finding-header">
            <span class="finding-pattern">${finding.pattern}</span>
            <span class="finding-location">${fileName}:${finding.line}</span>
          </div>
          <div class="finding-description">${finding.description}</div>
          <div class="suggested-fix">
            <div class="suggested-fix-label">💡 Quick Fix:</div>
            <div class="suggested-fix-text">${finding.suggestedFix}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  private _getLogoUri(webview: vscode.Webview): string {
    const logoPath = vscode.Uri.joinPath(this._extensionUri, 'resources', 'icon.png');
    return webview.asWebviewUri(logoPath).toString();
  }
}
