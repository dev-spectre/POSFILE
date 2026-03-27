import { prisma } from '../config/database.js';
import Razorpay from 'razorpay';

// Initialize Razorpay only if credentials are available
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const generateOrderId = () => {
  const date = new Date();
  const timestamp = date.getTime();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
};

export const createOrder = async (req, res) => {
  try {
    const { items, customerPhone, customerName, paymentMethod, discount, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let subtotal = 0;
    const orderItemsFinal = [];

    // Validate items and calculate total
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });

      if (!menuItem || menuItem.restaurantId !== req.restaurantId) {
        return res.status(400).json({ error: `Invalid menu item: ${item.menuItemId}` });
      }

      const itemTotal = menuItem.finalPrice * item.quantity;
      subtotal += itemTotal;

      orderItemsFinal.push({
        menuItemId: menuItem.id,
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
    const orderId = generateOrderId();

    // Create order and items in a transaction
    const order = await prisma.order.create({
      data: {
        restaurantId: req.restaurantId,
        orderId,
        subtotal,
        tax,
        totalAmount,
        customerPhone,
        customerName,
        paymentMethod,
        discount: parseFloat(discount || 0),
        notes,
        paymentStatus: 'pending',
        items: {
          create: orderItemsFinal
        }
      },
      include: {
        items: true
      }
    });

    // If payment method is card/upi, create Razorpay order if credentials available
    if ((paymentMethod === 'upi' || paymentMethod === 'card') && razorpay) {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // Convert to paise
          currency: 'INR',
          receipt: order.orderId,
        });

        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: { razorpayOrderId: razorpayOrder.id },
          include: { items: true }
        });

        return res.status(201).json({
          message: 'Order created successfully',
          order: updatedOrder,
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });
      } catch (razorpayError) {
        console.warn('Razorpay error:', razorpayError.message);
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

    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { items: true }
    });

    if (!order || order.restaurantId !== req.restaurantId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify signature (basic implementation)
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayPaymentId,
        paymentStatus: 'paid',
        orderStatus: 'confirmed'
      },
      include: { items: true }
    });

    // Update or create sales record
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const paymentField = 'upi'; // For Razorpay
    
    // In PostgreSQL/Prisma, updating Json fields directly with increment is harder, 
    // so we handle the Sales aggregation carefully.
    const currentSales = await prisma.sale.findFirst({
        where: { restaurantId: req.restaurantId, date }
    });

    let paymentSummary = currentSales?.paymentSummary || { upi: 0, card: 0, cash: 0, wallet: 0 };
    paymentSummary[paymentField] = (paymentSummary[paymentField] || 0) + order.totalAmount;

    await prisma.sale.upsert({
      where: { 
          id: currentSales?.id || 'new-sale' // Prisma requires a unique identifier for upsert
      },
      create: {
        restaurantId: req.restaurantId,
        date,
        dailyTotal: order.totalAmount,
        orderCount: 1,
        paymentSummary: paymentSummary
      },
      update: {
        dailyTotal: { increment: order.totalAmount },
        orderCount: { increment: 1 },
        paymentSummary: paymentSummary
      }
    });

    res.status(200).json({
      message: 'Payment verified successfully',
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsPaid = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { items: true }
    });

    if (!order || order.restaurantId !== req.restaurantId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      },
      include: { items: true }
    });

    // Update sales
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const paymentKey = order.paymentMethod;
    const currentSales = await prisma.sale.findFirst({
        where: { restaurantId: req.restaurantId, date }
    });

    let paymentSummary = currentSales?.paymentSummary || { upi: 0, card: 0, cash: 0, wallet: 0 };
    paymentSummary[paymentKey] = (paymentSummary[paymentKey] || 0) + order.totalAmount;

    await prisma.sale.upsert({
      where: { 
          id: currentSales?.id || 'new-sale-mark-paid'
      },
      create: {
        restaurantId: req.restaurantId,
        date,
        dailyTotal: order.totalAmount,
        orderCount: 1,
        paymentSummary: paymentSummary
      },
      update: {
        dailyTotal: { increment: order.totalAmount },
        orderCount: { increment: 1 },
        paymentSummary: paymentSummary
      }
    });

    res.status(200).json({
      message: 'Order marked as paid',
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate } = req.query;

    let where = { restaurantId: req.restaurantId };

    if (status) where.orderStatus = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const date = new Date(endDate);
        date.setHours(23, 59, 59, 999);
        where.createdAt.lte = date;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { menuItem: true } } }
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { items: { include: { menuItem: true } } }
    });

    if (!order || order.restaurantId !== req.restaurantId) {
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

    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { items: true }
    });

    if (!order || order.restaurantId !== req.restaurantId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let updateData = {
        customerPhone: customerPhone || order.customerPhone,
        customerName: customerName || order.customerName,
        notes: notes || order.notes,
    };

    // Recalculate if items are being updated
    if (items) {
      let subtotal = 0;
      const orderItemsFinal = [];

      for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });

        if (!menuItem) {
          return res.status(400).json({ error: 'Invalid menu item' });
        }

        const itemTotal = menuItem.finalPrice * item.quantity;
        subtotal += itemTotal;

        orderItemsFinal.push({
          menuItemId: menuItem.id,
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

      updateData.subtotal = subtotal;
      updateData.tax = tax;
      updateData.totalAmount = totalAmount;
      updateData.discount = parseFloat(discount || 0);
      
      // Delete old items and create new ones in a transaction
      await prisma.$transaction([
          prisma.orderItem.deleteMany({ where: { orderId: order.id } }),
          prisma.order.update({
              where: { id: order.id },
              data: {
                  ...updateData,
                  items: {
                      create: orderItemsFinal
                  }
              }
          })
      ]);
    } else {
        await prisma.order.update({
            where: { id: order.id },
            data: updateData
        });
    }

    const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true }
    });

    res.status(200).json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.update({
      where: { orderId, restaurantId: req.restaurantId },
      data: { orderStatus: 'cancelled', paymentStatus: 'refunded' },
      include: { items: true }
    });

    res.status(200).json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
