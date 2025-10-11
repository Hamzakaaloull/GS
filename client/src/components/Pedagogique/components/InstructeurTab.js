// components/Pedagogique/components/InstructeurTab.js
"use client";
import React, { useState, useEffect } from "react";
import { 
  Plus, Download, Search, Filter, X, Edit, Trash2, Eye, 
  User, Phone, MapPin, Calendar, Award
} from "lucide-react";
import InstructeurForm from "./InstructeurForm";
import ExportInstructeurDialog from "./ExportInstructeurDialog";
import InstructeurDetailDialog from "./InstructeurDetailDialog";
import ConfirmationDialog from "./ConfirmationDialog";

export default function InstructeurTab() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [instructeurs, setInstructeurs] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedInstructeur, setSelectedInstructeur] = useState(null);
  const [editingInstructeur, setEditingInstructeur] = useState(null);
  const [loading, setLoading] = useState({ global: false, delete: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // États des filtres simples
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialite, setSelectedSpecialite] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");

  const grades = [
    "Soldat de 2e classe",
    "Soldat de 1re classe",
    "Caporal",
    "Caporal-chef",
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
    "Colonel (plein)"
  ];

  useEffect(() => {
    fetchInstructeurs();
    fetchSpecialites();
    
    // Écouter les événements d'alerte personnalisés
    window.addEventListener('showSnackbar', handleCustomAlert);
    return () => window.removeEventListener('showSnackbar', handleCustomAlert);
  }, []);

  const handleCustomAlert = (event) => {
    showSnackbar(event.detail.message, event.detail.severity);
  };

  const fetchInstructeurs = async () => {
    setLoading(prev => ({ ...prev, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/instructeurs?populate=specialite&populate=profile`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      console.log("Fetched instructeurs:", data);
      setInstructeurs(data.data || []);
    } catch (error) {
      console.error("Error fetching instructeurs:", error);
      showSnackbar("Erreur lors du chargement des instructeurs", "error");
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

  const handleOpenForm = (instructeur = null) => {
    if (instructeur) {
      setEditingInstructeur(instructeur);
      setSelectedInstructeur(instructeur);
    } else {
      setEditingInstructeur(null);
      setSelectedInstructeur(null);
    }
    setOpenForm(true);
  };

  const handleShowDetail = (instructeur) => {
    setSelectedInstructeur(instructeur);
    setOpenDetail(true);
  };

  const handleDelete = (instructeur) => {
    setSelectedInstructeur(instructeur);
    setOpenConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedInstructeur) return;
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/instructeurs/${selectedInstructeur.documentId}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );

      if (res.ok) {
        await fetchInstructeurs();
        showSnackbar("Instructeur supprimé avec succès", "success");
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error("Error deleting instructeur:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
      setOpenConfirm(false);
      setSelectedInstructeur(null);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000);
  };

  // Filtrage simple des instructeurs
  const filteredInstructeurs = instructeurs.filter((instructeur) => {
    const matchesSearch = 
      (instructeur.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (instructeur.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (instructeur.mle?.toString() || '').includes(searchQuery.toLowerCase());

    const matchesSpecialite = !selectedSpecialite || 
      instructeur.specialite?.name === selectedSpecialite;

    const matchesGrade = !selectedGrade || 
      instructeur.grade === selectedGrade;

    return matchesSearch && matchesSpecialite && matchesGrade;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialite("");
    setSelectedGrade("");
  };

  return (
    <div className="space-y-6">
      {/* Header avec boutons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gestion des Instructeurs</h2>
          <p className="text-muted-foreground mt-1">
            {instructeurs.length} instructeur(s) au total
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setOpenExport(true)}
            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter Fiche
          </button>
          <button 
            onClick={() => handleOpenForm()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter Instructeur
          </button>
        </div>
      </div>

      {/* Filtres simples */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche par nom/prénom/MLE */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, MLE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          {/* Filtre par spécialité */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select
              value={selectedSpecialite}
              onChange={(e) => setSelectedSpecialite(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground appearance-none"
            >
              <option value="">Toutes les spécialités</option>
              {specialites.map((specialite) => (
                <option key={specialite.documentId} value={specialite.name}>
                  {specialite.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par grade */}
          <div className="relative">
            <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground appearance-none"
            >
              <option value="">Tous les grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des instructeurs */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-foreground">Liste des Instructeurs</h3>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredInstructeurs.length} / {instructeurs.length}
            </span>
          </div>
        </div>

        {loading.global ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredInstructeurs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucun instructeur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Instructeur</th>
                  <th className="text-left p-4 font-semibold text-foreground">MLE</th>
                  <th className="text-left p-4 font-semibold text-foreground">Grade</th>
                  <th className="text-left p-4 font-semibold text-foreground">Spécialité</th>
                  <th className="text-left p-4 font-semibold text-foreground">Téléphone</th>
                  <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInstructeurs.map((instructeur) => (
                  <tr key={instructeur.documentId} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {instructeur.profile ? (
                            <img
                              src={`${API_URL}${instructeur.profile.url}`}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {instructeur.first_name} {instructeur.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground font-medium">
                        {instructeur.mle || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground">
                        {instructeur.grade || 'Non spécifié'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground">
                        {instructeur.specialite?.name || 'Aucune'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground">
                        {instructeur.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleShowDetail(instructeur)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-600"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenForm(instructeur)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(instructeur)}
                          disabled={loading.delete}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulaire Instructeur */}
      <InstructeurForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchInstructeurs}
        instructeur={editingInstructeur}
        specialites={specialites}
      />

      {/* Dialogue d'exportation */}
      <ExportInstructeurDialog
        open={openExport}
        onClose={() => setOpenExport(false)}
        instructeurs={filteredInstructeurs}
        specialites={specialites}
      />

      {/* Dialogue de détail */}
      <InstructeurDetailDialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        instructeur={selectedInstructeur}
      />

      {/* Dialogue de confirmation */}
      <ConfirmationDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleDeleteConfirmed}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer l'instructeur ${selectedInstructeur?.first_name} ${selectedInstructeur?.last_name} ?`}
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