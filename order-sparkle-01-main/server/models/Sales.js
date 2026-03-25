import mongoose from 'mongoose';

const SalesSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dailyTotal: {
      type: Number,
      default: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    weeklyTotal: {
      type: Number,
      default: 0,
    },
    weeklyOrderCount: {
      type: Number,
      default: 0,
    },
    monthlyTotal: {
      type: Number,
      default: 0,
    },
    monthlyOrderCount: {
      type: Number,
      default: 0,
    },
    paymentSummary: {
      upi: { type: Number, default: 0 },
      card: { type: Number, default: 0 },
      cash: { type: Number, default: 0 },
      wallet: { type: Number, default: 0 },
    },
    topItems: [
      {
        menuItemId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantity: Number,
        revenue: Number,
      },
    ],
    categoryWiseSales: [
      {
        category: String,
        revenue: Number,
        orderCount: Number,
      },
    ],
  },
  { timestamps: true }
);

SalesSchema.index({ restaurantId: 1, date: -1 });

const Sales = mongoose.model('Sales', SalesSchema);
export default Sales;
