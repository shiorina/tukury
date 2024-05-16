import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ingredientId = req.query.id;

  switch (req.method) {
    case 'PUT':
      const { name, description }: Prisma.IngredientUpdateInput = req.body;
      try {
        const ingredient = await prisma.ingredient.update({
          where: { id: parseInt(ingredientId as string) },
          data: {
            name,
            description,
          },
        });
        res.status(200).json({ message: 'Ingredient updated successfully', ingredient });
      } catch (e) {
        if (e instanceof Error) {
          console.error("Error updating ingredient:", e.message);
          res.status(500).json({ error: 'Ingredient update failed', details: e.message });
        } else {
          console.error("An unexpected error occurred");
          res.status(500).json({ error: 'An unexpected error occurred' });
        }
      }
      break;

    case 'DELETE':
      try {
        await prisma.ingredient.delete({
          where: { id: parseInt(ingredientId as string) },
        });
        res.status(200).json({ message: 'Ingredient deleted successfully' });
      } catch (e) {
        if (e instanceof Error) {
          console.error("Error deleting ingredient:", e.message);
          res.status(500).json({ error: 'Ingredient deletion failed', details: e.message });
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
