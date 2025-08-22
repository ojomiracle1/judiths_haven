const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

describe('generateToken utility', () => {
  const OLD_ENV = process.env;
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should generate a JWT token as a string', () => {
    const token = generateToken('testuserid');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('should encode the correct payload', () => {
    const token = generateToken('testuserid');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('id', 'testuserid');
    expect(decoded).toHaveProperty('exp');
    expect(decoded).toHaveProperty('iat');
  });
}); 