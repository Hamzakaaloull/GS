// components/Pedagogique/components/ExportRemarkDialog.js
"use client";
import React, { useState, useEffect } from "react";
import { Download, FileText, X, Search, Check, Calendar, User, BookOpen } from "lucide-react";
import { formatDateForDisplay } from "@/hooks/dateUtils";

export default function ExportRemarkDialog({
  open,
  onClose,
  remarks = [],
  instructeurs = [],
  subjects = []
}) {
  const [selectedRemarks, setSelectedRemarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportType, setExportType] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    instructeur: "",
    subject: "",
    type: ""
  });

  // Filtrer les remarques
  const filteredRemarks = remarks.filter(remark => {
    const remarkData = remark.attributes || remark;
    const instructeur = remarkData.instructeur?.data || remarkData.instructeur;
    const subject = remarkData.subject?.data || remarkData.subject;
    
    const matchesSearch = 
      (instructeur?.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (instructeur?.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (subject?.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (remarkData.content?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesDate = !filters.date || 
      formatDateForDisplay(remarkData.date) === formatDateForDisplay(filters.date);

    const matchesInstructeur = !filters.instructeur || 
      (instructeur?.id || instructeur?.documentId) == filters.instructeur;

    const matchesSubject = !filters.subject || 
      (subject?.id || subject?.documentId) == filters.subject;

    const matchesType = !filters.type || 
      remarkData.type === filters.type;

    return matchesSearch && matchesDate && matchesInstructeur && matchesSubject && matchesType;
  });

  const toggleSelectAll = () => {
    if (selectedRemarks.length === filteredRemarks.length) {
      setSelectedRemarks([]);
    } else {
      setSelectedRemarks(filteredRemarks.map(r => r.documentId));
    }
  };

  const toggleRemarkSelection = (remarkId) => {
    setSelectedRemarks(prev =>
      prev.includes(remarkId)
        ? prev.filter(id => id !== remarkId)
        : [...prev, remarkId]
    );
  };

  const handleExport = async () => {
    if (selectedRemarks.length === 0) return;
    
    setLoading(true);
    try {
      const remarksToExport = remarks.filter(r => selectedRemarks.includes(r.documentId));
      await exportToPDF(remarksToExport);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async (remarksData) => {
    try {
      const { exportRemarksToPDF } = await import("./ExportRemarkPDF");
      await exportRemarksToPDF(remarksData);
    } catch (error) {
      console.error("Error loading PDF export:", error);
      throw error;
    }
  };

  const clearFilters = () => {
    setFilters({
      date: "",
      instructeur: "",
      subject: "",
      type: ""
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
            Exporter les Remarques
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Type d'exportation - PDF seulement */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Type d'exportation</h3>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setExportType("pdf")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  exportType === "pdf" 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    exportType === "pdf" ? "bg-red-500/10" : "bg-muted"
                  }`}>
                    <FileText className={`h-6 w-6 ${
                      exportType === "pdf" ? "text-red-600" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-foreground">PDF</h4>
                    <p className="text-sm text-muted-foreground">Rapport détaillé des remarques</p>
                  </div>
                  {exportType === "pdf" && <Check className="h-5 w-5 text-primary" />}
                </div>
              </button>
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
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>

              {/* Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>

              {/* Instructeur */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <select
                  value={filters.instructeur}
                  onChange={(e) => setFilters(prev => ({ ...prev, instructeur: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground appearance-none"
                >
                  <option value="">Tous les instructeurs</option>
                  {instructeurs.map((instructeur) => (
                    <option key={instructeur.documentId} value={instructeur.documentId}>
                      {instructeur.first_name} {instructeur.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="relative">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                >
                  <option value="">Tous les types</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Négative</option>
                </select>
              </div>
            </div>

            {/* Filtre sujet */}
            <div className="mt-4">
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground appearance-none"
                >
                  <option value="">Tous les sujets</option>
                  {subjects.map((subject) => (
                    <option key={subject.documentId} value={subject.documentId}>
                      {subject.title}
                    </option>
                  ))}
                </select>
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
                  {filters.date && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      Date: {formatDateForDisplay(filters.date)}
                    </span>
                  )}
                  {filters.instructeur && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      Instructeur: {instructeurs.find(i => i.documentId === filters.instructeur)?.first_name}
                    </span>
                  )}
                  {filters.subject && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      Sujet: {subjects.find(s => s.documentId === filters.subject)?.title}
                    </span>
                  )}
                  {filters.type && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      Type: {filters.type === 'positive' ? 'Positive' : 'Négative'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sélection des remarques */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">Sélection des Remarques</h3>
              <div className="text-sm text-muted-foreground">
                {filteredRemarks.length} remarque(s) trouvée(s)
              </div>
            </div>

            {/* Select All */}
            <div className="mb-3">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRemarks.length === filteredRemarks.length && filteredRemarks.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-foreground">Sélectionner tout</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRemarks.length} remarque(s) sélectionnée(s)
                  </div>
                </div>
              </label>
            </div>

            {/* Liste des remarques */}
            <div className="max-h-60 overflow-y-auto border border-border rounded-lg">
              {filteredRemarks.map((remark) => {
                const remarkData = remark.attributes || remark;
                const instructeur = remarkData.instructeur?.data || remarkData.instructeur;
                const subject = remarkData.subject?.data || remarkData.subject;
                
                return (
                  <label 
                    key={remark.documentId}
                    className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRemarks.includes(remark.documentId)}
                      onChange={() => toggleRemarkSelection(remark.documentId)}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {formatDateForDisplay(remarkData.date)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          remarkData.type === 'positive' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {remarkData.type === 'positive' ? 'Positive' : 'Négative'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 grid grid-cols-2 gap-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {instructeur?.first_name} {instructeur?.last_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {subject?.title || 'Non spécifié'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {remarkData.start_time} - {remarkData.end_time}
                      </div>
                      <div className="text-sm text-foreground mt-1">
                        {remarkData.content}
                      </div>
                    </div>
                  </label>
                );
              })}
              
              {filteredRemarks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune remarque trouvée avec les filtres actuels
                </div>
              )}
            </div>
          </div>

          {/* Résumé */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Résumé de l'exportation</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Remarques sélectionnées</div>
                <div className="font-semibold text-foreground text-lg">{selectedRemarks.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Type de fichier</div>
                <div className="font-semibold text-foreground capitalize">{exportType}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Période</div>
                <div className="font-semibold text-foreground">
                  {filteredRemarks.length > 0 
                    ? `${formatDateForDisplay(Math.min(...filteredRemarks.map(r => new Date(r.attributes?.date || r.date))))} - ${formatDateForDisplay(Math.max(...filteredRemarks.map(r => new Date(r.attributes?.date || r.date))))}`
                    : 'N/A'
                  }
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
              disabled={selectedRemarks.length === 0 || loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exporter ({selectedRemarks.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}