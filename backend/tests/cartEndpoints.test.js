const request = require('supertest');
const app = require('../server');
const { getTestUserToken } = require('./testUtils');

describe('Cart API Endpoints', () => {
  let token, productId;
  beforeAll(async () => {
    token = await getTestUserToken();
    // Create a category
    const categoryRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `CartCat${Date.now()}`, image: 'test.jpg', description: 'desc' });
    const categoryId = categoryRes.body._id;
    // Create a product
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cart Test Product',
        price: 15,
        countInStock: 10,
        description: 'desc',
        brand: 'brand',
        category: categoryId,
        images: ['test.jpg']
      });
    productId = productRes.body._id;
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
    expect(Array.isArray(res.body.items)).toBe(true);
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