import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { Session } from 'next-auth';

const prisma = new PrismaClient();

interface ProductCategoryPayload {
  itemId: number;
  brand: string;
  unit: string;
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
        const productCategories = await prisma.productCategory.findMany();
        res.status(200).json(productCategories);
      } catch (e) {
        console.error("Error retrieving product categories:", e);
        res.status(500).json({ error: "商品区分の取得に失敗しました", details: e });
      }
      break;

    case 'POST':
      try {
        const { itemId, brand, unit }: ProductCategoryPayload = req.body;
        const productCategory = await prisma.productCategory.create({
          data: {
            itemId,
            brand,
            unit,
          },
        });
        res.status(201).json(productCategory);
      } catch (e) {
        console.error("Error creating product category:", e);
        res.status(500).json({ error: "商品区分の作成に失敗しました", details: e });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
