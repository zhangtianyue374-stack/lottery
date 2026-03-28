import express from 'express';
import { bindOrders, getMyOrders } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 绑定订单号
router.post('/bind', authenticate, bindOrders);

// 获取我的订单
router.get('/my', authenticate, getMyOrders);

export default router;
