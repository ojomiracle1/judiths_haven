const Order = require('../models/Order');

describe('Order model', () => {
  it('should be defined', () => {
    expect(Order).toBeDefined();
  });

  it('should have orderItems array', () => {
    const order = new Order({
      user: '507f1f77bcf86cd799439011',
      orderItems: [],
      shippingAddress: { address: '123 St', city: 'City', postalCode: '0000', country: 'Country' },
      paymentMethod: 'PayPal',
      itemsPrice: 10,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 10
    });
    expect(Array.isArray(order.orderItems)).toBe(true);
    order.orderItems.push({
      name: 'Test',
      qty: 1,
      image: 'test.jpg',
      price: 10,
      product: '507f1f77bcf86cd799439011'
    });
    expect(order.orderItems.length).toBe(1);
  });
}); 