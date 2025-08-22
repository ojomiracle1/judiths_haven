const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 8,
      select: false,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    phone: {
      type: String,
      required: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Debug middleware to log document changes
userSchema.pre('save', function (next) {
  console.log('Before save:', {
    userId: this._id,
    email: this.email,
    resetToken: this.resetPasswordToken,
    resetExpire: this.resetPasswordExpire,
    isModified: {
      resetToken: this.isModified('resetPasswordToken'),
      resetExpire: this.isModified('resetPasswordExpire'),
    },
  });
  next();
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if the model exists before creating it
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;