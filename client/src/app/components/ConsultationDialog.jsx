// src/app/components/ConsultationDialog.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Typography,
} from "@mui/material";
import { fetchStagiaires, uploadFile } from "../../lib/api";

export default function ConsultationDialog({ open, onClose, onSubmit, initial = null }) {
  const [stagiaires, setStagiaires] = useState([]);
  const [loadingStags, setLoadingStags] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileObj, setFileObj] = useState(null); // chosen File
  const [form, setForm] = useState({ date: "", note: "", stagiaire: "", existingFileUrl: "" });

  useEffect(() => {
    if (!open) return;
    setLoadingStags(true);
    fetchStagiaires()
      .then((list) => {
        const normalized = list.map((it) => {
          const attrs = it.attributes || it;
          return { id: it.id || attrs.documentId || attrs.id, first_name: attrs.first_name, last_name: attrs.last_name, mle: attrs.mle };
        });
        setStagiaires(normalized);
      })
      .catch(() => setStagiaires([]))
      .finally(() => setLoadingStags(false));
  }, [open]);

  useEffect(() => {
    if (initial) {
      setForm({
        date: initial.date ? initial.date.split?.("T")[0] || initial.date : "",
        note: initial.note || "",
        stagiaire: initial.stagiaire || initial.stagiaire?.data?.documentId || initial.stagiaire?.documentId || (initial.stagiaire?.data?.id || initial.stagiaire?.id) || "",
        existingFileUrl: (initial.file && (initial.file.data?.attributes?.url || initial.file.url)) || initial.file || "",
      });
    } else {
      setForm({ date: "", note: "", stagiaire: "", existingFileUrl: "" });
      setFileObj(null);
    }
  }, [initial, open]);

  const handleChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFileObj(f);
  };

  const submit = async () => {
    try {
      let uploadedFileDocId = undefined;
      if (fileObj) {
        setUploading(true);
        const uploaded = await uploadFile(fileObj);
        // try to get documentId or id
        uploadedFileDocId = uploaded?.documentId || uploaded?.id || (uploaded?.attributes?.documentId) || null;
        setUploading(false);
      }

      // prepare payload: stagiaire should be documentId or id depending on your Strapi schema
      const payload = {
        date: form.date,
        note: form.note,
        stagiaire: form.stagiaire,
      };
      if (uploadedFileDocId) payload.fileDocumentId = uploadedFileDocId;

      // if no file uploaded but existingFile present in initial, we keep it by not touching 'file'
      onSubmit(payload);
    } catch (e) {
      setUploading(false);
      console.error(e);
      throw e;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" TransitionProps={{ timeout: 220 }}>
      <DialogTitle>{initial ? "Modifier la consultation" : "Créer une consultation"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Date" type="date" value={form.date} onChange={handleChange("date")} InputLabelProps={{ shrink: true }} fullWidth />
          <FormControl fullWidth>
            <InputLabel id="stagiaire-label">Stagiaire</InputLabel>
            <Select labelId="stagiaire-label" value={form.stagiaire} label="Stagiaire" onChange={handleChange("stagiaire")}>
              <MenuItem value="">-- Choisir --</MenuItem>
              {stagiaires.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} — {s.mle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="Note" value={form.note} onChange={handleChange("note")} multiline rows={4} fullWidth />

          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Fichier (optionnel)</Typography>
            <input type="file" onChange={handleFileChange} />
            {form.existingFileUrl && !fileObj && (
              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                Fichier actuel: <a href={form.existingFileUrl} target="_blank" rel="noreferrer">Ouvrir</a>
              </Typography>
            )}
            {uploading && <LinearProgress sx={{ mt: 1 }} />}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={submit} color="success" disabled={uploading}>
          {initial ? "Enregistrer" : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
