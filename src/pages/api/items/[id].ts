import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const itemId = req.query.id as string;

  switch (req.method) {
    case 'PUT':
      const { name, description, displayName }: Prisma.ItemUpdateInput = req.body;
      try {
        const item = await prisma.item.update({
          where: { id: parseInt(itemId) },
          data: {
            name,
            description,
            displayName,
          },
        });
        res.status(200).json({ message: 'Item updated successfully', item });
      } catch (e) {
        if (e instanceof Error) {
          console.error("Error updating item:", e.message);
          res.status(500).json({ error: 'Item update failed', details: e.message });
        } else {
          console.error("An unexpected error occurred");
          res.status(500).json({ error: 'An unexpected error occurred' });
        }
      }
      break;

    case 'DELETE':
      try {
        await prisma.item.delete({
          where: { id: parseInt(itemId) },
        });
        res.status(200).json({ message: 'Item deleted successfully' });
      } catch (e) {
        if (e instanceof Error) {
          console.error("Error deleting item:", e.message);
          res.status(500).json({ error: 'Item deletion failed', details: e.message });
        } else {
          console.error("An unexpected error occurred during deletion");
          res.status(500).json({ error: 'An unexpected error occurred' });
        }
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
