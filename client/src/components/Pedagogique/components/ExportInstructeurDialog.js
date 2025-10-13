// components/Pedagogique/components/ExportInstructeurDialog.js
"use client";
import React, { useState, useEffect } from "react";
import { Download, FileText, X, Search, Check, User, Award, BookOpen } from "lucide-react";
import { exportInstructeurToPDF } from "./exportInstructeurPdf";

export default function ExportInstructeurDialog({
  open,
  onClose,
  instructeurs = [],
  specialites = []
}) {
  const [selectedInstructeurs, setSelectedInstructeurs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    specialite: "",
    grade: "",
    mle: ""
  });

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

  // Filtrer les instructeurs
  const filteredInstructeurs = instructeurs.filter(instructeur => {
    const matchesSearch = 
      (instructeur.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (instructeur.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (instructeur.mle?.toString() || '').includes(searchQuery.toLowerCase());

    const matchesSpecialite = !filters.specialite || 
      instructeur.specialite?.name === filters.specialite;

    const matchesGrade = !filters.grade || 
      instructeur.grade === filters.grade;

    const matchesMle = !filters.mle || 
      (instructeur.mle?.toString() || '').includes(filters.mle);

    return matchesSearch && matchesSpecialite && matchesGrade && matchesMle;
  });

  const toggleSelectAll = () => {
    if (selectedInstructeurs.length === filteredInstructeurs.length) {
      setSelectedInstructeurs([]);
    } else {
      setSelectedInstructeurs(filteredInstructeurs.map(i => i.documentId));
    }
  };

  const toggleInstructeurSelection = (instructeurId) => {
    setSelectedInstructeurs(prev =>
      prev.includes(instructeurId)
        ? prev.filter(id => id !== instructeurId)
        : [...prev, instructeurId]
    );
  };

  const handleExport = async () => {
    if (selectedInstructeurs.length === 0) return;
    
    setLoading(true);
    try {
      const instructeursToExport = instructeurs.filter(i => selectedInstructeurs.includes(i.documentId));
      await exportInstructeurToPDF(instructeursToExport);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      const event = new CustomEvent('showSnackbar', {
        detail: { message: "Erreur lors de l'exportation", severity: 'error' }
      });
      window.dispatchEvent(event);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      specialite: "",
      grade: "",
      mle: ""
    });
    setSearchQuery("");
  };

  const hasActiveFilters = Object.values(filters).some(value => value) || searchQuery;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter les Fiches Instructeurs
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Type d'exportation - Only PDF now */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Type d'exportation</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border-2 border-primary bg-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-foreground">PDF</h4>
                    <p className="text-sm text-muted-foreground">Fiches détaillées des instructeurs</p>
                  </div>
                  <Check className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Filtres de sélection</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
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

              {/* Spécialité */}
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <select
                  value={filters.specialite}
                  onChange={(e) => setFilters(prev => ({ ...prev, specialite: e.target.value }))}
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

              {/* Grade */}
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <select
                  value={filters.grade}
                  onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
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

              {/* MLE */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Filtrer par MLE..."
                  value={filters.mle}
                  onChange={(e) => setFilters(prev => ({ ...prev, mle: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>
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
                  {filters.specialite && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      Spécialité: {filters.specialite}
                    </span>
                  )}
                  {filters.grade && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      Grade: {filters.grade}
                    </span>
                  )}
                  {filters.mle && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      MLE: {filters.mle}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sélection des instructeurs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">Sélection des Instructeurs</h3>
              <div className="text-sm text-muted-foreground">
                {filteredInstructeurs.length} instructeur(s) trouvé(s)
              </div>
            </div>

            {/* Select All */}
            <div className="mb-3">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedInstructeurs.length === filteredInstructeurs.length && filteredInstructeurs.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-foreground">Sélectionner tout</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedInstructeurs.length} instructeur(s) sélectionné(s)
                  </div>
                </div>
              </label>
            </div>

            {/* Liste des instructeurs */}
            <div className="max-h-60 overflow-y-auto border border-border rounded-lg">
              {filteredInstructeurs.map((instructeur) => (
                <label 
                  key={instructeur.documentId}
                  className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedInstructeurs.includes(instructeur.documentId)}
                    onChange={() => toggleInstructeurSelection(instructeur.documentId)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {instructeur.first_name} {instructeur.last_name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        MLE: {instructeur.mle || 'N/A'}
                      </span>
                      <span>
                        Grade: {instructeur.grade || 'Non spécifié'}
                      </span>
                      <span>
                        Spécialité: {instructeur.specialite?.name || 'Aucune'}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
              
              {filteredInstructeurs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun instructeur trouvé avec les filtres actuels
                </div>
              )}
            </div>
          </div>

          {/* Résumé */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Résumé de l'exportation</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Instructeurs sélectionnés</div>
                <div className="font-semibold text-foreground text-lg">{selectedInstructeurs.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Type de fichier</div>
                <div className="font-semibold text-foreground">PDF</div>
              </div>
              <div>
                <div className="text-muted-foreground">Spécialités</div>
                <div className="font-semibold text-foreground">
                  {[...new Set(selectedInstructeurs.map(id => 
                    instructeurs.find(i => i.documentId === id)?.specialite?.name
                  ).filter(Boolean))].length}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Filtres actifs</div>
                <div className="font-semibold text-foreground">
                  {Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={selectedInstructeurs.length === 0 || loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exporter ({selectedInstructeurs.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}