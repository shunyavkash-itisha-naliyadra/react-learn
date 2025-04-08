import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";

const AlertMessage = ({ message, type, onClose }) => {
  const [open, setOpen] = useState(true);

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
    if (onClose) onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity={type} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertMessage;
