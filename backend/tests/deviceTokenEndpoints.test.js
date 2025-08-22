const request = require('supertest');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');

describe('Device Token API Endpoints', () => {
  let token;
  beforeAll(async () => {
    token = await getTestUserToken();
  });

  it('should register a device token', async () => {
    const res = await request(app)
      .post('/api/device-token')
      .set('Authorization', `Bearer ${token}`)
      .send({ token: 'test-device-token' });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('message');
  });

  it('should not register without token', async () => {
    const res = await request(app)
      .post('/api/device-token')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('should not register if not authenticated', async () => {
    const res = await request(app)
      .post('/api/device-token')
      .send({ token: 'test-device-token' });
    expect(res.statusCode).toBe(401);
  });
}); 