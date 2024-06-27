import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const storeProducts = await prisma.storeProduct.findMany({
      include: {
        prices: true
      }
    });

    const updatedPrices = [];

    for (const storeProduct of storeProducts) {
      if (!storeProduct.url) continue;

      try {
        const response = await axios.get(storeProduct.url);
        const $ = cheerio.load(response.data);
        const priceText = $('#corePriceDisplay_desktop_feature_div .a-price-whole').text().trim();

        if (priceText) {
          const price = parseFloat(priceText.replace(',', ''));
          const newPrice = await prisma.storeProductPrice.create({
            data: {
              storeProductId: storeProduct.id,
              price,
              recordingDate: new Date(),
            },
          });

          updatedPrices.push(newPrice);
        }
      } catch (error) {
        console.error(`Error fetching price for ${storeProduct.name}:`, error);
      }
    }

    const storeProductPrices = await prisma.storeProductPrice.findMany({
      include: {
        storeProduct: {
          include: {
            item: true,
            store: true,
            productCategory: true
          }
        }
      }
    });

    const serializedStoreProductPrices = storeProductPrices.map(price => ({
      ...price,
      recordingDate: price.recordingDate.toISOString(),
    }));

    res.status(200).json(serializedStoreProductPrices);
  } catch (error) {
    console.error('Error fetching all prices:', error);
    res.status(500).json({ error: 'Error fetching all prices' });
  }
}
