const express = require('express');
const router = express.Router();

// @desc    Calculate shipping price
// @route   POST /api/shipping/calculate
// @access  Public
router.post('/calculate', (req, res) => {
  const { address, cartItems } = req.body;
  if (!address || !address.country) {
    return res.status(400).json({ message: 'Address with country is required.' });
  }
  // Calculate cart total
  const total = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + (item.price * (item.qty || item.quantity || 1)), 0)
    : 0;

  let shipping = 10000; // Default international
  const country = address.country.trim().toLowerCase();
  if (country === 'nigeria') {
    shipping = 2000;
  } else if ([
    'ghana', 'kenya', 'south africa', 'egypt', 'morocco', 'ethiopia', 'tanzania', 'algeria', 'uganda', 'sudan', 'angola', 'mozambique', 'cameroon', 'côte d’ivoire', 'ivory coast', 'niger', 'burkina faso', 'mali', 'malawi', 'zambia', 'senegal', 'chad', 'somalia', 'zimbabwe', 'guinea', 'rwanda', 'benin', 'burundi', 'tunisia', 'south sudan', 'togo', 'sierra leone', 'libya', 'congo', 'liberia', 'central african republic', 'mauritania', 'eritrea', 'namibia', 'gambia', 'botswana', 'gabon', 'lesotho', 'guinea-bissau', 'equatorial guinea', 'mauritius', 'eswatini', 'djibouti', 'comoros', 'cape verde', 'sao tome and principe'
  ].includes(country)) {
    shipping = 5000;
  }
  // Free shipping over ₦50,000
  if (total >= 50000) {
    shipping = 0;
  }
  res.json({ shippingPrice: shipping });
});

module.exports = router; 