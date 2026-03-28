import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '登录已过期，请重新登录' });
  }
};

export const adminAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken || req.headers['x-admin-token'];

    if (!token) {
      return res.status(401).json({ success: false, message: '请先登录管理后台' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'admin') {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '登录已过期，请重新登录' });
  }
};
