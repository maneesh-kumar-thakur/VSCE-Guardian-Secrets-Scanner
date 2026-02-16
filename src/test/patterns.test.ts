/**
 * Unit Tests for Pattern Detection
 */

import * as assert from 'assert';
import { SecretPatternLibrary, SecretPattern } from '../patterns';

suite('Secret Pattern Library Tests', () => {
  suite('Entropy Calculation', () => {
    test('Should calculate low entropy for repeated characters', () => {
      const entropy = SecretPatternLibrary.calculateEntropy('aaaaaaaaaa');
      assert.ok(entropy < 1.0, `Expected entropy < 1.0, got ${entropy}`);
    });

    test('Should calculate high entropy for random strings', () => {
      const entropy = SecretPatternLibrary.calculateEntropy('K7x9Mq2Wp5Nz8Rt3');
      assert.ok(entropy > 4.0, `Expected entropy > 4.0, got ${entropy}`);
    });

    test('Should calculate medium entropy for passwords', () => {
      const entropy = SecretPatternLibrary.calculateEntropy('password123');
      assert.ok(entropy > 2.0 && entropy < 4.0, `Expected 2.0 < entropy < 4.0, got ${entropy}`);
    });

    test('Should handle empty strings', () => {
      const entropy = SecretPatternLibrary.calculateEntropy('');
      assert.ok(isNaN(entropy) || entropy === 0);
    });

    test('Should handle single character', () => {
      const entropy = SecretPatternLibrary.calculateEntropy('a');
      assert.strictEqual(entropy, 0);
    });
  });

  suite('High Entropy Secret Detection', () => {
    test('Should detect high entropy secret with good variety', () => {
      const result = SecretPatternLibrary.isHighEntropySecret('K7x9Mq2Wp5Nz8Rt3Jv6Yl4H', 4.5);
      assert.strictEqual(result, true, 'Should detect high entropy secret');
    });

    test('Should reject short strings', () => {
      const result = SecretPatternLibrary.isHighEntropySecret('K7x9Mq', 4.5);
      assert.strictEqual(result, false, 'Should reject strings < 16 chars');
    });

    test('Should reject low variety strings', () => {
      const result = SecretPatternLibrary.isHighEntropySecret('1234567890123456', 4.5);
      assert.strictEqual(result, false, 'Should reject low variety strings');
    });

    test('Should respect custom threshold', () => {
      const lowThreshold = SecretPatternLibrary.isHighEntropySecret('K7x9Mq2Wp5Nz8Rt3', 3.0);
      const highThreshold = SecretPatternLibrary.isHighEntropySecret('K7x9Mq2Wp5Nz8Rt3', 6.0);
      
      assert.strictEqual(lowThreshold, true, 'Should pass low threshold');
      assert.strictEqual(highThreshold, false, 'Should fail high threshold');
    });
  });

  suite('AWS Pattern Detection', () => {
    test('Should detect AWS Access Key ID', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const awsPattern = patterns.find(p => p.name === 'AWS Access Key ID');
      
      assert.ok(awsPattern, 'AWS pattern should exist');
      
      const validKey = 'AKIAIOSFODNN7EXAMPLE';
      const match = awsPattern!.pattern.test(validKey);
      assert.strictEqual(match, true, 'Should match valid AWS key');
    });

    test('Should detect AKIA prefixed keys', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const awsPattern = patterns.find(p => p.name === 'AWS Access Key ID');
      
      const testCases = [
        'AKIAIOSFODNN7EXAMPLE',
        'AKIA1234567890ABCDEF',
        'ASIATESTACCESSKEY123',
      ];
      
      testCases.forEach(key => {
        awsPattern!.pattern.lastIndex = 0;
        const match = awsPattern!.pattern.test(key);
        assert.strictEqual(match, true, `Should match ${key}`);
      });
    });

    test('Should not detect invalid AWS keys', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const awsPattern = patterns.find(p => p.name === 'AWS Access Key ID');
      
      const invalidCases = [
        'AKIA123',  // Too short
        'BKIA1234567890ABCDEF',  // Wrong prefix
        'akiaiosfodnn7example',  // Lowercase
      ];
      
      invalidCases.forEach(key => {
        awsPattern!.pattern.lastIndex = 0;
        const match = awsPattern!.pattern.test(key);
        assert.strictEqual(match, false, `Should not match ${key}`);
      });
    });
  });

  suite('GitHub Token Detection', () => {
    test('Should detect GitHub Personal Access Token', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const ghPattern = patterns.find(p => p.name === 'GitHub Personal Access Token');
      
      const token = 'ghp_1234567890abcdefghijklmnopqrstuv';
      const match = ghPattern!.pattern.test(token);
      assert.strictEqual(match, true, 'Should match GitHub PAT');
    });

    test('Should detect GitHub OAuth Token', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const ghPattern = patterns.find(p => p.name === 'GitHub OAuth Token');
      
      const token = 'gho_1234567890abcdefghijklmnopqrstuv';
      const match = ghPattern!.pattern.test(token);
      assert.strictEqual(match, true, 'Should match GitHub OAuth');
    });

    test('Should detect GitHub App Token', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const ghPattern = patterns.find(p => p.name === 'GitHub App Token');
      
      const tokens = [
        'ghu_1234567890abcdefghijklmnopqrstuv',
        'ghs_1234567890abcdefghijklmnopqrstuv',
      ];
      
      tokens.forEach(token => {
        ghPattern!.pattern.lastIndex = 0;
        const match = ghPattern!.pattern.test(token);
        assert.strictEqual(match, true, `Should match ${token}`);
      });
    });
  });

  suite('Database Connection String Detection', () => {
    test('Should detect MongoDB connection string', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const dbPattern = patterns.find(p => p.name === 'Database Connection String');
      
      const connStr = 'mongodb://user:password123@localhost:27017/mydb';
      const match = dbPattern!.pattern.test(connStr);
      assert.strictEqual(match, true, 'Should match MongoDB connection');
    });

    test('Should detect PostgreSQL connection string', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const dbPattern = patterns.find(p => p.name === 'Database Connection String');
      
      const connStr = 'postgresql://admin:secretpass@db.example.com:5432/production';
      dbPattern!.pattern.lastIndex = 0;
      const match = dbPattern!.pattern.test(connStr);
      assert.strictEqual(match, true, 'Should match PostgreSQL connection');
    });

    test('Should detect MySQL connection string', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const dbPattern = patterns.find(p => p.name === 'Database Connection String');
      
      const connStr = 'mysql://root:mypassword@localhost:3306/app';
      dbPattern!.pattern.lastIndex = 0;
      const match = dbPattern!.pattern.test(connStr);
      assert.strictEqual(match, true, 'Should match MySQL connection');
    });
  });

  suite('Private Key Detection', () => {
    test('Should detect RSA private key', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const keyPattern = patterns.find(p => p.name === 'RSA Private Key');
      
      const key = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...';
      const match = keyPattern!.pattern.test(key);
      assert.strictEqual(match, true, 'Should match RSA key');
    });

    test('Should detect SSH private key', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const keyPattern = patterns.find(p => p.name === 'SSH Private Key');
      
      const keys = [
        '-----BEGIN OPENSSH PRIVATE KEY-----',
        '-----BEGIN DSA PRIVATE KEY-----',
        '-----BEGIN EC PRIVATE KEY-----',
      ];
      
      keys.forEach(key => {
        keyPattern!.pattern.lastIndex = 0;
        const match = keyPattern!.pattern.test(key);
        assert.strictEqual(match, true, `Should match ${key}`);
      });
    });

    test('Should detect PGP private key', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const keyPattern = patterns.find(p => p.name === 'PGP Private Key');
      
      const key = '-----BEGIN PGP PRIVATE KEY BLOCK-----';
      const match = keyPattern!.pattern.test(key);
      assert.strictEqual(match, true, 'Should match PGP key');
    });
  });

  suite('JWT Detection', () => {
    test('Should detect valid JWT', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const jwtPattern = patterns.find(p => p.name === 'JSON Web Token');
      
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const match = jwtPattern!.pattern.test(jwt);
      assert.strictEqual(match, true, 'Should match JWT');
    });

    test('Should not detect invalid JWT format', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const jwtPattern = patterns.find(p => p.name === 'JSON Web Token');
      
      const invalidJwts = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',  // Only header
        'not.a.jwt',  // Invalid format
      ];
      
      invalidJwts.forEach(jwt => {
        jwtPattern!.pattern.lastIndex = 0;
        const match = jwtPattern!.pattern.test(jwt);
        assert.strictEqual(match, false, `Should not match ${jwt}`);
      });
    });
  });

  suite('Stripe API Key Detection', () => {
    test('Should detect Stripe live secret key', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const stripePattern = patterns.find(p => p.name === 'Stripe API Key');
      
      const key = 'sk_live_1234567890abcdefghij';
      const match = stripePattern!.pattern.test(key);
      assert.strictEqual(match, true, 'Should match Stripe live key');
    });

    test('Should detect Stripe test key', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const stripePattern = patterns.find(p => p.name === 'Stripe API Key');
      
      const key = 'sk_test_1234567890abcdefghij';
      stripePattern!.pattern.lastIndex = 0;
      const match = stripePattern!.pattern.test(key);
      assert.strictEqual(match, true, 'Should match Stripe test key');
    });

    test('Should detect Stripe publishable key', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const stripePattern = patterns.find(p => p.name === 'Stripe API Key');
      
      const key = 'pk_live_1234567890abcdefghij';
      stripePattern!.pattern.lastIndex = 0;
      const match = stripePattern!.pattern.test(key);
      assert.strictEqual(match, true, 'Should match Stripe publishable key');
    });
  });

  suite('Slack Token Detection', () => {
    test('Should detect Slack bot token', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const slackPattern = patterns.find(p => p.name === 'Slack Token');
      
      const token = 'xoxb-1234567890-1234567890-abcdefghijklmnop';
      const match = slackPattern!.pattern.test(token);
      assert.strictEqual(match, true, 'Should match Slack bot token');
    });

    test('Should detect Slack webhook', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const webhookPattern = patterns.find(p => p.name === 'Slack Webhook');
      
      const webhook = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX';
      const match = webhookPattern!.pattern.test(webhook);
      assert.strictEqual(match, true, 'Should match Slack webhook');
    });
  });

  suite('Generic Password Detection', () => {
    test('Should detect password in assignment', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const pwdPattern = patterns.find(p => p.name === 'Password in Code');
      
      const code = 'password = "mySecretPass123"';
      const match = pwdPattern!.pattern.test(code);
      assert.strictEqual(match, true, 'Should match password assignment');
    });

    test('Should detect password variations', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const pwdPattern = patterns.find(p => p.name === 'Password in Code');
      
      const variations = [
        'password: "secret123"',
        'pwd = "mypass456"',
        'pass="testing789"',
        'passwd: "admin1234"',
      ];
      
      variations.forEach(code => {
        pwdPattern!.pattern.lastIndex = 0;
        const match = pwdPattern!.pattern.test(code);
        assert.strictEqual(match, true, `Should match ${code}`);
      });
    });
  });

  suite('False Positive Filtering', () => {
    test('Should filter placeholder API keys', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const apiPattern = patterns.find(p => p.name === 'Generic API Key');
      
      const placeholder = 'api_key = "YOUR_API_KEY"';
      const matches = apiPattern!.pattern.exec(placeholder);
      
      if (matches && apiPattern!.falsePositiveFilter) {
        const isFiltered = apiPattern!.falsePositiveFilter(matches[0], placeholder);
        assert.strictEqual(isFiltered, true, 'Should filter placeholder');
      }
    });

    test('Should filter example passwords', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const pwdPattern = patterns.find(p => p.name === 'Password in Code');
      
      const examples = [
        'password = "EXAMPLE_PASSWORD"',
        'pwd: "TEST_PASSWORD"',
        'pass = "PLACEHOLDER"',
      ];
      
      examples.forEach(code => {
        pwdPattern!.pattern.lastIndex = 0;
        const matches = pwdPattern!.pattern.exec(code);
        
        if (matches && pwdPattern!.falsePositiveFilter) {
          const isFiltered = pwdPattern!.falsePositiveFilter(matches[0], code);
          assert.strictEqual(isFiltered, true, `Should filter ${code}`);
        }
      });
    });

    test('Should not filter real secrets', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const apiPattern = patterns.find(p => p.name === 'Generic API Key');
      
      const realSecret = 'api_key = "sk_live_1234567890abcdef"';
      const matches = apiPattern!.pattern.exec(realSecret);
      
      if (matches && apiPattern!.falsePositiveFilter) {
        const isFiltered = apiPattern!.falsePositiveFilter(matches[0], realSecret);
        assert.strictEqual(isFiltered, false, 'Should not filter real secret');
      }
    });
  });

  suite('Pattern Coverage', () => {
    test('Should have patterns for major cloud providers', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const categories = patterns.map(p => p.category);
      
      assert.ok(categories.includes('Cloud Credentials'), 'Should have cloud credentials');
    });

    test('Should have patterns for source control', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const categories = patterns.map(p => p.category);
      
      assert.ok(categories.includes('Source Control'), 'Should have source control patterns');
    });

    test('Should have patterns for databases', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const categories = patterns.map(p => p.category);
      
      assert.ok(categories.includes('Database'), 'Should have database patterns');
    });

    test('Should have patterns for payment services', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const categories = patterns.map(p => p.category);
      
      assert.ok(categories.includes('Payment'), 'Should have payment patterns');
    });

    test('Should have at least 40 patterns', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      assert.ok(patterns.length >= 40, `Should have at least 40 patterns, got ${patterns.length}`);
    });
  });

  suite('Severity Levels', () => {
    test('AWS keys should be critical', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const awsPattern = patterns.find(p => p.name === 'AWS Access Key ID');
      assert.strictEqual(awsPattern!.severity, 'critical');
    });

    test('Private keys should be critical', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const keyPattern = patterns.find(p => p.name === 'RSA Private Key');
      assert.strictEqual(keyPattern!.severity, 'critical');
    });

    test('Generic passwords should be high', () => {
      const patterns = SecretPatternLibrary.getPatterns();
      const pwdPattern = patterns.find(p => p.name === 'Password in Code');
      assert.strictEqual(pwdPattern!.severity, 'high');
    });
  });

  suite('Custom Pattern Addition', () => {
    test('Should allow adding custom patterns', () => {
      const initialCount = SecretPatternLibrary.getPatterns().length;
      
      const customPattern: SecretPattern = {
        name: 'Test Custom Pattern',
        pattern: /CUSTOM_[A-Z0-9]{16}/g,
        severity: 'high',
        description: 'Test pattern',
        category: 'Test',
        suggestedFix: 'Remove this test pattern from code.',
      };
      
      SecretPatternLibrary.addCustomPattern(customPattern);
      
      const newCount = SecretPatternLibrary.getPatterns().length;
      assert.strictEqual(newCount, initialCount + 1, 'Should increase pattern count');
    });

    test('Custom pattern should be detectable', () => {
      const customPattern: SecretPattern = {
        name: 'Custom API Key',
        pattern: /MYAPP_[A-Z0-9]{32}/g,
        severity: 'critical',
        description: 'Custom app API key',
        category: 'Custom',
        suggestedFix: 'DELETE IMMEDIATELY and regenerate API key.',
      };
      
      SecretPatternLibrary.addCustomPattern(customPattern);
      
      const patterns = SecretPatternLibrary.getPatterns();
      const addedPattern = patterns.find(p => p.name === 'Custom API Key');
      
      assert.ok(addedPattern, 'Custom pattern should be in library');
      
      const testKey = 'MYAPP_1234567890ABCDEF1234567890AB';
      const match = addedPattern!.pattern.test(testKey);
      assert.strictEqual(match, true, 'Should match custom pattern');
    });
  });
});
