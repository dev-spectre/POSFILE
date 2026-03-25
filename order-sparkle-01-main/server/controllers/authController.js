import jwt from 'jsonwebtoken';
import Restaurant from '../models/Restaurant.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req, res) => {
  try {
    const { restaurantName, adminUsername, adminEmail, password, phoneNumber, address } = req.body;

    // Validation
    if (!restaurantName || !adminUsername || !adminEmail || !password || !phoneNumber || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if restaurant or admin already exists
    const existingRestaurant = await Restaurant.findOne({
      $or: [{ restaurantName }, { adminUsername }, { adminEmail }],
    });

    if (existingRestaurant) {
      return res.status(400).json({ error: 'Restaurant name, username, or email already exists' });
    }

    // Create new restaurant
    const restaurant = new Restaurant({
      restaurantName,
      adminUsername,
      adminEmail,
      password,
      phoneNumber,
      address,
    });

    await restaurant.save();

    // Generate JWT token
    const token = jwt.sign({ restaurantId: restaurant._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Restaurant registered successfully',
      token,
      restaurant: restaurant.toJSON(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB connection errors
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect ECONNREFUSED')) {
      return res.status(503).json({ 
        error: 'Database connection failed. Please ensure MongoDB is running or check your MONGODB_URI' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { restaurantName, adminUsername, password } = req.body;

    if (!password || (!restaurantName && !adminUsername)) {
      return res.status(400).json({ error: 'Username/Restaurant name and password are required' });
    }

    // Find restaurant by name or username
    const restaurant = await Restaurant.findOne({
      $or: [{ restaurantName }, { adminUsername }],
    });

    if (!restaurant) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await restaurant.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ restaurantId: restaurant._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      restaurant: restaurant.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json(restaurant.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { restaurantName, phoneNumber, address, city, state, zipCode, cuisineType } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.restaurantId,
      {
        restaurantName,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        cuisineType,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      restaurant: restaurant.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
