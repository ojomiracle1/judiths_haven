const request = require('supertest');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');
let adminToken, userToken, userId;

beforeAll(async () => {
  // Create admin
  adminToken = await getTestUserToken();
  // Create a regular user
  const email = `regular${Date.now()}@example.com`;
  const password = 'Test1234!';
  await request(app).post('/api/users/register').send({ name: 'Regular User', email, password });
  const loginRes = await request(app).post('/api/users/login').send({ email, password });
  userToken = loginRes.body.token;
  userId = loginRes.body._id;
});

describe('User Auth API', () => {
  const email = `testuser${Date.now()}@example.com`;
  const password = 'Test1234!';

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Test User', email, password });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('email', email);
    expect(res.body).toHaveProperty('name', 'Test User');
  });

  it('should login with correct credentials', async () => {
    // Register first (if not already)
    await request(app)
      .post('/api/users/register')
      .send({ name: 'Test User', email, password });
    const res = await request(app)
      .post('/api/users/login')
      .send({ email, password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', email);
  });
});

describe('User Validation', () => {
  it('should not register with missing email', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'No Email', password: 'Test1234!' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
  it('should not register with invalid email', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Bad Email', email: 'notanemail', password: 'Test1234!' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
  it('should not login with missing password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('User Management (Admin)', () => {
  it('should get all users as admin', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not get all users as non-admin', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should not get all users if not authenticated', async () => {
    const res = await request(app).get('/api/users');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should get a user by id as admin', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app)
      .get('/api/users/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('should update a user as admin', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated User', isAdmin: false });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated User');
  });

  it('should not update a user as non-admin', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Should Not Update' });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should delete a user as admin', async () => {
    // Create a user to delete
    const email = `todelete${Date.now()}@example.com`;
    const password = 'Test1234!';
    const regRes = await request(app).post('/api/users/register').send({ name: 'To Delete', email, password });
    const delUserId = regRes.body._id;
    const res = await request(app)
      .delete(`/api/users/${delUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(res.statusCode);
  });

  it('should not delete a user as non-admin', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should ban a user as admin', async () => {
    // Create a user to ban
    const email = `toban${Date.now()}@example.com`;
    const password = 'Test1234!';
    const regRes = await request(app).post('/api/users/register').send({ name: 'To Ban', email, password });
    const banUserId = regRes.body._id;
    const res = await request(app)
      .patch(`/api/users/${banUserId}/ban`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ banned: true });
    expect([200, 204]).toContain(res.statusCode);
  });

  it('should not ban a user as non-admin', async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}/ban`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ banned: true });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should return 404 when banning non-existent user', async () => {
    const res = await request(app)
      .patch('/api/users/000000000000000000000000/ban')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ banned: true });
    expect(res.statusCode).toBe(404);
  });
}); 