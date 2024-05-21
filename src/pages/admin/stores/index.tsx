import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, Store } from '@prisma/client';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import StoreModal from '@/components/StoreModal';
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

  const handleOpen = (store?: Store) => {
    setCurrentStore(store || null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setTimeout(() => {
      setCurrentStore(null);
    }, 300);
  };

  const handleSubmit = async (storeData: { name: string; url?: string }, id?: number) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/private/admin/stores/${id}` : '/api/private/admin/stores';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storeData),
    });

    if (response.ok) {
      fetchStores();
      handleClose();
      toast.success(id ? "ストアが更新されました" : "新しいストアが登録されました");
    } else {
      toast.error(id ? "ストアの更新に失敗しました" : "ストアの登録に失敗しました");
    }
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
    <div>
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
      <StoreModal open={modalOpen} handleClose={handleClose} handleSubmit={handleSubmit} store={currentStore} />
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
    </div>
  );
};

export default StoresPage;
