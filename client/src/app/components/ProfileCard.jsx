// src/app/components/ProfileCard.jsx
"use client";

import React from "react";
import { Box, Avatar, Typography, Paper } from "@mui/material";
import LogoutButton from "./LogoutButton";

export default function ProfileCard({ name = "Dr. Hamza", avatar = "", onLogout }) {
  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.25,
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.92)",
      }}
    >
      <Avatar src={avatar} alt={name} sx={{ width: 48, height: 48 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          Docteur
        </Typography>
      </Box>

      <LogoutButton onLogout={onLogout} />
    </Paper>
  );
}
