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
  try {
    await dbConnect();

    if (req.method === 'GET') {
      try {
        const items = await Item.find({}).sort({ no: -1 }).lean();
        return res.status(200).json({
          success: true,
          data: items
        });
      } catch (error) {
        console.error('GET items error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch items'
        });
      }
    }

    if (req.method === 'POST') {
      try {
        const item = await Item.create(req.body);
        return res.status(201).json({
          success: true,
          data: item
        });
      } catch (error) {
        console.error('POST item error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create item'
        });
      }
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 