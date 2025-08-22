const sendEmail = require('../utils/sendEmail');
const nodemailer = require('nodemailer');

describe('sendEmail utility', () => {
  it('should be a function', () => {
    expect(typeof sendEmail).toBe('function');
  });

  it('should send an email (mock nodemailer)', async () => {
    const sendMailMock = jest.fn().mockResolvedValue(true);
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail: sendMailMock });
    const options = { to: 'test@example.com', subject: 'Test', html: '<b>Test</b>' };
    await sendEmail(options);
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@example.com',
      subject: 'Test',
      html: '<b>Test</b>'
    }));
    nodemailer.createTransport.mockRestore();
  });
}); 