import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, Recipe as BaseRecipe, User } from '@prisma/client';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import RecipeModal from '../../components/RecipeModal';
import { toast } from 'react-toastify';


const prisma = new PrismaClient();

interface Recipe extends BaseRecipe {
  user: User;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const recipes: Recipe[] = await prisma.recipe.findMany({
    include: {
      user: true
    }
  });
  return { props: { recipes } };
};

interface RecipesPageProps {
  recipes: Recipe[];
}

const RecipesPage = ({ recipes: initialRecipes }: RecipesPageProps) => {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<number | null>(null);

  const fetchRecipes = async () => {
    const response = await fetch('/api/recipes');
    if (response.ok) {
      const fetchedRecipes = await response.json();
      setRecipes(fetchedRecipes);
    } else {
      console.error('Failed to fetch recipes');
    }
  };

  const handleOpen = (recipe?: Recipe) => {
    setCurrentRecipe(recipe || null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setCurrentRecipe(null);
  };

  const handleSubmit = async (recipeData: { title: string; description: string, steps: string }, id?: number) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/recipes/${id}` : '/api/recipes';
  
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });
  
    if (response.ok) {
      fetchRecipes();
      handleClose();
      toast.success(id ? "レシピが更新されました" : "レシピが作成できました");
    } else {
      toast.error(id ? "レシピの更新に失敗しました" : "レシピの作成に失敗しました");
    }
  };

  const handleDeleteConfirmation = (id: number) => {
    setRecipeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (recipeToDelete == null) return;
  
    const response = await fetch(`/api/recipes/${recipeToDelete}`, {
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
    <div>
      <Typography variant="h4" gutterBottom>レシピ一覧</Typography>
      <Button onClick={() => handleOpen()} variant="contained" color="primary" sx={{ mb: 2 }}>
        新規作成
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="レシピのテーブル">
          <TableHead>
            <TableRow>
              <TableCell>タイトル</TableCell>
              <TableCell align="right">説明</TableCell>
              <TableCell align="right">作成者</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell component="th" scope="recipe">{recipe.title}</TableCell>
                <TableCell align="right">{recipe.description}</TableCell>
                <TableCell align="right">{recipe.user.username}</TableCell>
                <TableCell align="right">
                  <Button onClick={() => handleOpen(recipe)} color="primary">編集</Button>
                  <Button onClick={() => handleDeleteConfirmation(recipe.id)} color="secondary">削除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RecipeModal open={modalOpen} handleClose={handleClose} handleSubmit={handleSubmit} recipe={currentRecipe} />
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
    </div>
  );
};

export default RecipesPage;
