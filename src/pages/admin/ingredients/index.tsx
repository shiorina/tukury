import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, Ingredient } from '@prisma/client';
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
  const ingredients: Ingredient[] = await prisma.ingredient.findMany();
  return { props: { ingredients } };
};

interface IngredientsPageProps {
  ingredients: Ingredient[];
}

const IngredientsPage = ({ ingredients: initialIngredients }: IngredientsPageProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<number | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [label, setLabel] = useState<string>('');

  const fetchIngredients = async () => {
    const response = await fetch('/api/private/admin/ingredients');
    if (response.ok) {
      const data = await response.json();
      setIngredients(data);
    } else {
      toast.error('Failed to fetch ingredients');
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleOpen = (currentIngredient?: Ingredient) => {
    if (currentIngredient) {
      setCurrentIngredient(currentIngredient);
      setName(currentIngredient.name);
      setDescription(currentIngredient.description || '');
      setLabel(currentIngredient.label);
    } else {
      setCurrentIngredient(null);
      setName('');
      setDescription('');
      setLabel('');
    }

    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setCurrentIngredient(null);
    setName('');
    setDescription('');
    setLabel('');
  };

  const postIngredient = async (ingredientData: { name: string; description: string; label: string }) => {
    try {
      const response = await axios.post('/api/private/admin/ingredients', ingredientData, {
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
  

  const updateIngredient = async (id: number, ingredientData: { name: string; description: string; label: string }) => {
    try {
      const response = await axios.put(`/api/private/admin/ingredients/${id}`, ingredientData, {
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
    if (currentIngredient) {
      await updateIngredient(currentIngredient.id, { name, description, label });
    } else {
      await postIngredient({ name, description, label });
    }

    fetchIngredients();
    handleClose();
  };

  const handleDeleteConfirmation = (id: number) => {
    setIngredientToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (ingredientToDelete == null) return;

    const response = await fetch(`/api/private/admin/ingredients/${ingredientToDelete}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchIngredients();
      setDeleteConfirmOpen(false);
      setIngredientToDelete(null);
      toast.success("食材を削除しました");
    } else {
      console.error('Failed to delete the ingredient');
      toast.error("食材の削除に失敗しました");
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setIngredientToDelete(null);
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
            {ingredients.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell>{ingredient.name}</TableCell>
                <TableCell>{ingredient.description}</TableCell>
                <TableCell>{ingredient.label}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(ingredient)} color="primary">編集</Button>
                  <Button onClick={() => handleDeleteConfirmation(ingredient.id)} color="secondary">削除</Button>
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
            {currentIngredient ? "食材を編集" : "新しい食材を作成"}
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

export default IngredientsPage;
