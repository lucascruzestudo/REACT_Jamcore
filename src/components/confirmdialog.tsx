import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'confirmação',
  description = 'tem certeza?',
  confirmText = 'excluir',
  cancelText = 'cancelar',
  onConfirm,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="confirm-dialog-title">
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#555' }}>{description}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>{cancelText}</Button>
        <Button onClick={onConfirm} color="error" variant="contained" sx={{ textTransform: 'none' }}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
