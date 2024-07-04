import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name } = req.body;

    try {
      const updatedProduct = await prisma.storeProduct.update({
        where: { id: parseInt(id as string) },
        data: { name },
      });

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating store product name:', error);
      res.status(500).json({ error: '商品名の更新に失敗しました' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
