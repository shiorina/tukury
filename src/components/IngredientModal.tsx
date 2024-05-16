import { useState, useEffect } from 'react';
import { Button, Modal, Box, Typography, TextField } from '@mui/material';
import { Ingredient } from '@prisma/client';

interface IngredientModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (ingredientData: { name: string; description?: string }, id?: number) => void;
  ingredient: Ingredient | null; 
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

const IngredientModal = ({ open, handleClose, handleSubmit, ingredient }: IngredientModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setDescription(ingredient.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [ingredient]);

  const submitAndClose = () => {
    handleSubmit({ name, description }, ingredient?.id);
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
          {ingredient ? "材料を編集" : "新しい材料を作成"}
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
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={submitAndClose} variant="contained" sx={{ mt: 2 }}>
          保存
        </Button>
      </Box>
    </Modal>
  );
};

export default IngredientModal;
