import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Item from '../../../models/Item';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      try {
        const filter: any = {};
        
        // 검색 필터 적용
        if (req.query.division) filter.division = req.query.division;
        if (req.query.industry) filter.industry = req.query.industry;
        if (req.query.partGroup) filter.partGroup = req.query.partGroup;
        if (req.query.electronicCode) {
          filter.electronicCode = { $regex: req.query.electronicCode, $options: 'i' };
        }
        if (req.query.itemName) {
          filter.itemName = { $regex: req.query.itemName, $options: 'i' };
        }
        if (req.query.model) {
          filter.model = { $regex: req.query.model, $options: 'i' };
        }

        const items = await Item.find(filter)
          .sort({ no: -1 })
          .lean();

        return res.status(200).json({ success: true, data: items });
      } catch (error) {
        throw new Error('Failed to fetch items');
      }
    }

    if (req.method === 'POST') {
      try {
        const lastItem = await Item.findOne().sort({ no: -1 });
        const nextNo = (lastItem?.no || 0) + 1;

        const newItem = {
          ...req.body,
          no: nextNo,
          datetime: new Date(),
          status: '양산',
          unit: 'EA'
        };

        const item = await Item.create(newItem);
        return res.status(201).json({ success: true, data: item });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({
            success: false,
            error: '중복된 전산코드가 존재합니다.'
          });
        }
        throw error;
      }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 