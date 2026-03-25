import Sales from '../models/Sales.js';
import Order from '../models/Order.js';

export const getDailySales = async (req, res) => {
  try {
    const { date } = req.query;

    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    const sales = await Sales.findOne({
      restaurantId: req.restaurantId,
      date: queryDate,
    });

    if (!sales) {
      return res.status(200).json({
        restaurantId: req.restaurantId,
        date: queryDate,
        dailyTotal: 0,
        orderCount: 0,
        paymentSummary: { upi: 0, card: 0, cash: 0, wallet: 0 },
      });
    }

    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeeklySales = async (req, res) => {
  try {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    const orders = await Order.find({
      restaurantId: req.restaurantId,
      paymentStatus: 'paid',
      createdAt: { $gte: startDate, $lte: endDate },
    });

    let weeklyTotal = 0;
    let weeklyOrderCount = 0;
    let paymentSummary = { upi: 0, card: 0, cash: 0, wallet: 0 };

    orders.forEach((order) => {
      weeklyTotal += order.totalAmount;
      weeklyOrderCount += 1;
      paymentSummary[order.paymentMethod] = (paymentSummary[order.paymentMethod] || 0) + order.totalAmount;
    });

    res.status(200).json({
      weeklyTotal,
      weeklyOrderCount,
      paymentSummary,
      startDate,
      endDate,
      orders: orders.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlySales = async (req, res) => {
  try {
    const { month, year } = req.query;

    const now = new Date();
    const queryYear = year ? parseInt(year) : now.getFullYear();
    const queryMonth = month ? parseInt(month) - 1 : now.getMonth();

    const startDate = new Date(queryYear, queryMonth, 1);
    const endDate = new Date(queryYear, queryMonth + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      restaurantId: req.restaurantId,
      paymentStatus: 'paid',
      createdAt: { $gte: startDate, $lte: endDate },
    });

    let monthlyTotal = 0;
    let monthlyOrderCount = 0;
    let paymentSummary = { upi: 0, card: 0, cash: 0, wallet: 0 };
    let dailyData = {};

    orders.forEach((order) => {
      monthlyTotal += order.totalAmount;
      monthlyOrderCount += 1;
      paymentSummary[order.paymentMethod] = (paymentSummary[order.paymentMethod] || 0) + order.totalAmount;

      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = 0;
      }
      dailyData[dateKey] += order.totalAmount;
    });

    res.status(200).json({
      monthlyTotal,
      monthlyOrderCount,
      paymentSummary,
      startDate,
      endDate,
      dailyData,
      orders: orders.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTopSellingItems = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const orders = await Order.find({
      restaurantId: req.restaurantId,
      paymentStatus: 'paid',
      createdAt: { $gte: startDate },
    }).populate('items.menuItemId');

    const itemStats = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const itemId = item.menuItemId._id.toString();
        if (!itemStats[itemId]) {
          itemStats[itemId] = {
            menuItemId: item.menuItemId._id,
            name: item.menuItemId.name,
            quantity: 0,
            revenue: 0,
          };
        }
        itemStats[itemId].quantity += item.quantity;
        itemStats[itemId].revenue += item.itemTotal;
      });
    });

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.status(200).json(topItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategorySales = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const orders = await Order.find({
      restaurantId: req.restaurantId,
      paymentStatus: 'paid',
      createdAt: { $gte: startDate },
    }).populate('items.menuItemId');

    const categoryStats = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.menuItemId.category;
        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            revenue: 0,
            orderCount: 0,
          };
        }
        categoryStats[category].revenue += item.itemTotal;
        categoryStats[category].orderCount += 1;
      });
    });

    const categorySales = Object.values(categoryStats);

    res.status(200).json(categorySales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
