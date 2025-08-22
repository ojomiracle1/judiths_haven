const request = require('supertest');
const path = require('path');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');

describe('Upload API Endpoints', () => {
  let token;
  beforeAll(async () => {
    token = await getTestUserToken();
  });

  it('should upload a file as admin', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', path.join(__dirname, '../uploads/category-1.jpg'));
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('path');
  });

  it('should not upload without a file', async () => {
    const res = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });

  it('should not upload if not admin', async () => {
    // Simulate a non-admin user by not using the admin token
    const res = await request(app)
      .post('/api/upload');
    expect([401, 403]).toContain(res.statusCode);
  });
}); 