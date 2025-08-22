const request = require('supertest');
const app = require('../server');

describe('Contact API Endpoints', () => {
  it('should submit a contact message', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Test User', email: `contact${Date.now()}@example.com`, message: 'Hello!' });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('message');
  });

  it('should not submit with missing fields', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Test User', email: '' });
    expect(res.statusCode).toBe(400);
  });
}); 