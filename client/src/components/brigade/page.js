// app/brigades/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Users, BookOpen, Calendar } from "lucide-react";
import BrigadeTable from "./components/BrigadeTable";
import BrigadeForm from "./components/BrigadeForm";
import BrigadeDetailDialog from "./components/BrigadeDetailDialog";
import BrigadeDialogs from "./components/BrigadeDialogs";

export default function BrigadesPage() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [brigades, setBrigades] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [stages, setStages] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBrigade, setSelectedBrigade] = useState(null);
  const [editingBrigade, setEditingBrigade] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    effectif: "",
    specialite: null,
    stagiaires: [],
    stage: null
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

  useEffect(() => {
    fetchBrigades();
    fetchStagiaires();
    fetchSpecialites();
    fetchStages();
  }, []);

  async function fetchBrigades() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/brigades?populate=stagiaires&populate=specialite&populate=stage`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setBrigades(data.data || []);
    } catch (error) {
      console.error("Error fetching brigades:", error);
      showSnackbar("Erreur lors du chargement des brigades", "error");
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
      setStagiaires(data.data || []);
    } catch (error) {
      console.error("Error fetching stagiaires:", error);
    }
  }

  async function fetchSpecialites() {
    try {
      const res = await fetch(
        `${API_URL}/api/specialites`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setSpecialites(data.data || []);
    } catch (error) {
      console.error("Error fetching specialites:", error);
    }
  }

  async function fetchStages() {
    try {
      const res = await fetch(
        `${API_URL}/api/stages`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setStages(data.data || []);
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  }

  function handleOpen(brigade = null) {
    if (brigade) {
      setEditingBrigade(brigade.documentId);
      
      setFormData({
        nom: brigade.nom || "",
        effectif: brigade.effectif?.toString() || "",
        specialite: brigade.specialite?.documentId || null,
        stagiaires: brigade.stagiaires?.map(s => s.documentId) || [],
        stage: brigade.stage?.documentId || null
      });
    } else {
      setEditingBrigade(null);
      setFormData({
        nom: "",
        effectif: "",
        specialite: null,
        stagiaires: [],
        stage: null
      });
    }
    setOpen(true);
  }

  function handleShowDetail(brigade) {
    setSelectedBrigade(brigade);
    setDetailOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      const url = editingBrigade
        ? `${API_URL}/api/brigades/${editingBrigade}`
        : `${API_URL}/api/brigades`;
      
      const method = editingBrigade ? "PUT" : "POST";
      
      const requestData = {
        data: {
          nom: formData.nom,
          effectif: formData.effectif ? parseInt(formData.effectif) : null,
          specialite: formData.specialite ? { connect: [formData.specialite] } : { disconnect: [] },
          stagiaires: {
            connect: formData.stagiaires
          },
          stage: formData.stage ? { connect: [formData.stage] } : { disconnect: [] }
        }
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error?.message || "Erreur lors de l'opération");
      }

      await fetchBrigades();
      setOpen(false);
      showSnackbar(
        editingBrigade ? "Brigade modifiée avec succès" : "Brigade créée avec succès", 
        "success"
      );
    } catch (err) {
      console.error("Error submitting form:", err);
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function confirmDelete(brigade) {
    setSelectedBrigade(brigade);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedBrigade) return;
    
    setLoading((p) => ({ ...p, delete: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/brigades/${selectedBrigade.documentId}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );

      if (res.status === 204) {
        await fetchBrigades();
        showSnackbar("Brigade supprimée avec succès", "success");
      } else if (!res.ok) {
        throw new Error(`Erreur lors de la suppression: ${res.status}`);
      }
    } catch (error) {
      console.error("Error deleting brigade:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setSelectedBrigade(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  // Filter brigades based on search
  const filteredBrigades = brigades.filter((brigade) => {
    const matchesSearch = 
      (brigade.nom?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Brigades</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les brigades et leurs informations
          </p>
        </div>
        <button 
          onClick={() => handleOpen()} 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Brigade
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search by Name */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom de brigade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Brigades Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Liste des Brigades</h2>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredBrigades.length} / {brigades.length}
            </span>
          </div>
        </div>
        <div className="p-0">
          <BrigadeTable
            brigades={filteredBrigades}
            loading={loading.global}
            handleEdit={handleOpen}
            handleDelete={confirmDelete}
            handleShowDetail={handleShowDetail}
            loadingDelete={loading.delete}
            selectedBrigade={selectedBrigade}
          />
        </div>
      </div>

      {/* Brigade Form Dialog */}
      <BrigadeForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingBrigade={editingBrigade}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        stagiaires={stagiaires}
        specialites={specialites}
        stages={stages}
      />

      {/* Brigade Detail Dialog */}
      <BrigadeDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        brigade={selectedBrigade}
      />

      {/* Confirmation Dialogs and Snackbar */}
      <BrigadeDialogs
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