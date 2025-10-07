// app/brigades/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Users, BookOpen, Calendar, ChevronDown } from "lucide-react";
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
  const [brigadeNames, setBrigadeNames] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBrigade, setSelectedBrigade] = useState(null);
  const [editingBrigade, setEditingBrigade] = useState(null);
  const [formData, setFormData] = useState({
    year: "",
    effectif: "",
    brigade_name: null,
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
  const [yearFilter, setYearFilter] = useState("");
  const [selectedBrigadeName, setSelectedBrigadeName] = useState("");
  const [isBrigadeDropdownOpen, setIsBrigadeDropdownOpen] = useState(false);

  useEffect(() => {
    fetchBrigades();
    fetchStagiaires();
    fetchSpecialites();
    fetchStages();
    fetchBrigadeNames();
  }, []);

  async function fetchBrigades() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/brigades?populate=stagiaires&populate=specialite&populate=stage&populate=brigade_name`,
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

  async function fetchBrigadeNames() {
    try {
      const res = await fetch(
        `${API_URL}/api/brigade-names`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setBrigadeNames(data.data || []);
    } catch (error) {
      console.error("Error fetching brigade names:", error);
    }
  }

  function handleOpen(brigade = null) {
    if (brigade) {
      setEditingBrigade(brigade.documentId);
      
      // إصلاح مشكلة السنة - استخدام السنة مباشرة بدون تحويل
      const year = brigade.year 
        ? extractYearFromDate(brigade.year)
        : "";
      
      setFormData({
        year: year,
        effectif: brigade.effectif?.toString() || "",
        brigade_name: brigade.brigade_name?.documentId || null,
        specialite: brigade.specialite?.documentId || null,
        stagiaires: brigade.stagiaires?.map(s => s.documentId) || [],
        stage: brigade.stage?.documentId || null
      });
    } else {
      setEditingBrigade(null);
      setFormData({
        year: "",
        effectif: "",
        brigade_name: null,
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

  // دالة لاستخراج السنة من التاريخ بدون مشاكل
  const extractYearFromDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // استخدام UTC لتجنب مشاكل المنطقة الزمنية
      return date.getUTCFullYear().toString();
    } catch (error) {
      console.error("Error extracting year from date:", error);
      return "";
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      const url = editingBrigade
        ? `${API_URL}/api/brigades/${editingBrigade}`
        : `${API_URL}/api/brigades`;
      
      const method = editingBrigade ? "PUT" : "POST";
      
      // إصلاح مشكلة السنة - استخدام UTC لتجنب مشاكل المنطقة الزمنية
      const yearDate = formData.year ? `${formData.year}-01-01T00:00:00.000Z` : null;
      
      const requestData = {
        data: {
          year: yearDate,
          effectif: formData.effectif ? parseInt(formData.effectif) : null,
          brigade_name: formData.brigade_name ? { connect: [formData.brigade_name] } : { disconnect: [] },
          specialite: formData.specialite ? { connect: [formData.specialite] } : { disconnect: [] },
          stagiaires: {
            connect: formData.stagiaires
          },
          stage: formData.stage ? { connect: [formData.stage] } : { disconnect: [] }
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

      if (!res.ok) {
        const errorMessage = responseData.error?.message || 
                            responseData.error?.details?.errors?.map(err => err.message).join(', ') || 
                            "Erreur lors de l'opération";
        throw new Error(errorMessage);
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

  // فلترة البريجادات حسب البحث والسنة واسم البريجاد
  const filteredBrigades = brigades.filter((brigade) => {
    const matchesSearch = 
      (brigade.brigade_name?.nom?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    // استخدام دالة استخراج السنة المحسنة
    const brigadeYear = extractYearFromDate(brigade.year);
    
    const matchesYear = !yearFilter || 
      brigadeYear.includes(yearFilter);
    
    const matchesBrigadeName = !selectedBrigadeName || 
      brigade.brigade_name?.nom === selectedBrigadeName;
    
    return matchesSearch && matchesYear && matchesBrigadeName;
  });

  // الحصول على قائمة أسماء البريجادات الفريدة
  const uniqueBrigadeNames = [...new Set(brigades
    .map(b => b.brigade_name?.nom)
    .filter(name => name)
  )].sort();

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          {/* Filter by Brigade Name */}
          <div className="relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBrigadeDropdownOpen(!isBrigadeDropdownOpen)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground text-left flex items-center justify-between"
              >
                <span className={selectedBrigadeName ? "text-foreground" : "text-muted-foreground"}>
                  {selectedBrigadeName || "Tous les noms"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isBrigadeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isBrigadeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrigadeName("");
                      setIsBrigadeDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors border-b border-border ${
                      !selectedBrigadeName ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    Tous les noms
                  </button>
                  {uniqueBrigadeNames.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setSelectedBrigadeName(name);
                        setIsBrigadeDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                        selectedBrigadeName === name ? 'bg-primary/10 text-primary' : 'text-foreground'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Year Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="number"
              placeholder="Filtrer par année..."
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              min="2000"
              max="2030"
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery("");
              setYearFilter("");
              setSelectedBrigadeName("");
            }}
            className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            Effacer les filtres
          </button>
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
        brigadeNames={brigadeNames}
        fetchBrigadeNames={fetchBrigadeNames}
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