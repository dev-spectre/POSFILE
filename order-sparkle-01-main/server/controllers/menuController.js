import MenuItem from '../models/MenuItem.js';

export const addMenuItem = async (req, res) => {
  try {
    const { name, category, price, discountPercentage, description, image, preparationTime, isVeg } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const menuItem = new MenuItem({
      restaurantId: req.restaurantId,
      name,
      category,
      price,
      discountPercentage: discountPercentage || 0,
      description,
      image,
      preparationTime,
      isVeg: isVeg || false,
    });

    await menuItem.save();

    res.status(201).json({
      message: 'Menu item added successfully',
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurantId: req.restaurantId }).sort({ category: 1 });

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const menuItems = await MenuItem.find({
      restaurantId: req.restaurantId,
      category,
    });

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, discountPercentage, description, image, isAvailable, preparationTime, isVeg } = req.body;

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId: req.restaurantId },
      {
        name,
        category,
        price,
        discountPercentage: discountPercentage || 0,
        description,
        image,
        isAvailable,
        preparationTime,
        isVeg,
      },
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.status(200).json({
      message: 'Menu item updated successfully',
      menuItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findOneAndDelete({
      _id: id,
      restaurantId: req.restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.status(200).json({
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const applyGlobalDiscount = async (req, res) => {
  try {
    const { discountPercentage } = req.body;

    if (discountPercentage === undefined || discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ error: 'Invalid discount percentage' });
    }

    const menuItems = await MenuItem.updateMany(
      { restaurantId: req.restaurantId },
      { discountPercentage }
    );

    res.status(200).json({
      message: 'Global discount applied successfully',
      updatedCount: menuItems.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
