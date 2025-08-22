const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    images: [{
      type: String,
      required: [true, 'At least one product image is required'],
    }],
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      default: 0,
    },
    countInStock: {
      type: Number,
      required: [true, 'Product stock count is required'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    sizes: [{
      type: String
    }],
    colors: [{
      type: String
    }],
    features: [String],
    gender: {
      type: String,
      enum: ['male', 'female', 'unisex'],
      default: 'unisex'
    },
    featured: {
      type: Boolean,
      default: false
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    discountPrice: {
      type: Number,
      default: null
    },
    supplier: {
      name: { type: String, default: '' },
      contact: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' }
    }
  },
  {
    timestamps: true,
  }
);

// Add index for better search performance
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;