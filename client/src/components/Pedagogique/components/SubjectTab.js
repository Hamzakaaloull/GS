// components/Pedagogique/components/SubjectTab.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Download, Search, Edit, Trash2, Eye, X, BookOpen, FileText } from "lucide-react";
import SubjectForm from "./SubjectForm";

export default function SubjectTab() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [subjects, setSubjects] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [loading, setLoading] = useState({ global: false, delete: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(prev => ({ ...prev, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/subjects?populate=content`,
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
      showSnackbar("Erreur lors du chargement des sujets", "error");
    } finally {
      setLoading(prev => ({ ...prev, global: false }));
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
  };

  const handleDelete = async (subject) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce sujet ?")) return;
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/subjects/${subject.documentId}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );

      if (res.ok) {
        await fetchSubjects();
        showSnackbar("Sujet supprimé avec succès", "success");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000);
  };

  // Filtrer les sujets
  const filteredSubjects = subjects.filter((subject) => {
    return (
      (subject.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (subject.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  });

  const clearFilters = () => {
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gestion des Sujets</h2>
          <p className="text-muted-foreground mt-1">
            {subjects.length} sujet(s) au total
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenForm()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter Sujet
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Bouton effacer les filtres */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-foreground flex items-center gap-2 justify-center"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          )}
        </div>

        {/* Affichage des filtres actifs */}
        {hasActiveFilters && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Filtres actifs:</span>
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Tout effacer
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                  Recherche: {searchQuery}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tableau des sujets */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-foreground">Liste des Sujets</h3>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredSubjects.length} / {subjects.length}
            </span>
          </div>
        </div>

        {loading.global ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucun sujet trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Sujet</th>
                  <th className="text-left p-4 font-semibold text-foreground">Description</th>
                  <th className="text-left p-4 font-semibold text-foreground">Documents</th>
                  <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.documentId} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {subject.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground max-w-md">
                        {subject.description || 'Aucune description'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{subject.content?.length || 0} document(s)</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenForm(subject)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject)}
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

      {/* Formulaire Sujet */}
      <SubjectForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchSubjects}
        subject={editingSubject}
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