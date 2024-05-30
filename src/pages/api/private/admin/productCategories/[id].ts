import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const productCategoryId = req.query.id;

  switch (req.method) {
    case 'PUT':
      const { item_id, brand, unit }: { item_id: number, brand: string, unit: string } = req.body;
      try {
        const productCategory = await prisma.productCategory.update({
          where: { id: parseInt(productCategoryId as string) },
          data: {
            item_id,
            brand,
            unit,
          },
        });
        res.status(200).json({ message: 'Product category updated successfully', productCategory });
      } catch (e) {
        if (e instanceof Error) {
          console.error("Error updating product category:", e.message);
          res.status(500).json({ error: 'Product category update failed', details: e.message });
        } else {
          console.error("An unexpected error occurred");
          res.status(500).json({ error: 'An unexpected error occurred' });
        }
      }
      break;

    case 'DELETE':
      try {
        await prisma.productCategory.delete({
          where: { id: parseInt(productCategoryId as string) },
        });
        res.status(200).json({ message: 'Product category deleted successfully' });
      } catch (e) {
        if (e instanceof Error) {
          console.error("Error deleting product category:", e.message);
          res.status(500).json({ error: 'Product category deletion failed', details: e.message });
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
