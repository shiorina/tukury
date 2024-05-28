import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, Item } from '@prisma/client';
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
} from '@mui/material';
import CustomModal from '@/components/CustomModal';
import Layout from '@/components/Layout';
import { toast } from 'react-toastify';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  const items: Item[] = await prisma.item.findMany();
  return { props: { items } };
};

interface ItemsPageProps {
  items: Item[];
}

const ItemsPage = ({ items: initialItems }: ItemsPageProps) => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [label, setLabel] = useState<string>('');

  const fetchItems = async () => {
    const response = await fetch('/api/private/admin/items');
    if (response.ok) {
      const data = await response.json();
      setItems(data);
    } else {
      toast.error('Failed to fetch items');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpen = (currentItem?: Item) => {
    if (currentItem) {
      setCurrentItem(currentItem);
      setName(currentItem.name);
      setDescription(currentItem.description || '');
      setLabel(currentItem.label);
    } else {
      setCurrentItem(null);
      setName('');
      setDescription('');
      setLabel('');
    }

    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setCurrentItem(null);
    setName('');
    setDescription('');
    setLabel('');
  };

  const postItem = async (itemData: { name: string; description: string; label: string }) => {
    try {
      const response = await axios.post('/api/private/admin/items', itemData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        toast.success("新しい食材が登録されました");
        return response.data;
      } else {
        toast.error("食材の登録に失敗しました");
        return null;
      }
    } catch (error) {
      console.error('Error during POST request:', error);
      toast.error("食材の登録に失敗しました");
      return null;
    }
  };

  const updateItem = async (id: number, itemData: { name: string; description: string; label: string }) => {
    try {
      const response = await axios.put(`/api/private/admin/items/${id}`, itemData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success("食材が更新されました");
        return response.data;
      } else {
        toast.error("食材の更新に失敗しました");
        return null;
      }
    } catch (error: unknown) {
      console.error('Error during PUT request:', error);
      toast.error("食材の更新に失敗しました");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (currentItem) {
      await updateItem(currentItem.id, { name, description, label });
    } else {
      await postItem({ name, description, label });
    }

    fetchItems();
    handleClose();
  };

  const handleDeleteConfirmation = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete == null) return;

    const response = await fetch(`/api/private/admin/items/${itemToDelete}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchItems();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      toast.success("食材を削除しました");
    } else {
      console.error('Failed to delete the item');
      toast.error("食材の削除に失敗しました");
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h2">
          食材一覧
        </Typography>
        <Button onClick={() => handleOpen()} variant="contained" color="primary">
          新規作成
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="食材のテーブル">
          <TableHead>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>説明</TableCell>
              <TableCell>表示名</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.label}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(item)} color="primary">編集</Button>
                  <Button onClick={() => handleDeleteConfirmation(item.id)} color="secondary">削除</Button>
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
            {currentItem ? "食材を編集" : "新しい食材を作成"}
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
            label="説明"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="表示名"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
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
        <DialogTitle id="alert-dialog-title">{"この食材を削除しますか？"}</DialogTitle>
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

export default ItemsPage;
