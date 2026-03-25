import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    category: {
      type: String,
      required: true,
      enum: ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Combos', 'Other'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    image: String,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: Number, // in minutes
    isVeg: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
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

// Calculate finalPrice before saving
MenuItemSchema.pre('save', function (next) {
  this.finalPrice = this.price - (this.price * this.discountPercentage) / 100;
  next();
});

// Index for faster queries
MenuItemSchema.index({ restaurantId: 1, category: 1 });

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
export default MenuItem;
