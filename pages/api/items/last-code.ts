import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Item from '../../../models/Item';

type ResponseData = {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const lastItem = await Item.findOne().sort({ electronicCode: -1 }).select('electronicCode');
    
    return res.status(200).json({
      success: true,
      data: lastItem
    });
  } catch (error) {
    console.error('Failed to fetch last code:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch last code'
    });
  }
} 