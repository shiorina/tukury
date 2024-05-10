import { useState, useEffect } from 'react';
import { Button, Modal, Box, Typography, TextField } from '@mui/material';
import { Recipe } from '@prisma/client';

interface RecipeModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (recipeData: { title: string; description: string, steps: string }, id?: number) => void;
  recipe: Recipe | null; 
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const RecipeModal = ({ open, handleClose, handleSubmit, recipe }: RecipeModalProps) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [steps, setSteps] = useState<string>('');

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setDescription(recipe.description || '');
      setSteps(recipe.steps);
    } else {
      setTitle('');
      setDescription('');
      setSteps('');
    }
  }, [recipe]);

  const submitAndClose = () => {
    if (recipe) {
      handleSubmit({ title, description, steps }, recipe.id);
    } else {
      handleSubmit({ title, description, steps });
    }
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {recipe ? "レシピを編集" : "新しいレシピを作成"}
        </Typography>
        <TextField
          margin="normal"
          fullWidth
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}/>
        <TextField
          margin="normal"
          fullWidth
          label="説明"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)} />
        <TextField
          margin="normal"
          fullWidth
          label="工程"
          multiline
          rows={4}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}/>
        <Button onClick={submitAndClose} variant="contained" sx={{ mt: 2 }}>
          保存
        </Button>
      </Box>
    </Modal>
  );
};

export default RecipeModal;
