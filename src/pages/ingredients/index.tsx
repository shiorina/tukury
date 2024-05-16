import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, Ingredient } from '@prisma/client';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import IngredientModal from '@/components/IngredientModal';
import { toast } from 'react-toastify';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  const ingredients: Ingredient[] = await prisma.ingredient.findMany({});
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

  const fetchIngredients = async () => {
    const response = await fetch('/api/ingredients');
    if (response.ok) {
      const data = await response.json();
      setIngredients(data);
    } else {
      toast.error('材料の取得に失敗しました');
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleOpen = (ingredient?: Ingredient) => {
    setCurrentIngredient(ingredient || null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setCurrentIngredient(null);
  };

  const handleSubmit = async (ingredientData: { name: string; description?: string }, id?: number) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/ingredients/${id}` : '/api/ingredients';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ingredientData),
    });

    if (response.ok) {
      fetchIngredients();
      handleClose();
      toast.success(id ? "材料が更新されました" : "新しい材料が登録されました");
    } else {
      toast.error(id ? "材料の更新に失敗しました" : "材料の登録に失敗しました");
    }
  };

  const handleDeleteConfirmation = (id: number) => {
    setIngredientToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (ingredientToDelete == null) return;
  
    const response = await fetch(`/api/ingredients/${ingredientToDelete}`, {
      method: 'DELETE'
    });
  
    if (response.ok) {
      fetchIngredients();
      setDeleteConfirmOpen(false);
      setIngredientToDelete(null);
      toast.success("材料を削除しました");
    } else {
      console.error('Failed to delete the ingredient');
      toast.error("材料の削除に失敗しました");
    }
  };
  

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setIngredientToDelete(null);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>材料一覧</Typography>
      <Button onClick={() => handleOpen()} variant="contained" color="primary" sx={{ mb: 2 }}>
        新規登録
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>説明</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell>{ingredient.name}</TableCell>
                <TableCell>{ingredient.description}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(ingredient)} color="primary">編集</Button>
                  <Button onClick={() => handleDeleteConfirmation(ingredient.id)} color="secondary">削除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <IngredientModal open={modalOpen} handleClose={handleClose} handleSubmit={handleSubmit} ingredient={currentIngredient} />
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"この材料を削除しますか？"}</DialogTitle>
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

export default IngredientsPage;
