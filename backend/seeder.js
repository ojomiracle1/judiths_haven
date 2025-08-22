const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const users = require('./data/users');
const products = require('./data/products');
const categories = require('./data/categories');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const connectDB = require('./config/db');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

dotenv.config();

connectDB();

// Base64 placeholder image (1x1 transparent pixel)
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Function to download and save image
const downloadImage = async (url, filename) => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(`/uploads/${filename}`));
      writer.on('error', () => resolve(PLACEHOLDER_IMAGE));
    });
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return PLACEHOLDER_IMAGE;
  }
};

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Download and save category images
    const categoriesWithLocalImages = await Promise.all(
      categories.map(async (category, index) => {
        const filename = `category-${index + 1}.jpg`;
        const localImagePath = await downloadImage(category.image, filename);
        return { ...category, image: localImagePath };
      })
    );

    const createdCategories = await Category.insertMany(categoriesWithLocalImages);
    const categoryMap = createdCategories.reduce((acc, category) => {
      acc[category.name] = category._id;
      return acc;
    }, {});

    // Download and save product images
    const productsWithLocalImages = await Promise.all(
      products.map(async (product, index) => {
        let categoryId;
        if (product.name.includes('Dress')) {
          categoryId = categoryMap['Dresses'];
        } else if (product.name.includes('Handbag') || product.name.includes('Watch')) {
          categoryId = categoryMap['Accessories'];
        } else if (product.name.includes('Skincare')) {
          categoryId = categoryMap['Beauty'];
        }

        const localImages = await Promise.all(
          product.images.map(async (imageUrl, imgIndex) => {
            const filename = `product-${index + 1}-${imgIndex + 1}.jpg`;
            return await downloadImage(imageUrl, filename);
          })
        );

        return {
          ...product,
          user: adminUser,
          category: categoryId,
          images: localImages,
          countInStock: product.stock || 0
        };
      })
    );

    await Product.insertMany(productsWithLocalImages);

    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    // Clean up uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
    }

    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 