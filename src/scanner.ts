/**
 * Secret Scanner Engine
 * Performs deep scanning across various file types with context awareness
 */

import * as vscode from 'vscode';
import { SecretPatternLibrary, SecretPattern } from './patterns';
import { SuppressionManager } from './suppressionManager';

export interface Finding {
  file: string;
  line: number;
  column: number;
  pattern: string;
  match: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  category: string;
  context: string;
  suggestedFix: string;
  entropy?: number;
}

export class ScannerEngine {
  private findings: Finding[] = [];
  private config: vscode.WorkspaceConfiguration;
  private diagnosticCollection: vscode.DiagnosticCollection;
  private suppressionManager: SuppressionManager | null = null;

  constructor(diagnosticCollection: vscode.DiagnosticCollection, suppressionManager?: SuppressionManager) {
    this.diagnosticCollection = diagnosticCollection;
    this.config = vscode.workspace.getConfiguration('guardian');
    this.suppressionManager = suppressionManager || null;
  }

  /**
   * Scan a single file for secrets
   */
  async scanFile(uri: vscode.Uri): Promise<Finding[]> {
    const fileFindings: Finding[] = [];
    
    try {
      const document = await vscode.workspace.openTextDocument(uri);
      const text = document.getText();
      const lines = text.split('\n');

      // Get patterns to scan
      const patterns = SecretPatternLibrary.getPatterns();
      const customPatterns = this.getCustomPatterns();
      const allPatterns = [...patterns, ...customPatterns];

      // Scan with each pattern
      for (const pattern of allPatterns) {
        const matches = this.findMatches(text, pattern);
        
        for (const match of matches) {
          const position = document.positionAt(match.index);
          const line = position.line;
          const column = position.character;
          
          // Get context (surrounding lines)
          const contextStart = Math.max(0, line - 1);
          const contextEnd = Math.min(lines.length - 1, line + 1);
          const context = lines.slice(contextStart, contextEnd + 1).join('\n');

          // Apply false positive filter if exists
          if (pattern.falsePositiveFilter && pattern.falsePositiveFilter(match.text, context)) {
            continue;
          }

          // Check severity threshold
          if (!this.meetsSeverityThreshold(pattern.severity)) {
            continue;
          }

          // Calculate entropy if enabled
          let entropy: number | undefined;
          if (this.config.get('enableEntropyAnalysis')) {
            entropy = SecretPatternLibrary.calculateEntropy(match.text);
          }

          const finding: Finding = {
            file: uri.fsPath,
            line: line + 1,
            column: column + 1,
            pattern: pattern.name,
            match: this.maskSecret(match.text),
            severity: pattern.severity,
            description: pattern.description,
            category: pattern.category,
            context: this.maskSecret(context),
            suggestedFix: pattern.suggestedFix,
            entropy,
          };

          fileFindings.push(finding);
        }
      }

      // Entropy-based detection for unknown secrets
      if (this.config.get('enableEntropyAnalysis')) {
        const entropyFindings = this.scanForHighEntropyStrings(document, lines);
        fileFindings.push(...entropyFindings);
      }

      // Update diagnostics for this file
      this.updateDiagnostics(uri, fileFindings);

    } catch (error) {
      console.error(`Error scanning file ${uri.fsPath}:`, error);
    }

    return fileFindings;
  }

