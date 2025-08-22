jest.setTimeout(30000);
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');

let token;
let productId;

describe('Cart API', () => {
  beforeAll(async () => {
    // Ensure DB is connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    token = await getTestUserToken();
    const uniqueCategoryName = `Test Category ${Date.now()}`;
    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: uniqueCategoryName, image: 'test.jpg', description: 'Test category description' });
    const categoryId = categoryRes.body._id;
    // Create a product to add to cart
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product',
        price: 20,
        countInStock: 10,
        description: 'Test',
        brand: 'Test',
        category: categoryId,
        images: ['test.jpg']
      });
    productId = productRes.body._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should add an item to the cart', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body.items[0].product).toBe(productId);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it('should get the user cart', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('should update cart item quantity', async () => {
    const res = await request(app)
      .put('/api/cart/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.items[0].quantity).toBe(5);
  });

  it('should remove item from cart', async () => {
    const res = await request(app)
      .delete('/api/cart/remove')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId });
    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(0);
  });
});
