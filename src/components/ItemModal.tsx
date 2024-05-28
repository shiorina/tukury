import { useState, useEffect } from 'react';
import { Button, Modal, Box, Typography, TextField } from '@mui/material';
import { Item } from '@prisma/client';

interface ItemModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (itemData: { name: string; description?: string; label: string }, id?: number) => void;
  item: Item | null; 
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

const ItemModal = ({ open, handleClose, handleSubmit, item }: ItemModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || '');
      setLabel(item.label);
    } else {
      setName('');
      setDescription('');
      setLabel('');
    }
  }, [item]);

  const submitAndClose = () => {
    handleSubmit({ name, description, label }, item?.id);
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
          {item ? "食材を編集" : "新しい食材を作成"}
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
        <TextField
          margin="normal"
          fullWidth
          label="表示名"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Button onClick={submitAndClose} variant="contained" sx={{ mt: 2 }}>
          保存
        </Button>
      </Box>
    </Modal>
  );
};

export default ItemModal;
