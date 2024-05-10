import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { PrismaClient, Recipe as BaseRecipe, User } from '@prisma/client';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import RecipeModal from '../../components/RecipeModal';

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

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const handleSubmit = async (recipeData: { title: string; description: string, steps: string }) => {
    const response = await fetch('/api/recipes/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipeData),
    });

    if (response.ok) {
      const newRecipe = await response.json();
      setRecipes([...recipes, newRecipe]);
      handleClose();
    } else {
      console.error('Something went wrong');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>レシピ一覧</Typography>
      <Button onClick={handleOpen} variant="contained" color="primary" sx={{ mb: 2 }}>
        新規作成
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="レシピのテーブル">
          <TableHead>
            <TableRow>
              <TableCell>タイトル</TableCell>
              <TableCell align="right">説明</TableCell>
              <TableCell align="right">作成者</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell component="th" scope="recipe">{recipe.title}</TableCell>
                <TableCell align="right">{recipe.description}</TableCell>
                <TableCell align="right">{recipe.user.username}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RecipeModal open={modalOpen} handleClose={handleClose} handleSubmit={handleSubmit} />
    </div>
  );
};

export default RecipesPage;
