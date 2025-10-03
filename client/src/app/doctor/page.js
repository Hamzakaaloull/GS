// src/app/doctor/page.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, TextField, Button, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import Sidebar from "../components/Sidebar";
import ConsultationTable from "../components/ConsultationTable";
import ConsultationDialog from "../components/ConsultationDialog";
import ProfileView from "../components/ProfileView";
import NotificationSnackbar from "../components/NotificationSnackbar";
import { fetchConsultations, createConsultation, updateConsultation } from "../../lib/api";

export default function DoctorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // notifications
  const [notif, setNotif] = useState({ open: false, message: "", severity: "success" });

  // mobile detect
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // load data
  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchConsultations();
      setConsultations(data || []);
    } catch (e) {
      console.error(e);
      setNotif({ open: true, message: "Erreur lors du chargement", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // search/filters robust: examine nested structures
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return consultations.filter((item) => {
      const attrs = item.attributes || item;
      if (dateFilter) {
        const d = attrs.date ? (attrs.date.split ? attrs.date.split("T")[0] : attrs.date) : "";
        if (d !== dateFilter) return false;
      }
      if (!q) return true;
      // try possible paths for stagiaire fields
      const stag = attrs.stagiaire?.data?.attributes || attrs.stagiaire?.attributes || attrs.stagiaire || {};
      const first = (stag.first_name || stag.firstname || "").toString().toLowerCase();
      const last = (stag.last_name || stag.lastname || "").toString().toLowerCase();
      const mle = (stag.mle || "").toString().toLowerCase();
      return first.includes(q) || last.includes(q) || mle.includes(q);
    });
  }, [consultations, search, dateFilter]);

  // handlers
  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (item) => {
    // prepare initial structure for dialog
    const attrs = item.attributes || item;
    const initial = {
      id: item.id || attrs.documentId || attrs.id,
      date: attrs.date,
      note: attrs.note,
      stagiaire: attrs.stagiaire?.data?.documentId || attrs.stagiaire?.documentId || attrs.stagiaire?.data?.id || attrs.stagiaire?.id || "",
      file: attrs.file?.data?.attributes?.url || attrs.file?.url || attrs.file || "",
      documentId: attrs.documentId || item.documentId || item.id || attrs.id,
    };
    setEditing(initial);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (payload) => {
    try {
      if (editing) {
        // update
        const docId = editing.documentId || editing.id;
        await updateConsultation(docId, {
          date: payload.date,
          note: payload.note,
          stagiaire: payload.stagiaire,
          fileDocumentId: payload.fileDocumentId, // if uploaded in dialog
        });
        setNotif({ open: true, message: "Consultation mise à jour", severity: "success" });
      } else {
        // create
        await createConsultation({
          date: payload.date,
          note: payload.note,
          stagiaire: payload.stagiaire,
          fileDocumentId: payload.fileDocumentId,
        });
        setNotif({ open: true, message: "Consultation créée", severity: "success" });
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      setNotif({ open: true, message: "Erreur lors de l'enregistrement", severity: "error" });
    }
  };

  const showAlert = ({ severity, message }) => setNotif({ open: true, severity, message });

  if (isMobile) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
        <Typography variant="h6">Application non disponible sur mobile. Merci d'utiliser un écran plus grand.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f8fafc" }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(s => !s)} user={{ name: "Dr. Hamza" }} onShowProfile={() => setShowProfile(s => !s)} />

      <Box component="main" sx={{ flex: 1, p: 3, overflow: "auto" }}>
        {showProfile ? (
          <ProfileView />
        ) : (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Consultations</Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  size="small"
                  placeholder="Rechercher prénom, nom ou mle"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                  sx={{ minWidth: 280 }}
                />
                <TextField size="small" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                <Button variant="contained" startIcon={<AddIcon />} color="success" onClick={openCreate}>Créer</Button>
              </Box>
            </Box>

            <ConsultationTable data={filtered} onRefresh={load} onEdit={openEdit} showAlert={showAlert} />
          </>
        )}
      </Box>

      <ConsultationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleDialogSubmit} initial={editing} />

      <NotificationSnackbar open={notif.open} onClose={() => setNotif(s => ({...s, open:false})) } severity={notif.severity} message={notif.message} />
    </Box>
  );
}
