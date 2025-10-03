// src/app/components/ProfileView.jsx
"use client";

import React, { useEffect, useState } from "react";
import { Paper, Box, Avatar, Typography, Divider } from "@mui/material";
import { fetchCurrentUser } from "../../lib/api";

export default function ProfileView() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((res) => {
        // Strapi may return object or { user: ... }
        const u = res?.user || res;
        setUser(u);
      })
      .catch(() => setUser(null));
  }, []);

  if (!user) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6">Profil</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Aucune information disponible.</Typography>
      </Paper>
    );
  }

  const name = user.username || `${user.firstName || user.first_name || ""} ${user.lastName || user.last_name || ""}`;

  return (
    <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <Avatar src={user.avatar?.url || ""} sx={{ width: 96, height: 96 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{name}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Rôle: {user.role?.name || user.role || "-"}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2">Informations</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        ID: {user.id || user.documentId}
      </Typography>
    </Paper>
  );
}
