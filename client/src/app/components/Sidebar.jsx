// src/app/components/Sidebar.jsx
"use client";

import React from "react";
import {
  Box,
  IconButton,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArticleIcon from "@mui/icons-material/Article";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ProfileCard from "./ProfileCard";
import LogoutButton from "./LogoutButton";

export default function Sidebar({ open = true, onToggle = () => {}, user = {}, onShowProfile = () => {} }) {
  const widthOpen = 280;
  const widthClosed = 72;

  return (
    <Box
      component="aside"
      sx={{
        height: "100vh",
        width: open ? widthOpen : widthClosed,
        transition: "width 260ms cubic-bezier(.2,.8,.2,1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
        // light gradient
        background: open
          ? "linear-gradient(180deg, rgba(245,248,255,1) 0%, rgba(235,241,255,1) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,250,255,1) 100%)",
        borderRight: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center", mb: 2 }}>
          {open ? (
            <Typography variant="h6" sx={{ color: "#6b21a8", fontWeight: 800 }}>
              uinkits
            </Typography>
          ) : (
            <Box />
          )}
          <IconButton onClick={onToggle} size="small" aria-label="toggle sidebar">
            <MenuIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List>
          <ListItemButton selected sx={{ borderRadius: 2, mb: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LocalHospitalIcon sx={{ color: "#6b21a8" }} />
            </ListItemIcon>
            {open && <ListItemText primary="Consultations" />}
          </ListItemButton>

          <ListItemButton sx={{ borderRadius: 2, mb: 1 }} onClick={onShowProfile}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PersonOutlineIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Profil" />}
          </ListItemButton>

          <ListItemButton sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ArticleIcon />
            </ListItemIcon>
            {open && <ListItemText primary="Rapports" />}
          </ListItemButton>
        </List>
      </div>

      <Box sx={{ mt: 2 }}>
        {open ? (
          <ProfileCard
            name={user.name || "Dr. Hamza"}
            avatar={user.avatar || ""}
            onLogout={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          />
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <LogoutButton onLogout={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
