// app/stages/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar } from "lucide-react";
import StageTable from "./components/StageTable";
import StageForm from "./components/StageForm";
import StageDetailDialog from "./components/StageDetailDialog";
import StageDialogs from "./components/StageDialogs";

export default function StagesPage() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const [stages, setStages] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [brigades, setBrigades] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    description: "",
    stagiaires: [],
    specialites: [],
    brigades: [],
  });
  const [loading, setLoading] = useState({
    global: false,
    delete: false,
    submit: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    year: "",
  });

  useEffect(() => {
    fetchStages();
    fetchStagiaires();
    fetchSpecialites();
    fetchBrigades();
  }, []);

  async function fetchStages() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/stages?populate=stagiaires&populate=specialites&populate=brigades`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      setStages(data.data || []);
    } catch (error) {
      console.error("Error fetching stages:", error);
      showSnackbar("Erreur lors du chargement des stages", "error");
    } finally {
      setLoading((p) => ({ ...p, global: false }));
    }
  }

  async function fetchStagiaires() {
    try {
      const res = await fetch(`${API_URL}/api/stagiaires?populate=profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setStagiaires(data.data || []);
    } catch (error) {
      console.error("Error fetching stagiaires:", error);
    }
  }

  async function fetchSpecialites() {
    try {
      const res = await fetch(`${API_URL}/api/specialites`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setSpecialites(data.data || []);
    } catch (error) {
      console.error("Error fetching specialites:", error);
    }
  }

  async function fetchBrigades() {
    try {
      const res = await fetch(`${API_URL}/api/brigades`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setBrigades(data.data || []);
    } catch (error) {
      console.error("Error fetching brigades:", error);
    }
  }

  function handleOpen(stage = null) {
    if (stage) {
      setEditingStage(stage.documentId);

      const adjustDateForForm = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        // Adjust for timezone offset
        const adjustedDate = new Date(
          date.getTime() + date.getTimezoneOffset() * 60000
        );
        return adjustedDate.toISOString().split("T")[0];
      };

      const formattedStartDate = adjustDateForForm(stage.start_date);
      const formattedEndDate = adjustDateForForm(stage.end_date);

      setFormData({
        name: stage.name || "",
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        description: stage.description || "",
        stagiaires: stage.stagiaires?.map((s) => s.documentId) || [],
        specialites: stage.specialites?.map((s) => s.documentId) || [],
        brigades: stage.brigades?.map((b) => b.documentId) || [],
      });
    } else {
      setEditingStage(null);
      setFormData({
        name: "",
        start_date: "",
        end_date: "",
        description: "",
        stagiaires: [],
        specialites: [],
        brigades: [],
      });
    }
    setOpen(true);
  }

  function handleShowDetail(stage) {
    setSelectedStage(stage);
    setDetailOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      const url = editingStage
        ? `${API_URL}/api/stages/${editingStage}`
        : `${API_URL}/api/stages`;

      const method = editingStage ? "PUT" : "POST";

      const requestData = {
        data: {
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description || null,
          stagiaires: {
            connect: formData.stagiaires,
          },
          specialites: {
            connect: formData.specialites,
          },
          brigades: {
            connect: formData.brigades,
          },
        },
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
        throw new Error(
          responseData.error?.message || "Erreur lors de l'opération"
        );
      }

      await fetchStages();
      setOpen(false);
      showSnackbar(
        editingStage ? "Stage modifié avec succès" : "Stage créé avec succès",
        "success"
      );
    } catch (err) {
      console.error("Error submitting form:", err);
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function confirmDelete(stage) {
    setSelectedStage(stage);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedStage) return;

    setLoading((p) => ({ ...p, delete: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/stages/${selectedStage.documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 204) {
        await fetchStages();
        showSnackbar("Stage supprimé avec succès", "success");
      } else if (!res.ok) {
        throw new Error(`Erreur lors de la suppression: ${res.status}`);
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setSelectedStage(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  // Get unique years from stages
  // Get unique years from stages (using adjusted dates)
  const years = [
    ...new Set(
      stages
        .map((stage) => {
          if (!stage.start_date) return null;

          const date = new Date(stage.start_date);
          // Adjust for timezone offset
          const adjustedDate = new Date(
            date.getTime() + date.getTimezoneOffset() * 60000
          );
          return adjustedDate.getFullYear();
        })
        .filter((year) => year)
    ),
  ].sort((a, b) => b - a);

  // Filter stages based on search and filters
  // Filter stages based on search and filters
  const filteredStages = stages.filter((stage) => {
    const matchesSearch =
      (stage.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (stage.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );

    // Adjust dates for filtering by adding one day
    const adjustDateForFilter = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
    };

    const stageStartDate = adjustDateForFilter(stage.start_date);
    const stageEndDate = adjustDateForFilter(stage.end_date);

    const matchesStartDate =
      !filters.start_date || stageStartDate === filters.start_date;

    const matchesEndDate =
      !filters.end_date || stageEndDate === filters.end_date;

    const matchesYear =
      !filters.year ||
      (stageStartDate && stageStartDate.split("-")[0] === filters.year);

    return matchesSearch && matchesStartDate && matchesEndDate && matchesYear;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Stages
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les stages et leurs informations
          </p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Stage
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search by Name */}

          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
              <Search className="h-4 w-4" />
              Rechercher
            </label>
            <Search className="absolute left-3 top-1/2 transform text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          {/* Filters */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Date de début
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) =>
                setFilters((f) => ({ ...f, start_date: e.target.value }))
              }
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Date de fin
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) =>
                setFilters((f) => ({ ...f, end_date: e.target.value }))
              }
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
              Année
            </label>
            <select
              value={filters.year}
              onChange={(e) =>
                setFilters((f) => ({ ...f, year: e.target.value }))
              }
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            >
              <option value="">Toutes les années</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stages Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">
              Liste des Stages
            </h2>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredStages.length} / {stages.length}
            </span>
          </div>
        </div>
        <div className="p-0">
          <StageTable
            stages={filteredStages}
            loading={loading.global}
            handleEdit={handleOpen}
            handleDelete={confirmDelete}
            handleShowDetail={handleShowDetail}
            loadingDelete={loading.delete}
            selectedStage={selectedStage}
          />
        </div>
      </div>

      {/* Stage Form Dialog */}
      <StageForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingStage={editingStage}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        stagiaires={stagiaires}
        specialites={specialites}
        brigades={brigades}
      />

      {/* Stage Detail Dialog */}
      <StageDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        stage={selectedStage}
      />

      {/* Confirmation Dialogs and Snackbar */}
      <StageDialogs
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
