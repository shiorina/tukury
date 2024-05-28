import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]'; 
import { Session } from 'next-auth';

const prisma = new PrismaClient();

interface RecipePayload {
  title: string;
  description: string;
  steps: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session: Session | null = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: '認証されませんでした' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const recipes = await prisma.recipe.findMany();
        res.status(200).json(recipes);
      } catch (e) {
        console.error("Error retrieving recipes:", e);
        res.status(500).json({ error: "レシピの取得に失敗しました", details: e });
      }
      break;

    case 'POST':
      try {
        const { title, description, steps }: RecipePayload = req.body;
        const recipe = await prisma.recipe.create({
          data: {
            title,
            description,
            steps,
          },
        });
        res.status(201).json(recipe);
      } catch (e) {
        console.error("Error creating recipe:", e);
        res.status(500).json({ error: "レシピの作成に失敗しました", details: e });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
