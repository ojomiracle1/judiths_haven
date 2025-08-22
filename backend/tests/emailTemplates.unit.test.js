const emailTemplates = require('../utils/emailTemplates');

describe('emailTemplates utility', () => {
  it('should be an object', () => {
    expect(typeof emailTemplates).toBe('object');
    expect(emailTemplates).not.toBeNull();
  });

  it('should have a resetPassword template', () => {
    expect(emailTemplates).toHaveProperty('resetPassword');
  });
}); 