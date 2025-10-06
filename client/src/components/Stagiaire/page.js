// app/stagiaires/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import StagiaireTable from "./components/StagiaireTable";
import StagiaireForm from "./components/StagiaireForm";
import StagiaireDetailDialog from "./components/StagiaireDetailDialog";
import StagiaireDialogs from "./components/StagiaireDialogs";

export default function StagiairesPage() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const [stagiaires, setStagiaires] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [stages, setStages] = useState([]);
  const [brigades, setBrigades] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedStagiaire, setSelectedStagiaire] = useState(null);
  const [editingStagiaire, setEditingStagiaire] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null); // حفظ المرجع القديم عند التحرير
  const [formData, setFormData] = useState({
    cin: "",
    mle: "",
    first_name: "",
    last_name: "",
    grade: "",
    date_naissance: "",
    phone: "",
    groupe_sanguaine: "",
    profile: null,
    specialite: null,
    stage: null,
    brigade: null,
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
    specialite: "",
    stage: "",
    brigade: "",
    grade: "",
  });

  const grades = [
    "Soldat  de 2e classe",
    "Soldat  de 1re classe",
    "Caporal Adjoint",
    "Caporal-chef Police",
    "Sergent",
    "Sergent-chef",
    "Sergent-major",
    "Adjudant",
    "Adjudant-chef",
    "Sous-lieutenant",
    "Lieutenant",
    "Capitaine",
    "Commandant",
    "Lieutenant-colonel",
    "Colonel (plein)",
  ];

  useEffect(() => {
    fetchStagiaires();
    fetchSpecialites();
    fetchStages();
    fetchBrigades();
  }, []);

  async function fetchStagiaires() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/stagiaires?populate=specialite&populate=stage&populate=brigade&populate=profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      console.log("Stagiaires data:", data);
      setStagiaires(data.data || []);
    } catch (error) {
      console.error("Error fetching stagiaires:", error);
      showSnackbar("Erreur lors du chargement des stagiaires", "error");
    } finally {
      setLoading((p) => ({ ...p, global: false }));
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
      console.log("Specialites data:", data);
      setSpecialites(data.data || []);
    } catch (error) {
      console.error("Error fetching specialites:", error);
      showSnackbar("Erreur lors du chargement des spécialités", "error");
    }
  }

  async function fetchStages() {
    try {
      const res = await fetch(`${API_URL}/api/stages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      console.log("Stages data:", data);
      setStages(data.data || []);
    } catch (error) {
      console.error("Error fetching stages:", error);
      showSnackbar("Erreur lors du chargement des stages", "error");
    }
  }

  async function fetchBrigades() {
    try {
      const res = await fetch(`${API_URL}/api/brigades?populate=specialite`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      console.log("Brigades data:", data);
      setBrigades(data.data || []);
    } catch (error) {
      console.error("Error fetching brigades:", error);
      showSnackbar("Erreur lors من تحميل brigades", "error");
    }
  }

  function handleOpen(stagiaire = null) {
    if (stagiaire) {
      setEditingStagiaire(stagiaire.documentId);

      const formattedDate = stagiaire.date_naissance
        ? new Date(stagiaire.date_naissance).toISOString().split("T")[0]
        : "";

      // نحفض المرجع القديم للprofile باش نستعمله فـ disconnect إذا تمّ الحذف
      setOriginalProfile(stagiaire.profile || null);

      setFormData({
        cin: stagiaire.cin || "",
        mle: stagiaire.mle || "",
        first_name: stagiaire.first_name || "",
        last_name: stagiaire.last_name || "",
        grade: stagiaire.grade || "",
        date_naissance: formattedDate,
        phone: stagiaire.phone || "",
        groupe_sanguaine: stagiaire.groupe_sanguaine || "",
        profile: stagiaire.profile || null, // إما null أو object موجود
        specialite: stagiaire.specialite?.documentId || null,
        stage: stagiaire.stage?.documentId || null,
        brigade: stagiaire.brigade?.documentId || null,
      });
    } else {
      setEditingStagiaire(null);
      setOriginalProfile(null);
      setFormData({
        cin: "",
        mle: "",
        first_name: "",
        last_name: "",
        grade: "",
        date_naissance: "",
        phone: "",
        groupe_sanguaine: "",
        profile: null,
        specialite: null,
        stage: null,
        brigade: null,
      });
    }
    setOpen(true);
  }

  function handleShowDetail(stagiaire) {
    setSelectedStagiaire(stagiaire);
    setDetailOpen(true);
  }

  // يقوم بالرفع ويرجع object فيه id و/أو documentId (مرن مع صيغ الرد المختلفة)
  async function handleImageUpload(file) {
    const uploadData = new FormData();
    uploadData.append("files", file);
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: uploadData,
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Upload failed response:", txt);
        return null;
      }

      const uploaded = await res.json();
      // ممكن يجي كـ array مباشرة أو كـ { data: [...] }
      let fileObj = null;
      if (Array.isArray(uploaded) && uploaded.length) {
        fileObj = uploaded[0];
      } else if (uploaded.data && Array.isArray(uploaded.data) && uploaded.data.length) {
        fileObj = uploaded.data[0];
      } else if (uploaded[0]) {
        fileObj = uploaded[0];
      }

      if (!fileObj) {
        console.error("Upload: unexpected response format", uploaded);
        return null;
      }

      // نرجع كائن فيه id و documentId باش نقدر نختار الأنسب عند الربط
      return {
        id: fileObj.id || null,
        documentId: fileObj.documentId || null,
        url: fileObj.url || fileObj.url,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      showSnackbar("Erreur lors du téléchargement de l'image", "error");
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      let uploadedFile = null;

      // حالة: المستخدم اختار ملف جديد
      if (formData.profile instanceof File) {
        uploadedFile = await handleImageUpload(formData.profile);
        if (!uploadedFile) throw new Error("Failed to upload image");
      } else if (formData.profile && formData.profile.documentId) {
        // حالة: الملف موجود من قبل (لم يتغيّر)
        uploadedFile = {
          id: formData.profile.id || null,
          documentId: formData.profile.documentId || null,
        };
      }

      const url = editingStagiaire
        ? `${API_URL}/api/stagiaires/${editingStagiaire}`
        : `${API_URL}/api/stagiaires`;

      const method = editingStagiaire ? "PUT" : "POST";

      const requestData = {
        data: {
          cin: formData.cin || null,
          mle: formData.mle || null,
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          grade: formData.grade || null,
          date_naissance: formData.date_naissance || null,
          phone: formData.phone || null,
          groupe_sanguaine: formData.groupe_sanguaine || null,
        },
      };

      // === ربط/فصل profile (الصورة) ===
      if (uploadedFile) {
        // استعمل numeric id إذا كان متوفر (أكثر توافقاً مع بعض نسخ plugin)
        if (uploadedFile.id) {
          requestData.data.profile = { connect: [uploadedFile.id] };
        } else if (uploadedFile.documentId) {
          // بديل: longhand object مع documentId
          requestData.data.profile = { connect: [{ documentId: uploadedFile.documentId }] };
        }
      } else if (editingStagiaire && !formData.profile && originalProfile) {
        // المستخدم حذف الصورة أثناء التعديل => نعمل disconnect للمرجع القديم
        if (originalProfile.id) {
          requestData.data.profile = { disconnect: [originalProfile.id] };
        } else if (originalProfile.documentId) {
          requestData.data.profile = { disconnect: [{ documentId: originalProfile.documentId }] };
        }
      }

      // === علاقات أخرى (specialite, stage, brigade) ===
      // نستخدم صيغة connect longhand بالـ documentId (إن وُجد)
      if (formData.specialite) {
        requestData.data.specialite = { connect: [{ documentId: formData.specialite }] };
      } else if (editingStagiaire && !formData.specialite) {
        // إذا حذف المستخدم الاختيار أثناء التعديل، نقطع العلاقة إذا كان موجوداً أصلاً
        // ملاحظة: إن لم يكن لديك مرجع أصلي محفوظ، هذا لا يقوم بشيء
      }

      if (formData.stage) {
        // قد تكون stage مرقّمة أو documentId حسب الـ form; نحاول اكتشاف
        if (typeof formData.stage === "number") {
          requestData.data.stage = { connect: [formData.stage] };
        } else {
          requestData.data.stage = { connect: [{ documentId: formData.stage }] };
        }
      }

      if (formData.brigade) {
        if (typeof formData.brigade === "number") {
          requestData.data.brigade = { connect: [formData.brigade] };
        } else {
          requestData.data.brigade = { connect: [{ documentId: formData.brigade }] };
        }
      }

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
        throw new Error(responseData.error?.message || JSON.stringify(responseData));
      }

      await fetchStagiaires();
      setOpen(false);
      showSnackbar(editingStagiaire ? "Stagiaire modifié avec succès" : "Stagiaire créé avec succès", "success");
    } catch (err) {
      console.error("Error submitting form:", err);
      showSnackbar(err.message || "Erreur lors de l'opération", "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setFormData((p) => ({ ...p, profile: file }));
    }
  }

  function confirmDelete(stagiaire) {
    setSelectedStagiaire(stagiaire);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedStagiaire) return;

    setLoading((p) => ({ ...p, delete: true }));
    try {
      console.log("Deleting stagiaire with documentId:", selectedStagiaire.documentId);

      const res = await fetch(`${API_URL}/api/stagiaires/${selectedStagiaire.documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Delete response status:", res.status);

      if (res.status === 204) {
        await fetchStagiaires();
        showSnackbar("Stagiaire supprimé avec succès", "success");
      } else if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete error response:", errorText);
        throw new Error(`Erreur lors de la suppression: ${res.status}`);
      }
    } catch (error) {
      console.error("Error deleting stagiaire:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setSelectedStagiaire(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  const filteredStagiaires = stagiaires.filter((stagiaire) => {
    const matchesSearch =
      (stagiaire.mle?.toString() || "").includes(searchQuery) ||
      (stagiaire.first_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (stagiaire.last_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (stagiaire.cin?.toString() || "").includes(searchQuery);

    const matchesSpecialite = !filters.specialite || stagiaire.specialite?.documentId === filters.specialite;
    const matchesStage = !filters.stage || stagiaire.stage?.documentId === filters.stage;
    const matchesBrigade = !filters.brigade || stagiaire.brigade?.documentId === filters.brigade;
    const matchesGrade = !filters.grade || stagiaire.grade === filters.grade;

    return matchesSearch && matchesSpecialite && matchesStage && matchesBrigade && matchesGrade;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Stagiaires</h1>
          <p className="text-muted-foreground mt-1">Gérez les stagiaires et leurs informations</p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Stagiaire
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

          <select value={filters.specialite} onChange={(e) => setFilters((f) => ({ ...f, specialite: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground">
            <option value="">Toutes les spécialités</option>
            {specialites.map((specialite) => (
              <option key={specialite.documentId} value={specialite.documentId}>
                {specialite.name}
              </option>
            ))}
          </select>

          <select value={filters.stage} onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground">
            <option value="">Tous les stages</option>
            {stages.map((stage) => (
              <option key={stage.documentId} value={stage.documentId}>
                {stage.name}
              </option>
            ))}
          </select>

          <select value={filters.brigade} onChange={(e) => setFilters((f) => ({ ...f, brigade: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground">
            <option value="">Toutes les brigades</option>
            {brigades.map((brigade) => (
              <option key={brigade.documentId} value={brigade.documentId}>
                {brigade.nom}
              </option>
            ))}
          </select>

          <select value={filters.grade} onChange={(e) => setFilters((f) => ({ ...f, grade: e.target.value }))} className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground">
            <option value="">Tous les grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Liste des Stagiaires</h2>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredStagiaires.length} / {stagiaires.length}
            </span>
          </div>
        </div>
        <div className="p-0">
          <StagiaireTable
            stagiaires={filteredStagiaires}
            loading={loading.global}
            API_URL={API_URL}
            handleEdit={handleOpen}
            handleDelete={confirmDelete}
            handleShowDetail={handleShowDetail}
            loadingDelete={loading.delete}
            selectedStagiaire={selectedStagiaire}
          />
        </div>
      </div>

      {/* Form */}
      <StagiaireForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingStagiaire={editingStagiaire}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        handleImageChange={handleImageChange}
        specialites={specialites}
        stages={stages}
        brigades={brigades}
        grades={grades}
      />

      {/* Details */}
      <StagiaireDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} stagiaire={selectedStagiaire} API_URL={API_URL} />

      {/* Dialogs */}
      <StagiaireDialogs
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
