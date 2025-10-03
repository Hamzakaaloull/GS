// src/app/components/ConsultationTable.jsx
"use client";

import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Slide,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { deleteConsultation } from "../../lib/api";

const Transition = (props) => <Slide direction="up" {...props} />;

export default function ConsultationTable({ data = [], onRefresh = () => {}, onEdit = () => {}, showAlert = () => {} }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openMenu = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelected(row);
  };
  const closeMenu = () => {
    setAnchorEl(null);
    setSelected(null);
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      // selected should contain documentId or id; prefer documentId if available
      const documentId = selected?.documentId || selected?.id || selected?.attributes?.documentId || selected?.attributes?.id;
      await deleteConsultation(documentId);
      setConfirmOpen(false);
      closeMenu();
      showAlert({ severity: "success", message: "Suppression effectuée" });
      onRefresh();
    } catch (e) {
      console.error(e);
      showAlert({ severity: "error", message: "Erreur lors de la suppression" });
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "linear-gradient(90deg,#f3f5ff,#ffffff)" }}>
              <TableCell sx={{ minWidth: 140 }}>Date</TableCell>
              <TableCell>Prénom / Nom</TableCell>
              <TableCell>Mle</TableCell>
              <TableCell sx={{ maxWidth: 420 }}>Note</TableCell>
              <TableCell>Fichier</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => {
              const attrs = row.attributes || row;
              const date = attrs.date ? (attrs.date.split ? attrs.date.split("T")[0] : attrs.date) : "-";
              const stag = attrs.stagiaire?.data?.attributes || attrs.stagiaire?.attributes || attrs.stagiaire || {};
              const first = stag.first_name || stag.firstname || "";
              const last = stag.last_name || stag.lastname || "";
              const mle = stag.mle || "";
              const note = attrs.note || "-";
              const fileUrl = attrs.file?.data?.attributes?.url || attrs.file?.url || attrs.file || null;

              return (
                <TableRow key={row.id || attrs.documentId || attrs.id}>
                  <TableCell>{date}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{first} {last}</Typography>
                  </TableCell>
                  <TableCell>{mle}</TableCell>
                  <TableCell sx={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {note}
                  </TableCell>
                  <TableCell>
                    {fileUrl ? <Button size="small" href={fileUrl} target="_blank">Ouvrir</Button> : <Typography variant="caption" color="text.secondary">Aucun</Typography>}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => openMenu(e, row)}><MoreVertIcon /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={() => { if (onEdit && selected) onEdit(selected); closeMenu(); }}>Modifier</MenuItem>
        <MenuItem onClick={() => { setConfirmOpen(true); closeMenu(); }}>Supprimer</MenuItem>
      </Menu>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} TransitionComponent={Transition}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Voulez-vous supprimer cette consultation ? Cette action est irréversible.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
