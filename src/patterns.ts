/**
 * Secret Pattern Detector
 * Advanced pattern matching with entropy analysis and context awareness
 */

export interface SecretPattern {
  name: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  category: string;
  suggestedFix: string;
  falsePositiveFilter?: (match: string, context: string) => boolean;
}

export class SecretPatternLibrary {
  private static readonly patterns: SecretPattern[] = [
    // AWS Credentials
    {
      name: 'AWS Access Key ID',
      pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
      severity: 'critical',
      description: 'AWS Access Key ID detected',
      category: 'Cloud Credentials',
      suggestedFix: '🔴 DELETE THIS LINE IMMEDIATELY. AWS IAM Console → Users → Select user → Access keys → Deactivate the exposed key → Create a new key. Update all configs.',
    },
    {
      name: 'AWS Secret Access Key',
      pattern: /aws[\s_-]*(?:secret|access|key)[\s_-]*['"][\w+/=-]{40}['"]/gi,
      severity: 'critical',
      description: 'AWS Secret Access Key detected',
      category: 'Cloud Credentials',      suggestedFix: '🔴 DELETE IMMEDIATELY. AWS IAM → Deactivate key → Create new one → Update all applications.',    },
    {
      name: 'AWS Session Token',
      pattern: /aws[\s_-]*session[\s_-]*token[\s_-]*['"][\w+/=-]{100,}['"]/gi,
      severity: 'critical',
      description: 'AWS Session Token detected',
      category: 'Cloud Credentials',      suggestedFix: '🔴 DELETE IMMEDIATELY. Session tokens expire - remove and generate new temporary credentials if needed.',    },

    // Google Cloud
    {
      name: 'Google API Key',
      pattern: /AIza[0-9A-Za-z\\-_]{35}/g,
      severity: 'critical',
      description: 'Google API Key detected',
      category: 'Cloud Credentials',
      suggestedFix: '🔴 DELETE IMMEDIATELY. Google Cloud Console → APIs & Services → Delete key → Create new restricted key.',
    },
    {
      name: 'Google Cloud Service Account',
      pattern: /"type":\s*"service_account"/g,
      severity: 'critical',
      description: 'Google Cloud Service Account JSON detected',
      category: 'Cloud Credentials',
      suggestedFix: '🔴 DELETE FILE IMMEDIATELY. Google Cloud Console → Service Accounts → Delete key → Create new one. Use git-filter-repo to clean history.',
    },
    {
      name: 'Google OAuth',
      pattern: /\d+-[\dA-Za-z_]{32}\.apps\.googleusercontent\.com/g,
      severity: 'high',
      description: 'Google OAuth Client ID detected',
      category: 'Cloud Credentials',
      suggestedFix: '⚠️ Remove from code. Google Cloud Console → OAuth 2.0 → Delete and create new ID. Use environment variables.',
    },

    // Azure
    {
      name: 'Azure Storage Account Key',
      pattern: /DefaultEndpointsProtocol=https;AccountName=[a-z0-9]+;AccountKey=[A-Za-z0-9+/=]{88}/g,
      severity: 'critical',
      description: 'Azure Storage Account Key detected',
      category: 'Cloud Credentials',
      suggestedFix: '🔴 DELETE IMMEDIATELY. Azure Portal → Storage Accounts → Regenerate key → Use Azure Key Vault for management.',
    },
    {
      name: 'Azure Client Secret',
      pattern: /azure[\s_-]*client[\s_-]*secret[\s_-]*['"][\w~.-]{34,40}['"]/gi,
      severity: 'critical',
      description: 'Azure Client Secret detected',
      category: 'Cloud Credentials',      suggestedFix: '🔴 DELETE IMMEDIATELY. Azure Portal → App registrations → Delete secret → Create new one. Move to Azure Key Vault.',    },

    // Generic API Keys and Tokens
    {
      name: 'Generic API Key',
      pattern: /(?:api[_-]?key|apikey)[\s_-]*['"]([\w=-]{20,})['"]/gi,
      severity: 'high',
      description: 'Generic API Key detected',
      category: 'API Keys',
      suggestedFix: '⚠️ Remove immediately. Identify provider → Regenerate key → Move to .env or secrets manager.',
      falsePositiveFilter: (match, context) => {
        return /YOUR_API_KEY|EXAMPLE|PLACEHOLDER|TEST|DUMMY|SAMPLE/i.test(match);
      },
    },
    {
      name: 'Bearer Token',
      pattern: /bearer\s+[\w.=-]+/gi,
      severity: 'high',
      description: 'Bearer Token detected',
      category: 'Tokens',      suggestedFix: '⚠️ Remove token from code. Rotate immediately with API provider → Store in .env → Update authentication.',    },
    {
      name: 'Authorization Header',
      pattern: /authorization:\s*['"]?(?:Bearer|Basic|Token)\s+[\w.=-]+['"]?/gi,
      severity: 'high',
      description: 'Authorization Header detected',
      category: 'Tokens',      suggestedFix: '⚠️ Never hardcode auth headers. Use dynamic token retrieval from Key Vault, .env, or Secrets Manager.',    },

    // GitHub
    {
      name: 'GitHub Personal Access Token',
      pattern: /ghp_[0-9a-zA-Z]{36}/g,
      severity: 'critical',
      description: 'GitHub Personal Access Token detected',
      category: 'Source Control',
      suggestedFix: '🔴 DELETE IMMEDIATELY. GitHub Settings → Developer settings → Tokens → Delete exposed token → Create new one.',
    },
    {
      name: 'GitHub OAuth Token',
      pattern: /gho_[0-9a-zA-Z]{36}/g,
      severity: 'critical',
      description: 'GitHub OAuth Token detected',
      category: 'Source Control',
      suggestedFix: '🔴 DELETE IMMEDIATELY. GitHub → OAuth Apps → Revoke token → Regenerate. Rotate all related credentials.',
    },
    {
      name: 'GitHub App Token',
      pattern: /(?:ghu|ghs)_[0-9a-zA-Z]{36}/g,
      severity: 'critical',
      description: 'GitHub App Token detected',
      category: 'Source Control',
      suggestedFix: '🔴 DELETE IMMEDIATELY. GitHub → App settings → Revoke token → Regenerate.',
    },

    // GitLab
    {
      name: 'GitLab Personal Access Token',
      pattern: /glpat-[0-9a-zA-Z\-_]{20}/g,
      severity: 'critical',
      description: 'GitLab Personal Access Token detected',
      category: 'Source Control',      suggestedFix: '🔴 DELETE IMMEDIATELY. GitLab Settings → Access Tokens → Revoke exposed token → Create new one.',    },

    // Slack
    {
      name: 'Slack Token',
      pattern: /xox[baprs]-[0-9a-zA-Z]{10,48}/g,
      severity: 'high',
      description: 'Slack Token detected',
      category: 'Communication',
      suggestedFix: '⚠️ DELETE IMMEDIATELY. Slack Workspace → Settings → Manage Apps → Revoke token → Regenerate.',
    },
    {
      name: 'Slack Webhook',
      pattern: /https:\/\/hooks\.slack\.com\/services\/T\w+\/B\w+\/\w+/g,
      severity: 'high',
      description: 'Slack Webhook URL detected',
      category: 'Communication',
      suggestedFix: '⚠️ DELETE IMMEDIATELY. Slack Workspace → Apps → Find webhook → Delete and create new one.',
    },

    // Database Connection Strings
    {
      name: 'Database Connection String',
      pattern: /(?:mongodb|mysql|postgresql|postgres|jdbc):\/\/[^\s'"]+:[^\s'"]+@[^\s'"]+/gi,
      severity: 'critical',
      description: 'Database connection string with credentials detected',
      category: 'Database',      suggestedFix: '🔴 DELETE IMMEDIATELY. Extract to .env file with format DATABASE_URL=driver://user:pass@host:port/db. Never commit credentials.',    },
    {
      name: 'PostgreSQL Password',
      pattern: /(?:postgres|postgresql|pg)[\s_-]*(?:password|pwd)[\s_-]*['"]([^'"]{8,})['"]/gi,
      severity: 'critical',
      description: 'PostgreSQL password detected',
      category: 'Database',      suggestedFix: '🔴 DELETE IMMEDIATELY. Create new PostgreSQL user → Update connection string in .env → Never commit database credentials.',    },
    {
      name: 'MySQL Password',
      pattern: /(?:mysql|mariadb)[\s_-]*(?:password|pwd)[\s_-]*['"]([^'"]{8,})['"]/gi,
      severity: 'critical',
      description: 'MySQL password detected',
      category: 'Database',      suggestedFix: '🔴 DELETE IMMEDIATELY. Create new MySQL user → Update .env connection string → Use secrets management for production.',    },

    // Private Keys
    {
      name: 'RSA Private Key',
      pattern: /-----BEGIN RSA PRIVATE KEY-----/g,
      severity: 'critical',
      description: 'RSA Private Key detected',
      category: 'Cryptographic Keys',
      suggestedFix: '🔴 DELETE FILE IMMEDIATELY. Generate new RSA key pair → Use git-filter-repo to clean history → Rotate all keys and certificates.',
    },
    {
      name: 'SSH Private Key',
      pattern: /-----BEGIN (?:OPENSSH|DSA|EC) PRIVATE KEY-----/g,
      severity: 'critical',
      description: 'SSH Private Key detected',
      category: 'Cryptographic Keys',
      suggestedFix: '🔴 DELETE FILE IMMEDIATELY. Delete from server → Generate new SSH key pair → Use git-filter-repo to ensure removed from history.',
    },
    {
      name: 'PGP Private Key',
      pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/g,
      severity: 'critical',
      description: 'PGP Private Key detected',
      category: 'Cryptographic Keys',
      suggestedFix: '🔴 DELETE FILE IMMEDIATELY. Revoke exposed PGP key → Generate new keypair → Clean repository history with git-filter-repo.',
    },

    // JWT
    {
      name: 'JSON Web Token',
      pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
      severity: 'high',
      description: 'JSON Web Token (JWT) detected',
      category: 'Tokens',
      suggestedFix: '⚠️ DELETE IMMEDIATELY. Check JWT claims with jwt.io → Rotate signing key → Regenerate all JWTs → Move secret to .env.',
    },

    // Payment/Financial
    {
      name: 'Stripe API Key',
      pattern: /(?:sk|pk)_(?:live|test)_[0-9a-zA-Z]{24,}/g,
      severity: 'critical',
      description: 'Stripe API Key detected',
      category: 'Payment',
      suggestedFix: '🔴 DELETE IMMEDIATELY. Stripe Dashboard → Developers → API Keys → Revoke exposed key → Regenerate.',
    },
    {
      name: 'PayPal/Braintree Access Token',
      pattern: /access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}/g,
      severity: 'critical',
      description: 'PayPal/Braintree Access Token detected',
      category: 'Payment',
      suggestedFix: '🔴 DELETE IMMEDIATELY. PayPal/Braintree Dashboard → Settings → Regenerate token → Update all integrations.',
    },

    // Passwords (Generic)
    {
      name: 'Password in Code',
      pattern: /(?:password|passwd|pwd|pass)[\s_-]*[=:\s]+['"]([^'"]{8,})['"]/gi,
      severity: 'high',
      description: 'Password detected in code',
      category: 'Credentials',      suggestedFix: '⚠️ DELETE IMMEDIATELY. Change password on affected service → Move to .env or secrets manager → Never hardcode passwords.',      falsePositiveFilter: (match, context) => {
        return /PASSWORD|CHANGEME|YOUR_PASSWORD|EXAMPLE|TEST|PLACEHOLDER/i.test(match);
      },
    },
    {
      name: 'Secret Key',
      pattern: /(?:secret[_-]?key|secretkey)[\s_-]*[=:\s]+['"]([^'"]{16,})['"]/gi,
      severity: 'high',
      description: 'Secret key detected',
      category: 'Credentials',      suggestedFix: '⚠️ DELETE IMMEDIATELY. Generate new secret key → Store in .env or secrets manager → Update all deployments.',    },

    // Email Services
    {
      name: 'SendGrid API Key',
      pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
      severity: 'high',
      description: 'SendGrid API Key detected',
      category: 'Email Services',
      suggestedFix: '⚠️ DELETE IMMEDIATELY. SendGrid Dashboard → API Keys → Delete and regenerate key.',
    },
    {
      name: 'Mailgun API Key',
      pattern: /key-[0-9a-zA-Z]{32}/g,
      severity: 'high',
      description: 'Mailgun API Key detected',
      category: 'Email Services',
      suggestedFix: '⚠️ DELETE IMMEDIATELY. Mailgun Dashboard → API Keys → Delete and regenerate.',
    },
    {
      name: 'Mailchimp API Key',
      pattern: /[0-9a-f]{32}-us\d{1,2}/g,
      severity: 'high',
      description: 'Mailchimp API Key detected',
      category: 'Email Services',
      suggestedFix: '⚠️ DELETE IMMEDIATELY. Mailchimp Account → API Keys & Webhooks → Delete and regenerate.',
    },

    // Messaging/SMS
    {
      name: 'Twilio API Key',
      pattern: /SK[0-9a-fA-F]{32}/g,
      severity: 'high',
      description: 'Twilio API Key detected',
      category: 'SMS/Messaging',
      suggestedFix: '⚠️ DELETE IMMEDIATELY. Twilio Console → Account → API Keys → Delete and regenerate.',
    },

    // NPM
    {
      name: 'NPM Token',
      pattern: /npm_[a-zA-Z0-9]{36}/g,
      severity: 'high',
      description: 'NPM Token detected',
      category: 'Package Managers',
      suggestedFix: '⚠️ DELETE IMMEDIATELY. npm login → npm token delete → npm token create to regenerate.',
    },

    // PyPI
    {
      name: 'PyPI API Token',
      pattern: /pypi-AgEIcHlwaS5vcmc[A-Za-z0-9\-_]{70,}/g,
      severity: 'high',
      description: 'PyPI API Token detected',
      category: 'Package Managers',      suggestedFix: '⚠️ DELETE IMMEDIATELY. PyPI Account Settings → API tokens → Revoke and regenerate token.',    },

    // Heroku
    {
      name: 'Heroku API Key',
      pattern: /[hH]eroku.*[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
      severity: 'high',
      description: 'Heroku API Key detected',
      category: 'Cloud Platforms',
      suggestedFix: '⚠️ DELETE IMMEDIATELY. Heroku Dashboard → Account settings → API Key → Regenerate token.',
    },

    // Generic High-Entropy Strings
    {
      name: 'High Entropy String',
      pattern: /(?:key|token|secret|password|pwd|pass|api)[\s_-]*[=:\s]+['"]([\w+/=-]{32,})['"]/gi,
      severity: 'medium',
      description: 'High entropy string near sensitive keyword',
      category: 'Generic Secrets',      suggestedFix: '❓ Review this value - it appears to be secret-like. If real: DELETE and move to .env. If not: Mark as safe with // guardian:ignore',      falsePositiveFilter: (match, context) => {
        return /EXAMPLE|PLACEHOLDER|YOUR_|TEST_|DUMMY|SAMPLE/i.test(match);
      },
    },
  ];

  static getPatterns(): SecretPattern[] {
    return this.patterns;
  }

  static addCustomPattern(pattern: SecretPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Calculate Shannon entropy of a string
   * Higher entropy suggests more randomness (potential secret)
   */
  static calculateEntropy(str: string): number {
    const len = str.length;
    const frequencies: { [key: string]: number } = {};

    // Count character frequencies
    for (let i = 0; i < len; i++) {
      const char = str[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    // Calculate entropy
    let entropy = 0;
    for (const char in frequencies) {
      const p = frequencies[char] / len;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  /**
   * Check if a string appears to be a secret based on entropy
   */
  static isHighEntropySecret(str: string, threshold: number = 4.5): boolean {
    if (str.length < 16) return false;
    
    const entropy = this.calculateEntropy(str);
    
    // Additional checks
    const hasUpperCase = /[A-Z]/.test(str);
    const hasLowerCase = /[a-z]/.test(str);
    const hasDigits = /\d/.test(str);
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(str);
    
    const varietyScore = [hasUpperCase, hasLowerCase, hasDigits, hasSpecialChars].filter(Boolean).length;
    
    return entropy >= threshold && varietyScore >= 2;
  }
}
