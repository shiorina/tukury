import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { Session } from 'next-auth';
import fs from 'fs';
import formidable, { IncomingForm, Fields, Files } from 'formidable';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session: Session | null = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: '認証されませんでした' });
  }

  if (req.method === 'POST') {
    const form = new IncomingForm();

    form.parse(req, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        return res.status(500).json({ error: 'ファイルの解析に失敗しました' });
      }

      let file: formidable.File | undefined;
      if (Array.isArray(files.file)) {
        file = files.file[0];
      } else if (files.file) {
        file = files.file as formidable.File;
      }

      if (!file) {
        return res.status(400).json({ error: 'ファイルが見つかりません' });
      }

      const filePath = file.filepath;

      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            for (const row of results) {
              const { itemName, brand, unit, storeName, url } = row;

              let item = await prisma.item.findUnique({
                where: { name: itemName },
              });

              if (!item) {
                item = await prisma.item.create({
                  data: {
                    name: itemName,
                    displayName: itemName,
                    description: '',
                  },
                });
              }

              let store = await prisma.store.findUnique({
                where: {name: storeName}
              });


              if (!store) {
                store = await prisma.store.create({
                  data: {
                    name: storeName,
                  },
                });
              }

              const productCategory = await prisma.productCategory.create({
                data: {
                  itemId: item.id,
                  brand,
                  unit,
                },
              });

              await prisma.storeProduct.create({
                data: {
                  itemId: item.id,
                  storeId: store.id,
                  productCategoryId: productCategory.id,
                  itemQuantity: 1,
                  name: '(仮)',
                  url: url
                }
              })
            }
            res.status(200).json({ message: 'CSVファイルの処理が完了しました' });
          } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'データベースへの登録に失敗しました' });
          }
        });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
