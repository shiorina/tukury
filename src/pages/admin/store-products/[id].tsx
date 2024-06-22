import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, StoreProduct, StoreProductPrice, Item, Store, ProductCategory } from '@prisma/client';
import { ParsedUrlQuery } from 'querystring';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Tooltip } from '@mui/material';
import Layout from '@/components/Layout';
import axios from 'axios';
import { toast } from 'react-toastify';

const prisma = new PrismaClient();

type StoreProductWithRelations = StoreProduct & {
  item: Item;
  store: Store;
  productCategory: ProductCategory;
  prices: StoreProductPrice[];
}

interface Params extends ParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as Params;
  const storeProduct = await prisma.storeProduct.findUnique({
    where: { id: parseInt(id) },
    include: {
      store: true,
      item: true,
      productCategory: true,
      prices: true
    }
  });

  // recordingDate を文字列に変換
  const serializedStoreProduct = {
    ...storeProduct,
    prices: storeProduct?.prices.map(price => ({
      ...price,
      recordingDate: price.recordingDate.toISOString()
    }))
  };

  return {
    props: {
      storeProduct: serializedStoreProduct
    }
  };
};

interface Props {
  storeProduct: StoreProductWithRelations;
}

const StoreProductDetailPage = ({ storeProduct }: Props) => {
  const today = new Date().toISOString().split('T')[0];

  const [price, setPrice] = useState<number | null>(null);
  const [recordingDate, setRecordingDate] = useState<string>(today);
  const [prices, setPrices] = useState<StoreProductPrice[]>(storeProduct.prices);

  const handleAddPrice = async () => {
    if (price === null || recordingDate === '') {
      toast.error('価格と記録日を入力してください');
      return;
    }

    try {
      const response = await axios.post(`/api/private/admin/store-products/${storeProduct.id}/prices`, {
        price,
        recordingDate
      });

      if (response.status === 201) {
        toast.success('価格情報が追加されました');
        setPrices([...prices, response.data]);
        setPrice(null);
        setRecordingDate(today);
      } else {
        toast.error('価格情報の追加に失敗しました');
      }
    } catch (error) {
      toast.error('価格情報の追加中にエラーが発生しました');
      console.error(error);
    }
  };

  const handleFetchPrice = async () => {
    try {
      const response = await axios.get(`/api/private/admin/store-products/${storeProduct.id}/fetch-price`);

      if (response.status === 200) {
        toast.success('価格情報が自動取得されました');
        setPrices([...prices, response.data]);
      } else {
        toast.error(`価格情報の自動取得に失敗しました: ${response.data.error}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`価格情報の自動取得に失敗しました: ${error.response.data.error}`);
      } else {
        toast.error('価格情報の自動取得中にエラーが発生しました');
      }
      console.error(error);
    }
  };

  const shortenURL = (url: string, maxLength: number) => {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength) + '...';
  };

  return (
    <Layout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {storeProduct.name}
        </Typography>
        <Typography variant="h6" component="h2">
          店舗: {storeProduct.store.name}
        </Typography>
        <Typography variant="h6" component="h2">
          食材: {storeProduct.item.name}
        </Typography>
        <Typography variant="h6" component="h2">
          銘柄: {storeProduct.productCategory.brand}
        </Typography>
        <Typography variant="h6" component="h2">
          量: {storeProduct.productCategory.unit}
        </Typography>
        {storeProduct.url && (
          <Typography variant="h6" component="h2">
            URL: 
            <Tooltip title={storeProduct.url}>
              <a href={storeProduct.url} target="_blank" rel="noopener noreferrer">
                {shortenURL(storeProduct.url, 30)}
              </a>
            </Tooltip>
          </Typography>
        )}
        <Typography variant="h6" component="h2" gutterBottom>
          価格情報
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="価格情報のテーブル">
            <TableHead>
              <TableRow>
                <TableCell>価格</TableCell>
                <TableCell>記録日</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>{price.price}円</TableCell>
                  <TableCell>{new Date(price.recordingDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box mt={4}>
          <Typography variant="h6" component="h2">
            価格情報を追加
          </Typography>
          <TextField
            label="価格"
            type="number"
            value={price ?? ''}
            onChange={(e) => setPrice(Number(e.target.value))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="記録日"
            type="date"
            value={recordingDate}
            onChange={(e) => setRecordingDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button variant="contained" color="primary" onClick={handleAddPrice} sx={{ mr: 2 }}>
            追加
          </Button>
          <Button variant="contained" color="secondary" onClick={handleFetchPrice}>
            自動で取得
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default StoreProductDetailPage;
