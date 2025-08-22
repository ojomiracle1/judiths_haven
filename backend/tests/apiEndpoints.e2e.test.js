// E2E API test: Simulates a full user journey via API endpoints.
const request = require('supertest');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');
const mongoose = require('mongoose');

describe('E2E API User Journey', () => {
  let adminToken, userToken, productId, orderId;
  beforeAll(async () => {
    adminToken = await getTestUserToken();
    // Register and login as a regular user
    const email = `e2euser${Date.now()}@example.com`;
    const password = 'Test1234!';
    await request(app).post('/api/users/register').send({ name: 'E2E User', email, password });
    const loginRes = await request(app).post('/api/users/login').send({ email, password });
    userToken = loginRes.body.token;
    // Create a category for the product
    const catRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `E2ECat${Date.now()}`, image: 'test.jpg', description: 'desc' });
    global.categoryId = catRes.body._id;
  });

  it('Admin creates a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'E2E Product', price: 50, countInStock: 5, description: 'desc', brand: 'brand', category: global.categoryId, images: ['test.jpg'] });
    expect(res.statusCode).toBe(201);
    productId = res.body._id;
  });

  it('User adds product to cart', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body.items[0].product).toBe(productId);
  });

  it('User places an order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        orderItems: [{ name: 'E2E Product', qty: 2, image: 'test.jpg', price: 50, product: productId }],
        shippingAddress: { address: '123 St', city: 'City', postalCode: '0000', country: 'Country' },
        paymentMethod: 'PayPal',
        itemsPrice: 100,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 100,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      });
    expect(res.statusCode).toBe(201);
    orderId = res.body._id;
  });

  it('User checks order details', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(orderId);
    expect(res.body.orderItems[0].product).toBe(productId);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
}); 