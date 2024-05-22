// src/pages/admin/stores/index.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, Store } from '@prisma/client';
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
} from '@mui/material';
import CustomModal from '@/components/CustomModal';
import Layout from '@/components/Layout';
import { toast } from 'react-toastify';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  const stores: Store[] = await prisma.store.findMany();
  return { props: { stores } };
};

interface StoresPageProps {
  stores: Store[];
}

const StoresPage = ({ stores: initialStores }: StoresPageProps) => {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<number | null>(null);
  const [name, setName] = useState<string>('');
  const [url, setUrl] = useState<string>('');

  const fetchStores = async () => {
    const response = await fetch('/api/private/admin/stores');
    if (response.ok) {
      const data = await response.json();
      setStores(data);
    } else {
      toast.error('Failed to fetch stores');
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleOpen = (currentStore?: Store) => {
    // 編集時にはcurrentStoreの値をセットする
    if (currentStore) {
      setCurrentStore(currentStore);
      setName(currentStore.name);
      setUrl(currentStore.url || '');
    } else {
      setCurrentStore(null);
      setName('');
      setUrl('');
    }

    // モーダルを開く
    setModalOpen(true);
  };

  const handleClose = () => {
    // モーダルを閉じる
    setModalOpen(false);

    // モーダル内の値をリセット
    setCurrentStore(null);
    setName('');
    setUrl('');
  };

  const postStore = async (storeData: { name: string; url: string }) => {
    try {
      const response = await axios.post('/api/private/admin/stores', storeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success("新しいストアが登録されました");
        return response.data;
      } else {
        toast.error("ストアの登録に失敗しました");
        return null;
      }
    } catch (error) {
      console.error('Error during POST request:', error);
      toast.error("ストアの登録に失敗しました");
      return null;
    }
  };

  const updateStore = async (id: number, storeData: { name: string; url: string }) => {
    try {
      const response = await axios.put(`/api/private/admin/stores/${id}`, storeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success("ストアが更新されました");
        return response.data;
      } else {
        toast.error("ストアの更新に失敗しました");
        return null;
      }
    } catch (error) {
      console.error('Error during PUT request:', error);
      toast.error("ストアの更新に失敗しました");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (currentStore) {
      await updateStore(currentStore.id, { name, url });
    } else {
      await postStore({ name, url });
    }

    fetchStores();
    handleClose();
  };

  const handleDeleteConfirmation = (id: number) => {
    setStoreToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (storeToDelete == null) return;

    const response = await fetch(`/api/private/admin/stores/${storeToDelete}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchStores();
      setDeleteConfirmOpen(false);
      setStoreToDelete(null);
      toast.success("ストアを削除しました");
    } else {
      console.error('Failed to delete the store');
      toast.error("ストアの削除に失敗しました");
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setStoreToDelete(null);
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom>ストア一覧</Typography>
      <Button onClick={() => handleOpen()} variant="contained" color="primary" sx={{ mb: 2 }}>
        新規作成
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="ストアのテーブル">
          <TableHead>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.url}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(store)} color="primary">編集</Button>
                  <Button onClick={() => handleDeleteConfirmation(store.id)} color="secondary">削除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CustomModal
        open={modalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {currentStore ? "ストアを編集" : "新しいストアを作成"}
          </Typography>
          <TextField
            margin="normal"
            fullWidth
            label="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2 }}>
            保存
          </Button>
        </>
      </CustomModal>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"このストアを削除しますか？"}</DialogTitle>
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
      </Dialog>
    </Layout>
  );
};

export default StoresPage;