  /**
   * Scan workspace for secrets
   */
  async scanWorkspace(): Promise<Finding[]> {
    this.findings = [];
    const excludePatterns = this.config.get<string[]>('excludePatterns') || [];
    
    // Build exclude pattern
    const excludeGlob = `{${excludePatterns.join(',')}}`;

    // Find all files
    const files = await vscode.workspace.findFiles('**/*', excludeGlob);

    // Progress notification
    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Guardian: Scanning workspace for secrets...',
      cancellable: true,
    }, async (progress, token) => {
      const total = files.length;
      let completed = 0;

      for (const file of files) {
        if (token.isCancellationRequested) {
          break;
        }

        // Skip binary files unless configured to scan them
        if (!this.config.get('scanBinaryFiles') && this.isBinaryFile(file.fsPath)) {
          completed++;
          continue;
        }

        const fileFindings = await this.scanFile(file);
        
        // Filter out suppressed findings
        const unsuppressedFindings = fileFindings.filter(finding => {
          if (!this.suppressionManager) return true;
          return !this.suppressionManager.isSuppressed(
            finding.file,
            finding.line,
            finding.pattern
          );
        });
        
        this.findings.push(...unsuppressedFindings);

        completed++;
        progress.report({
          increment: (1 / total) * 100,
          message: `${completed}/${total} files scanned`,
        });
      }

      return this.findings;
    });
  }

  /**
   * Find pattern matches in text
   */
  private findMatches(text: string, pattern: SecretPattern): Array<{ index: number; text: string }> {
    const matches: Array<{ index: number; text: string }> = [];
    let match: RegExpExecArray | null;

    // Reset regex state
    pattern.pattern.lastIndex = 0;

    while ((match = pattern.pattern.exec(text)) !== null) {
      matches.push({
        index: match.index,
        text: match[0],
      });
    }

    return matches;
  }

  /**
   * Scan for high-entropy strings that might be secrets
   */
  private scanForHighEntropyStrings(document: vscode.TextDocument, lines: string[]): Finding[] {
    const findings: Finding[] = [];
    const threshold = this.config.get<number>('entropyThreshold') || 4.5;
    
    // Look for quoted strings and assignment values
    const stringPattern = /(['"`])([a-zA-Z0-9+\/=_-]{20,})\1/g;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match: RegExpExecArray | null;
      stringPattern.lastIndex = 0;

      while ((match = stringPattern.exec(line)) !== null) {
        const candidateSecret = match[2];
        
        if (SecretPatternLibrary.isHighEntropySecret(candidateSecret, threshold)) {
          const entropy = SecretPatternLibrary.calculateEntropy(candidateSecret);
          
          // Get context
          const contextStart = Math.max(0, i - 1);
          const contextEnd = Math.min(lines.length - 1, i + 1);
          const context = lines.slice(contextStart, contextEnd + 1).join('\n');

          findings.push({
            file: document.uri.fsPath,
            line: i + 1,
            column: match.index + 1,
            pattern: 'High Entropy Detection',
            match: this.maskSecret(candidateSecret),
            severity: 'medium',
            description: `High entropy string detected (entropy: ${entropy.toFixed(2)})`,
            category: 'Entropy Analysis',
            context: this.maskSecret(context),
            suggestedFix: '❓ Review this value - it appears secret-like. If real: DELETE and move to .env. If not: Mark as safe with // guardian:ignore',
            entropy,
          });
        }
      }
    }

    return findings;
  }

  /**
   * Mask secrets in output to prevent exposure in logs/UI
   */
  private maskSecret(text: string): string {
    if (text.length <= 8) {
      return '***';
    }
    
    const visible = 4;
    const start = text.substring(0, visible);
    const end = text.substring(text.length - visible);
    const masked = '*'.repeat(Math.min(text.length - (visible * 2), 20));
    
    return `${start}${masked}${end}`;
  }

  /**
   * Check if severity meets configured threshold
   */
  private meetsSeverityThreshold(severity: string): boolean {
    const configuredLevel = this.config.get<string>('severityLevel') || 'medium';
    const levels = ['low', 'medium', 'high', 'critical'];
    
    const configuredIndex = levels.indexOf(configuredLevel);
    const severityIndex = levels.indexOf(severity);
    
    return severityIndex >= configuredIndex;
  }

  /**
   * Check if file is binary based on extension
   */
  private isBinaryFile(filePath: string): boolean {
    const binaryExtensions = [
      '.exe', '.dll', '.so', '.dylib', '.bin', '.dat',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
      '.mp3', '.mp4', '.avi', '.mov', '.wav',
      '.zip', '.tar', '.gz', '.rar', '.7z',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    ];
    
    return binaryExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
  }

  /**
   * Get custom patterns from configuration
   */
  private getCustomPatterns(): SecretPattern[] {
    const customPatterns = this.config.get<any[]>('customPatterns') || [];
    
    return customPatterns.map((cp: any) => ({
      name: cp.name || 'Custom Pattern',
      pattern: new RegExp(cp.pattern, cp.flags || 'g'),
      severity: cp.severity || 'medium',
      description: cp.description || 'Custom pattern match',
      category: 'Custom',
      suggestedFix: cp.suggestedFix || 'Review and remediate according to your security policy.',
    }));
  }

  /**
   * Update diagnostics for a file
   */
  private updateDiagnostics(uri?: vscode.Uri, findings?: Finding[]): void {
    if (uri && findings) {
      // Update for a specific file
      const diagnostics: vscode.Diagnostic[] = findings.map(finding => {
        const range = new vscode.Range(
          new vscode.Position(finding.line - 1, finding.column - 1),
          new vscode.Position(finding.line - 1, finding.column + finding.match.length)
        );

        const severity = this.getSeverityLevel(finding.severity);
        const entropyInfo = finding.entropy ? ` [Entropy: ${finding.entropy.toFixed(2)}]` : '';
        const message = `${finding.description} (${finding.category})${entropyInfo}`;

        return new vscode.Diagnostic(range, message, severity);
      });

      this.diagnosticCollection.set(uri, diagnostics);
    } else {
      // Update all diagnostics for all findings
      const findingsByFile = new Map<string, Finding[]>();
      this.findings.forEach(finding => {
        if (!findingsByFile.has(finding.file)) {
          findingsByFile.set(finding.file, []);
        }
        findingsByFile.get(finding.file)!.push(finding);
      });

      // Clear all and set new
      this.diagnosticCollection.clear();
      findingsByFile.forEach((fileFindings, filePath) => {
        const uri = vscode.Uri.file(filePath);
        this.updateDiagnostics(uri, fileFindings);
      });
    }
  }

  /**
   * Convert severity to VS Code diagnostic severity
   */
  private getSeverityLevel(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
      case 'critical':
      case 'high':
        return vscode.DiagnosticSeverity.Error;
      case 'medium':
        return vscode.DiagnosticSeverity.Warning;
      case 'low':
      default:
        return vscode.DiagnosticSeverity.Information;
    }
  }

  /**
   * Clear all findings
   */
  clearFindings(): void {
    this.findings = [];
    this.diagnosticCollection.clear();
  }

  /**
   * Get all findings
   */
  getFindings(): Finding[] {
    return this.findings;
  }

  /**
   * Set suppression manager
   */
  setSuppressionManager(suppressionManager: SuppressionManager): void {
    this.suppressionManager = suppressionManager;
  }

  /**
   * Get suppression manager
   */
  getSuppressionManager(): SuppressionManager | null {
    return this.suppressionManager;
  }

  /**
   * Suppress a finding
   */
  suppressFinding(finding: Finding, reason: string): void {
    if (!this.suppressionManager) {
      console.warn('Suppression manager not initialized');
      return;
    }
    this.suppressionManager.suppress(finding.file, finding.line, finding.pattern, reason, finding.severity);
    // Remove from findings
    this.findings = this.findings.filter(f => 
      !(f.file === finding.file && f.line === finding.line && f.pattern === finding.pattern)
    );
    // Update diagnostics
    this.updateDiagnostics();
  }
}

