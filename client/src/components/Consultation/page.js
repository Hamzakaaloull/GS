// app/consultations/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar } from "lucide-react";
import ConsultationTable from "./components/ConsultationTable";
import ConsultationForm from "./components/ConsultationForm";
import ConsultationDetailDialog from "./components/ConsultationDetailDialog";
import ConsultationDialogs from "./components/ConsultationDialogs";

export default function ConsultationsPage() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [consultations, setConsultations] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    note: "",
    file: null,
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
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchConsultations();
    fetchStagiaires();
  }, []);

  async function fetchConsultations() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/consultations?populate=stagiaire&populate=file`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      console.log("Consultations data:", data);
      setConsultations(data.data || []);
    } catch (error) {
      console.error("Error fetching consultations:", error);
      showSnackbar("Erreur lors du chargement des consultations", "error");
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

  function handleOpen(consultation = null) {
    if (consultation) {
      setEditingConsultation(consultation.documentId);
      
      const formattedDate = consultation.date 
        ? new Date(consultation.date).toISOString().split('T')[0]
        : "";
      
      setFormData({
        date: formattedDate,
        note: consultation.note || "",
        file: consultation.file || null,
        stagiaire: consultation.stagiaire?.documentId || null,
      });
    } else {
      setEditingConsultation(null);
      setFormData({
        date: "",
        note: "",
        file: null,
        stagiaire: null,
      });
    }
    setOpen(true);
  }

  function handleShowDetail(consultation) {
    setSelectedConsultation(consultation);
    setDetailOpen(true);
  }

  async function handleFileUpload(file) {
    const uploadData = new FormData();
    uploadData.append("files", file);
    try {
      const res = await fetch(
        `${API_URL}/api/upload`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
          body: uploadData,
        }
      );
      
      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }
      
      const uploaded = await res.json();
      console.log("Upload response:", uploaded);
      
      // Strapi v5 returns an array of file objects
      if (uploaded && uploaded.length > 0) {
        return uploaded[0].id; // Use 'id' instead of 'documentId' for file relationships
      }
      return null;
    } catch (error) {
      console.error("Error uploading file:", error);
      showSnackbar("Erreur lors du téléchargement du fichier", "error");
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      let fileId = null;
      
      // Handle file upload for new files
      if (formData.file instanceof File) {
        fileId = await handleFileUpload(formData.file);
        if (!fileId) {
          throw new Error("Échec du téléchargement du fichier");
        }
      } else if (formData.file && formData.file.id) {
        // Use existing file ID
        fileId = formData.file.id;
      }

      const url = editingConsultation
        ? `${API_URL}/api/consultations/${editingConsultation}`
        : `${API_URL}/api/consultations`;
      
      const method = editingConsultation ? "PUT" : "POST";
      
      // Prepare the request data for Strapi v5
      const requestData = {
        data: {
          date: formData.date,
          note: formData.note,
          stagiaire: formData.stagiaire ? {
            connect: [formData.stagiaire]
          } : undefined,
          ...(fileId && {
            file: {
              id: fileId // Use simple id reference for files
            }
          })
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

      await fetchConsultations();
      setOpen(false);
      showSnackbar(
        editingConsultation ? "Consultation modifiée avec succès" : "Consultation créée avec succès", 
        "success"
      );
    } catch (err) {
      console.error("Error submitting form:", err);
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setFormData((p) => ({ ...p, file: file }));
    }
  }

  function confirmDelete(consultation) {
    setSelectedConsultation(consultation);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedConsultation) return;
    
    setLoading((p) => ({ ...p, delete: true }));
    try {
      console.log("Deleting consultation with documentId:", selectedConsultation.documentId);
      
      const res = await fetch(
        `${API_URL}/api/consultations/${selectedConsultation.documentId}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );

      console.log("Delete response status:", res.status);

      if (res.status === 204) {
        await fetchConsultations();
        showSnackbar("Consultation supprimée avec succès", "success");
      } else if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete error response:", errorText);
        throw new Error(`Erreur lors de la suppression: ${res.status}`);
      }
    } catch (error) {
      console.error("Error deleting consultation:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setSelectedConsultation(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch = 
      (consultation.stagiaire?.mle?.toString() || '').includes(searchQuery) ||
      (consultation.stagiaire?.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (consultation.stagiaire?.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (consultation.stagiaire?.cin?.toString() || '').includes(searchQuery);
    
    const matchesDate = !dateFilter || 
      consultation.date?.startsWith(dateFilter);
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Consultations</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les consultations médicales des stagiaires
          </p>
        </div>
        <button 
          onClick={() => handleOpen()} 
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Consultation
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search by Stagiaire */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par MLE, nom, prénom ou CIN du stagiaire..."
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

      {/* Consultations Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Liste des Consultations</h2>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredConsultations.length} / {consultations.length}
            </span>
          </div>
        </div>
        <div className="p-0">
          <ConsultationTable
            consultations={filteredConsultations}
            loading={loading.global}
            API_URL={API_URL}
            handleEdit={handleOpen}
            handleDelete={confirmDelete}
            handleShowDetail={handleShowDetail}
            loadingDelete={loading.delete}
            selectedConsultation={selectedConsultation}
          />
        </div>
      </div>

      {/* Consultation Form Dialog */}
      <ConsultationForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingConsultation={editingConsultation}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        handleFileChange={handleFileChange}
        stagiaires={stagiaires}
      />

      {/* Consultation Detail Dialog */}
      <ConsultationDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        consultation={selectedConsultation}
        API_URL={API_URL}
      />

      {/* Confirmation Dialogs and Snackbar */}
      <ConsultationDialogs
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