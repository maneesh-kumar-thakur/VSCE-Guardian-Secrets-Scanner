/**
 * Guardian Settings Webview Provider
 */

import * as vscode from 'vscode';

interface GuardianSettings {
  enableEntropyAnalysis: boolean;
  entropyThreshold: number;
  excludePatterns: string[];
  severityLevel: string;
  customPatterns: string[];
  scanBinaryFiles: boolean;
  blockOnCritical: boolean;
  blockOnHigh: boolean;
  autoScanStaged: boolean;
}

export class SettingsProvider {
  public static currentPanel: SettingsProvider | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (SettingsProvider.currentPanel) {
      SettingsProvider.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'guardianSettings',
      'Guardian Settings',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    SettingsProvider.currentPanel = new SettingsProvider(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        try {
          if (message.command === 'saveSettings') {
            await this._saveSettings(message.settings);
          }
        } catch (error) {
          console.error('Error handling settings message:', error);
        }
      },
      null,
      this._disposables
    );
  }

  private async _update() {
    const settings = this._getSettings();
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview, settings);
  }

  private _getSettings(): GuardianSettings {
    const config = vscode.workspace.getConfiguration('guardian');
    return {
      enableEntropyAnalysis: config.get('enableEntropyAnalysis', true),
      entropyThreshold: config.get('entropyThreshold', 4.5),
      excludePatterns: config.get('excludePatterns', [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/vendor/**',
      ]),
      severityLevel: config.get('severityLevel', 'medium'),
      customPatterns: config.get('customPatterns', []),
      scanBinaryFiles: config.get('scanBinaryFiles', false),
      blockOnCritical: config.get('git.blockOnCritical', true),
      blockOnHigh: config.get('git.blockOnHigh', false),
      autoScanStaged: config.get('git.autoScanStaged', false),
    };
  }

  private async _saveSettings(settings: GuardianSettings) {
    const config = vscode.workspace.getConfiguration('guardian');
    await config.update('enableEntropyAnalysis', settings.enableEntropyAnalysis, vscode.ConfigurationTarget.Global);
    await config.update('entropyThreshold', settings.entropyThreshold, vscode.ConfigurationTarget.Global);
    await config.update('excludePatterns', settings.excludePatterns, vscode.ConfigurationTarget.Global);
    await config.update('severityLevel', settings.severityLevel, vscode.ConfigurationTarget.Global);
    await config.update('customPatterns', settings.customPatterns, vscode.ConfigurationTarget.Global);
    await config.update('scanBinaryFiles', settings.scanBinaryFiles, vscode.ConfigurationTarget.Global);
    await config.update('git.blockOnCritical', settings.blockOnCritical, vscode.ConfigurationTarget.Global);
    await config.update('git.blockOnHigh', settings.blockOnHigh, vscode.ConfigurationTarget.Global);
    await config.update('git.autoScanStaged', settings.autoScanStaged, vscode.ConfigurationTarget.Global);
    
    vscode.window.showInformationMessage('✓ Guardian settings saved successfully');
    this._update();
  }

  public dispose() {
    SettingsProvider.currentPanel = undefined;
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview, settings: GuardianSettings): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guardian Settings</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      color: #222222;
      padding: 30px;
      min-height: 100vh;
    }

    .settings-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .settings-header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid;
      border-image: linear-gradient(90deg, #4caf50, #2196f3) 1;
    }

    .settings-header h1 {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #4caf50, #2196f3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }

    .settings-header p {
      font-size: 14px;
      color: #666666;
      font-weight: 500;
    }

    .settings-section {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%);
      border: 1.5px solid rgba(76, 175, 80, 0.15);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      transition: all 0.3s ease;
    }

    .settings-section:hover {
      border-color: rgba(76, 175, 80, 0.3);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #222222;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title .icon {
      font-size: 20px;
    }

    .setting-item {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .setting-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .setting-label {
      font-weight: 700;
      font-size: 15px;
      color: #333333;
      margin-bottom: 8px;
      display: block;
    }

    .setting-description {
      font-size: 13px;
      color: #666666;
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .setting-input,
    .setting-select,
    .setting-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1.5px solid rgba(0, 0, 0, 0.12);
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      color: #333333;
      background: #ffffff;
      transition: all 0.2s;
    }

    .setting-input:focus,
    .setting-select:focus,
    .setting-textarea:focus {
      outline: none;
      border-color: #4caf50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
    }

    .setting-input[type="number"] {
      max-width: 150px;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 10px;
    }

    .checkbox-container input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #4caf50;
    }

    .checkbox-container label {
      cursor: pointer;
      font-size: 14px;
      color: #333333;
      font-weight: 500;
    }

    .array-input-container {
      background: #f8f8f8;
      border-radius: 6px;
      padding: 12px;
      margin-top: 10px;
    }

    .array-item {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      align-items: center;
    }

    .array-item input {
      flex: 1;
      padding: 8px 10px;
      border: 1.5px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      font-size: 13px;
      font-family: "Courier New", monospace;
    }

    .array-item input:focus {
      outline: none;
      border-color: #4caf50;
    }

    .btn-remove {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-remove:hover {
      background: #f44336;
      transform: scale(1.05);
    }

    .btn-add {
      background: linear-gradient(135deg, #4caf50, #45a049);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      margin-top: 8px;
      transition: all 0.3s;
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 30px;
      padding-top: 30px;
      border-top: 2px solid rgba(0, 0, 0, 0.08);
      justify-content: flex-end;
    }

    .btn {
      padding: 12px 28px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-save {
      background: linear-gradient(135deg, #4caf50, #45a049);
      color: white;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }

    .btn-save:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    }

    .btn-save:active {
      transform: translateY(0);
    }

    .btn-cancel {
      background: #f0f0f0;
      color: #333333;
      border: 1.5px solid #e0e0e0;
    }

    .btn-cancel:hover {
      background: #e8e8e8;
    }

    .info-box {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
      border-left: 4px solid #2196f3;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #333333;
      line-height: 1.6;
    }

    .severity-options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 10px;
    }

    .severity-option {
      border: 1.5px solid rgba(0, 0, 0, 0.12);
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: #ffffff;
      font-weight: 600;
      font-size: 13px;
    }

    .severity-option:hover {
      border-color: #4caf50;
      background: #f8f8f8;
    }

    .severity-option.selected {
      background: #4caf50;
      color: white;
      border-color: #4caf50;
    }

    .success-message {
      background: #c8e6c9;
      color: #2e7d32;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-weight: 600;
      font-size: 13px;
      display: none;
    }

    .success-message.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="settings-container">
    <div class="settings-header">
      <h1>⚙️ Guardian Settings</h1>
      <p>Configure secrets detection and security policies</p>
    </div>

    <div class="info-box">
      💡 <strong>Tip:</strong> Changes are saved globally to your VS Code settings. Recommended defaults are pre-selected.
    </div>

    <!-- Detection Settings -->
    <div class="settings-section">
      <div class="section-title">
        <span class="icon">🔍</span>
        <span>Detection Settings</span>
      </div>

      <div class="setting-item">
        <label class="setting-label">Entropy Analysis</label>
        <p class="setting-description">Detect secrets by analyzing randomness in strings (passwords, tokens, keys)</p>
        <div class="checkbox-container">
          <input type="checkbox" id="enableEntropyAnalysis" ${settings.enableEntropyAnalysis ? 'checked' : ''}>
          <label for="enableEntropyAnalysis">Enable entropy-based secret detection</label>
        </div>
      </div>

      <div class="setting-item">
        <label class="setting-label" for="entropyThreshold">Entropy Threshold: <span id="thresholdValue">${settings.entropyThreshold}</span></label>
        <p class="setting-description">Tune sensitivity (3.0 = catch more, 6.0 = strict). Recommended: 4.5</p>
        <input type="range" id="entropyThreshold" class="setting-input" min="3.0" max="6.0" step="0.1" value="${settings.entropyThreshold}" oninput="document.getElementById('thresholdValue').textContent = this.value">
      </div>

      <div class="setting-item">
        <label class="setting-label" for="severityLevel">Minimum Severity Level</label>
        <p class="setting-description">Only report alerts at or above this severity level</p>
        <div class="severity-options">
          <div class="severity-option ${settings.severityLevel === 'critical' ? 'selected' : ''}" onclick="setSeverity('critical')">🔴 Critical</div>
          <div class="severity-option ${settings.severityLevel === 'high' ? 'selected' : ''}" onclick="setSeverity('high')">🟠 High</div>
          <div class="severity-option ${settings.severityLevel === 'medium' ? 'selected' : ''}" onclick="setSeverity('medium')">🟡 Medium</div>
          <div class="severity-option ${settings.severityLevel === 'low' ? 'selected' : ''}" onclick="setSeverity('low')">🔵 Low</div>
        </div>
        <input type="hidden" id="severityLevel" value="${settings.severityLevel}">
      </div>
    </div>

    <!-- Scanning Settings -->
    <div class="settings-section">
      <div class="section-title">
        <span class="icon">📁</span>
        <span>Scanning Settings</span>
      </div>

      <div class="setting-item">
        <label class="setting-label">Exclude Patterns</label>
        <p class="setting-description">Folders to skip during scanning (glob patterns)</p>
        <div class="array-input-container" id="excludePatternsContainer">
          ${settings.excludePatterns.map((pattern, idx) => `
            <div class="array-item">
              <input type="text" value="${pattern}" onchange="updateExcludePattern(${idx}, this.value)">
              <button class="btn-remove" onclick="removeExcludePattern(${idx})">Remove</button>
            </div>
          `).join('')}
        </div>
        <button class="btn-add" onclick="addExcludePattern()">+ Add Pattern</button>
      </div>

      <div class="setting-item">
        <label class="setting-label">Scan Binary Files</label>
        <p class="setting-description">⚠️ Warning: Adds 10-30s overhead. Scan Office & PDF files for secrets</p>
        <div class="checkbox-container">
          <input type="checkbox" id="scanBinaryFiles" ${settings.scanBinaryFiles ? 'checked' : ''}>
          <label for="scanBinaryFiles">Scan xlsx, docx, pdf files</label>
        </div>
      </div>
    </div>

    <!-- Custom Patterns -->
    <div class="settings-section">
      <div class="section-title">
        <span class="icon">🎯</span>
        <span>Custom Patterns</span>
      </div>

      <div class="setting-item">
        <label class="setting-label">Custom Detection Patterns</label>
        <p class="setting-description">Add your own regex patterns for company-specific secrets</p>
        <div class="array-input-container" id="customPatternsContainer">
          ${settings.customPatterns.map((pattern, idx) => `
            <div class="array-item">
              <input type="text" value="${pattern}" onchange="updateCustomPattern(${idx}, this.value)" placeholder="Enter regex pattern">
              <button class="btn-remove" onclick="removeCustomPattern(${idx})">Remove</button>
            </div>
          `).join('')}
        </div>
        <button class="btn-add" onclick="addCustomPattern()">+ Add Custom Pattern</button>
      </div>
    </div>

    <!-- Git Security -->
    <div class="settings-section">
      <div class="section-title">
        <span class="icon">🔐</span>
        <span>Git Security Settings</span>
      </div>

      <div class="setting-item">
        <label class="setting-label">Block Critical Secrets</label>
        <p class="setting-description">Prevent commits containing critical secrets (AWS keys, private keys, DB passwords)</p>
        <div class="checkbox-container">
          <input type="checkbox" id="blockOnCritical" ${settings.blockOnCritical ? 'checked' : ''}>
          <label for="blockOnCritical">Block commits with critical secrets</label>
        </div>
      </div>

      <div class="setting-item">
        <label class="setting-label">Block High Severity Secrets</label>
        <p class="setting-description">Prevent commits containing high severity secrets (API keys, OAuth tokens)</p>
        <div class="checkbox-container">
          <input type="checkbox" id="blockOnHigh" ${settings.blockOnHigh ? 'checked' : ''}>
          <label for="blockOnHigh">Block commits with high severity secrets</label>
        </div>
      </div>

      <div class="setting-item">
        <label class="setting-label">Auto-scan Staged Files</label>
        <p class="setting-description">Automatically scan staged files before each commit (faster, checks only staged changes)</p>
        <div class="checkbox-container">
          <input type="checkbox" id="autoScanStaged" ${settings.autoScanStaged ? 'checked' : ''}>
          <label for="autoScanStaged">Auto-scan staged files before commit</label>
        </div>
      </div>
    </div>

    <!-- Save Buttons -->
    <div class="button-group">
      <button class="btn btn-cancel" onclick="window.close()">Cancel</button>
      <button class="btn btn-save" onclick="saveSettings()">Save Settings</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let excludePatterns = ${JSON.stringify(settings.excludePatterns)};
    let customPatterns = ${JSON.stringify(settings.customPatterns)};

    function setSeverity(level) {
      document.getElementById('severityLevel').value = level;
      document.querySelectorAll('.severity-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      event.target.classList.add('selected');
    }

    function addExcludePattern() {
      excludePatterns.push('');
      renderExcludePatterns();
    }

    function removeExcludePattern(idx) {
      excludePatterns.splice(idx, 1);
      renderExcludePatterns();
    }

    function updateExcludePattern(idx, value) {
      excludePatterns[idx] = value;
    }

    function renderExcludePatterns() {
      const container = document.getElementById('excludePatternsContainer');
      container.innerHTML = excludePatterns.map((pattern, idx) => \`
        <div class="array-item">
          <input type="text" value="\${pattern}" onchange="updateExcludePattern(\${idx}, this.value)">
          <button class="btn-remove" onclick="removeExcludePattern(\${idx})">Remove</button>
        </div>
      \`).join('');
    }

    function addCustomPattern() {
      customPatterns.push('');
      renderCustomPatterns();
    }

    function removeCustomPattern(idx) {
      customPatterns.splice(idx, 1);
      renderCustomPatterns();
    }

    function updateCustomPattern(idx, value) {
      customPatterns[idx] = value;
    }

    function renderCustomPatterns() {
      const container = document.getElementById('customPatternsContainer');
      container.innerHTML = customPatterns.map((pattern, idx) => \`
        <div class="array-item">
          <input type="text" value="\${pattern}" onchange="updateCustomPattern(\${idx}, this.value)" placeholder="Enter regex pattern">
          <button class="btn-remove" onclick="removeCustomPattern(\${idx})">Remove</button>
        </div>
      \`).join('');
    }

    function saveSettings() {
      const settings = {
        enableEntropyAnalysis: document.getElementById('enableEntropyAnalysis').checked,
        entropyThreshold: parseFloat(document.getElementById('entropyThreshold').value),
        excludePatterns: excludePatterns.filter(p => p.trim()),
        severityLevel: document.getElementById('severityLevel').value,
        customPatterns: customPatterns.filter(p => p.trim()),
        scanBinaryFiles: document.getElementById('scanBinaryFiles').checked,
        blockOnCritical: document.getElementById('blockOnCritical').checked,
        blockOnHigh: document.getElementById('blockOnHigh').checked,
        autoScanStaged: document.getElementById('autoScanStaged').checked,
      };

      vscode.postMessage({
        command: 'saveSettings',
        settings: settings
      });
    }
  </script>
</body>
</html>`;
  }
}
