// app/brigades/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Upload } from "lucide-react";
import BrigadeTable from "./components/BrigadeTable";
import BrigadeForm from "./components/BrigadeForm";
import BrigadeDetailDialog from "./components/BrigadeDetailDialog";
import BrigadeDialogs from "./components/BrigadeDialogs";
import { getYearFromDate } from "@/hooks/dateUtils";

export default function BrigadesPage() {
  // State for data
  const [brigades, setBrigades] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [stages, setStages] = useState([]);
  const [brigadeNames, setBrigadeNames] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState({
    initial: true,
    submit: false,
  });
  const [loadingDelete, setLoadingDelete] = useState(false);
  
  // State for modals
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  
  // State for selected items
  const [editingBrigade, setEditingBrigade] = useState(null);
  const [selectedBrigade, setSelectedBrigade] = useState(null);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [specialiteFilter, setSpecialiteFilter] = useState("");
  
  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" or "error"
  });

  // State for form data
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    brigade_name: "",
    effectif: 0,
    specialite: "",
    stage: "",
    stagiaires: [],
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch all data in parallel
      const [
        brigadesRes,
        stagiairesRes,
        specialitesRes,
        stagesRes,
        brigadeNamesRes,
      ] = await Promise.all([
        fetch(`${API_URL}/api/brigades?populate=*`, { headers }),
        fetch(`${API_URL}/api/stagiaires`, { headers }),
        fetch(`${API_URL}/api/specialites`, { headers }),
        fetch(`${API_URL}/api/stages`, { headers }),
        fetch(`${API_URL}/api/brigade-names`, { headers }),
      ]);

      if (!brigadesRes.ok || !stagiairesRes.ok || !specialitesRes.ok || !stagesRes.ok || !brigadeNamesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [
        brigadesData,
        stagiairesData,
        specialitesData,
        stagesData,
        brigadeNamesData,
      ] = await Promise.all([
        brigadesRes.json(),
        stagiairesRes.json(),
        specialitesRes.json(),
        stagesRes.json(),
        brigadeNamesRes.json(),
      ]);

      setBrigades(brigadesData.data || []);
      setStagiaires(stagiairesData.data || []);
      setSpecialites(specialitesData.data || []);
      setStages(stagesData.data || []);
      setBrigadeNames(brigadeNamesData.data || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Erreur lors du chargement des données", "error");
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  const fetchBrigadeNames = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_URL}/api/brigade-names`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setBrigadeNames(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching brigade names:", error);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Filter brigades based on search and filters
  const filteredBrigades = brigades.filter(brigade => {
    const matchesSearch = 
      searchQuery === "" ||
      brigade.brigade_name?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brigade.specialite?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brigade.stage?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear = 
      yearFilter === "" || 
      getYearFromDate(brigade.year).toString() === yearFilter;

    const matchesSpecialite = 
      specialiteFilter === "" || 
      brigade.specialite?.documentId === specialiteFilter;

    return matchesSearch && matchesYear && matchesSpecialite;
  });

  // Handlers for CRUD operations
  const handleCreate = () => {
    setEditingBrigade(null);
    setFormData({
      year: new Date().getFullYear(),
      brigade_name: "",
      effectif: 0,
      specialite: "",
      stage: "",
      stagiaires: [],
    });
    setOpenForm(true);
  };

  const handleEdit = (brigade) => {
    setEditingBrigade(brigade);
    setFormData({
      year: getYearFromDate(brigade.year),
      brigade_name: brigade.brigade_name?.documentId || "",
      effectif: brigade.effectif || 0,
      specialite: brigade.specialite?.documentId || "",
      stage: brigade.stage?.documentId || "",
      stagiaires: brigade.stagiaires?.map(s => s.documentId) || [],
    });
    setOpenForm(true);
  };

  const handleDelete = (brigade) => {
    setSelectedBrigade(brigade);
    setOpenConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedBrigade) return;

    try {
      setLoadingDelete(true);
      const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/brigades/${selectedBrigade.documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setBrigades(prev => prev.filter(b => b.documentId !== selectedBrigade.documentId));
        showSnackbar("Brigade supprimée avec succès");
        setOpenConfirm(false);
        setSelectedBrigade(null);
      } else {
        throw new Error("Failed to delete brigade");
      }
    } catch (error) {
      console.error("Error deleting brigade:", error);
      showSnackbar("Erreur lors de la suppression de la brigade", "error");
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleShowDetail = (brigade) => {
    setSelectedBrigade(brigade);
    setOpenDetail(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
      const token = localStorage.getItem("token");

      // Prepare the data for Strapi
      const requestData = {
        data: {
          year: new Date(formData.year, 0, 1).toISOString(), // Convert year to full date
          effectif: parseInt(formData.effectif) || 0,
          brigade_name: formData.brigade_name || null,
          specialite: formData.specialite || null,
          stage: formData.stage || null,
          stagiaires: formData.stagiaires || [],
        },
      };

      let res;
      if (editingBrigade) {
        // Update existing brigade
        res = await fetch(`${API_URL}/api/brigades/${editingBrigade.documentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });
      } else {
        // Create new brigade
        res = await fetch(`${API_URL}/api/brigades`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });
      }

      if (res.ok) {
        const result = await res.json();
        
        if (editingBrigade) {
          setBrigades(prev => 
            prev.map(b => b.documentId === editingBrigade.documentId ? result.data : b)
          );
          showSnackbar("Brigade modifiée avec succès");
        } else {
          setBrigades(prev => [...prev, result.data]);
          showSnackbar("Brigade créée avec succès");
        }
        
        setOpenForm(false);
        setEditingBrigade(null);
      } else {
        throw new Error("Failed to save brigade");
      }
    } catch (error) {
      console.error("Error saving brigade:", error);
      showSnackbar("Erreur lors de la sauvegarde de la brigade", "error");
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Get unique years for filter
  const availableYears = [...new Set(brigades.map(b => getYearFromDate(b.year)))].sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Brigades</h1>
            <p className="text-muted-foreground mt-2">
              Gérez les brigades et leurs affectations
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Brigade
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{brigades.length}</div>
            <div className="text-sm text-muted-foreground">Brigades totales</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {brigades.reduce((acc, brigade) => acc + (brigade.effectif || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Effectif total</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {brigades.reduce((acc, brigade) => acc + (brigade.stagiaires?.length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Stagiaires assignés</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {availableYears.length}
            </div>
            <div className="text-sm text-muted-foreground">Années différentes</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, spécialité ou stage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
              />
            </div>

            {/* Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            >
              <option value="">Toutes les années</option>
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Specialite Filter */}
            <select
              value={specialiteFilter}
              onChange={(e) => setSpecialiteFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            >
              <option value="">Toutes les spécialités</option>
              {specialites.map(specialite => (
                <option key={specialite.documentId} value={specialite.documentId}>
                  {specialite.name}
                </option>
              ))}
            </select>

            {/* Export/Import Buttons */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
                <Download className="h-4 w-4" />
                Exporter
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground">
                <Upload className="h-4 w-4" />
                Importer
              </button>
            </div>
          </div>
        </div>

        {/* Brigade Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <BrigadeTable
            brigades={filteredBrigades}
            loading={loading.initial}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleShowDetail={handleShowDetail}
            loadingDelete={loadingDelete}
            selectedBrigade={selectedBrigade}
          />
        </div>

        {/* Modals */}
        <BrigadeForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSubmit={handleFormSubmit}
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

        <BrigadeDetailDialog
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          brigade={selectedBrigade}
        />

        <BrigadeDialogs
          openConfirm={openConfirm}
          onCloseConfirm={() => setOpenConfirm(false)}
          handleDeleteConfirmed={handleDeleteConfirmed}
          loadingDelete={loadingDelete}
          snackbar={snackbar}
          onCloseSnackbar={handleCloseSnackbar}
        />
      </div>
    </div>
  );
}