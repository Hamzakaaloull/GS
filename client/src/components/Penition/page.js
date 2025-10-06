// app/punitions/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar } from "lucide-react";
import PunitionTable from "./components/PunitionTable";
import PunitionForm from "./components/PunitionForm";
import PunitionDetailDialog from "./components/PunitionDetailDialog";
import PunitionDialogs from "./components/PunitionDialogs";

export default function PunitionsPage() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [punitions, setPunitions] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPunition, setSelectedPunition] = useState(null);
  const [editingPunition, setEditingPunition] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    motif: "",
    description: "",
    stagiaires: [],
  });
  const [loading, setLoading] = useState({ 
    global: false, 
    delete: false, 
    submit: false 
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" 
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchPunitions();
    fetchStagiaires();
  }, []);

  async function fetchPunitions() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/punitions?populate=stagiaires`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      console.log("Punitions data:", data);
      setPunitions(data.data || []);
    } catch (error) {
      console.error("Error fetching punitions:", error);
      showSnackbar("Erreur lors du chargement des punitions", "error");
    } finally {
      setLoading((p) => ({ ...p, global: false }));
    }
  }

  async function fetchStagiaires() {
    try {
      const res = await fetch(
        `${API_URL}/api/stagiaires?populate=profile`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      console.log("Stagiaires data:", data);
      setStagiaires(data.data || []);
    } catch (error) {
      console.error("Error fetching stagiaires:", error);
      showSnackbar("Erreur lors du chargement des stagiaires", "error");
    }
  }

  function handleOpen(punition = null) {
    if (punition) {
      setEditingPunition(punition.documentId);
      
      const formattedDate = punition.date 
        ? new Date(punition.date).toISOString().split('T')[0]
        : "";
      
      setFormData({
        date: formattedDate,
        motif: punition.motif || "",
        description: punition.description || "",
        stagiaires: punition.stagiaires?.map(s => s.documentId) || [],
      });
    } else {
      setEditingPunition(null);
      setFormData({
        date: "",
        motif: "",
        description: "",
        stagiaires: [],
      });
    }
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      const url = editingPunition
        ? `${API_URL}/api/punitions/${editingPunition}`
        : `${API_URL}/api/punitions`;
      
      const method = editingPunition ? "PUT" : "POST";
      
      const requestData = {
        data: {
          date: formData.date,
          motif: formData.motif,
          description: formData.description,
          stagiaires: formData.stagiaires.length > 0 ? {
            connect: formData.stagiaires
          } : undefined
        }
      };

      // Clean up undefined values
      Object.keys(requestData.data).forEach(key => {
        if (requestData.data[key] === undefined) {
          delete requestData.data[key];
        }
      });

      console.log("Submitting data:", JSON.stringify(requestData, null, 2));

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await res.json();
      console.log("Response:", responseData);

      if (!res.ok) {
        const errorMessage = responseData.error?.message || 
                            responseData.error?.details?.errors?.map(err => err.message).join(', ') || 
                            "Erreur lors de l'opération";
        throw new Error(errorMessage);
      }

      await fetchPunitions();
      setOpen(false);
      showSnackbar(
        editingPunition ? "Punition modifiée avec succès" : "Punition créée avec succès", 
        "success"
      );
    } catch (err) {
      console.error("Error submitting form:", err);
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function handleShowDetail(punition) {
    setSelectedPunition(punition);
    setDetailOpen(true);
  }

  function confirmDelete(punition) {
    setSelectedPunition(punition);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedPunition) return;
    
    setLoading((p) => ({ ...p, delete: true }));
    try {
      console.log("Deleting punition with documentId:", selectedPunition.documentId);
      
      const res = await fetch(
        `${API_URL}/api/punitions/${selectedPunition.documentId}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );

      console.log("Delete response status:", res.status);

      if (res.status === 204) {
        await fetchPunitions();
        showSnackbar("Punition supprimée avec succès", "success");
      } else if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete error response:", errorText);
        throw new Error(`Erreur lors de la suppression: ${res.status}`);
      }
    } catch (error) {
      console.error("Error deleting punition:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setSelectedPunition(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  const filteredPunitions = punitions.filter((punition) => {
    const matchesSearch = 
      (punition.motif?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (punition.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || 
      punition.date?.startsWith(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Punitions</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les punitions des stagiaires
          </p>
        </div>
        <button 
          onClick={() => handleOpen()} 
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Punition
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par motif ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Punitions Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Liste des Punitions</h2>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredPunitions.length} / {punitions.length}
            </span>
          </div>
        </div>
        <div className="p-0">
          <PunitionTable
            punitions={filteredPunitions}
            loading={loading.global}
            API_URL={API_URL}
            handleEdit={handleOpen}
            handleDelete={confirmDelete}
            handleShowDetail={handleShowDetail}
            loadingDelete={loading.delete}
            selectedPunition={selectedPunition}
          />
        </div>
      </div>

      {/* Punition Form Dialog */}
      <PunitionForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingPunition={editingPunition}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        stagiaires={stagiaires}
      />

      {/* Punition Detail Dialog */}
      <PunitionDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        punition={selectedPunition}
        API_URL={API_URL}
      />

      {/* Confirmation Dialogs and Snackbar */}
      <PunitionDialogs
        openConfirm={openConfirm}
        onCloseConfirm={() => setOpenConfirm(false)}
        handleDeleteConfirmed={handleDeleteConfirmed}
        loadingDelete={loading.delete}
        snackbar={snackbar}
        onCloseSnackbar={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}