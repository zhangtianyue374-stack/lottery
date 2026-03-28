import Order from '../models/Order.js';
import User from '../models/User.js';

// 计算抽奖次数
const calculateChances = (totalAmount) => {
  if (totalAmount >= 5000) return 8;
  if (totalAmount >= 2000) return 5;
  if (totalAmount >= 500) return 3;
  if (totalAmount > 0) return 1;
  return 0;
};

// 绑定订单号
export const bindOrders = async (req, res) => {
  try {
    const { orderNos } = req.body;
    const userId = req.user._id;

    if (!orderNos || !Array.isArray(orderNos) || orderNos.length === 0) {
      return res.status(400).json({ success: false, message: '请输入至少一个订单号' });
    }

    const results = {
      success: [],
      failed: []
    };

    let totalAmount = 0;

    for (const orderNo of orderNos) {
      const trimmedOrderNo = String(orderNo).trim();

      if (!trimmedOrderNo) continue;

      const order = await Order.findOne({ orderNo: trimmedOrderNo });

      if (!order) {
        results.failed.push({ orderNo: trimmedOrderNo, reason: '订单号不存在' });
        continue;
      }

      if (order.status === 'bound' && order.bindedUserId?.toString() !== userId.toString()) {
        results.failed.push({ orderNo: trimmedOrderNo, reason: '该订单已被其他用户绑定' });
        continue;
      }

      if (order.status === 'bound' && order.bindedUserId?.toString() === userId.toString()) {
        results.failed.push({ orderNo: trimmedOrderNo, reason: '该订单您已绑定过' });
        continue;
      }

      order.status = 'bound';
      order.bindedUserId = userId;
      order.bindedAt = new Date();
      await order.save();

      totalAmount += order.totalAmount;
      results.success.push({ orderNo: trimmedOrderNo, amount: order.totalAmount });
    }

    // 更新用户总金额和抽奖次数
    if (totalAmount > 0) {
      const user = await User.findById(userId);
      user.totalAmount += totalAmount;
      user.lotteryChances = calculateChances(user.totalAmount);
      await user.save();
    }

    // 获取更新后的用户信息
    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: `成功绑定 ${results.success.length} 个订单`,
      data: {
        results,
        totalAmount: updatedUser.totalAmount,
        lotteryChances: updatedUser.lotteryChances
      }
    });
  } catch (error) {
    console.error('Bind orders error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取我的订单
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ bindedUserId: req.user._id })
      .sort({ bindedAt: -1 });

    res.json({
      success: true,
      data: {
        orders,
        totalAmount: req.user.totalAmount,
        lotteryChances: req.user.lotteryChances
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};
