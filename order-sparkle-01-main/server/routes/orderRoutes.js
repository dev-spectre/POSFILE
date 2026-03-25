import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:orderId', orderController.getOrder);
router.put('/:orderId', orderController.editOrder);
router.post('/:orderId/mark-paid', orderController.markAsPaid);
router.post('/:orderId/cancel', orderController.cancelOrder);
router.post('/payment/verify', orderController.verifyPayment);

export default router;
