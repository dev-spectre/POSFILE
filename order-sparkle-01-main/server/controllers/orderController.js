import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Sales from '../models/Sales.js';
import Razorpay from 'razorpay';

// Initialize Razorpay only if credentials are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export const createOrder = async (req, res) => {
  try {
    const { items, customerPhone, customerName, paymentMethod, discount, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let subtotal = 0;
    let orderItems = [];

    // Validate items and calculate total
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);

      if (!menuItem || menuItem.restaurantId.toString() !== req.restaurantId.toString()) {
        return res.status(400).json({ error: `Invalid menu item: ${item.menuItemId}` });
      }

      const itemTotal = menuItem.finalPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        finalPrice: menuItem.finalPrice,
        quantity: item.quantity,
        discount: menuItem.discountPercentage,
        itemTotal,
      });
    }

    const tax = Math.round(subtotal * 0.05); // 5% tax
    const totalAmount = subtotal + tax - (discount || 0);

    const order = new Order({
      restaurantId: req.restaurantId,
      items: orderItems,
      subtotal,
      tax,
      totalAmount,
      customerPhone,
      customerName,
      paymentMethod,
      discount: discount || 0,
      notes,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
    });

    await order.save();

    // If payment method is card/upi, create Razorpay order if credentials available
    if ((paymentMethod === 'upi' || paymentMethod === 'card') && razorpay) {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // Convert to paise
          currency: 'INR',
          receipt: order.orderId,
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(201).json({
          message: 'Order created successfully',
          order,
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });
      } catch (razorpayError) {
        console.warn('Razorpay error:', razorpayError.message);
        // Fall back to returning order without Razorpay
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findOne({
      orderId,
      restaurantId: req.restaurantId,
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify signature (basic implementation)
    order.razorpayPaymentId = razorpayPaymentId;
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    await order.save();

    // Update or create sales record
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    await Sales.findOneAndUpdate(
      { restaurantId: req.restaurantId, date },
      {
        $inc: {
          dailyTotal: order.totalAmount,
          orderCount: 1,
          'paymentSummary.upi': order.totalAmount,
        },
      },
      { upsert: true }
    );

    res.status(200).json({
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsPaid = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOneAndUpdate(
      { orderId, restaurantId: req.restaurantId },
      {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update sales
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const paymentKey = order.paymentMethod;
    await Sales.findOneAndUpdate(
      { restaurantId: req.restaurantId, date },
      {
        $inc: {
          dailyTotal: order.totalAmount,
          orderCount: 1,
          [`paymentSummary.${paymentKey}`]: order.totalAmount,
        },
      },
      { upsert: true }
    );

    res.status(200).json({
      message: 'Order marked as paid',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query;

    let filter = { restaurantId: req.restaurantId };

    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const date = new Date(endDate);
        date.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = date;
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('items.menuItemId');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      orderId,
      restaurantId: req.restaurantId,
    }).populate('items.menuItemId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items, customerPhone, customerName, notes, discount } = req.body;

    const order = await Order.findOne({
      orderId,
      restaurantId: req.restaurantId,
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Recalculate if items are being updated
    if (items) {
      let subtotal = 0;
      let orderItems = [];

      for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItemId);

        if (!menuItem) {
          return res.status(400).json({ error: 'Invalid menu item' });
        }

        const itemTotal = menuItem.finalPrice * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          finalPrice: menuItem.finalPrice,
          quantity: item.quantity,
          discount: menuItem.discountPercentage,
          itemTotal,
        });
      }

      const tax = Math.round(subtotal * 0.05);
      const totalAmount = subtotal + tax - (discount || 0);

      order.items = orderItems;
      order.subtotal = subtotal;
      order.tax = tax;
      order.totalAmount = totalAmount;
      order.discount = discount || 0;
    }

    if (customerPhone) order.customerPhone = customerPhone;
    if (customerName) order.customerName = customerName;
    if (notes) order.notes = notes;

    await order.save();

    res.status(200).json({
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOneAndUpdate(
      { orderId, restaurantId: req.restaurantId },
      { orderStatus: 'cancelled', paymentStatus: 'refunded' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
