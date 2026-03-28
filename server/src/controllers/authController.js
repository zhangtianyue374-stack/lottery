import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const generateToken = (userId, type = 'user') => {
  return jwt.sign(
    { userId, type },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 用户注册
export const register = async (req, res) => {
  try {
    const { phone, wechatId, weiboId, password, confirmPassword } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: '手机号和密码不能为空' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: '两次密码输入不一致' });
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: '请输入正确的手机号' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密码至少6位' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '该手机号已注册' });
    }

    const user = new User({ phone, wechatId, weiboId, password });
    await user.save();

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: { user, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: '服务器错误，请稍后再试' });
  }
};

// 用户登录
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: '手机号和密码不能为空' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false, message: '手机号或密码错误' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '手机号或密码错误' });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: '登录成功',
      data: { user, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '服务器错误，请稍后再试' });
  }
};

// 退出登录
export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: '已退出登录' });
};

// 获取当前用户
export const getMe = async (req, res) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 管理员登录
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    let admin = await Admin.findOne({ username });

    // 首次登录自动创建管理员
    if (!admin && username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      admin = new Admin({ username, password });
      await admin.save();
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const token = generateToken(admin._id, 'admin');

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: '登录成功',
      data: { token }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 管理员退出
export const adminLogout = (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: '已退出管理后台' });
};
