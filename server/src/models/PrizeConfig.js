import mongoose from 'mongoose';

const prizeConfigSchema = new mongoose.Schema({
  grandPrizePool: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  grandPrizeDrawn: {
    type: Boolean,
    default: false
  },
  firstPrize: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  secondPrize: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  thirdPrize: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  poolGeneratedAt: {
    type: Date,
    default: null
  },
  poolRankings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalAmount: Number,
    rank: Number
  }]
}, {
  timestamps: true
});

export default mongoose.model('PrizeConfig', prizeConfigSchema);
