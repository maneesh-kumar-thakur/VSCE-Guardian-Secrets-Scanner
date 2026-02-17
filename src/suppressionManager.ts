/**
 * Suppression Manager for False Positive Management
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface SuppressionRule {
  id: string;
  filePath: string;
  lineNumber: number;
  pattern: string;
  reason: string;
  timestamp: number;
  severity: string;
}

export class SuppressionManager {
  private suppressionFile: string;
  private suppressions: Map<string, SuppressionRule> = new Map();

  constructor(workspaceRoot: string) {
    this.suppressionFile = path.join(workspaceRoot, '.vscode', 'guardian-suppressions.json');
    this.loadSuppressions();
  }

  /**
   * Load suppressions from disk
   */
  private loadSuppressions(): void {
    try {
      if (fs.existsSync(this.suppressionFile)) {
        const data = fs.readFileSync(this.suppressionFile, 'utf-8');
        const rules: SuppressionRule[] = JSON.parse(data);
        this.suppressions.clear();
        rules.forEach(rule => {
          this.suppressions.set(rule.id, rule);
        });
        console.log(`Loaded ${this.suppressions.size} suppression rules`);
      }
    } catch (error) {
      console.error('Error loading suppressions:', error);
    }
  }

  /**
   * Save suppressions to disk
   */
  private saveSuppressions(): void {
    try {
      const dir = path.dirname(this.suppressionFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const rules = Array.from(this.suppressions.values());
      fs.writeFileSync(this.suppressionFile, JSON.stringify(rules, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving suppressions:', error);
    }
  }

  /**
   * Generate unique ID for a finding
   */
  private generateId(filePath: string, lineNumber: number, pattern: string): string {
    return `${filePath}:${lineNumber}:${pattern}`;
  }

  /**
   * Check if a finding is suppressed
   */
  isSuppressed(filePath: string, lineNumber: number, pattern: string): boolean {
    const id = this.generateId(filePath, lineNumber, pattern);
    return this.suppressions.has(id);
  }

  /**
   * Suppress a finding
   */
  suppress(filePath: string, lineNumber: number, pattern: string, reason: string, severity: string): SuppressionRule {
    const id = this.generateId(filePath, lineNumber, pattern);
    const rule: SuppressionRule = {
      id,
      filePath,
      lineNumber,
      pattern,
      reason,
      timestamp: Date.now(),
      severity,
    };
    this.suppressions.set(id, rule);
    this.saveSuppressions();
    return rule;
  }

  /**
   * Unsuppress a finding
   */
  unsuppress(filePath: string, lineNumber: number, pattern: string): void {
    const id = this.generateId(filePath, lineNumber, pattern);
    this.suppressions.delete(id);
    this.saveSuppressions();
  }

  /**
   * Get all suppression rules
   */
  getAllSuppressions(): SuppressionRule[] {
    return Array.from(this.suppressions.values());
  }

  /**
   * Get suppressions for a file
   */
  getFileSuppressions(filePath: string): SuppressionRule[] {
    return Array.from(this.suppressions.values()).filter(
      rule => rule.filePath === filePath
    );
  }

  /**
   * Clear all suppressions (use with caution)
   */
  clearAllSuppressions(): void {
    this.suppressions.clear();
    this.saveSuppressions();
  }

  /**
   * Get suppression stats
   */
  getStats(): {
    totalSuppressions: number;
    byCritical: number;
    byHigh: number;
    byMedium: number;
    byLow: number;
  } {
    const stats = {
      totalSuppressions: this.suppressions.size,
      byCritical: 0,
      byHigh: 0,
      byMedium: 0,
      byLow: 0,
    };

    this.suppressions.forEach(rule => {
      if (rule.severity === 'critical') stats.byCritical++;
      else if (rule.severity === 'high') stats.byHigh++;
      else if (rule.severity === 'medium') stats.byMedium++;
      else if (rule.severity === 'low') stats.byLow++;
    });

    return stats;
  }

  /**
   * Remove suppression for specific finding
   */
  removeSuppression(id: string): void {
    this.suppressions.delete(id);
    this.saveSuppressions();
  }
}
