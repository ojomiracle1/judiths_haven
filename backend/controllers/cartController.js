const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update item quantity
exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(item => item.product.equals(productId));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => !item.product.equals(productId));
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
