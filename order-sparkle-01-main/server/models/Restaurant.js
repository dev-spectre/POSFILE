import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const RestaurantSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    adminUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    adminEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: String,
    state: String,
    zipCode: String,
    cuisineType: {
      type: String,
      default: 'Multi-cuisine',
    },
    logo: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
RestaurantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
RestaurantSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
RestaurantSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
export default Restaurant;
