import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, StoreProductPrice, StoreProduct, Item, Store, ProductCategory } from '@prisma/client';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tooltip } from '@mui/material';
import Layout from '@/components/Layout';
import { toast } from 'react-toastify';

const prisma = new PrismaClient();

type StoreProductPriceWithRelations = StoreProductPrice & {
  storeProduct: StoreProduct & {
    item: Item;
    store: Store;
    productCategory: ProductCategory;
  };
}

export const getServerSideProps: GetServerSideProps = async () => {
  const storeProductPrices: StoreProductPriceWithRelations[] = await prisma.storeProductPrice.findMany({
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

  // recordingDate を文字列に変換
  const serializedStoreProductPrices = storeProductPrices.map(price => ({
    ...price,
    recordingDate: price.recordingDate.toISOString(),
  }));

  return {
    props: {
      storeProductPrices: serializedStoreProductPrices
    }
  };
};

interface Props {
  storeProductPrices: StoreProductPriceWithRelations[];
}

const StoreProductPricesPage = ({ storeProductPrices }: Props) => {
  const [prices, setPrices] = useState<StoreProductPriceWithRelations[]>(storeProductPrices);

  const handleFetchAllPrices = async () => {
    try {
      const response = await axios.get('/api/private/admin/store-product-prices/fetch-all-prices');

      if (response.status === 200) {
        toast.success('全商品の価格情報が自動取得されました');
        setPrices(response.data);
      } else {
        toast.error('全商品の価格情報の自動取得に失敗しました');
      }
    } catch (error) {
      toast.error('全商品の価格情報の自動取得中にエラーが発生しました');
      console.error(error);
    }
  };

  const shortenURL = (url: string, maxLength: number) => {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength) + '...';
  };

  // 商品・URLごとに価格情報をまとめ、時系列順にソートし、日付重複を除外
  const groupedPrices = prices.reduce((acc, price) => {
    const key = `${price.storeProduct.item.name}_${price.storeProduct.url}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(price);
    return acc;
  }, {} as Record<string, StoreProductPriceWithRelations[]>);

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          商品価格一覧
        </Typography>
        <Button variant="contained" color="primary" onClick={handleFetchAllPrices}>
          一括価格取得
        </Button>
      </Box>
      {Object.entries(groupedPrices).map(([key, priceList]) => {
        const [productName, productUrl] = key.split('_');
        // 記録日で重複を除外
        const uniquePrices = priceList.reduce((acc, currentPrice) => {
          const dateKey = new Date(currentPrice.recordingDate).toLocaleDateString();
          if (!acc[dateKey]) {
            acc[dateKey] = currentPrice;
          }
          return acc;
        }, {} as Record<string, StoreProductPriceWithRelations>);

        return (
          <Box key={key} mb={4}>
            <Typography variant="h6" component="h2">
              {productName}
            </Typography>
            {productUrl && (
              <Typography variant="subtitle1">
                URL: 
                <Tooltip title={productUrl}>
                  <a href={productUrl} target="_blank" rel="noopener noreferrer">
                    {shortenURL(productUrl, 30)}
                  </a>
                </Tooltip>
              </Typography>
            )}
            <TableContainer component={Paper}>
              <Table aria-label={`${productName}の価格情報のテーブル`}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>価格</TableCell>
                    <TableCell>記録日</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(uniquePrices)
                    .sort((a, b) => new Date(a.recordingDate).getTime() - new Date(b.recordingDate).getTime())
                    .map(price => (
                      <TableRow key={price.id}>
                        <TableCell>{price.id}</TableCell>
                        <TableCell>{price.price}円</TableCell>
                        <TableCell>{new Date(price.recordingDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
    </Layout>
  );
};

export default StoreProductPricesPage;
