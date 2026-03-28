import multer from 'multer';
import path from 'path';
import * as XLSX from 'xlsx';
import User from '../models/User.js';
import Order from '../models/Order.js';
import LotteryRecord from '../models/LotteryRecord.js';
import PrizeConfig from '../models/PrizeConfig.js';

// 上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 Excel 文件'));
    }
  }
});

export const uploadMiddleware = upload.single('file');

// 上传订单表
export const uploadOrders = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请上传文件' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length < 2) {
      return res.status(400).json({ success: false, message: '文件数据为空' });
    }

    const headers = jsonData[0].map((h, i) => ({ index: i, name: String(h).trim() }));

    // 找到关键列索引
    const orderNoIndex = headers.find(h => h.name === '订单编号')?.index;
    const settleAmountIndex = headers.find(h => h.name === '结算金额')?.index;

    if (orderNoIndex === undefined) {
      return res.status(400).json({ success: false, message: '未找到"订单编号"列' });
    }

    if (settleAmountIndex === undefined) {
      return res.status(400).json({ success: false, message: '未找到"结算金额"列' });
    }

    // 按订单号聚合（一个订单可能有多行）
    const orderMap = new Map();

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const orderNo = String(row[orderNoIndex] || '').trim();
      const settleAmount = parseFloat(row[settleAmountIndex]) || 0;

      if (!orderNo) continue;

      if (orderMap.has(orderNo)) {
        orderMap.get(orderNo).totalAmount += settleAmount;
      } else {
        orderMap.set(orderNo, { orderNo, totalAmount: settleAmount });
      }
    }

    // 批量插入/更新订单
    let imported = 0;
    let updated = 0;

    for (const [orderNo, orderData] of orderMap) {
      const existingOrder = await Order.findOne({ orderNo });

      if (existingOrder) {
        existingOrder.totalAmount = orderData.totalAmount;
        await existingOrder.save();
        updated++;
      } else {
        const newOrder = new Order({
          orderNo,
          totalAmount: orderData.totalAmount,
          status: 'pending'
        });
        await newOrder.save();
        imported++;
      }
    }

    // 清理上传文件
    const fs = await import('fs');
    fs.default.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `导入成功：新增 ${imported} 个订单，更新 ${updated} 个订单`,
      data: { imported, updated, total: orderMap.size }
    });
  } catch (error) {
    console.error('Upload orders error:', error);
    res.status(500).json({ success: false, message: '服务器错误：' + error.message });
  }
};

