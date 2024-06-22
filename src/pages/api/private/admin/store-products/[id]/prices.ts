// pages/api/private/admin/store-products/[id]/prices.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    const { price, recordingDate } = req.body;

    try {
      const newPrice = await prisma.storeProductPrice.create({
        data: {
          price: parseFloat(price),
          recordingDate: new Date(recordingDate),
          storeProductId: parseInt(id as string),
        },
      });

      res.status(201).json(newPrice);
    } catch (error) {
      console.error('Error adding price:', error);
      res.status(500).json({ error: '価格情報の追加に失敗しました' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
