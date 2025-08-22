const request = require('supertest');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');
let adminToken, userToken, productId;

beforeAll(async () => {
  adminToken = await getTestUserToken();
  // Create a regular user
  const email = `produser${Date.now()}@example.com`;
  const password = 'Test1234!';
  await request(app).post('/api/users/register').send({ name: 'Prod User', email, password });
  const loginRes = await request(app).post('/api/users/login').send({ email, password });
  userToken = loginRes.body.token;
  // Create a category for product creation
  const catRes = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: `ProdCat${Date.now()}`, image: 'test.jpg', description: 'desc' });
  global.categoryId = catRes.body._id;
});

describe('Product API', () => {
  it('should list products', async () => {
    const res = await request(app)
      .get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
  });
});

describe('Product Admin/Negative Cases', () => {
  it('should create a product as admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Admin Product',
        price: 100,
        countInStock: 10,
        description: 'desc',
        brand: 'brand',
        category: global.categoryId,
        images: ['test.jpg']
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Admin Product');
    productId = res.body._id;
  });

  it('should not create a product as non-admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'User Product',
        price: 100,
        countInStock: 10,
        description: 'desc',
        brand: 'brand',
        category: global.categoryId,
        images: ['test.jpg']
      });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should not create a product if not authenticated', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: 'NoAuth Product',
        price: 100,
        countInStock: 10,
        description: 'desc',
        brand: 'brand',
        category: global.categoryId,
        images: ['test.jpg']
      });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should not create a product with missing fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Incomplete Product' });
    expect(res.statusCode).toBe(400);
  });

  it('should update a product as admin', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Product' });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('name', 'Updated Product');
  });

  it('should not update a product as non-admin', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Should Not Update' });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should not update a product if not authenticated', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({ name: 'NoAuth Update' });
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should return 404 when updating non-existent product', async () => {
    const res = await request(app)
      .put('/api/products/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'No Product' });
    expect(res.statusCode).toBe(404);
  });

  it('should delete a product as admin', async () => {
    // Create a product to delete
    const resCreate = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'To Delete',
        price: 50,
        countInStock: 5,
        description: 'desc',
        brand: 'brand',
        category: global.categoryId,
        images: ['test.jpg']
      });
    const delProductId = resCreate.body._id;
    const res = await request(app)
      .delete(`/api/products/${delProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(res.statusCode);
  });

  it('should not delete a product as non-admin', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should not delete a product if not authenticated', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`);
    expect([401, 403]).toContain(res.statusCode);
  });

  it('should return 404 when deleting non-existent product', async () => {
    const res = await request(app)
      .delete('/api/products/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('Product Validation', () => {
  it('should not create a product with missing name', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 100, countInStock: 10, description: 'desc', brand: 'brand', category: global.categoryId, images: ['test.jpg'] });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
  it('should not create a product with negative price', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bad Product', price: -10, countInStock: 10, description: 'desc', brand: 'brand', category: global.categoryId, images: ['test.jpg'] });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
  it('should not update a product with invalid ID', async () => {
    const res = await request(app)
      .put('/api/products/invalidid')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Invalid Update' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});