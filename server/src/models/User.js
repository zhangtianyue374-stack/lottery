import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  wechatId: {
    type: String,
    trim: true,
    default: ''
  },
  weiboId: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  lotteryChances: {
    type: Number,
    default: 0
  },
  isGrandPrizeWinner: {
    type: Boolean,
    default: false
  },
  prizeLevel: {
    type: String,
    enum: [null, 'first', 'second', 'third'],
    default: null
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
