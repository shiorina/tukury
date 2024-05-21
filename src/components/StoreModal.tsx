import { useState, useEffect } from 'react';
import { Button, Modal, Box, Typography, TextField } from '@mui/material';
import { Store } from '@prisma/client';

interface StoreModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (storeData: { name: string; url?: string }, id?: number) => void;
  store: Store | null;
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

const StoreModal = ({ open, handleClose, handleSubmit, store }: StoreModalProps) => {
  const [name, setName] = useState<string>('');
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    if (store) {
      setName(store.name);
      setUrl(store.url || '');
    } else {
      setName('');
      setUrl('');
    }
  }, [store]);

  const submitAndClose = () => {
    if (store) {
      handleSubmit({ name, url }, store.id);
    } else {
      handleSubmit({ name, url });
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
          {store ? "ストアを編集" : "新しいストアを作成"}
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
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={submitAndClose} variant="contained" sx={{ mt: 2 }}>
          保存
        </Button>
      </Box>
    </Modal>
  );
};

export default StoreModal;
