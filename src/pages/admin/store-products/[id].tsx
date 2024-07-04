import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, StoreProduct, StoreProductPrice, Item, Store, ProductCategory } from '@prisma/client';
import { ParsedUrlQuery } from 'querystring';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Tooltip, Select, MenuItem, InputLabel, FormControl, Autocomplete } from '@mui/material';
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

  const items: Item[] = await prisma.item.findMany();
  const stores: Store[] = await prisma.store.findMany();

  // 重複を排除したproductCategoriesリストを生成
  const productCategories: ProductCategory[] = await prisma.productCategory.findMany();
  const uniqueProductCategories = productCategories.reduce((acc: ProductCategory[], current) => {
    if (!acc.find(category => category.brand === current.brand)) {
      acc.push(current);
    }
    return acc;
  }, []);

  return {
    props: {
      storeProduct: serializedStoreProduct,
      items,
      stores,
      productCategories: uniqueProductCategories,
    }
  };
};

interface Props {
  storeProduct: StoreProductWithRelations;
  items: Item[];
  stores: Store[];
  productCategories: ProductCategory[];
}

const StoreProductDetailPage = ({ storeProduct, items, stores, productCategories }: Props) => {
  const today = new Date().toISOString().split('T')[0];

  const [price, setPrice] = useState<number | null>(null);
  const [recordingDate, setRecordingDate] = useState<string>(today);
  const [prices, setPrices] = useState<StoreProductPrice[]>(storeProduct.prices);
  const [name, setName] = useState(storeProduct.name);
  const [storeId, setStoreId] = useState<string>(storeProduct.store.id.toString());
  const [itemId, setItemId] = useState<string>(storeProduct.item.id.toString());
  const [productCategoryId, setProductCategoryId] = useState<string>(storeProduct.productCategory.id.toString());
  const [itemQuantity, setItemQuantity] = useState<number>(storeProduct.itemQuantity);
  const [url, setUrl] = useState<string | null>(storeProduct.url);
  const [imageUrl, setImageUrl] = useState<string | null>(storeProduct.imageUrl);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleUpdateProduct = async () => {
    try {
      const response = await axios.put(`/api/private/admin/store-products/${storeProduct.id}`, {
        name,
        storeId: parseInt(storeId),
        itemId: parseInt(itemId),
        productCategoryId: parseInt(productCategoryId),
        itemQuantity,
        url,
        imageUrl
      });

      if (response.status === 200) {
        toast.success('商品情報が更新されました');
        setIsEditing(false);
      } else {
        toast.error('商品情報の更新に失敗しました');
      }
    } catch (error) {
      toast.error('商品情報の更新中にエラーが発生しました');
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
          商品詳細
        </Typography>
        {!isEditing ? (
          <>
            <Button variant="contained" color="primary" onClick={() => setIsEditing(true)} sx={{ mb: 2 }}>
              編集
            </Button>
            <Typography variant="h6" component="h2">
              商品名: {name}
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
          </>
        ) : (
          <>
            <Box>
              <Typography variant="h6" component="h2">
                商品名
              </Typography>
              <TextField
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Box>
            <Box>
              <Typography variant="h6" component="h2">
                ストア
              </Typography>
              <FormControl fullWidth>
                <Select
                  labelId="store-select-label"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value as string)}
                >
                  {stores?.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography variant="h6" component="h2">
                食材
              </Typography>
              <Autocomplete
                freeSolo
                options={items.map((item) => ({ label: item.name, id: item.id.toString() }))}
                value={
                  items.find((item) => item.id.toString() === itemId)
                    ? { label: items.find((item) => item.id.toString() === itemId)!.name, id: itemId }
                    : { label: '', id: '' }
                }
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    setItemId('');
                  } else {
                    setItemId(newValue?.id || '');
                  }
                }}
                onInputChange={(event, newInputValue) => {
                  const matchingItem = items.find((item) => item.name === newInputValue);
                  if (matchingItem) {
                    setItemId(matchingItem.id.toString());
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                  />
                )}
              />
            </Box>
            <Box>
              <Typography variant="h6" component="h2">
                銘柄
              </Typography>
              <Autocomplete
                freeSolo
                options={productCategories.map((category) => ({ label: category.brand, id: category.id.toString() }))}
                value={
                  productCategories.find((category) => category.id.toString() === productCategoryId)
                    ? { label: productCategories.find((category) => category.id.toString() === productCategoryId)!.brand, id: productCategoryId }
                    : { label: '', id: '' }
                }
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    setProductCategoryId('');
                  } else {
                    setProductCategoryId(newValue?.id || '');
                  }
                }}
                onInputChange={(event, newInputValue) => {
                  const matchingCategory = productCategories.find((category) => category.brand === newInputValue);
                  if (matchingCategory) {
                    setProductCategoryId(matchingCategory.id.toString());
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="銘柄"
                    fullWidth
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="h6" component="h2">
                URL
              </Typography>
              <TextField
                fullWidth
                value={url ?? ''}
                onChange={(e) => setUrl(e.target.value)}
              />
            </Box>
            <Box>
              <Typography variant="h6" component="h2">
                画像URL
              </Typography>
              <TextField
                fullWidth
                value={imageUrl ?? ''}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </Box>
            <Button variant="contained" color="primary" onClick={handleUpdateProduct} sx={{ mt: 2 }}>
              保存
            </Button>
            <Button variant="contained" color="secondary" onClick={() => setIsEditing(false)} sx={{ mt: 2, ml: 2 }}>
              キャンセル
            </Button>
          </>
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
