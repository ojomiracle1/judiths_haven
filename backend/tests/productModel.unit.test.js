const Product = require('../models/Product');

describe('Product model', () => {
  it('should be defined', () => {
    expect(Product).toBeDefined();
  });

  it('should have a reviews array', () => {
    const product = new Product({
      name: 'Test Product',
      price: 10,
      countInStock: 5,
      description: 'desc',
      brand: 'brand',
      category: '507f1f77bcf86cd799439011',
      images: ['test.jpg'],
      user: '507f1f77bcf86cd799439011'
    });
    expect(Array.isArray(product.reviews)).toBe(true);
    product.reviews.push({
      name: 'Reviewer',
      rating: 5,
      comment: 'Great!',
      user: '507f1f77bcf86cd799439011'
    });
    expect(product.reviews.length).toBe(1);
  });
}); 