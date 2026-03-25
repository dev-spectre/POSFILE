import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as menuController from '../controllers/menuController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', menuController.addMenuItem);
router.get('/', menuController.getMenuItems);
router.get('/category/:category', menuController.getMenuItemsByCategory);
router.put('/:id', menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);
router.post('/discount/apply-global', menuController.applyGlobalDiscount);

export default router;
