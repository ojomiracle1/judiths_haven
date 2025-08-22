const request = require('supertest');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');

describe('Category API', () => {
  let adminToken, userToken, categoryId;

  beforeAll(async () => {
    adminToken = await getTestUserToken();
    // Create a regular user
    const email = `catuser${Date.now()}@example.com`;
    const password = 'Test1234!';
    await request(app).post('/api/users/register').send({ name: 'Cat User', email, password });
    const loginRes = await request(app).post('/api/users/login').send({ email, password });
    userToken = loginRes.body.token;
  });

  it('should list categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `AdminCat${Date.now()}`, image: 'test.jpg', description: 'desc' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('image');
    expect(res.body).toHaveProperty('description');
    categoryId = res.body._id;
  });

  it('should not create a category as non-admin', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'UserCat', image: 'test.jpg', description: 'desc' });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should not create a category if not authenticated', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'NoAuthCat', image: 'test.jpg', description: 'desc' });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should not create a category with missing fields', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'IncompleteCat' });
    expect(res.statusCode).toBe(400);
  });

  it('should update a category as admin', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'UpdatedCat' });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('name', 'UpdatedCat');
  });

  it('should not update a category as non-admin', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'ShouldNotUpdate' });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should not update a category if not authenticated', async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .send({ name: 'NoAuthUpdate' });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should return 404 when updating non-existent category', async () => {
    const res = await request(app)
      .put('/api/categories/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'NoCat' });
    expect(res.statusCode).toBe(404);
  });

  it('should delete a category as admin', async () => {
    // Create a category to delete
    const resCreate = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `ToDeleteCat${Date.now()}`, image: 'test.jpg', description: 'desc' });
    const delCategoryId = resCreate.body._id;
    const res = await request(app)
      .delete(`/api/categories/${delCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(res.statusCode);
  });

  it('should not delete a category as non-admin', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should not delete a category if not authenticated', async () => {
    const res = await request(app)
      .delete(`/api/categories/${categoryId}`);
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should return 404 when deleting non-existent category', async () => {
    const res = await request(app)
      .delete('/api/categories/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
}); 