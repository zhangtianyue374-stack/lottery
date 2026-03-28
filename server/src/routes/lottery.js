import express from 'express';
import { getLotteryInfo, getPoolRankings, getWinners, getMyRecords } from '../controllers/lotteryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 获取抽奖信息
router.get('/info', authenticate, getLotteryInfo);

// 获取大奖池排名
router.get('/pool', getPoolRankings);

// 获取中奖信息（实时公布）
router.get('/winners', getWinners);

// 获取我的抽奖记录
router.get('/records', authenticate, getMyRecords);

export default router;
