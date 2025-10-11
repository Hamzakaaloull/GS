// components/Pedagogique/components/SubjectTab.js
"use client";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { Plus, Download, Search, Edit, Trash2, Eye, X, BookOpen, FileText, Filter, ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import SubjectForm from "./SubjectForm";
import ConfirmationDialog from "./ConfirmationDialog";

// Lazy load components for better performance
const SubjectDetailModal = lazy(() => import('./SubjectDetailModal'));

export default function SubjectTab() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [subjects, setSubjects] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [loading, setLoading] = useState({ global: false, delete: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialite, setFilterSpecialite] = useState("");
  const [filterIsMilitaire, setFilterIsMilitaire] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, subject: null });
  const [detailModal, setDetailModal] = useState({ open: false, subject: null });
  const [expandedSections, setExpandedSections] = useState({});
  const [actionMenu, setActionMenu] = useState({ open: false, subject: null, x: 0, y: 0 });

  useEffect(() => {
    fetchSubjects();
    fetchSpecialites();
  }, []);

  const fetchSubjects = async () => {
    setLoading(prev => ({ ...prev, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/subjects?populate=content&populate=specialite`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setSubjects(data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showSnackbar("Erreur lors du chargement des matières", "error");
    } finally {
      setLoading(prev => ({ ...prev, global: false }));
    }
  };

  const fetchSpecialites = async () => {
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
  };

  const handleOpenForm = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setSelectedSubject(subject);
    } else {
      setEditingSubject(null);
      setSelectedSubject(null);
    }
    setOpenForm(true);
    setActionMenu({ open: false, subject: null });
  };

  const handleDelete = async (subject) => {
    setDeleteDialog({ open: true, subject });
    setActionMenu({ open: false, subject: null });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.subject) return;
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/subjects/${deleteDialog.subject.id || deleteDialog.subject.documentId}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );

      if (res.ok) {
        await fetchSubjects();
        showSnackbar("Matière supprimée avec succès", "success");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
      setDeleteDialog({ open: false, subject: null });
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openActionMenu = (e, subject) => {
    e.preventDefault();
    e.stopPropagation();
    setActionMenu({
      open: true,
      subject,
      x: e.clientX,
      y: e.clientY
    });
  };

  const closeActionMenu = () => {
    setActionMenu({ open: false, subject: null });
  };

  // Filtrer les matières
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = 
      (subject.attributes?.title?.toLowerCase() || subject.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (subject.attributes?.description?.toLowerCase() || subject.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesSpecialite = !filterSpecialite || 
      (subject.attributes?.is_militaire || subject.is_militaire ? "Interarme" : 
        (subject.attributes?.specialite?.data?.attributes?.name || subject.specialite?.name || "Non spécifié")) === filterSpecialite;
    
    const matchesMilitaire = !filterIsMilitaire || (subject.attributes?.is_militaire || subject.is_militaire);

    return matchesSearch && matchesSpecialite && matchesMilitaire;
  });

  // Grouper les matières par type
  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    const isMilitaire = subject.attributes?.is_militaire || subject.is_militaire;
    const specialiteName = subject.attributes?.specialite?.data?.attributes?.name || subject.specialite?.name;
    
    const category = isMilitaire ? "Interarme" : (specialiteName || "Non spécifié");
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(subject);
    return acc;
  }, {});

  const clearFilters = () => {
    setSearchQuery("");
    setFilterSpecialite("");
    setFilterIsMilitaire(false);
  };

  const hasActiveFilters = searchQuery || filterSpecialite || filterIsMilitaire;

  const downloadFile = async (file) => {
    try {
      const fileUrl = file.url.startsWith('http') ? file.url : `${API_URL}${file.url}`;
      const response = await fetch(fileUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      showSnackbar('Erreur lors du téléchargement', 'error');
    }
  };

  const getSubjectDisplayData = (subject) => {
    return {
      id: subject.id || subject.documentId,
      title: subject.attributes?.title || subject.title,
      description: subject.attributes?.description || subject.description,
      is_militaire: subject.attributes?.is_militaire || subject.is_militaire,
      specialite: subject.attributes?.specialite?.data || subject.specialite,
      content: subject.attributes?.content || subject.content,
      createdAt: subject.attributes?.createdAt || subject.createdAt,
      updatedAt: subject.attributes?.updatedAt || subject.updatedAt
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gestion des Matières</h2>
          <p className="text-muted-foreground mt-1">
            {subjects.length} matière(s) au total
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenForm()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter Matière
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par titre, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          {/* Filtre spécialité */}
          <select
            value={filterSpecialite}
            onChange={(e) => setFilterSpecialite(e.target.value)}
            className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
          >
            <option value="">Toutes les spécialités</option>
            <option value="Interarme">Interarme</option>
            {specialites.map(spec => (
              <option key={spec.id} value={spec.attributes?.name || spec.name}>
                {spec.attributes?.name || spec.name}
              </option>
            ))}
          </select>

          {/* Filtre matière militaire */}
          <div className="flex items-center gap-2 p-2 border border-input rounded-lg">
            <input
              type="checkbox"
              id="filterMilitaire"
              checked={filterIsMilitaire}
              onChange={(e) => setFilterIsMilitaire(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary border-input"
            />
            <label htmlFor="filterMilitaire" className="text-sm text-foreground">
              Matières d'interarme uniquement
            </label>
          </div>
        </div>

        {/* Bouton effacer les filtres */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-foreground flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          </div>
        )}
      </div>

      {/* Tableau des matières groupées */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-foreground">Liste des Matières</h3>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredSubjects.length} / {subjects.length}
            </span>
          </div>
        </div>

        {loading.global ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : Object.keys(groupedSubjects).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune matière trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {Object.entries(groupedSubjects).map(([category, categorySubjects]) => (
              <div key={category} className="border-b border-border last:border-b-0">
                {/* En-tête de catégorie */}
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {expandedSections[category] ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-semibold text-foreground">
                      {category} ({categorySubjects.length})
                    </span>
                  </div>
                </button>

                {/* Contenu de la catégorie */}
                {expandedSections[category] && (
                  <div className="bg-muted/10">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/20">
                          <tr>
                            <th className="text-left p-4 font-semibold text-foreground">Matière</th>
                            <th className="text-left p-4 font-semibold text-foreground">Description</th>
                            <th className="text-left p-4 font-semibold text-foreground">Documents</th>
                            <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {categorySubjects.map((subject) => {
                            const subjectData = getSubjectDisplayData(subject);
                            return (
                              <tr key={subjectData.id} className="hover:bg-muted/20 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                      <BookOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-foreground">
                                        {subjectData.title}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {subjectData.is_militaire ? "Interarme" : (subjectData.specialite?.attributes?.name || subjectData.specialite?.name || "Non spécifié")}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="text-foreground max-w-md">
                                    {subjectData.description || 'Aucune description'}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2 text-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>{subjectData.content?.length || 0} document(s)</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex justify-end">
                                    <button
                                      onClick={(e) => openActionMenu(e, subject)}
                                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground relative"
                                      title="Actions"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu d'actions contextuel */}
      {actionMenu.open && (
        <div 
          className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: actionMenu.x, top: actionMenu.y }}
        >
          <button
            onClick={() => {
              setDetailModal({ open: true, subject: actionMenu.subject });
              closeActionMenu();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Eye className="h-4 w-4" />
            Voir détails
          </button>
          <button
            onClick={() => handleOpenForm(actionMenu.subject)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
          <button
            onClick={() => handleDelete(actionMenu.subject)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      )}

      {/* Clic outside pour fermer le menu d'actions */}
      {actionMenu.open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeActionMenu}
        />
      )}

      {/* Formulaire Matière */}
      <SubjectForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchSubjects}
        subject={editingSubject}
      />

      {/* Modal de détail avec lazy loading */}
      <Suspense fallback={
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        {detailModal.open && (
          <SubjectDetailModal
            subject={detailModal.subject}
            onClose={() => setDetailModal({ open: false, subject: null })}
            onDownload={downloadFile}
          />
        )}
      </Suspense>

      {/* Dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, subject: null })}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette matière ? Cette action est irréversible."
        type="danger"
        loading={loading.delete}
      />

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`${
              snackbar.severity === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            } px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}
          >
            <span>{snackbar.message}</span>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="p-1 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}