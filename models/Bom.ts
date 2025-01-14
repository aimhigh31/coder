import mongoose from 'mongoose';

const BomSchema = new mongoose.Schema({
  no: {
    type: Number,
    required: true
  },
  industry: {
    type: String,
    default: ''
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
});

BomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Bom || mongoose.model('Bom', BomSchema); 