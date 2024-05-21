import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const storeId = req.query.storeId as string;

  switch (req.method) {
    case 'PUT':
      try {
        const { name, url } = req.body;
        const store = await prisma.store.update({
          where: { id: parseInt(storeId) },
          data: {
            name,
            url,
          },
        });
        res.status(200).json(store);
      } catch (e) {
        console.error('Failed to update store:', e);
        res.status(500).json({ error: 'Failed to update store' });
      }
      break;

    case 'DELETE':
      try {
        await prisma.store.delete({
          where: { id: parseInt(storeId) },
        });
        res.status(200).json({ message: 'Store deleted successfully' });
      } catch (e) {
        console.error('Failed to delete store:', e);
        res.status(500).json({ error: 'Failed to delete store' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
