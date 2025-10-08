"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, PieChart } from "lucide-react";
import RemarqueTable from "./components/RemarqueTable";
import RemarqueForm from "./components/RemarqueForm";
import RemarqueDetailDialog from "./components/RemarqueDetailDialog";
import RemarqueDialogs from "./components/RemarqueDialogs";
import RemarqueStats from "./components/RemarqueStats";
import { formatDateForInput, adjustDateForFilter } from '@/hooks/dateUtils';

export default function RemarquesPage() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [remarques, setRemarques] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [selectedRemarque, setSelectedRemarque] = useState(null);
  const [editingRemarque, setEditingRemarque] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    content: "",
    result: "",
    type: "",
    stagiaire: null,
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
  const [filters, setFilters] = useState({
    date: "",
    type: ""
  });

  const types = ["Positive", "Negative"];

  useEffect(() => {
    fetchRemarques();
    fetchStagiaires();
  }, []);

  async function fetchRemarques() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/remarques?populate=stagiaire`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      console.log("Remarques data:", data);
      setRemarques(data.data || []);
    } catch (error) {
      console.error("Error fetching remarques:", error);
      showSnackbar("Erreur lors du chargement des remarques", "error");
    } finally {
      setLoading((p) => ({ ...p, global: false }));
    }
  }

  async function fetchStagiaires() {
    try {
      const res = await fetch(
        `${API_URL}/api/stagiaires`,
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
      showSnackbar("Erreur lors du chargement des stagiaires", "error");
    }
  }

  function handleOpen(remarque = null) {
    if (remarque) {
      setEditingRemarque(remarque.documentId);
      
      // استخدام formatDateForInput لضبط التاريخ
      const formattedDate = formatDateForInput(remarque.date);
      
      setFormData({
        date: formattedDate,
        content: remarque.content || "",
        result: remarque.result || "",
        type: remarque.type || "",
        stagiaire: remarque.stagiaire?.documentId || null,
      });
    } else {
      setEditingRemarque(null);
      setFormData({
        date: "",
        content: "",
        result: "",
        type: "",
        stagiaire: null,
      });
    }
    setOpen(true);
  }

  function handleShowDetail(remarque) {
    setSelectedRemarque(remarque);
    setDetailOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      const url = editingRemarque
        ? `${API_URL}/api/remarques/${editingRemarque}`
        : `${API_URL}/api/remarques`;
      
      const method = editingRemarque ? "PUT" : "POST";
      
      const requestData = {
        data: {
          date: formData.date || null,
          content: formData.content || null,
          result: formData.result || null,
          type: formData.type || null,
          ...(formData.stagiaire && { 
            stagiaire: { 
              connect: [formData.stagiaire] 
            } 
          }),
        }
      };

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
        throw new Error(responseData.error?.message || "Erreur lors de l'opération");
      }

      await fetchRemarques();
      setOpen(false);
      showSnackbar(
        editingRemarque ? "Remarque modifiée avec succès" : "Remarque créée avec succès", 
        "success"
      );
    } catch (err) {
      console.error("Error submitting form:", err);
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function confirmDelete(remarque) {
    setSelectedRemarque(remarque);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedRemarque) return;
    
    setLoading((p) => ({ ...p, delete: true }));
    try {
      console.log("Deleting remarque with documentId:", selectedRemarque.documentId);
      
      const res = await fetch(
        `${API_URL}/api/remarques/${selectedRemarque.documentId}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );

      console.log("Delete response status:", res.status);

      if (res.status === 204) {
        await fetchRemarques();
        showSnackbar("Remarque supprimée avec succès", "success");
      } else if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete error response:", errorText);
        throw new Error(`Erreur lors de la suppression: ${res.status}`);
      }
    } catch (error) {
      console.error("Error deleting remarque:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setSelectedRemarque(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  // Filter remarques based on search and filters
  const filteredRemarques = remarques.filter((remarque) => {
    const matchesSearch = searchQuery === "" || 
      (remarque.stagiaire?.mle?.toString() || '').includes(searchQuery) ||
      (remarque.stagiaire?.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (remarque.stagiaire?.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (remarque.stagiaire?.cin?.toString() || '').includes(searchQuery);
    
    // استخدام adjustDateForFilter للفلترة
    const matchesDate = !filters.date || 
      adjustDateForFilter(remarque.date) === filters.date;
    
    const matchesType = !filters.type || 
      remarque.type?.toLowerCase() === filters.type.toLowerCase();
    
    return matchesSearch && matchesDate && matchesType;
  });

  // Calculate statistics for all remarques
  const statsData = {
    positive: remarques.filter(r => r.type?.toLowerCase() === 'positive').length,
    negative: remarques.filter(r => r.type?.toLowerCase() === 'negative').length
  };

  // Calculate statistics for a specific stagiaire
  const getStagiaireStats = (stagiaireId) => {
    const stagiaireRemarques = remarques.filter(r => r.stagiaire?.documentId === stagiaireId);
    return {
      positive: stagiaireRemarques.filter(r => r.type?.toLowerCase() === 'positive').length,
      negative: stagiaireRemarques.filter(r => r.type?.toLowerCase() === 'negative').length
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Remarques</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les remarques des stagiaires
          </p>
        </div>
        <button 
          onClick={() => handleOpen()} 
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Remarque
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par MLE, nom, prénom ou CIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters(f => ({ ...f, date: e.target.value }))}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
          />

          {/* Type Filter */}
          <select 
            value={filters.type} 
            onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
          >
            <option value="">Tous les types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Stats Button */}
          <button 
            onClick={() => setStatsOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors justify-center"
          >
            <PieChart className="w-4 h-4" />
            Statistiques
          </button>
        </div>
      </div>

      {/* Remarques Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Liste des Remarques</h2>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredRemarques.length} / {remarques.length}
            </span>
          </div>
        </div>
        <div className="p-0">
          <RemarqueTable
            remarques={filteredRemarques}
            loading={loading.global}
            handleEdit={handleOpen}
            handleDelete={confirmDelete}
            handleShowDetail={handleShowDetail}
            loadingDelete={loading.delete}
            selectedRemarque={selectedRemarque}
          />
        </div>
      </div>

      {/* Remarque Form Dialog */}
      <RemarqueForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingRemarque={editingRemarque}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        stagiaires={stagiaires}
        types={types}
      />

      {/* Remarque Detail Dialog */}
      <RemarqueDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        remarque={selectedRemarque}
        getStagiaireStats={getStagiaireStats}
      />

      {/* Stats Dialog */}
      <RemarqueStats
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        data={statsData}
      />

      {/* Confirmation Dialogs and Snackbar */}
      <RemarqueDialogs
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