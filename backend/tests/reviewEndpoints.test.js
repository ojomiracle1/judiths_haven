const request = require('supertest');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');

// Review API tests, including validation and error handling.
describe('Review Validation', () => {
  it('should not add a review with missing comment', async () => {
    const { getTestUserToken } = require('./testUtils');
    const token = await getTestUserToken();
    // Create a category and product
    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `ReviewCat${Date.now()}`, image: 'test.jpg', description: 'desc' });
    const categoryId = categoryRes.body._id;
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Review Test Product', price: 15, countInStock: 10, description: 'desc', brand: 'brand', category: categoryId, images: ['test.jpg'] });
    const productId = productRes.body._id;
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
  it('should not add a review with invalid rating', async () => {
    const { getTestUserToken } = require('./testUtils');
    const token = await getTestUserToken();
    // Create a category and product
    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `ReviewCat${Date.now()}`, image: 'test.jpg', description: 'desc' });
    const categoryId = categoryRes.body._id;
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Review Test Product', price: 15, countInStock: 10, description: 'desc', brand: 'brand', category: categoryId, images: ['test.jpg'] });
    const productId = productRes.body._id;
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 10, comment: 'Bad rating' }); // invalid rating
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('Review API Endpoints', () => {
  let token, productId;
  beforeAll(async () => {
    token = await getTestUserToken();
    // Create a category
    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `ReviewCat${Date.now()}`, image: 'test.jpg', description: 'desc' });
    const categoryId = categoryRes.body._id;
    // Create a product
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Review Test Product',
        price: 15,
        countInStock: 10,
        description: 'desc',
        brand: 'brand',
        category: categoryId,
        images: ['test.jpg']
      });
    productId = productRes.body._id;
  });

  it('should add a review to a product', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5, comment: 'Great product!' });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('message');
  });

  it('should not add a review without rating', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ comment: 'Missing rating' });
    expect(res.statusCode).toBe(400);
  });

  it('should not add a review if not authenticated', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/reviews`)
      .send({ rating: 4, comment: 'No auth' });
    expect(res.statusCode).toBe(401);
  });

  it('should get reviews for a product', async () => {
    const res = await request(app)
      .get(`/api/products/${productId}/reviews`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 