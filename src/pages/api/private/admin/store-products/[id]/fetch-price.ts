import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import cheerio from 'cheerio';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const storeProduct = await prisma.storeProduct.findUnique({
    where: { id: parseInt(id as string) },
  });

  if (!storeProduct || !storeProduct.url) {
    return res.status(400).json({ error: '有効な商品URLが見つかりませんでした' });
  }

  try {
    const response = await axios.get(storeProduct.url);
    const html = response.data;
    const $ = cheerio.load(html);

    // セレクタを設定
    const priceElement = $('#corePriceDisplay_desktop_feature_div .a-price-whole');
    const priceText = priceElement.text().replace(',', '');

    const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

    if (isNaN(price)) {
      return res.status(400).json({ error: '値段を取得できませんでした' });
    }

    const newPrice = await prisma.storeProductPrice.create({
      data: {
        storeProductId: storeProduct.id,
        price,
        recordingDate: new Date(),
      },
    });

    res.status(200).json(newPrice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '価格の取得に失敗しました' });
  }
}
