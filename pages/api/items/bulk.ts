import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Item from '../../../models/Item';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const items = req.body;

    // 기존 데이터 삭제
    await Item.deleteMany({});

    // 새 데이터 삽입
    const result = await Item.insertMany(items);
    res.status(200).json(result);
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Failed to bulk upload items' });
  }
} 