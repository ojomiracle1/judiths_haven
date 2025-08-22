const request = require('supertest');
const app = require('../server');

describe('Newsletter API Endpoints', () => {
  it('should subscribe to the newsletter', async () => {
    const res = await request(app)
      .post('/api/newsletter/subscribe')
      .send({ email: `test${Date.now()}@example.com` });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should not subscribe with missing email', async () => {
    const res = await request(app)
      .post('/api/newsletter/subscribe')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('should not subscribe with duplicate email', async () => {
    const email = `dup${Date.now()}@example.com`;
    await request(app).post('/api/newsletter/subscribe').send({ email });
    const res = await request(app).post('/api/newsletter/subscribe').send({ email });
    expect(res.statusCode).toBe(400);
  });
}); 