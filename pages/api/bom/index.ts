import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import Bom from '../../../models/Bom';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    switch (req.method) {
      case 'POST':
        const bomData = {
          ...req.body,
          parentCode: req.body.parentCode || ''  // 명시적으로 처리
        };
        const newBom = await Bom.create(bomData);
        return res.status(201).json({ success: true, data: newBom });

      case 'PUT':
        const { id } = req.query;
        const updateData = {
          ...req.body,
          parentCode: req.body.parentCode || ''  // 명시적으로 처리
        };
        const updatedBom = await Bom.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true
        });
        return res.status(200).json({ success: true, data: updatedBom });

      default:
        const boms = await Bom.find({}).sort({ no: -1 });
        return res.status(200).json({ success: true, data: boms });
    }
  } catch (error) {
    console.error('BOM API Error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
} 