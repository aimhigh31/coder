import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  no: Number,
  datetime: String,
  electronicCode: String,
  division: String,
  industry: String,
  partGroup: String,
  revision: String,
  itemName: String,
  itemType: String,
  status: String,
  unit: String,
  model: String,
  accountCode: String,
  note: String,
  author: String
}, {
  timestamps: true
});

export default mongoose.models.Item || mongoose.model('Item', ItemSchema); 