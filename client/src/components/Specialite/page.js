// app/specialites/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, BookOpen, Users, MapPin, Calendar } from "lucide-react";
import SpecialiteTable from "./components/SpecialiteTable";
import SpecialiteForm from "./components/SpecialiteForm";
import SpecialiteDetailDialog from "./components/SpecialiteDetailDialog";
import SpecialiteDialogs from "./components/SpecialiteDialogs";

export default function SpecialitesPage() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [specialites, setSpecialites] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [brigades, setBrigades] = useState([]);
  const [stages, setStages] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSpecialite, setSelectedSpecialite] = useState(null);
  const [editingSpecialite, setEditingSpecialite] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stagiaires: [],
    brigades: [],
    stages: []
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
    fetchSpecialites();
    fetchStagiaires();
    fetchBrigades();
    fetchStages();
  }, []);

  async function fetchSpecialites() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/specialites?populate=stagiaires&populate=brigades&populate=stages`,
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
      showSnackbar("Erreur lors du chargement des spécialités", "error");
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

  async function fetchBrigades() {
    try {
      const res = await fetch(
        `${API_URL}/api/brigades`,
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

  function handleOpen(specialite = null) {
    if (specialite) {
      setEditingSpecialite(specialite.documentId);
      
      setFormData({
        name: specialite.name || "",
        description: specialite.description || "",
        stagiaires: specialite.stagiaires?.map(s => s.documentId) || [],
        brigades: specialite.brigades?.map(b => b.documentId) || [],
        stages: specialite.stages?.map(st => st.documentId) || []
      });
    } else {
      setEditingSpecialite(null);
      setFormData({
        name: "",
        description: "",
        stagiaires: [],
        brigades: [],
        stages: []
      });
    }
    setOpen(true);
  }

  function handleShowDetail(specialite) {
    setSelectedSpecialite(specialite);
    setDetailOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      const url = editingSpecialite
        ? `${API_URL}/api/specialites/${editingSpecialite}`
        : `${API_URL}/api/specialites`;
      
      const method = editingSpecialite ? "PUT" : "POST";
      
      const requestData = {
        data: {
          name: formData.name,
          description: formData.description || null,
          stagiaires: {
            connect: formData.stagiaires
          },
          brigades: {
            connect: formData.brigades
          },
          stages: {
            connect: formData.stages
          }
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

      await fetchSpecialites();
      setOpen(false);
      showSnackbar(
        editingSpecialite ? "Spécialité modifiée avec succès" : "Spécialité créée avec succès", 
        "success"
      );
    } catch (err) {
      console.error("Error submitting form:", err);
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function confirmDelete(specialite) {
    setSelectedSpecialite(specialite);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedSpecialite) return;
    
    setLoading((p) => ({ ...p, delete: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/specialites/${selectedSpecialite.documentId}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );

      if (res.status === 204) {
        await fetchSpecialites();
        showSnackbar("Spécialité supprimée avec succès", "success");
      } else if (!res.ok) {
        throw new Error(`Erreur lors de la suppression: ${res.status}`);
      }
    } catch (error) {
      console.error("Error deleting specialite:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setSelectedSpecialite(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  // Filter specialites based on search
  const filteredSpecialites = specialites.filter((specialite) => {
    const matchesSearch = 
      (specialite.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (specialite.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Spécialités</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les spécialités et leurs informations
          </p>
        </div>
        <button 
          onClick={() => handleOpen()} 
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Spécialité
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
              placeholder="Rechercher par nom ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Specialites Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Liste des Spécialités</h2>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredSpecialites.length} / {specialites.length}
            </span>
          </div>
        </div>
        <div className="p-0">
          <SpecialiteTable
            specialites={filteredSpecialites}
            loading={loading.global}
            handleEdit={handleOpen}
            handleDelete={confirmDelete}
            handleShowDetail={handleShowDetail}
            loadingDelete={loading.delete}
            selectedSpecialite={selectedSpecialite}
          />
        </div>
      </div>

      {/* Specialite Form Dialog */}
      <SpecialiteForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingSpecialite={editingSpecialite}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        stagiaires={stagiaires}
        brigades={brigades}
        stages={stages}
      />

      {/* Specialite Detail Dialog */}
      <SpecialiteDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        specialite={selectedSpecialite}
      />

      {/* Confirmation Dialogs and Snackbar */}
      <SpecialiteDialogs
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