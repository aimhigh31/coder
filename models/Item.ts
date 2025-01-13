import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  no: {
    type: Number,
    required: true,
    unique: true,
  },
  datetime: {
    type: Date,
    default: Date.now
  },
  division: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  partGroup: {
    type: String,
    required: true
  },
  revision: {
    type: String,
    default: 'A'
  },
  electronicCode: {
    type: String,
    required: true,
    unique: true,
  },
  itemName: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    required: true,
    default: '제품'
  },
  status: {
    type: String,
    default: '양산'
  },
  unit: {
    type: String,
    default: 'EA'
  },
  model: String,
  accountCode: String,
  note: String,
  author: String
}, {
  timestamps: true,
  versionKey: false,
  collection: 'items'
});

// 전산코드 자동 생성
ItemSchema.pre('save', function(next) {
  if (this.isNew && !this.electronicCode) {
    this.electronicCode = `${this.division}-${this.industry}-${this.partGroup}-${String(this.no).padStart(5, '0')}${this.revision}`;
  }
  next();
});

export default mongoose.models.Item || mongoose.model('Item', ItemSchema); 