import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      try {
        const stores = await prisma.store.findMany();
        res.status(200).json(stores);
      } catch (e) {
        console.error('Failed to fetch stores:', e);
        res.status(500).json({ error: 'Failed to fetch stores' });
      }
      break;

    case 'POST':
      try {
        const { name, url } = req.body;
        const store = await prisma.store.create({
          data: {
            name,
            url,
          },
        });
        res.status(201).json(store);
      } catch (e) {
        console.error('Failed to create store:', e);
        res.status(500).json({ error: 'Failed to create store' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
