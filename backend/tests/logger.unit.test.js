const logger = require('../utils/logger');

describe('logger utility', () => {
  it('should have log methods', () => {
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should log messages (mock transport)', () => {
    // Spy on the logger's transports[0].log method
    const spy = jest.spyOn(logger.transports[0], 'log');
    logger.info('Test info message');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
}); 