import express from 'express';
import {
  uploadMiddleware,
  uploadOrders,
  generatePool,
  drawGrandPrize,
  getUsers,
  getStatistics,
  exportWinners
} from '../controllers/adminController.js';
import { adminAuthenticate } from '../middleware/auth.js';

const router = express.Router();

// 所有管理接口需要管理员认证
router.use(adminAuthenticate);

// 上传订单表
router.post('/upload-orders', uploadMiddleware, uploadOrders);

// 生成大奖候选池
router.post('/generate-pool', generatePool);

// 抽取大奖
router.post('/draw-grand', drawGrandPrize);

// 获取用户列表
router.get('/users', getUsers);

// 获取统计数据
router.get('/statistics', getStatistics);

// 导出中奖信息
router.get('/export', exportWinners);

export default router;
