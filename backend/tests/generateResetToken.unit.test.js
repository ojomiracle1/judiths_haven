const generateResetToken = require('../utils/generateResetToken');

describe('generateResetToken utility', () => {
  it('should return a string', () => {
    const token = generateResetToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('should generate unique tokens', () => {
    const tokens = new Set();
    for (let i = 0; i < 10; i++) {
      tokens.add(generateResetToken());
    }
    expect(tokens.size).toBe(10);
    for (const token of tokens) {
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThanOrEqual(32); // typical token length
    }
  });
}); 