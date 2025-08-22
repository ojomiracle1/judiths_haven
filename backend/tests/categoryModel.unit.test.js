const Category = require('../models/Category');

describe('Category model', () => {
  it('should be defined', () => {
    expect(Category).toBeDefined();
  });

  it('should have a name property', () => {
    const category = new Category({
      name: 'Test Category',
      description: 'desc',
      image: 'test.jpg'
    });
    expect(category.name).toBe('Test Category');
  });
}); 