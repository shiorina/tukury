import { useState, ChangeEvent } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, StoreProduct, Item, Store, ProductCategory } from '@prisma/client';
import axios from 'axios';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tooltip
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import Layout from '@/components/Layout';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Link from 'next/link';

const prisma = new PrismaClient();

type StoreProductWithRelation = StoreProduct & {
  item: Item;
  store: Store;
  productCategory: ProductCategory;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const storeProducts: StoreProduct[] = await prisma.storeProduct.findMany({
    include: {
      store: true,
      item: true,
      productCategory: true
    }
  });

  const items: Item[] = await prisma.item.findMany();
  const stores: Store[] = await prisma.store.findMany();
  const productCategories: ProductCategory[] = await prisma.productCategory.findMany();

  return { props: { storeProducts, items, stores, productCategories } };
};

interface Props {
  storeProducts: StoreProductWithRelation[];
  items: Item[];
  stores: Store[];
  productCategories: ProductCategory[];
}

const ProductCategoryPage = (props: Props) => {
  const { storeProducts, items, stores, productCategories } = props;
  const [storeProductList, setStoreProductList] = useState<StoreProductWithRelation[]>(storeProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStoreProduct, setNewStoreProduct] = useState({
    name: '',
    storeId: '',
    itemId: '',
    productCategoryId: '',
    itemQuantity: 0,
    url: '',
    imageUrl: '',
  });

  const handleOpen = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setNewStoreProduct({
      name: '',
      storeId: '',
      itemId: '',
      productCategoryId: '',
      itemQuantity: 0,
      url: '',
      imageUrl: '',
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStoreProduct({ ...newStoreProduct, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewStoreProduct({ ...newStoreProduct, [name as string]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/private/admin/store-products', newStoreProduct, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        toast.success('新しい店舗取扱商品が登録されました');
        setStoreProductList([...storeProductList, response.data]);
        handleClose();
      } else {
        toast.error('店舗取扱商品の登録に失敗しました');
      }
    } catch (error) {
      console.error('Error during POST request:', error);
      toast.error('店舗取扱商品の登録に失敗しました');
    }
  };

  const shortenURL = (url: string, maxLength: number) => {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength) + '...';
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h2">
          店舗取扱商品一覧
        </Typography>
        <Box>
          <Link href='/admin/store-products/upload' passHref>
            <Button variant="outlined" color="primary" sx={{ mr: 2 }}>
              CSVインポート
            </Button>
          </Link>
          <Button onClick={handleOpen} variant="contained" color="primary">
            新規作成
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="商品区分のテーブル">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>商品名</TableCell>
              <TableCell>ストア名</TableCell>
              <TableCell>食材名</TableCell>
              <TableCell>銘柄</TableCell>
              <TableCell>量</TableCell>
              <TableCell>URL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {storeProductList.map((storeProduct) => (
              <TableRow key={storeProduct.id}>
                <TableCell>
                  <Link href={`/admin/store-products/${storeProduct.id}`} passHref>
                    {storeProduct.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <Typography noWrap sx={{ whiteSpace: 'pre-line', maxHeight: '3em', overflow: 'hidden' }}>
                    {storeProduct.name}
                  </Typography>
                </TableCell>
                <TableCell>{storeProduct.store?.name}</TableCell>
                <TableCell>{storeProduct.item?.name}</TableCell>
                <TableCell>{storeProduct.productCategory?.brand}</TableCell>
                <TableCell>{storeProduct.productCategory?.unit}</TableCell>
                <TableCell>
                  {storeProduct.url && (
                    <Tooltip title={storeProduct.url}>
                      <a href={storeProduct.url} target="_blank" rel="noopener noreferrer">
                        {shortenURL(storeProduct.url, 20)}
                      </a>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>新規店舗取扱商品</DialogTitle>
        <DialogContent>
          <DialogContentText>
            新しい店舗取扱商品の情報を入力してください。
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="商品名"
            type="text"
            fullWidth
            value={newStoreProduct.name}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="store-select-label">ストア</InputLabel>
            <Select
              labelId="store-select-label"
              name="storeId"
              value={newStoreProduct.storeId}
              onChange={handleSelectChange}
              label="ストア"
            >
              {stores && stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="item-select-label">食材</InputLabel>
            <Select
              labelId="item-select-label"
              name="itemId"
              value={newStoreProduct.itemId}
              onChange={handleSelectChange}
              label="食材"
            >
              {items && items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="product-category-select-label">銘柄</InputLabel>
            <Select
              labelId="product-category-select-label"
              name="productCategoryId"
              value={newStoreProduct.productCategoryId}
              onChange={handleSelectChange}
              label="銘柄"
            >
              {productCategories && productCategories.map((productCategory) => (
                <MenuItem key={productCategory.id} value={productCategory.id}>
                  {productCategory.brand}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="itemQuantity"
            label="量"
            type="number"
            fullWidth
            value={newStoreProduct.itemQuantity}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="url"
            label="URL"
            type="text"
            fullWidth
            value={newStoreProduct.url}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="imageUrl"
            label="画像URL"
            type="text"
            fullWidth
            value={newStoreProduct.imageUrl}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            キャンセル
          </Button>
          <Button onClick={handleSubmit} color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ProductCategoryPage;
