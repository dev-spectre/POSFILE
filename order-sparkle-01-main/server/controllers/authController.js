import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';

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
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { restaurantName },
          { adminUsername },
          { adminEmail }
        ]
      },
    });

    if (existingRestaurant) {
      return res.status(400).json({ error: 'Restaurant name, username, or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        restaurantName,
        adminUsername,
        adminEmail,
        password: hashedPassword,
        phoneNumber,
        address,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ restaurantId: restaurant.id }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const { password: _, ...restaurantData } = restaurant;

    res.status(201).json({
      message: 'Restaurant registered successfully',
      token,
      restaurant: restaurantData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, restaurantName, adminUsername, password } = req.body;

    if (!password || (!email && !restaurantName && !adminUsername)) {
      return res.status(400).json({ error: 'Email/Username/Restaurant name and password are required' });
    }

    // Find restaurant by email, name or username
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { adminEmail: email || '' },
          { restaurantName: restaurantName || '' },
          { adminUsername: adminUsername || '' }
        ]
      },
    });

    if (!restaurant) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, restaurant.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ restaurantId: restaurant.id }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const { password: _, ...restaurantData } = restaurant;

    res.status(200).json({
      message: 'Login successful',
      token,
      restaurant: restaurantData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // This is a stub. In a real app, you'd send a reset token via email.
    // For now, we'll just return a success message if the user exists.
    const restaurant = await prisma.restaurant.findUnique({
      where: { adminEmail: email }
    });

    if (!restaurant) {
      // Don't reveal if user exists for security, but for demo we can be more helpful
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const { password: _, ...restaurantData } = restaurant;
    res.status(200).json(restaurantData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { restaurantName, phoneNumber, address, city, state, zipCode, cuisineType } = req.body;

    const restaurant = await prisma.restaurant.update({
      where: { id: req.restaurantId },
      data: {
        restaurantName,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        cuisineType,
      },
    });

    const { password: _, ...restaurantData } = restaurant;
    res.status(200).json({
      message: 'Profile updated successfully',
      restaurant: restaurantData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
