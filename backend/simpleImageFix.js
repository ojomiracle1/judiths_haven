const mongoose = require('mongoose');
require('dotenv').config();

// Simple MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/judiths-haven', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Product = require('./models/Product');
const Category = require('./models/Category');

// Working placeholder images
const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/400/500?random=1',
  'https://picsum.photos/400/500?random=2', 
  'https://picsum.photos/400/500?random=3',
  'https://picsum.photos/400/500?random=4',
  'https://picsum.photos/400/500?random=5'
];

const CATEGORY_IMAGES = {
  'Dresses': 'https://picsum.photos/400/500?random=10',
  'Accessories': 'https://picsum.photos/400/500?random=11',
  'Beauty': 'https://picsum.photos/400/500?random=12',
  'Footwear': 'https://picsum.photos/400/500?random=13',
  'Hoodies': 'https://picsum.photos/400/500?random=14'
};

async function fixImages() {
  try {
    console.log('🔧 Fixing images...');
    
    // Fix products
    const products = await Product.find({});
    for (let product of products) {
      const newImages = PLACEHOLDER_IMAGES.slice(0, 3);
      await Product.findByIdAndUpdate(product._id, { images: newImages });
      console.log(`✅ Fixed product: ${product.name}`);
    }
    
    // Fix categories
    const categories = await Category.find({});
    for (let category of categories) {
      const image = CATEGORY_IMAGES[category.name] || PLACEHOLDER_IMAGES[0];
      await Category.findByIdAndUpdate(category._id, { image });
      console.log(`✅ Fixed category: ${category.name}`);
    }
    
    console.log('🎉 All images fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixImages();
