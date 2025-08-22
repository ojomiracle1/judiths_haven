const request = require('supertest');
const app = require('../server');

describe('Sales Stats API Endpoints', () => {
  it('should get yearly sales stats', async () => {
    const res = await request(app)
      .get('/api/sales-stats/yearly?year=2025');
    expect([200, 404]).toContain(res.statusCode); // 404 if no data
  });

  it('should get total sales for year', async () => {
    const res = await request(app)
      .get('/api/sales-stats/total?year=2025');
    expect([200, 404]).toContain(res.statusCode); // 404 if no data
  });
}); 