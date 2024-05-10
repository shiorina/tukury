import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const recipeId = req.query.id;

  switch (req.method) {
    case 'PUT':
      const { title, description, steps }: Prisma.RecipeUpdateInput = req.body;
      try {
        const recipe = await prisma.recipe.update({
          where: { id: parseInt(recipeId as string) },
          data: {
            title,
            description,
            steps,
          },
        });
        res.status(200).json({ message: 'Recipe updated successfully', recipe });
      } catch (e) {
        if (e instanceof Error) {
          console.error("Error updating recipe:", e.message);
          res.status(500).json({ error: 'Recipe update failed', details: e.message });
        } else {
          console.error("An unexpected error occurred");
          res.status(500).json({ error: 'An unexpected error occurred' });
        }
      }
      break;

    case 'DELETE':
      try {
        const recipe = await prisma.recipe.delete({
          where: { id: parseInt(recipeId as string) },
        });
        res.status(200).json({ message: 'Recipe deleted successfully' });
      } catch (e) {
        if (e instanceof Error) {
          console.error("Error deleting recipe:", e.message);
          res.status(500).json({ error: 'Recipe deletion failed', details: e.message });
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