// 生成大奖候选池
export const generatePool = async (req, res) => {
  try {
    // 获取所有有订单绑定的用户，按总金额排序
    const users = await User.find({ totalAmount: { $gt: 0 } })
      .sort({ totalAmount: -1 })
      .limit(10);

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: '暂无绑定订单的用户' });
    }

    // 创建大奖池配置
    const prizeConfig = new PrizeConfig({
      grandPrizePool: users.map(u => u._id),
      poolRankings: users.map((u, i) => ({
        userId: u._id,
        phone: u.phone,
        totalAmount: u.totalAmount,
        rank: i + 1
      })),
      poolGeneratedAt: new Date(),
      grandPrizeDrawn: false
    });

    await prizeConfig.save();

    res.json({
      success: true,
      message: `大奖候选池已生成，共 ${users.length} 名用户入围`,
      data: {
        poolSize: users.length,
        poolRankings: prizeConfig.poolRankings
      }
    });
  } catch (error) {
    console.error('Generate pool error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 抽取大奖
export const drawGrandPrize = async (req, res) => {
  try {
    const { firstPrizeCount = 1, secondPrizeCount = 2, thirdPrizeCount = 2 } = req.body;

    let prizeConfig = await PrizeConfig.findOne().sort({ createdAt: -1 });

    if (!prizeConfig || prizeConfig.grandPrizePool.length === 0) {
      return res.status(400).json({ success: false, message: '大奖候选池不存在，请先生成' });
    }

    if (prizeConfig.grandPrizeDrawn) {
      return res.status(400).json({ success: false, message: '大奖已抽取完毕' });
    }

    const pool = [...prizeConfig.grandPrizePool];
    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const shuffled = shuffle(pool);

    // 抽取一等奖
    const firstWinner = shuffled.slice(0, firstPrizeCount)[0];

    // 抽取二等奖（从剩余中抽）
    const secondPool = shuffled.slice(firstPrizeCount);
    const secondWinners = secondPool.slice(0, secondPrizeCount);

    // 抽取三等奖（从剩余中抽）
    const thirdPool = secondPool.slice(secondPrizeCount);
    const thirdWinners = thirdPool.slice(0, thirdPrizeCount);

    // 更新用户中奖状态
    const updateWinner = async (userId, level) => {
      await User.findByIdAndUpdate(userId, {
        isGrandPrizeWinner: true,
        prizeLevel: level
      });
    };

    if (firstWinner) await updateWinner(firstWinner, 'first');
    for (const w of secondWinners) await updateWinner(w, 'second');
    for (const w of thirdWinners) await updateWinner(w, 'third');

    // 保存配置
    prizeConfig.firstPrize = firstWinner;
    prizeConfig.secondPrize = secondWinners;
    prizeConfig.thirdPrize = thirdWinners;
    prizeConfig.grandPrizeDrawn = true;
    await prizeConfig.save();

    // 记录抽奖记录
    const recordData = [
      { userId: firstWinner, wonPrize: 'first', prizeLevel: 'first' },
      ...secondWinners.map(w => ({ userId: w, wonPrize: 'second', prizeLevel: 'second' })),
      ...thirdWinners.map(w => ({ userId: w, wonPrize: 'third', prizeLevel: 'third' }))
    ];

    for (const record of recordData) {
      const order = await Order.findOne({ bindedUserId: record.userId });
      const lotteryRecord = new LotteryRecord({
        userId: record.userId,
        orderNo: order?.orderNo || 'N/A',
        wonPrize: record.wonPrize,
        prizeLevel: record.prizeLevel,
        ipAddress: req.ip
      });
      await lotteryRecord.save();
    }

    // 获取中奖用户详情
    const winners = {
      first: await User.findById(firstWinner),
      second: await User.find({}, { _id: 1, phone: 1, wechatId: 1 }),
      third: await User.find({}, { _id: 1, phone: 1, wechatId: 1 })
    };

    res.json({
      success: true,
      message: '大奖抽取完成',
      data: {
        winners: {
          first: winners.first ? {
            phone: winners.first.phone,
            totalAmount: winners.first.totalAmount
          } : null,
          second: secondWinners.map(id => User.findById(id)),
          third: thirdWinners.map(id => User.findById(id))
        }
      }
    });
  } catch (error) {
    console.error('Draw grand prize error:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取用户列表
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = search ? {
      $or: [
        { phone: { $regex: search, $options: 'i' } },
        { wechatId: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 获取统计数据
export const getStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const boundUsers = await User.countDocuments({ totalAmount: { $gt: 0 } });
    const winners = await User.countDocuments({ isGrandPrizeWinner: true });
    const totalOrders = await Order.countDocuments();
    const boundOrders = await Order.countDocuments({ status: 'bound' });
    const totalAmount = await User.aggregate([
      { $group: { _id: null, sum: { $sum: '$totalAmount' } } }
    ]);

    const prizeConfig = await PrizeConfig.findOne().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        totalUsers,
        boundUsers,
        winners,
        totalOrders,
        boundOrders,
        totalAmount: totalAmount[0]?.sum || 0,
        poolExists: !!prizeConfig,
        grandPrizeDrawn: prizeConfig?.grandPrizeDrawn || false,
        poolSize: prizeConfig?.grandPrizePool?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 导出中奖信息
export const exportWinners = async (req, res) => {
  try {
    const prizeConfig = await PrizeConfig.findOne()
      .populate('firstPrize', 'phone wechatId weiboId totalAmount')
      .populate('secondPrize', 'phone wechatId weiboId totalAmount')
      .populate('thirdPrize', 'phone wechatId weiboId totalAmount');

    if (!prizeConfig) {
      return res.status(400).json({ success: false, message: '暂无中奖信息' });
    }

    const winners = [];

    if (prizeConfig.firstPrize) {
      winners.push({
        奖项: '一等奖',
        手机号: prizeConfig.firstPrize.phone,
        微信号: prizeConfig.firstPrize.wechatId || '',
        微博号: prizeConfig.firstPrize.weiboId || '',
        订单总额: prizeConfig.firstPrize.totalAmount
      });
    }

    for (const w of (prizeConfig.secondPrize || [])) {
      winners.push({
        奖项: '二等奖',
        手机号: w.phone,
        微信号: w.wechatId || '',
        微博号: w.weiboId || '',
        订单总额: w.totalAmount
      });
    }

    for (const w of (prizeConfig.thirdPrize || [])) {
      winners.push({
        奖项: '三等奖',
        手机号: w.phone,
        微信号: w.wechatId || '',
        微博号: w.weiboId || '',
        订单总额: w.totalAmount
      });
    }

    // 生成 Excel
    const worksheet = XLSX.utils.json_to_sheet(winners);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '中奖信息');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=winners.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};
