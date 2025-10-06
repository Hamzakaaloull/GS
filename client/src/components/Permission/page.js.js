// app/permissions/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, Filter } from "lucide-react";
import PermissionTable from "./components/PermissionTable";
import PermissionForm from "./components/PermissionForm";
import PermissionDetailDialog from "./components/PermissionDetailDialog";
import PermissionDialogs from "./components/PermissionDialogs";

export default function PermissionsPage() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [permissions, setPermissions] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    type: "",
    duration: "",
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
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    duration: "",
    type: ""
  });

  const permissionTypes = [
    "Permission ordinaire",
"Permission exceptionnelle",
"Permission de longue durée",
"Permission pour convenances personnelles",
"Permission de convalescence",
"Permission pour raisons familiales graves",
"Permission libérale",
"Permission d’éloignement",
"Permission d’études",
  ];

  useEffect(() => {
    fetchPermissions();
    fetchStagiaires();
  }, []);

  async function fetchPermissions() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/permisions?populate=stagiaires&populate=stagiaires.profile`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      console.log("Permissions data:", data);
      setPermissions(data.data || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      showSnackbar("Erreur lors du chargement des permissions", "error");
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

  function handleOpen(permission = null) {
    if (permission) {
      setEditingPermission(permission.documentId);
      
      const formattedStartDate = permission.start_date 
        ? new Date(permission.start_date).toISOString().split('T')[0]
        : "";
      
      const formattedEndDate = permission.end_date 
        ? new Date(permission.end_date).toISOString().split('T')[0]
        : "";
      
      setFormData({
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        type: permission.type || "",
        duration: permission.duration?.toString() || "",
        stagiaires: permission.stagiaires?.map(s => s.documentId) || [],
      });
    } else {
      setEditingPermission(null);
      setFormData({
        start_date: "",
        end_date: "",
        type: "",
        duration: "",
        stagiaires: [],
      });
    }
    setOpen(true);
  }

  function handleShowDetail(permission) {
    setSelectedPermission(permission);
    setDetailOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      const url = editingPermission
        ? `${API_URL}/api/permisions/${editingPermission}`
        : `${API_URL}/api/permisions`;
      
      const method = editingPermission ? "PUT" : "POST";
      
      const requestData = {
        data: {
          start_date: formData.start_date,
          end_date: formData.end_date,
          type: formData.type,
          duration: parseInt(formData.duration),
          stagiaires: formData.stagiaires.length > 0 ? {
            connect: formData.stagiaires
          } : undefined,
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

      await fetchPermissions();
      setOpen(false);
      showSnackbar(
        editingPermission ? "Permission modifiée avec succès" : "Permission créée avec succès", 
        "success"
      );
    } catch (err) {
      console.error("Error submitting form:", err);
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function confirmDelete(permission) {
    setSelectedPermission(permission);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedPermission) return;
    
    setLoading((p) => ({ ...p, delete: true }));
    try {
      console.log("Deleting permission with documentId:", selectedPermission.documentId);
      
      const res = await fetch(
        `${API_URL}/api/permisions/${selectedPermission.documentId}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );

      console.log("Delete response status:", res.status);

      if (res.status === 204) {
        await fetchPermissions();
        showSnackbar("Permission supprimée avec succès", "success");
      } else if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete error response:", errorText);
        throw new Error(`Erreur lors de la suppression: ${res.status}`);
      }
    } catch (error) {
      console.error("Error deleting permission:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setSelectedPermission(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  const filteredPermissions = permissions.filter((permission) => {
    const matchesStartDate = !filters.start_date || 
      permission.start_date?.startsWith(filters.start_date);
    
    const matchesEndDate = !filters.end_date || 
      permission.end_date?.startsWith(filters.end_date);
    
    const matchesDuration = !filters.duration || 
      permission.duration?.toString().includes(filters.duration);
    
    const matchesType = !filters.type || 
      permission.type === filters.type;
    
    return matchesStartDate && matchesEndDate && matchesDuration && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les permissions des stagiaires
          </p>
        </div>
        <button 
          onClick={() => handleOpen()} 
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Permission
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Start Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="date"
              placeholder="Date de début"
              value={filters.start_date}
              onChange={(e) => setFilters(f => ({ ...f, start_date: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
            />
          </div>

          {/* End Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="date"
              placeholder="Date de fin"
              value={filters.end_date}
              onChange={(e) => setFilters(f => ({ ...f, end_date: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
            />
          </div>

          {/* Duration Filter */}
          <div>
            <input
              type="number"
              placeholder="Durée (jours)"
              value={filters.duration}
              onChange={(e) => setFilters(f => ({ ...f, duration: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select 
              value={filters.type} 
              onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
            >
              <option value="">Tous les types</option>
              {permissionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Liste des Permissions</h2>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredPermissions.length} / {permissions.length}
            </span>
          </div>
        </div>
        <div className="p-0">
          <PermissionTable
            permissions={filteredPermissions}
            loading={loading.global}
            API_URL={API_URL}
            handleEdit={handleOpen}
            handleDelete={confirmDelete}
            handleShowDetail={handleShowDetail}
            loadingDelete={loading.delete}
            selectedPermission={selectedPermission}
          />
        </div>
      </div>

      {/* Permission Form Dialog */}
      <PermissionForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingPermission={editingPermission}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        stagiaires={stagiaires}
        permissionTypes={permissionTypes}
      />

      {/* Permission Detail Dialog */}
      <PermissionDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        permission={selectedPermission}
        API_URL={API_URL}
      />

      {/* Confirmation Dialogs and Snackbar */}
      <PermissionDialogs
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