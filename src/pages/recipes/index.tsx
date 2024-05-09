import { GetServerSideProps } from 'next';
import { PrismaClient, Recipe as BaseRecipe, User } from '@prisma/client';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

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

const RecipesPage = ({ recipes }: RecipesPageProps) => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>レシピ一覧</Typography>
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
                <TableCell component="th" scope="recipe">
                  {recipe.title}
                </TableCell>
                <TableCell align="right">{recipe.description}</TableCell>
                <TableCell align="right">{recipe.user.username}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default RecipesPage;