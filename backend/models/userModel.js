const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId;
      },
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    phone: {
      type: String,
      default: '+2348156959463'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    profileImage: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Method to check if entered password matches the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;