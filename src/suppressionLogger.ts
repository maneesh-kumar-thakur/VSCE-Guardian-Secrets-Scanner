/**
 * Suppression Logger - Detailed logging of all suppression activities
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface SuppressionLogEntry {
  id: string;
  action: 'suppress' | 'unsuppress' | 'review';
  project: string;
  file: string;
  line: number;
  pattern: string;
  severity: string;
  reason?: string;
  user: string;
  timestamp: number;
  date: string;
  time: string;
  comment?: string;
  machine?: string;
}

export class SuppressionLogger {
  private logFilePath: string;
  private entries: SuppressionLogEntry[] = [];

  constructor(workspaceRoot: string) {
    this.logFilePath = path.join(workspaceRoot, 'SUPPRESSIONS.log');
    this.loadLog();
  }

  /**
   * Get project name from workspace root
   */
  private getProjectName(workspaceRoot: string): string {
    return path.basename(workspaceRoot) || 'Unknown Project';
  }

  /**
   * Format timestamp as readable date and time
   */
  private formatDateTime(timestamp: number): { date: string; time: string } {
    const dt = new Date(timestamp);
    return {
      date: dt.toISOString().split('T')[0], // YYYY-MM-DD
      time: dt.toISOString().split('T')[1].split('.')[0], // HH:MM:SS
    };
  }

  /**
   * Load existing log entries
   */
  private loadLog(): void {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const content = fs.readFileSync(this.logFilePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        
        // Parse JSON log entries (skip header comments)
        this.entries = lines
          .filter(line => line.startsWith('{'))
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter((entry): entry is SuppressionLogEntry => entry !== null);
          
        console.log(`Loaded ${this.entries.length} suppression log entries`);
      }
    } catch (error) {
      console.error('Error loading suppression log:', error);
    }
  }

  /**
   * Log a suppression activity
   */
  log(
    action: 'suppress' | 'unsuppress' | 'review',
    file: string,
    line: number,
    pattern: string,
    severity: string,
    user: string,
    projectName: string,
    reason?: string,
    comment?: string
  ): SuppressionLogEntry {
    const timestamp = Date.now();
    const { date, time } = this.formatDateTime(timestamp);
    const id = `${file}:${line}:${pattern}`;

    const entry: SuppressionLogEntry = {
      id,
      action,
      project: projectName,
      file,
      line,
      pattern,
      severity,
      reason,
      user,
      timestamp,
      date,
      time,
      comment,
      machine: os.hostname(),
    };

    this.entries.push(entry);
    this.appendToFile(entry);
    return entry;
  }

  /**
   * Append entry to log file
   */
  private appendToFile(entry: SuppressionLogEntry): void {
    try {
      // Ensure file has header
      if (!fs.existsSync(this.logFilePath)) {
        const header = `# Guardian Suppressions Log
# Format: One JSON object per line
# Each line is: action | date | time | user | project | file:line | pattern | severity | reason
# For easy parsing and analysis
#\n`;
        fs.writeFileSync(this.logFilePath, header);
      }

      // Append entry as JSON (one per line for easy parsing)
      const line = JSON.stringify(entry);
      fs.appendFileSync(this.logFilePath, line + '\n', 'utf-8');
    } catch (error) {
      console.error('Error writing to suppression log:', error);
    }
  }

  /**
   * Get all log entries
   */
  getAllEntries(): SuppressionLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries for a specific date
   */
  getEntriesByDate(date: string): SuppressionLogEntry[] {
    return this.entries.filter(e => e.date === date);
  }

  /**
   * Get entries for a specific user
   */
  getEntriesByUser(user: string): SuppressionLogEntry[] {
    return this.entries.filter(e => e.user.toLowerCase() === user.toLowerCase());
  }

  /**
   * Get entries for a specific file
   */
  getEntriesByFile(file: string): SuppressionLogEntry[] {
    return this.entries.filter(e => e.file === file);
  }

  /**
   * Get entries for a specific project
   */
  getEntriesByProject(project: string): SuppressionLogEntry[] {
    return this.entries.filter(e => e.project === project);
  }

  /**
   * Get specific action type entries
   */
  getEntriesByAction(action: 'suppress' | 'unsuppress' | 'review'): SuppressionLogEntry[] {
    return this.entries.filter(e => e.action === action);
  }

  /**
   * Generate formatted report
   */
  generateReport(): string {
    let report = `# Suppression Log Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Total Entries:** ${this.entries.length}\n\n`;

    if (this.entries.length === 0) {
      return report + `No suppression activities recorded yet.`;
    }

    // Group by project
    const byProject = new Map<string, SuppressionLogEntry[]>();
    this.entries.forEach(entry => {
      if (!byProject.has(entry.project)) {
        byProject.set(entry.project, []);
      }
      byProject.get(entry.project)!.push(entry);
    });

    // Group by user
    const byUser = new Map<string, SuppressionLogEntry[]>();
    this.entries.forEach(entry => {
      if (!byUser.has(entry.user)) {
        byUser.set(entry.user, []);
      }
      byUser.get(entry.user)!.push(entry);
    });

    // Group by action
    const suppress = this.entries.filter(e => e.action === 'suppress').length;
    const unsuppress = this.entries.filter(e => e.action === 'unsuppress').length;
    const review = this.entries.filter(e => e.action === 'review').length;

    report += `## Summary\n\n`;
    report += `| Metric | Count |\n`;
    report += `|--------|-------|\n`;
    report += `| Total Suppressions | ${suppress} |\n`;
    report += `| Total Unsuppressions | ${unsuppress} |\n`;
    report += `| Total Reviews | ${review} |\n`;
    report += `| Unique Users | ${byUser.size} |\n`;
    report += `| Unique Projects | ${byProject.size} |\n\n`;

    // By User
    if (byUser.size > 0) {
      report += `## Activity by User\n\n`;
      Array.from(byUser.entries()).forEach(([user, entries]) => {
        report += `### ${user}\n`;
        report += `- Suppressions: ${entries.filter(e => e.action === 'suppress').length}\n`;
        report += `- Unsuppressions: ${entries.filter(e => e.action === 'unsuppress').length}\n`;
        report += `- Reviews: ${entries.filter(e => e.action === 'review').length}\n`;
        report += `- Last Activity: ${entries[entries.length - 1].date} ${entries[entries.length - 1].time}\n\n`;
      });
    }

    // By Project
    if (byProject.size > 0) {
      report += `## Activity by Project\n\n`;
      Array.from(byProject.entries()).forEach(([project, entries]) => {
        report += `### ${project}\n`;
        report += `- Total Activities: ${entries.length}\n`;
        report += `- Suppressions: ${entries.filter(e => e.action === 'suppress').length}\n`;
        report += `- Last Activity: ${entries[entries.length - 1].date} ${entries[entries.length - 1].time}\n\n`;
      });
    }

    // Recent entries
    report += `## Recent Activities\n\n`;
    report += `| Date | Time | User | Project | File:Line | Pattern | Action |\n`;
    report += `|------|------|------|---------|-----------|---------|--------|\n`;
    
    const recent = this.entries.slice(-20).reverse();
    recent.forEach(entry => {
      report += `| ${entry.date} | ${entry.time} | ${entry.user} | ${entry.project} | ${entry.file}:${entry.line} | \`${entry.pattern}\` | ${entry.action} |\n`;
    });

    return report;
  }

  /**
   * Export log as CSV
   */
  exportAsCSV(): string {
    let csv = `Action,Date,Time,User,Project,File,Line,Pattern,Severity,Reason,Machine\n`;
    
    this.entries.forEach(entry => {
      const reason = entry.reason ? `"${entry.reason.replace(/"/g, '""')}"` : '';
      csv += `${entry.action},${entry.date},${entry.time},${entry.user},${entry.project},${entry.file},${entry.line},${entry.pattern},${entry.severity},${reason},${entry.machine}\n`;
    });

    return csv;
  }

  /**
   * Clear old entries (older than X days)
   */
  clearOldEntries(daysOld: number = 90): number {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const originalLength = this.entries.length;
    this.entries = this.entries.filter(e => e.timestamp > cutoffTime);
    const removed = originalLength - this.entries.length;

    // Rewrite log file
    this.rewriteLogFile();
    return removed;
  }

  /**
   * Rewrite log file with current entries
   */
  private rewriteLogFile(): void {
    try {
      const header = `# Guardian Suppressions Log\n# Format: One JSON object per line\n#\n`;
      let content = header;
      this.entries.forEach(entry => {
        content += JSON.stringify(entry) + '\n';
      });
      fs.writeFileSync(this.logFilePath, content, 'utf-8');
    } catch (error) {
      console.error('Error rewriting log file:', error);
    }
  }

  /**
   * Get log file path
   */
  getLogFilePath(): string {
    return this.logFilePath;
  }
}
