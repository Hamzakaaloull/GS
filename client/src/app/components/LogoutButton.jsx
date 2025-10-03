// src/app/components/LogoutButton.jsx
"use client";

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function LogoutButton({ onLogout }) {
  const doLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  return (
    <Tooltip title="Se déconnecter">
      <IconButton onClick={doLogout} size="small" color="inherit" aria-label="logout">
        <LogoutIcon />
      </IconButton>
    </Tooltip>
  );
}
