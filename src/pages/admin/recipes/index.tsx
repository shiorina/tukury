import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, Recipe } from '@prisma/client';
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
  const recipes: Recipe[] = await prisma.recipe.findMany();
  return { props: { recipes } };
};

interface RecipesPageProps {
  recipes: Recipe[];
}

const RecipesPage = ({ recipes: initialRecipes }: RecipesPageProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<number | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [steps, setSteps] = useState<string>('');

  const fetchRecipes = async () => {
    const response = await fetch('/api/private/admin/recipes');
    if (response.ok) {
      const data = await response.json();
      setRecipes(data);
    } else {
      toast.error('Failed to fetch recipes');
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleOpen = (currentRecipe?: Recipe) => {
    if (currentRecipe) {
      setCurrentRecipe(currentRecipe);
      setTitle(currentRecipe.title);
      setDescription(currentRecipe.description || '');
      setSteps(currentRecipe.steps);
    } else {
      setCurrentRecipe(null);
      setTitle('');
      setDescription('');
      setSteps('');
    }

    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setCurrentRecipe(null);
    setTitle('');
    setDescription('');
    setSteps('');
  };

  const postRecipe = async (recipeData: { title: string; description: string; steps: string }) => {
    try {
      const response = await axios.post('/api/private/admin/recipes', recipeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        toast.success("新しいレシピが登録されました");
        return response.data;
      } else {
        toast.error("レシピの登録に失敗しました");
        return null;
      }
    } catch (error) {
      console.error('Error during POST request:', error);
      toast.error("レシピの登録に失敗しました");
      return null;
    }
  };

  const updateRecipe = async (id: number, recipeData: { title: string; description: string; steps: string }) => {
    try {
      const response = await axios.put(`/api/private/admin/recipes/${id}`, recipeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success("レシピが更新されました");
        return response.data;
      } else {
        toast.error("レシピの更新に失敗しました");
        return null;
      }
    } catch (error) {
      console.error('Error during PUT request:', error);
      toast.error("レシピの更新に失敗しました");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (currentRecipe) {
      await updateRecipe(currentRecipe.id, { title, description, steps });
    } else {
      await postRecipe({ title, description, steps });
    }

    fetchRecipes();
    handleClose();
  };

  const handleDeleteConfirmation = (id: number) => {
    setRecipeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (recipeToDelete == null) return;

    const response = await fetch(`/api/private/admin/recipes/${recipeToDelete}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchRecipes();
      setDeleteConfirmOpen(false);
      setRecipeToDelete(null);
      toast.success("レシピを削除しました");
    } else {
      console.error('Failed to delete the recipe');
      toast.error("レシピの削除に失敗しました");
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setRecipeToDelete(null);
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">レシピ一覧</Typography>
        <Button onClick={() => handleOpen()} variant="contained" color="primary">
          新規作成
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="レシピのテーブル">
          <TableHead>
            <TableRow>
              <TableCell>タイトル</TableCell>
              <TableCell>説明</TableCell>
              <TableCell>工程</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>{recipe.title}</TableCell>
                <TableCell>{recipe.description}</TableCell>
                <TableCell>{recipe.steps}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(recipe)} color="primary">編集</Button>
                  <Button onClick={() => handleDeleteConfirmation(recipe.id)} color="secondary">削除</Button>
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
            {currentRecipe ? "レシピを編集" : "新しいレシピを作成"}
          </Typography>
          <TextField
            margin="normal"
            fullWidth
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            label="工程"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
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
        <DialogTitle id="alert-dialog-title">{"このレシピを削除しますか？"}</DialogTitle>
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

export default RecipesPage;
