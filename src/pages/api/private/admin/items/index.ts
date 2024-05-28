import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { Session } from 'next-auth';

const prisma = new PrismaClient();

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
        const items = await prisma.item.findMany();
        res.status(200).json(items);
      } catch (e: unknown) {
        console.error("Error retrieving items:", e);
        res.status(500).json({ error: "アイテムの取得に失敗しました", details: e instanceof Error ? e.message : 'Unknown error' });
      }
      break;

    case 'POST':
      try {
        const { name, description, label } = req.body;
        const item = await prisma.item.create({
          data: {
            name,
            description,
            label,
          },
        });
        res.status(201).json(item);
      } catch (e: unknown) {
        console.error("Error creating item:", e);
        res.status(500).json({ error: "アイテムの作成に失敗しました", details: e instanceof Error ? e.message : 'Unknown error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
