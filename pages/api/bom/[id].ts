import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Bom from '../../../models/Bom';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }

  await dbConnect();

  switch (req.method) {
    case 'PUT':
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ success: false, error: 'Invalid ID format' });
        }

        const bom = await Bom.findByIdAndUpdate(id, 
          { ...req.body, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        if (!bom) {
          return res.status(404).json({ success: false, error: 'BOM not found' });
        }
        res.status(200).json({ success: true, data: bom });
      } catch (error) {
        console.error('Update BOM Error:', error);
        res.status(400).json({ success: false, error: 'Failed to update BOM' });
      }
      break;

    case 'DELETE':
      try {
        const bom = await Bom.findByIdAndDelete(id);
        if (!bom) {
          return res.status(404).json({ success: false, error: 'BOM not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to delete BOM' });
      }
      break;

    default:
      res.status(400).json({ success: false, error: 'Invalid method' });
      break;
  }
} 