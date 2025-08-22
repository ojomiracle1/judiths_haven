const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/userModel');

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOneAndUpdate(
      { email: 'ojomiracle20@gmail.com' },
      { isAdmin: true, role: 'admin' },
      { new: true }
    );
    console.log('Updated user:', user);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error updating user:', err);
    process.exit(1);
  }
}

makeAdmin();
