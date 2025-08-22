const mongoose = require('mongoose');
const { updateProductsWithPlaceholders, createSampleProducts } = require('./utils/createPlaceholder');
const { updateCategoryImages, createDefaultCategories } = require('./utils/fixCategoryImages');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mama-miracle-boutique', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const fixImages = async () => {
  try {
    console.log('🚀 Starting image fix process...');
    
    // Connect to database
    await connectDB();
    
    // Update category images
    const updatedCategories = await updateCategoryImages();
    
    // Create default categories if needed
    await createDefaultCategories();
    
    // Update existing products with placeholder images
    const updatedProducts = await updateProductsWithPlaceholders();
    
    // Create sample products if needed
    await createSampleProducts();
    
    console.log('✅ Image fix process completed!');
    console.log(`📊 Updated ${updatedCategories} categories with placeholder images`);
    console.log(`📊 Updated ${updatedProducts} products with placeholder images`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during image fix process:', error);
    process.exit(1);
  }
};

// Run the script
fixImages();
