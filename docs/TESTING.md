# Testing Guide

## Overview

Guardian includes comprehensive unit tests to ensure reliability. Tests cover:

- Pattern detection accuracy
- Entropy calculation
- Scanner engine functionality
- False positive filtering

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run watch
```

### VS Code Integration

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Test: Run All Tests"
3. View results in Test Explorer

Or:
1. Press F5
2. Select "Extension Tests"
3. Tests run in Extension Development Host

## Test Structure

```
src/test/
├── patterns.test.ts    # Pattern detection tests
├── scanner.test.ts     # Scanner engine tests
└── runTest.ts          # Test runner configuration
```

## Test Coverage

### Pattern Detection Tests

**Entropy Calculation**:
- Low entropy strings
- High entropy strings
- Edge cases

**Specific Patterns**:
- AWS Access Keys
- GitHub Tokens
- Database connection strings
- Private keys
- JWT tokens
- API keys

**False Positive Filtering**:
- Placeholder detection (YOUR_API_KEY, EXAMPLE, TEST)
- Real secret validation

### Scanner Engine Tests

**File Scanning**:
- AWS key detection
- GitHub token detection
- Database strings

**Severity Filtering**:
- Respecting severity threshold

## Manual Testing Checklist

### Before Release

- [ ] Test all patterns with real examples
- [ ] Verify entropy detection
- [ ] Test false positive filtering
- [ ] Test all commands
- [ ] Verify dashboard displays correctly
- [ ] Test export formats (JSON, MD, CSV)
- [ ] Test custom pattern addition
- [ ] Verify diagnostics appear correctly
- [ ] Check status bar updates

### Test Files

Create test file with secrets:

```javascript
// AWS - Should detect
const awsKey = "AKIAIOSFODNN7EXAMPLE";

// GitHub - Should detect
const ghToken = "ghp_1234567890abcdefghijklmnopqrstuv";

// Stripe - Should detect
const stripeKey = "sk_live_1234567890abcdefghijklmnop";

// Placeholders - Should NOT detect
const placeholder = "YOUR_API_KEY";
const example = "EXAMPLE_TOKEN";
```

## Writing New Tests

### Test Structure

```typescript
import * as assert from 'assert';
import { SecretPatternLibrary } from '../patterns';

suite('Test Suite', () => {
  test('Should detect secret', () => {
    const patterns = SecretPatternLibrary.getPatterns();
    const pattern = patterns.find(p => p.name === 'My Secret');
    
    const secret = 'MY_SECRET_VALUE';
    assert.strictEqual(pattern!.pattern.test(secret), true);
  });
});
```

### Best Practices

1. **Test Real-World Scenarios**: Use actual secret formats
2. **Test Edge Cases**: Empty strings, very long strings
3. **Test Positive and Negative Cases**: Should detect and should not detect
4. **Use Descriptive Names**: Clear test purpose

## Debugging Tests

### VS Code Debugger

1. Set breakpoints in test files
2. Press F5
3. Select "Extension Tests"
4. Debugger pauses at breakpoints

### Console Logging

```typescript
test('Debug test', () => {
  console.log('Debug info:', someVariable);
});
```

View output in "Debug Console" panel

### Run Single Test

```typescript
test.only('My specific test', () => {
  // Only this test runs
});
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Coverage Goals

Target coverage:
- **Patterns**: 100% (all patterns tested)
- **Scanner**: 90%+ (core logic)

## Common Issues

### Module not found

```bash
npm run compile
```

### Tests timing out

```typescript
const mocha = new Mocha({
  timeout: 20000  // Increase from default
});
```

### Async test not completing

```typescript
// Good - use async/await
test('Async test', async () => {
  await someAsyncFunction();
});
```

## Summary

- **Unit Tests**: Fast, isolated, comprehensive
- **Manual Tests**: User workflows, edge cases
- **CI/CD Tests**: Automated on every push

Run tests often, test thoroughly! 🛡️
