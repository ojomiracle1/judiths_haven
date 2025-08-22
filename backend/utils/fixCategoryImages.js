const Category = require('../models/Category');

// Category placeholder images
const CATEGORY_PLACEHOLDERS = {
  'Dresses': 'https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=Dresses',
  'Accessories': 'https://via.placeholder.com/400x500/87CEEB/FFFFFF?text=Accessories',
  'Beauty': 'https://via.placeholder.com/400x500/FFB6C1/FFFFFF?text=Beauty',
  'Footwear': 'https://via.placeholder.com/400x500/98FB98/FFFFFF?text=Footwear',
  'Hoodies': 'https://via.placeholder.com/400x500/87CEEB/FFFFFF?text=Hoodies',
  'Bags': 'https://via.placeholder.com/400x500/DDA0DD/FFFFFF?text=Bags',
  'Jewelry': 'https://via.placeholder.com/400x500/F0E68C/FFFFFF?text=Jewelry',
  'default': 'https://via.placeholder.com/400x500/E6E6FA/FFFFFF?text=Category'
};

const updateCategoryImages = async () => {
  try {
    console.log('🔧 Updating category images...');
    
    const categories = await Category.find({});
    let updatedCount = 0;
    
    for (const category of categories) {
      let needsUpdate = false;
      let newImage = category.image;
      
      // Check if image is missing or is a local path
      if (!category.image || 
          category.image.startsWith('/uploads/') || 
          category.image.includes('localhost') ||
          category.image.includes('127.0.0.1')) {
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        // Get appropriate placeholder for category
        const placeholderImage = CATEGORY_PLACEHOLDERS[category.name] || CATEGORY_PLACEHOLDERS.default;
        
        // Update the category
        await Category.findByIdAndUpdate(category._id, {
          image: placeholderImage
        });
        
        updatedCount++;
        console.log(`✅ Updated category: ${category.name}`);
      }
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} categories with placeholder images`);
    return updatedCount;
    
  } catch (error) {
    console.error('❌ Error updating category images:', error);
    throw error;
  }
};

const createDefaultCategories = async () => {
  try {
    console.log('🛍️ Creating default categories...');
    
    const defaultCategories = [
      {
        name: 'Dresses',
        description: 'Beautiful dresses for all occasions',
        image: CATEGORY_PLACEHOLDERS['Dresses']
      },
      {
        name: 'Accessories',
        description: 'Stylish accessories to complement your look',
        image: CATEGORY_PLACEHOLDERS['Accessories']
      },
      {
        name: 'Beauty',
        description: 'Premium beauty and skincare products',
        image: CATEGORY_PLACEHOLDERS['Beauty']
      },
      {
        name: 'Footwear',
        description: 'Comfortable and stylish footwear',
        image: CATEGORY_PLACEHOLDERS['Footwear']
      }
    ];
    
    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        console.log(`⚠️ Category already exists: ${categoryData.name}`);
      }
    }
    
    console.log('🎉 Default categories created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating default categories:', error);
    throw error;
  }
};

module.exports = {
  updateCategoryImages,
  createDefaultCategories,
  CATEGORY_PLACEHOLDERS
};
