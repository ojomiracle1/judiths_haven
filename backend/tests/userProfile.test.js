const request = require('supertest');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');

describe('User Profile API', () => {
  let token;
  beforeAll(async () => {
    token = await getTestUserToken();
  });

  it('should get the user profile', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('name');
  });

  it('should update the user profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Name');
  });
}); 