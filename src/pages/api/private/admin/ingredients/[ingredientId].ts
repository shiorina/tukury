import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { ingredientId } = req.query;

  if (!ingredientId) {
    return res.status(400).json({ error: 'Missing ingredientId parameter' });
  }

  const id = parseInt(ingredientId as string, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ingredientId parameter' });
  }

  switch (req.method) {
    case 'PUT':
      const { name, description, label }: Prisma.IngredientUpdateInput = req.body;
      try {
        const ingredient = await prisma.ingredient.update({
          where: { id },
          data: {
            name,
            description,
            label,
          },
        });
        res.status(200).json({ message: 'Ingredient updated successfully', ingredient });
      } catch (e: unknown) {
        console.error("Error updating ingredient:", e);
        res.status(500).json({ error: 'Ingredient update failed', details: e instanceof Error ? e.message : 'Unknown error' });
      }
      break;

    case 'DELETE':
      try {
        await prisma.ingredient.delete({
          where: { id },
        });
        res.status(200).json({ message: 'Ingredient deleted successfully' });
      } catch (e: unknown) {
        console.error("Error deleting ingredient:", e);
        res.status(500).json({ error: 'Ingredient deletion failed', details: e instanceof Error ? e.message : 'Unknown error' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
