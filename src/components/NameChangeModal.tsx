import { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

interface NameChangeModalProps {
  open: boolean;
  handleClose: () => void;
  currentName: string;
  onSave: (newName: string) => void;
}

const NameChangeModal = ({ open, handleClose, currentName, onSave }: NameChangeModalProps) => {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    setNewName(currentName);
  }, [currentName]);

  const handleSave = () => {
    onSave(newName);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>商品名の変更</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="新しい商品名"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          キャンセル
        </Button>
        <Button onClick={handleSave} color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NameChangeModal;
