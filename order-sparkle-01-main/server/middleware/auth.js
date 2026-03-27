import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    // Allow demo mode without token
    if (!token) {
      // Use demo mode with a fake restaurant ID
      req.restaurantId = 'demo-restaurant-id';
      req.restaurant = {
        id: 'demo-restaurant-id',
        restaurantName: 'Demo Restaurant',
        adminUsername: 'demo',
        adminEmail: 'demo@restaurant.com',
      };
      return next();
    }

    // Allow demo token to bypass JWT verification
    if (token === 'demo-token-no-auth') {
      req.restaurantId = 'demo-restaurant-id';
      req.restaurant = {
        id: 'demo-restaurant-id',
        restaurantName: 'Demo Restaurant',
        adminUsername: 'demo',
        adminEmail: 'demo@restaurant.com',
      };
      return next();
    }

    // Verify real JWT tokens
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: decoded.restaurantId },
    });

    if (!restaurant) {
      return res.status(401).json({ error: 'Restaurant not found' });
    }

    req.restaurantId = decoded.restaurantId;
    req.restaurant = restaurant;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};
