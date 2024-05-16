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
        const ingredients = await prisma.ingredient.findMany();
        res.status(200).json(ingredients);
      } catch (e) {
        res.status(500).json({ error: 'Failed to fetch ingredients' });
      }
      break;
    
    case 'POST':
      try {
        const { name, description } = req.body;
        const ingredient = await prisma.ingredient.create({
          data: {
            name,
            description,
          },
        });
        res.status(201).json(ingredient);
      } catch (e) {
        res.status(500).json({ error: 'Failed to create ingredient' });
      }
      break;
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
