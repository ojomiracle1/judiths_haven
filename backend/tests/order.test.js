const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { getTestUserToken } = require('./testUtils');

// Order API tests, including validation and error handling.
describe('Order API', () => {
  let adminToken, userToken, orderId;

  beforeAll(async () => {
    adminToken = await getTestUserToken();
    // Create a regular user
    const email = `orderuser${Date.now()}@example.com`;
    const password = 'Test1234!';
    await request(app).post('/api/users/register').send({ name: 'Order User', email, password });
    const loginRes = await request(app).post('/api/users/login').send({ email, password });
    userToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        orderItems: [{ name: 'Test', qty: 1, image: 'test.jpg', price: 10, product: new mongoose.Types.ObjectId() }],
        shippingAddress: { address: '123 St', city: 'City', postalCode: '0000', country: 'Country' },
        paymentMethod: 'PayPal',
        itemsPrice: 10,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 10,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      });
    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    orderId = res.body._id;
  });

  it('should get the created order', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(orderId);
  });

  describe('Order Validation', () => {
    it('should not create an order with empty orderItems', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ orderItems: [], shippingAddress: { address: '123', city: 'C', postalCode: '0000', country: 'C' }, paymentMethod: 'PayPal', itemsPrice: 10, shippingPrice: 0, taxPrice: 0, totalPrice: 10 });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
    it('should not create an order with missing shippingAddress', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ orderItems: [{ name: 'Test', qty: 1, image: 'test.jpg', price: 10, product: new mongoose.Types.ObjectId() }], paymentMethod: 'PayPal', itemsPrice: 10, shippingPrice: 0, taxPrice: 0, totalPrice: 10 });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Order Admin/Negative Cases', () => {
    it('should not create an order if not authenticated', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({});
      expect([401, 403]).toContain(res.statusCode);
    });

    it('should not create an order with missing fields', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .get('/api/orders/000000000000000000000000')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toBe(404);
    });

    it('should not get an order if not authenticated', async () => {
      // Use orderId from previous test if available
      const res = await request(app)
        .get(`/api/orders/${orderId || '000000000000000000000000'}`);
      expect([401, 403]).toContain(res.statusCode);
    });

    // Add more tests for cancel, return, and status update as admin and user
    it('should not allow non-admin to update order status', async () => {
      // Create an order as user
      const resOrder = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderItems: [{ name: 'Test', qty: 1, image: 'test.jpg', price: 10, product: new mongoose.Types.ObjectId() }],
          shippingAddress: { address: '123 St', city: 'City', postalCode: '0000', country: 'Country' },
          paymentMethod: 'PayPal',
          itemsPrice: 10,
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: 10,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        });
      const testOrderId = resOrder.body._id;
      // Try to update as non-admin
      const res = await request(app)
        .put(`/api/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'Delivered' });
      expect([401, 403, 404]).toContain(res.statusCode);
    });

    it('should return 404 when updating status of non-existent order as admin', async () => {
      const res = await request(app)
        .put('/api/orders/000000000000000000000000/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Delivered' });
      expect([404, 400]).toContain(res.statusCode);
    });

    // Add more as needed for cancel, return, etc.
  });
});
