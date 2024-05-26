import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { Session } from 'next-auth';

const prisma = new PrismaClient();

interface IngredientPayload {
  name: string;
  description: string;
  label: string;
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
        const ingredients = await prisma.ingredient.findMany();
        res.status(200).json(ingredients);
      } catch (e: unknown) {
        console.error("Error retrieving ingredients:", e);
        res.status(500).json({ error: "食材の取得に失敗しました", details: e instanceof Error ? e.message : 'Unknown error' });
      }
      break;

    case 'POST':
      try {
        const { name, description, label }: IngredientPayload = req.body;
        const ingredient = await prisma.ingredient.create({
          data: {
            name,
            description,
            label,
          },
        });
        res.status(201).json(ingredient);
      } catch (e: unknown) {
        console.error("Error creating ingredient:", e);
        res.status(500).json({ error: "食材の作成に失敗しました", details: e instanceof Error ? e.message : 'Unknown error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
