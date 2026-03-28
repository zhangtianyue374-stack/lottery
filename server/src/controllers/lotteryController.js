import User from '../models/User.js';
import Order from '../models/Order.js';
import LotteryRecord from '../models/LotteryRecord.js';
import PrizeConfig from '../models/PrizeConfig.js';

// 获取抽奖信息（大奖池状态）
export const getLotteryInfo = async (req, res) => {
  try {
    const user = req.user;
    const prizeConfig = await PrizeConfig.findOne().sort({ createdAt: -1 });

    const isInPool = prizeConfig?.grandPrizePool.some(
      id => id.toString() === user._id.toString()
    );

    res.json({
      success: true,
      data: {
        lotteryChances: user.lotteryChances,
        totalAmount: user.totalAmount,
        isInPool,
        isGrandPrizeWinner: user.isGrandPrizeWinner,
        prizeLevel: user.prizeLevel,
        poolExists: !!prizeConfig,
        grandPrizeDrawn: prizeConfig?.grandPrizeDrawn || false
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取大奖池排名（仅显示前10用户，不含个人信息）
export const getPoolRankings = async (req, res) => {
  try {
    const prizeConfig = await PrizeConfig.findOne().sort({ createdAt: -1 });

    if (!prizeConfig || !prizeConfig.poolRankings) {
      return res.json({ success: true, data: { rankings: [], poolGeneratedAt: null } });
    }

    // 只返回排名信息，不返回用户敏感信息
    const rankings = prizeConfig.poolRankings.map(r => ({
      rank: r.rank,
      totalAmount: r.totalAmount,
      // 隐藏中间部分手机号
      phone: r.phone ? r.phone.slice(0, 3) + '****' + r.phone.slice(-4) : null
    }));

    res.json({
      success: true,
      data: {
        rankings,
        poolGeneratedAt: prizeConfig.poolGeneratedAt,
        grandPrizeDrawn: prizeConfig.grandPrizeDrawn,
        winners: prizeConfig.grandPrizeDrawn ? {
          first: prizeConfig.firstPrize,
          second: prizeConfig.secondPrize,
          third: prizeConfig.thirdPrize
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取所有中奖信息（实时滚动公布）
export const getWinners = async (req, res) => {
  try {
    const prizeConfig = await PrizeConfig.findOne()
      .populate('firstPrize', 'phone wechatId')
      .populate('secondPrize', 'phone wechatId')
      .populate('thirdPrize', 'phone wechatId');

    if (!prizeConfig || !prizeConfig.grandPrizeDrawn) {
      return res.json({
        success: true,
        data: {
          drawn: false,
          winners: null
        }
      });
    }

    // 格式化中奖信息
    const formatWinner = (user) => {
      if (!user) return null;
      return {
        phone: user.phone ? user.phone.slice(0, 3) + '****' + user.phone.slice(-4) : null,
        wechatId: user.wechatId || '未填写'
      };
    };

    res.json({
      success: true,
      data: {
        drawn: true,
        winners: {
          first: { level: '一等奖', winners: [formatWinner(prizeConfig.firstPrize)] },
          second: { level: '二等奖', winners: prizeConfig.secondPrize.map(formatWinner) },
          third: { level: '三等奖', winners: prizeConfig.thirdPrize.map(formatWinner) }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取我的抽奖记录
export const getMyRecords = async (req, res) => {
  try {
    const records = await LotteryRecord.find({ userId: req.user._id })
      .sort({ drawTime: -1 });

    res.json({ success: true, data: { records } });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};
