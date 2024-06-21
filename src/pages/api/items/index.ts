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
        const items = await prisma.item.findMany();
        res.status(200).json(items);
      } catch (e) {
        res.status(500).json({ error: 'Failed to fetch items' });
      }
      break;
    
    case 'POST':
      try {
        const { name, description, displayName } = req.body;
        const item = await prisma.item.create({
          data: {
            name,
            description,
            displayName,
          },
        });
        res.status(201).json(item);
      } catch (e) {
        res.status(500).json({ error: 'Failed to create item' });
      }
      break;
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
