import { useState, useEffect } from 'react';
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
} from '@mui/material';
import CustomModal from '@/components/CustomModal';
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



  console.log(storeProducts);
  return { props: { storeProducts } };
};

interface Props {
  storeProducts: StoreProductWithRelation[];
}

const ProductCategoryPage = (props: Props) => {
  const [storeProducts, setStoreProducts] = useState<StoreProductWithRelation[]>(props.storeProducts);
  const [modalOpen, setModalOpen] = useState(false);
  // const [currentProductCategory, setCurrentProductCategory] = useState<ProductCategory | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productCategoryToDelete, setProductCategoryToDelete] = useState<number | null>(null);
  const [item_id, setItemId] = useState<number>(0);
  const [brand, setBrand] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const router = useRouter();

  // const fetchProductCategories = async () => {
  //   const response = await fetch('/api/private/admin/product-categories');
  //   if (response.ok) {
  //     const data = await response.json();
  //     setProductCategories(data);
  //   } else {
  //     toast.error('Failed to fetch product categories');
  //   }
  // };

  // useEffect(() => {
  //   fetchProductCategories();
  // }, []);

  // const handleOpen = (currentProductCategory?: ProductCategory) => {
  //   if (currentProductCategory) {
  //     setCurrentProductCategory(currentProductCategory);
  //     setItemId(currentProductCategory.item_id);
  //     setBrand(currentProductCategory.brand);
  //     setUnit(currentProductCategory.unit);
  //   } else {
  //     setCurrentProductCategory(null);
  //     setItemId(0);
  //     setBrand('');
  //     setUnit('');
  //   }

  //   setModalOpen(true);
  // };

  // const handleClose = () => {
  //   setModalOpen(false);
  //   setCurrentProductCategory(null);
  //   setItemId(0);
  //   setBrand('');
  //   setUnit('');
  // };

  const postProductCategory = async (productCategoryData: { item_id: number; brand: string; unit: string }) => {
    try {
      const response = await axios.post('/api/private/admin/product-categories', productCategoryData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        toast.success("新しい商品区分が登録されました");
        return response.data;
      } else {
        toast.error("商品区分の登録に失敗しました");
        return null;
      }
    } catch (error) {
      console.error('Error during POST request:', error);
      toast.error("商品区分の登録に失敗しました");
      return null;
    }
  };

  const updateProductCategory = async (id: number, productCategoryData: { item_id: number; brand: string; unit: string }) => {
    try {
      const response = await axios.put(`/api/private/admin/product-categories/${id}`, productCategoryData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success("商品区分が更新されました");
        return response.data;
      } else {
        toast.error("商品区分の更新に失敗しました");
        return null;
      }
    } catch (error: unknown) {
      console.error('Error during PUT request:', error);
      toast.error("商品区分の更新に失敗しました");
      return null;
    }
  };

  // const handleSubmit = async () => {
  //   if (currentProductCategory) {
  //     await updateProductCategory(currentProductCategory.id, { item_id, brand, unit });
  //   } else {
  //     await postProductCategory({ item_id, brand, unit });
  //   }

  //   fetchProductCategories();
  //   handleClose();
  // };

  // const handleDeleteConfirmation = (id: number) => {
  //   setProductCategoryToDelete(id);
  //   setDeleteConfirmOpen(true);
  // };

  // const handleDelete = async () => {
  //   if (productCategoryToDelete == null) return;

  //   const response = await fetch(`/api/private/admin/product-categories/${productCategoryToDelete}`, {
  //     method: 'DELETE'
  //   });

  //   if (response.ok) {
  //     fetchProductCategories();
  //     setDeleteConfirmOpen(false);
  //     setProductCategoryToDelete(null);
  //     toast.success("商品区分を削除しました");
  //   } else {
  //     console.error('Failed to delete the product category');
  //     toast.error("商品区分の削除に失敗しました");
  //   }
  // };

  // const handleCancelDelete = () => {
  //   setDeleteConfirmOpen(false);
  //   setProductCategoryToDelete(null);
  // };

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
          
          {/* <Button onClick={() => handleOpen()} variant="contained" color="primary">
            新規作成
          </Button> */}
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="商品区分のテーブル">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>ストア名</TableCell>
              <TableCell>食材名</TableCell>
              <TableCell>銘柄</TableCell>
              <TableCell>量</TableCell>
              <TableCell>URL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {storeProducts.map((storeProduct) => (
              <TableRow key={storeProduct.id}>
                <TableCell>{storeProduct.id}</TableCell>
                <TableCell>{storeProduct.store.name}</TableCell>
                <TableCell>{storeProduct.item.name}</TableCell>
                <TableCell>{storeProduct.productCategory.brand}</TableCell>
                <TableCell>{storeProduct.productCategory.unit}</TableCell>
                <TableCell>{storeProduct.url}</TableCell>

                {/* <TableCell>
                  <Button onClick={() => handleOpen(productCategory)} color="primary">編集</Button>
                  <Button onClick={() => handleDeleteConfirmation(productCategory.id)} color="secondary">削除</Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* <CustomModal
        open={modalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {currentProductCategory ? "商品区分を編集" : "新しい商品区分を作成"}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="item-select-label">食材</InputLabel>
            <Select
              labelId="item-select-label"
              value={item_id}
              onChange={(e) => setItemId(e.target.value as number)}
              label="食材"
            >
              {items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="銘柄"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="量"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2 }}>
            保存
          </Button>
        </>
      </CustomModal> */}

      {/* <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"この商品区分を削除しますか？"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            この操作は元に戻せません。本当に削除しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog> */}
    </Layout>
  );
};

export default ProductCategoryPage;
