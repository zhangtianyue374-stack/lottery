import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: '请求过于频繁，请稍后再试' }
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: '注册次数过多，请稍后再试' }
});

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: '登录尝试次数过多，请稍后再试' }
});

export const lotteryLimiter = rateLimit({
  windowMs: 3 * 1000,
  max: 1,
  message: { success: false, message: '抽奖过于频繁，请稍后再试' }
});
