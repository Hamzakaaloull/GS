// src/app/components/NotificationSnackbar.jsx
"use client";

import React from "react";
import { Snackbar, Alert } from "@mui/material";

export default function NotificationSnackbar({ open, onClose, severity = "success", message = "" }) {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
