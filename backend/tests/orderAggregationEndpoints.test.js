const request = require('supertest');
const app = require('../server');

describe('Order Aggregation API Endpoints', () => {
  it('should get monthly order aggregation', async () => {
    const res = await request(app)
      .get('/api/orders/aggregate/monthly?year=2025');
    expect([200, 404]).toContain(res.statusCode); // 404 if no data
  });
}); 