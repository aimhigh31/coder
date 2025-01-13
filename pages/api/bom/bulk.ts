import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Bom from '../../../models/Bom';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const boms = await Bom.insertMany(req.body);
      res.status(201).json({ success: true, data: boms });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to create BOM items' });
    }
  } else {
    res.status(400).json({ success: false, error: 'Invalid method' });
  }
} 