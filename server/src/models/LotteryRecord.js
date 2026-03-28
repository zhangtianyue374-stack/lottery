import mongoose from 'mongoose';

const lotteryRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNo: {
    type: String,
    required: true
  },
  drawTime: {
    type: Date,
    default: Date.now
  },
  wonPrize: {
    type: String,
    enum: ['none', 'first', 'second', 'third'],
    default: 'none'
  },
  prizeLevel: {
    type: String,
    default: null
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

lotteryRecordSchema.index({ userId: 1, drawTime: -1 });

export default mongoose.model('LotteryRecord', lotteryRecordSchema);
