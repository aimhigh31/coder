import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Bom from '../../../models/Bom';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        // 필터 조건 구성
        const filter: any = {};
        if (req.query.itemType) filter.itemType = req.query.itemType;
        if (req.query.level) filter.level = Number(req.query.level);
        if (req.query.electronicCode) filter.electronicCode = { $regex: req.query.electronicCode, $options: 'i' };
        if (req.query.itemName) filter.itemName = { $regex: req.query.itemName, $options: 'i' };
        if (req.query.process) filter.process = { $regex: req.query.process, $options: 'i' };
        if (req.query.industry) filter.industry = { $regex: req.query.industry, $options: 'i' };
        if (req.query.model) filter.model = { $regex: req.query.model, $options: 'i' };

        const boms = await Bom.find(filter).sort({ no: -1 });
        console.log('Fetched BOM items:', boms.length);
        res.status(200).json({ success: true, data: boms });
      } catch (error) {
        console.error('GET BOM Error:', error);
        res.status(400).json({ success: false, error: 'Failed to fetch BOM data' });
      }
      break;

    case 'POST':
      try {
        console.log('Creating new BOM item:', req.body);
        const data = Array.isArray(req.body) ? req.body : [req.body];
        const lastBom = await Bom.findOne().sort({ no: -1 });
        const startNo = (lastBom?.no || 0) + 1;
        
        const processedData = data.map((item, index) => ({
          ...item,
          no: item.no || (startNo + index),
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        const boms = await Bom.create(processedData);
        console.log('Created BOM item:', boms);
        res.status(201).json({ success: true, data: Array.isArray(boms) ? boms : [boms] });
      } catch (error) {
        console.error('POST BOM Error:', error);
        res.status(400).json({ success: false, error: 'Failed to create BOM' });
      }
      break;

    default:
      res.status(400).json({ success: false, error: 'Invalid method' });
      break;
  }
} 