import express from 'express';
import { register, login, logout, getMe, adminLogin, adminLogout } from '../controllers/authController.js';
import { registerLimiter, loginLimiter } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 用户注册
router.post('/register', registerLimiter, register);

// 用户登录
router.post('/login', loginLimiter, login);

// 退出登录
router.post('/logout', logout);

// 获取当前用户
router.get('/me', authenticate, getMe);

// 管理员登录
router.post('/admin/login', adminLogin);

// 管理员退出
router.post('/admin/logout', adminLogout);

export default router;
