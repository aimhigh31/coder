import mongoose from 'mongoose';

const BomSchema = new mongoose.Schema({
  no: { type: Number, required: true },
  industry: { type: String, default: '' },
  model: { type: String, default: '' },
  itemType: { type: String, default: '제품' },
  level: { type: Number, default: 1 },
  parentCode: { type: String, default: '' },
  electronicCode: { type: String, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'EA' },
  process: { type: String, default: '' },
  note: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.models.Bom || mongoose.model('Bom', BomSchema); 