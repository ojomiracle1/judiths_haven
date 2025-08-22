const request = require('supertest');
const app = require('../server');

describe('Product Details API', () => {
  let productId;
  beforeAll(async () => {
    // Create a product as admin
    const { getTestUserToken } = require('./testUtils');
    const token = await getTestUserToken();
    // Create a category first
    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `TestCat${Date.now()}`, image: 'test.jpg', description: 'desc' });
    const categoryId = categoryRes.body._id;
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product',
        price: 10,
        countInStock: 5,
        description: 'desc',
        brand: 'brand',
        category: categoryId,
        images: ['test.jpg']
      });
    productId = productRes.body._id;
  });

  it('should get product details', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Product');
    expect(res.body).toHaveProperty('price', 10);
  });
}); 