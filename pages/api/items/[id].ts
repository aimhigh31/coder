import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Item from '../../../models/Item';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  await dbConnect();

  switch (req.method) {
    case 'DELETE':
      try {
        const deletedItem = await Item.findByIdAndDelete(id);
        if (!deletedItem) {
          return res.status(404).json({ error: 'Item not found' });
        }
        res.status(200).json(deletedItem);
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
      }
      break;

    case 'PUT':
      try {
        const updatedItem = await Item.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!updatedItem) {
          return res.status(404).json({ error: 'Item not found' });
        }
        res.status(200).json(updatedItem);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update item' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
      break;
  }
} 