import mongoose from 'mongoose';

const BomSchema = new mongoose.Schema({
  no: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  industry: {
    type: String,
    default: '',
    trim: true
  },
  model: {
    type: String,
    default: ''
  },
  itemType: {
    type: String,
    required: true,
    default: '제품'
  },
  level: {
    type: Number,
    required: true,
    default: 1
  },
  electronicCode: {
    type: String,
    default: ''
  },
  itemName: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String,
    default: ''
  },
  process: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'boms'
});

BomSchema.pre('save', function(next) {
  if (this.isNew) {
    this.createdAt = new Date();
  }
  this.updatedAt = new Date();
  next();
});

BomSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.models.Bom || mongoose.model('Bom', BomSchema); 