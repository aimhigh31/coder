import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Item from '../../../models/Item';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const lastItem = await Item.findOne().sort({ no: -1 }).select('no');
    
    return res.status(200).json({
      success: true,
      data: lastItem
    });
  } catch (error) {
    console.error('Failed to fetch last no:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch last no'
    });
  }
} 