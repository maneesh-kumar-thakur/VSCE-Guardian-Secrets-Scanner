/**
 * Suppression Manager for False Positive Management
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SuppressionLogger } from './suppressionLogger';

export interface SuppressionRule {
  id: string;
  filePath: string;
  lineNumber: number;
  pattern: string;
  reason: string;
  timestamp: number;
  severity: string;
  suppressedBy?: string;
  reviewStatus?: 'pending' | 'reviewed' | 'expired';
  expiryDate?: number;
}

export interface AuditLogEntry {
  action: 'suppress' | 'unsuppress' | 'review';
  ruleId: string;
  filePath: string;
  reason?: string;
  timestamp: number;
  user?: string;
  comment?: string;
}

export class SuppressionManager {
  private suppressionFile: string;
  private auditLogFile: string;
  private suppressions: Map<string, SuppressionRule> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private logger: SuppressionLogger;
  private projectName: string;
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.suppressionFile = path.join(workspaceRoot, '.vscode', 'guardian-suppressions.json');
    this.auditLogFile = path.join(workspaceRoot, 'SUPPRESSIONS_AUDIT.md');
    this.logger = new SuppressionLogger(workspaceRoot);
    this.projectName = path.basename(workspaceRoot) || 'Unknown Project';
    this.loadSuppressions();
    this.loadAuditLog();
  }

  /**
   * Get current username from environment
   */
  private getUsername(): string {
    return process.env.USERNAME || process.env.USER || 'unknown';
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
   * Load audit log from disk
   */
  private loadAuditLog(): void {
    try {
      if (fs.existsSync(this.auditLogFile)) {
        const content = fs.readFileSync(this.auditLogFile, 'utf-8');
        // Parse markdown to extract audit entries - simplified for this version
        console.log('Audit log exists for reference');
      }
    } catch (error) {
      console.error('Error loading audit log:', error);
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
   * Log action to audit file (markdown format for git tracking)
   */
  private logToAudit(entry: AuditLogEntry): void {
    try {
      const timestamp = new Date(entry.timestamp).toISOString();
      const user = entry.user || this.getUsername();
      let logLine = `- **${entry.action.toUpperCase()}** | ${entry.filePath}:${entry.ruleId.split(':')[1]} | ${timestamp} | User: ${user}`;
      
      if (entry.reason) {
        logLine += ` | Reason: ${entry.reason}`;
      }
      if (entry.comment) {
        logLine += ` | Comment: ${entry.comment}`;
      }
      logLine += '\n';

      // Append to audit file
      if (!fs.existsSync(this.auditLogFile)) {
        const header = `# Guardian Suppressions Audit Log\n\nThis file tracks all finding suppressions for security and compliance purposes.\n\n`;
        fs.writeFileSync(this.auditLogFile, header);
      }

      fs.appendFileSync(this.auditLogFile, logLine, 'utf-8');
      this.auditLog.push(entry);
    } catch (error) {
      console.error('Error writing audit log:', error);
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
    const username = this.getUsername();
    const rule: SuppressionRule = {
      id,
      filePath,
      lineNumber,
      pattern,
      reason,
      timestamp: Date.now(),
      severity,
      suppressedBy: username,
      reviewStatus: 'pending',
    };
    this.suppressions.set(id, rule);
    this.saveSuppressions();

    // Log to audit file
    this.logToAudit({
      action: 'suppress',
      ruleId: id,
      filePath,
      reason,
      timestamp: Date.now(),
      user: username,
    });

    // Log to suppression logger
    this.logger.log(
      'suppress',
      filePath,
      lineNumber,
      pattern,
      severity,
      username,
      this.projectName,
      reason
    );

    return rule;
  }

  /**
   * Unsuppress a finding
   */
  unsuppress(filePath: string, lineNumber: number, pattern: string, comment?: string): void {
    const id = this.generateId(filePath, lineNumber, pattern);
    const username = this.getUsername();
    const rule = this.suppressions.get(id);
    
    this.suppressions.delete(id);
    this.saveSuppressions();

    // Log to audit
    this.logToAudit({
      action: 'unsuppress',
      ruleId: id,
      filePath,
      timestamp: Date.now(),
      user: username,
      comment,
    });

    // Log to suppression logger
    if (rule) {
      this.logger.log(
        'unsuppress',
        filePath,
        lineNumber,
        pattern,
        rule.severity,
        username,
        this.projectName,
        undefined,
        comment
      );
    }
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

  /**
   * Get suppression summary for reporting
   */
  getSummaryReport(): string {
    const stats = this.getStats();
    const totalByUser = new Map<string, number>();
    const totalByFile = new Map<string, number>();

    this.suppressions.forEach(rule => {
      const user = rule.suppressedBy || 'unknown';
      totalByUser.set(user, (totalByUser.get(user) || 0) + 1);
      totalByFile.set(rule.filePath, (totalByFile.get(rule.filePath) || 0) + 1);
    });

    let report = `# Suppression Summary Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    report += `## Overall Statistics\n`;
    report += `- Total Suppressions: ${stats.totalSuppressions}\n`;
    report += `- Critical: ${stats.byCritical}\n`;
    report += `- High: ${stats.byHigh}\n`;
    report += `- Medium: ${stats.byMedium}\n`;
    report += `- Low: ${stats.byLow}\n\n`;

    if (totalByUser.size > 0) {
      report += `## By User\n`;
      totalByUser.forEach((count, user) => {
        report += `- ${user}: ${count}\n`;
      });
      report += `\n`;
    }

    if (totalByFile.size > 0) {
      report += `## By File\n`;
      Array.from(totalByFile.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([file, count]) => {
          report += `- ${file}: ${count}\n`;
        });
    }

    return report;
  }

  /**
   * Mark suppression as reviewed
   */
  markAsReviewed(id: string, comment?: string): void {
    const rule = this.suppressions.get(id);
    if (rule) {
      rule.reviewStatus = 'reviewed';
      this.saveSuppressions();

      this.logToAudit({
        action: 'review',
        ruleId: id,
        filePath: rule.filePath,
        timestamp: Date.now(),
        user: this.getUsername(),
        comment,
      });
    }
  }

  /**
   * Get pending review suppressions (older than 30 days)
   */
  getPendingReview(): SuppressionRule[] {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return Array.from(this.suppressions.values()).filter(
      rule => rule.reviewStatus === 'pending' && rule.timestamp < thirtyDaysAgo
    );
  }

  /**
   * Get suppression logger instance
   */
  getLogger(): SuppressionLogger {
    return this.logger;
  }

  /**
   * Get log file path
   */
  getLogFilePath(): string {
    return this.logger.getLogFilePath();
  }
}
