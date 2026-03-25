import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as salesController from '../controllers/salesController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/daily', salesController.getDailySales);
router.get('/weekly', salesController.getWeeklySales);
router.get('/monthly', salesController.getMonthlySales);
router.get('/top-items', salesController.getTopSellingItems);
router.get('/category-sales', salesController.getCategorySales);

export default router;
