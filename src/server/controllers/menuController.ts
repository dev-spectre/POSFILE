import { prisma } from '../config/database';

export const addMenuItem = async (req, res) => {
  try {
    const { name, category, price, discountPercentage, description, image, preparationTime, isVeg } = req.body;
    console.log(`📡 Adding menu item for restaurant: ${req.restaurantId}`);

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const priceVal = parseFloat(price);
    const discountVal = parseFloat(discountPercentage || 0);
    const finalPrice = priceVal - (priceVal * discountVal) / 100;

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: req.restaurantId,
        name,
        category,
        price: priceVal,
        discountPercentage: discountVal,
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        description,
        image,
        preparationTime: preparationTime ? parseInt(preparationTime) : null,
        isVeg: !!isVeg,
      },
    });

    console.log(`✅ Menu item added: ${menuItem.id}`);
    res.status(201).json({
      message: 'Menu item added successfully',
      menuItem,
    });
  } catch (error) {
    console.error('❌ Error in addMenuItem:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMenuItems = async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: req.restaurantId },
      orderBy: { category: 'asc' },
    });

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: req.restaurantId,
        category,
      },
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
    console.log(`📡 Updating menu item: ${id}`);

    // Verify ownership first
    const currentItem = await prisma.menuItem.findUnique({ where: { id } });
    if (!currentItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    if (currentItem.restaurantId !== req.restaurantId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Calculate final price if price or discount changed
    let finalPrice;
    if (price !== undefined || discountPercentage !== undefined) {
      const newPrice = price !== undefined ? parseFloat(price) : currentItem.price;
      const newDiscount = discountPercentage !== undefined ? parseFloat(discountPercentage) : currentItem.discountPercentage;
      finalPrice = newPrice - (newPrice * newDiscount) / 100;
    }

    // Delete by `id` only (no compound where — Prisma requires @@unique for that)
    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        category,
        price: price !== undefined ? parseFloat(price) : undefined,
        discountPercentage: discountPercentage !== undefined ? parseFloat(discountPercentage) : undefined,
        finalPrice: finalPrice !== undefined ? parseFloat(finalPrice.toFixed(2)) : undefined,
        description,
        image,
        isAvailable,
        preparationTime: preparationTime !== undefined ? parseInt(preparationTime) : undefined,
        isVeg,
      },
    });

    console.log(`✅ Menu item updated: ${id}`);
    res.status(200).json({
      message: 'Menu item updated successfully',
      menuItem,
    });
  } catch (error) {
    console.error('❌ Error in updateMenuItem:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📡 Deleting menu item: ${id} for restaurant: ${req.restaurantId}`);

    // Verify ownership first before deleting
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    if (existing.restaurantId !== req.restaurantId) {
      return res.status(403).json({ error: 'Unauthorized: This item does not belong to your restaurant' });
    }

    // Delete linked OrderItems first (FK constraint), then delete the MenuItem — in one transaction
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { menuItemId: id } }),
      prisma.menuItem.delete({ where: { id } }),
    ]);

    console.log(`✅ Menu item deleted: ${id}`);
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteMenuItem:', error);
    res.status(500).json({ error: error.message });
  }
};

export const applyGlobalDiscount = async (req, res) => {
  try {
    const { discountPercentage } = req.body;

    if (discountPercentage === undefined || discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ error: 'Invalid discount percentage' });
    }

    const discount = parseFloat(discountPercentage);

    // In Prisma, we can't easily do a mass update that references existing fields for calculation (finalPrice)
    // without a raw query or multiple updates. For a POS system, a raw query is fine or 
    // we can update them in a loop if the menu isn't huge.
    
    // Using raw SQL for efficiency if supported, or multiple updates.
    // Let's use many updates for safety across providers.
    const items = await prisma.menuItem.findMany({ where: { restaurantId: req.restaurantId } });
    
    const updates = items.map(item => {
      const finalPrice = item.price - (item.price * discount) / 100;
      return prisma.menuItem.update({
        where: { id: item.id },
        data: { discountPercentage: discount, finalPrice }
      });
    });

    await prisma.$transaction(updates);

    res.status(200).json({
      message: 'Global discount applied successfully',
      updatedCount: items.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
