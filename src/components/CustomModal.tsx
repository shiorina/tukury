import React from 'react';
import { Modal, Box, ModalProps } from '@mui/material';

const modalStyle = {
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

interface CustomModalProps extends Omit<ModalProps, 'children'> {
  children: React.ReactElement;
}

const CustomModal: React.FC<CustomModalProps> = ({ children, ...props }) => {
  return (
    <Modal {...props}>
      <Box sx={modalStyle}>
        {children}
      </Box>
    </Modal>
  );
};

export default CustomModal;
