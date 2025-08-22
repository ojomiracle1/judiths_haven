const Product = require('../models/Product');
const Category = require('../models/Category');

// Placeholder image URLs (using external services for reliable placeholder images)
const PLACEHOLDER_IMAGES = {
  'Dresses': 'https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=Dress',
  'Accessories': 'https://via.placeholder.com/400x500/87CEEB/FFFFFF?text=Accessory',
  'Beauty': 'https://via.placeholder.com/400x500/FFB6C1/FFFFFF?text=Beauty',
  'Shoes': 'https://via.placeholder.com/400x500/98FB98/FFFFFF?text=Shoes',
  'Bags': 'https://via.placeholder.com/400x500/DDA0DD/FFFFFF?text=Bag',
  'Jewelry': 'https://via.placeholder.com/400x500/F0E68C/FFFFFF?text=Jewelry',
  'default': 'https://via.placeholder.com/400x500/E6E6FA/FFFFFF?text=Product'
};

// Alternative placeholder images using different services
const ALTERNATIVE_PLACEHOLDERS = [
  'https://picsum.photos/400/500?random=1',
  'https://picsum.photos/400/500?random=2',
  'https://picsum.photos/400/500?random=3',
  'https://picsum.photos/400/500?random=4',
  'https://picsum.photos/400/500?random=5'
];

const getPlaceholderImage = (categoryName) => {
  if (categoryName && PLACEHOLDER_IMAGES[categoryName]) {
    return PLACEHOLDER_IMAGES[categoryName];
  }
  return PLACEHOLDER_IMAGES.default;
};

const getRandomPlaceholder = () => {
  const randomIndex = Math.floor(Math.random() * ALTERNATIVE_PLACEHOLDERS.length);
  return ALTERNATIVE_PLACEHOLDERS[randomIndex];
};

const updateProductsWithPlaceholders = async () => {
  try {
  // console.log('🔧 Updating products with placeholder images...');
    
    // Get all products
    const products = await Product.find({}).populate('category');
    
    let updatedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      let newImages = [...product.images];
      
      // Check if images array is empty or contains invalid paths
      if (!product.images || product.images.length === 0) {
        needsUpdate = true;
        newImages = [];
      }
      
      // Check if images contain local upload paths that won't work in production
      const hasLocalImages = product.images.some(img => 
        img && (img.startsWith('/uploads/') || img.includes('localhost'))
      );
      
      if (hasLocalImages) {
        needsUpdate = true;
        newImages = [];
      }
      
      // If we need to update, add placeholder images
      if (needsUpdate) {
        const categoryName = product.category?.name || 'default';
        const placeholderImage = getPlaceholderImage(categoryName);
        
        // Add 2-3 placeholder images for variety
        newImages = [
          placeholderImage,
          getRandomPlaceholder(),
          getRandomPlaceholder()
        ];
        
        // Update the product
        await Product.findByIdAndUpdate(product._id, {
          images: newImages
        });
        
        updatedCount++;
    // console.log(`✅ Updated product: ${product.name}`);
      }
    }
    
  // console.log(`🎉 Successfully updated ${updatedCount} products with placeholder images`);
    return updatedCount;
    
  } catch (error) {
    console.error('❌ Error updating products with placeholders:', error);
    throw error;
  }
};

const createSampleProducts = async () => {
  try {
    // console.log('🛍️ Creating sample products with images...');
    
    // Get categories
    const categories = await Category.find({});
    if (categories.length === 0) {
      // console.log('⚠️ No categories found. Please create categories first.');
      return;
    }
    
    const sampleProducts = [
      {
        name: "Elegant Summer Dress",
        description: "A beautiful summer dress perfect for any occasion",
        price: 89.99,
        category: categories[0]._id,
        brand: "Fashion House",
        countInStock: 15,
        images: [
          "https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=Summer+Dress",
          "https://picsum.photos/400/500?random=10",
          "https://picsum.photos/400/500?random=11"
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Pink", "Blue", "White"],
        gender: "female"
      },
      {
        name: "Classic Handbag",
        description: "A timeless handbag that goes with everything",
        price: 129.99,
        category: categories[1]?._id || categories[0]._id,
        brand: "Luxury Bags",
        countInStock: 8,
        images: [
          "https://via.placeholder.com/400x500/DDA0DD/FFFFFF?text=Handbag",
          "https://picsum.photos/400/500?random=12",
          "https://picsum.photos/400/500?random=13"
        ],
        sizes: ["One Size"],
        colors: ["Black", "Brown", "Tan"],
        gender: "female"
      },
      {
        name: "Premium Skincare Set",
        description: "Complete skincare routine for glowing skin",
        price: 79.99,
        category: categories[2]?._id || categories[0]._id,
        brand: "Beauty Essentials",
        countInStock: 25,
        images: [
          "https://via.placeholder.com/400x500/FFB6C1/FFFFFF?text=Skincare",
          "https://picsum.photos/400/500?random=14",
          "https://picsum.photos/400/500?random=15"
        ],
        sizes: ["One Size"],
        colors: ["Natural"],
        gender: "unisex"
      },
      {
        name: "Stylish Hoodie",
        description: "Comfortable and trendy hoodie for casual wear",
        price: 59.99,
        category: categories[0]._id,
        brand: "Casual Wear",
        countInStock: 20,
        images: [
          "https://via.placeholder.com/400x500/87CEEB/FFFFFF?text=Hoodie",
          "https://picsum.photos/400/500?random=16",
          "https://picsum.photos/400/500?random=17"
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Gray", "Black", "Navy"],
        gender: "unisex"
      }
    ];
    
    // Create products
    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        await Product.create({
          ...productData,
          user: "507f1f77bcf86cd799439011" // Default admin user ID
        });
        // console.log(`✅ Created product: ${productData.name}`);
      } else {
        // console.log(`⚠️ Product already exists: ${productData.name}`);
      }
    }
    
    // console.log('🎉 Sample products created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
    throw error;
  }
};

module.exports = {
  updateProductsWithPlaceholders,
  createSampleProducts,
  getPlaceholderImage,
  getRandomPlaceholder
};