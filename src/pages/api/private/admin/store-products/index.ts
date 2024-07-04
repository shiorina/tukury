import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, storeId, itemId, productCategoryId, itemQuantity, url, imageUrl } = req.body;

    try {
      const newStoreProduct = await prisma.storeProduct.create({
        data: {
          name,
          storeId: parseInt(storeId),
          itemId: parseInt(itemId),
          productCategoryId: parseInt(productCategoryId),
          itemQuantity: parseInt(itemQuantity),
          url,
          imageUrl,
        },
      });

      res.status(201).json(newStoreProduct);
    } catch (error) {
      console.error('Error creating store product:', error);
      res.status(500).json({ error: 'Error creating store product' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
