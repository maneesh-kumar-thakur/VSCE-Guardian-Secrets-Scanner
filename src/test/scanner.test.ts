/**
 * Unit Tests for Scanner Engine
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { ScannerEngine, Finding } from '../scanner';

suite('Scanner Engine Tests', () => {
  let diagnosticCollection: vscode.DiagnosticCollection;
  let scanner: ScannerEngine;

  setup(() => {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('test');
    scanner = new ScannerEngine(diagnosticCollection);
  });

  teardown(() => {
    diagnosticCollection.dispose();
  });

  suite('File Scanning', () => {
    test('Should detect AWS key in file content', async () => {
      const content = `
        const config = {
          accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
          secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
        };
      `;
      
      // Create mock document
      const uri = vscode.Uri.parse('test://test/aws-config.js');
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await scanner.scanFile(document.uri);
      
      assert.ok(findings.length > 0, 'Should find at least one secret');
      assert.ok(
        findings.some(f => f.pattern.includes('AWS')),
        'Should detect AWS key'
      );
    });

    test('Should detect GitHub token', async () => {
      const content = `
        const GITHUB_TOKEN = 'ghp_1234567890abcdefghijklmnopqrstuv';
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await scanner.scanFile(document.uri);
      
      assert.ok(
        findings.some(f => f.pattern.includes('GitHub')),
        'Should detect GitHub token'
      );
    });

    test('Should detect database connection string', async () => {
      const content = `
        const dbUrl = 'mongodb://admin:password123@db.example.com:27017/myapp';
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await scanner.scanFile(document.uri);
      
      assert.ok(
        findings.some(f => f.category === 'Database'),
        'Should detect database connection'
      );
    });

    test('Should not detect placeholders', async () => {
      const content = `
        const apiKey = 'YOUR_API_KEY';
        const password = 'EXAMPLE_PASSWORD';
        const token = 'TEST_TOKEN';
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await scanner.scanFile(document.uri);
      
      assert.strictEqual(
        findings.length,
        0,
        'Should not detect placeholders as secrets'
      );
    });
  });

  suite('Severity Filtering', () => {
    test('Should respect severity threshold', async () => {
      // Set threshold to high
      const config = vscode.workspace.getConfiguration('guardian');
      await config.update('severityLevel', 'high', vscode.ConfigurationTarget.Global);
      
      // Create new scanner with updated config
      const newScanner = new ScannerEngine(diagnosticCollection);
      
      const content = `
        const critical = 'AKIAIOSFODNN7EXAMPLE';  // Critical
        const medium = "some_random_string_here";  // Medium (entropy)
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await newScanner.scanFile(document.uri);
      
      // Should only include high and critical findings
      findings.forEach(f => {
        assert.ok(
          f.severity === 'critical' || f.severity === 'high',
          `Finding should be high or critical, got ${f.severity}`
        );
      });
      
      // Reset config
      await config.update('severityLevel', 'medium', vscode.ConfigurationTarget.Global);
    });
  });

  suite('Entropy Detection', () => {
    test('Should detect high entropy strings when enabled', async () => {
      const config = vscode.workspace.getConfiguration('guardian');
      await config.update('enableEntropyAnalysis', true, vscode.ConfigurationTarget.Global);
      await config.update('entropyThreshold', 4.5, vscode.ConfigurationTarget.Global);
      
      const newScanner = new ScannerEngine(diagnosticCollection);
      
      const content = `
        const secret = "K7x9Mq2Wp5Nz8Rt3Jv6Yl4HcBd0Sg";  // High entropy
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await newScanner.scanFile(document.uri);
      
      assert.ok(
        findings.some(f => f.category === 'Entropy Analysis'),
        'Should detect high entropy string'
      );
      
      // Reset
      await config.update('enableEntropyAnalysis', true, vscode.ConfigurationTarget.Global);
    });

    test('Should not detect low entropy strings', async () => {
      const config = vscode.workspace.getConfiguration('guardian');
      await config.update('enableEntropyAnalysis', true, vscode.ConfigurationTarget.Global);
      
      const newScanner = new ScannerEngine(diagnosticCollection);
      
      const content = `
        const simple = "aaaaaaaaaaaaaaaa";  // Low entropy
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await newScanner.scanFile(document.uri);
      
      assert.ok(
        !findings.some(f => f.category === 'Entropy Analysis'),
        'Should not detect low entropy string'
      );
    });
  });

  suite('Finding Properties', () => {
    test('Findings should have required properties', async () => {
      const content = `
        const key = 'AKIAIOSFODNN7EXAMPLE';
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await scanner.scanFile(document.uri);
      
      assert.ok(findings.length > 0, 'Should have findings');
      
      const finding = findings[0];
      assert.ok(finding.file, 'Should have file path');
      assert.ok(finding.line > 0, 'Should have line number');
      assert.ok(finding.column > 0, 'Should have column number');
      assert.ok(finding.pattern, 'Should have pattern name');
      assert.ok(finding.match, 'Should have match text');
      assert.ok(finding.severity, 'Should have severity');
      assert.ok(finding.description, 'Should have description');
      assert.ok(finding.category, 'Should have category');
      assert.ok(finding.context, 'Should have context');
    });

    test('Secrets should be masked in findings', async () => {
      const content = `
        const key = 'AKIAIOSFODNN7EXAMPLE';
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await scanner.scanFile(document.uri);
      
      assert.ok(findings.length > 0, 'Should have findings');
      
      const finding = findings[0];
      assert.ok(finding.match.includes('*'), 'Secret should be masked');
      assert.ok(!finding.match.includes('AKIAIOSFODNN7EXAMPLE'), 'Should not show full secret');
    });
  });

  suite('Clear Findings', () => {
    test('Should clear all findings', async () => {
      const content = `
        const key = 'AKIAIOSFODNN7EXAMPLE';
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      await scanner.scanFile(document.uri);
      let findings = scanner.getFindings();
      assert.ok(findings.length > 0, 'Should have findings before clear');
      
      scanner.clearFindings();
      findings = scanner.getFindings();
      assert.strictEqual(findings.length, 0, 'Should have no findings after clear');
    });
  });

  suite('Multiple Secrets in File', () => {
    test('Should detect multiple secrets', async () => {
      const content = `
        const aws = 'AKIAIOSFODNN7EXAMPLE';
        const github = 'ghp_1234567890abcdefghijklmnopqrstuv';
        const stripe = 'sk_live_1234567890abcdefghij';
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await scanner.scanFile(document.uri);
      
      assert.ok(findings.length >= 3, `Should find at least 3 secrets, found ${findings.length}`);
    });

    test('Should detect secrets on same line', async () => {
      const content = `
        const config = { aws: 'AKIAIOSFODNN7EXAMPLE', github: 'ghp_1234567890abcdefghijklmnopqrstuv' };
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await scanner.scanFile(document.uri);
      
      assert.ok(findings.length >= 2, 'Should find secrets on same line');
    });
  });

  suite('Context Information', () => {
    test('Should include surrounding lines in context', async () => {
      const content = `
        // Line 1
        const config = {
          // Line 3
          key: 'AKIAIOSFODNN7EXAMPLE',  // Line 4
          // Line 5
        };
        // Line 7
      `;
      
      const document = await vscode.workspace.openTextDocument({
        content,
        language: 'javascript',
      });
      
      const findings = await scanner.scanFile(document.uri);
      
      assert.ok(findings.length > 0, 'Should have findings');
      
      const finding = findings[0];
      const contextLines = finding.context.split('\n').length;
      assert.ok(contextLines >= 3, 'Context should include at least 3 lines');
    });
  });

  suite('Binary File Handling', () => {
    test('Should skip binary files by default', () => {
      // This is tested via configuration
      const config = vscode.workspace.getConfiguration('guardian');
      const scanBinary = config.get('scanBinaryFiles');
      assert.strictEqual(scanBinary, false, 'Should not scan binary files by default');
    });
  });
});
