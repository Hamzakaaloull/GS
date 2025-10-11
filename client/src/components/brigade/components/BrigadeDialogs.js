// app/brigades/components/ExportBrigadeDialog.js
"use client";
import React, { useState, useEffect } from "react";
import { Download, FileText, Table, X, Search, Check, Calendar, MapPin, ChevronDown, Users } from "lucide-react";
import ExportBrigadePDF from "./ExportBrigadePDF";
import ExportBrigadeExcel from "./ExportBrigadeExcel";

export default function ExportBrigadeDialog({
  open,
  onClose,
  brigades = [],
  filteredBrigades = [],
}) {
  const [activeExport, setActiveExport] = useState(null);
  const [selectedBrigades, setSelectedBrigades] = useState([]);
  const [searchBrigade, setSearchBrigade] = useState("");
  const [exportType, setExportType] = useState("pdf");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Filter states
  const [yearFilter, setYearFilter] = useState("");
  const [selectedBrigadeNames, setSelectedBrigadeNames] = useState([]);
  const [isBrigadeDropdownOpen, setIsBrigadeDropdownOpen] = useState(false);

  // Ensure brigades is always an array
  const safeBrigades = Array.isArray(brigades) ? brigades : [];

  // Extract unique brigade names for filter dropdown
  const uniqueBrigadeNames = [...new Set(safeBrigades
    .map(b => b.brigade_name?.nom)
    .filter(name => name)
  )].sort();

  // Extract unique years for filter
  const uniqueYears = [...new Set(safeBrigades
    .map(b => extractYearFromDate(b.year))
    .filter(year => year)
  )].sort((a, b) => b - a); // Sort descending

  // Filter brigades based on search and filters
  const filteredBrigadesList = safeBrigades.filter(brigade => {
    // Search filter
    const matchesSearch = 
      (brigade.brigade_name?.nom?.toLowerCase() || '').includes(searchBrigade.toLowerCase()) ||
      (brigade.specialite?.name?.toLowerCase() || '').includes(searchBrigade.toLowerCase()) ||
      (brigade.stage?.name?.toLowerCase() || '').includes(searchBrigade.toLowerCase()) ||
      (brigade.effectif?.toString().toLowerCase() || '').includes(searchBrigade.toLowerCase());

    // Year filter
    const brigadeYear = extractYearFromDate(brigade.year);
    const matchesYear = !yearFilter || brigadeYear === yearFilter;

    // Brigade name filter (multi-select)
    const matchesBrigadeName = selectedBrigadeNames.length === 0 || 
      selectedBrigadeNames.includes(brigade.brigade_name?.nom);

    return matchesSearch && matchesYear && matchesBrigadeName;
  });

  // دالة محسنة لاستخراج السنة من التاريخ
  const extractYearFromDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.getUTCFullYear().toString();
    } catch (error) {
      console.error("Error extracting year from date:", error);
      return '';
    }
  };

  // تحديد/إلغاء تحديد كل البريجادات
  const toggleSelectAll = () => {
    if (selectedBrigades.length === filteredBrigadesList.length) {
      setSelectedBrigades([]);
    } else {
      setSelectedBrigades(filteredBrigadesList.map(b => b.documentId));
    }
  };

  // تحديد/إلغاء تحديد بريجاد معين
  const toggleBrigadeSelection = (brigadeId) => {
    setSelectedBrigades(prev =>
      prev.includes(brigadeId)
        ? prev.filter(id => id !== brigadeId)
        : [...prev, brigadeId]
    );
  };

  // Multi-select for brigade names
  const toggleBrigadeNameSelection = (brigadeName) => {
    setSelectedBrigadeNames(prev =>
      prev.includes(brigadeName)
        ? prev.filter(name => name !== brigadeName)
        : [...prev, brigadeName]
    );
  };

  // Select all brigade names
  const selectAllBrigadeNames = () => {
    if (selectedBrigadeNames.length === uniqueBrigadeNames.length) {
      setSelectedBrigadeNames([]);
    } else {
      setSelectedBrigadeNames([...uniqueBrigadeNames]);
    }
  };

  // Select all years
  const selectAllYears = () => {
    setYearFilter("");
  };

  const handleExportSuccess = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000);
  };

  const handleCloseExport = () => {
    setActiveExport(null);
    setSelectedBrigades([]);
    setSearchBrigade("");
    setYearFilter("");
    setSelectedBrigadeNames([]);
  };

  const handleStartExport = () => {
    if (selectedBrigades.length === 0) {
      setSnackbar({ open: true, message: "Veuillez sélectionner au moins une brigade", severity: "error" });
      return;
    }
    setActiveExport(exportType);
  };

  const brigadesToExport = selectedBrigades.length > 0 
    ? safeBrigades.filter(b => selectedBrigades.includes(b.documentId))
    : [];

  // Clear all filters
  const clearAllFilters = () => {
    setSearchBrigade("");
    setYearFilter("");
    setSelectedBrigadeNames([]);
    setSelectedBrigades([]);
  };

  // Clear filters when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedBrigades([]);
      setSearchBrigade("");
      setYearFilter("");
      setSelectedBrigadeNames([]);
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exporter les Brigades
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Sélection du type d'exportation */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Type d'exportation</h3>
              <div className="grid grid-cols-2 gap-4">
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
                      <p className="text-sm text-muted-foreground">Document formaté</p>
                    </div>
                    {exportType === "pdf" && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setExportType("excel")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    exportType === "excel" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      exportType === "excel" ? "bg-green-500/10" : "bg-muted"
                    }`}>
                      <Table className={`h-6 w-6 ${
                        exportType === "excel" ? "text-green-600" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-foreground">Excel</h4>
                      <p className="text-sm text-muted-foreground">Données modifiables</p>
                    </div>
                    {exportType === "excel" && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-foreground mb-4">Filtres de sélection</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search by Name */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, spécialité, stage..."
                    value={searchBrigade}
                    onChange={(e) => setSearchBrigade(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  />
                </div>

                {/* Year Filter */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground appearance-none"
                  >
                    <option value="">Toutes les années</option>
                    {uniqueYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                </div>

                {/* Multi-select Brigade Names */}
                <div className="relative">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBrigadeDropdownOpen(!isBrigadeDropdownOpen)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground text-left flex items-center justify-between"
                    >
                      <span className="truncate">
                        {selectedBrigadeNames.length === 0 
                          ? "Tous les noms" 
                          : `${selectedBrigadeNames.length} nom(s) sélectionné(s)`
                        }
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isBrigadeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isBrigadeDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {/* Select All Option */}
                        <label className="flex items-center gap-3 p-3 border-b border-border hover:bg-muted transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrigadeNames.length === uniqueBrigadeNames.length}
                            onChange={selectAllBrigadeNames}
                            className="rounded border-input text-primary focus:ring-primary"
                          />
                          <div>
                            <div className="font-medium text-foreground">Sélectionner tout</div>
                          </div>
                        </label>

                        {/* Brigade Names List */}
                        {uniqueBrigadeNames.map((name) => (
                          <label
                            key={name}
                            className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrigadeNames.includes(name)}
                              onChange={() => toggleBrigadeNameSelection(name)}
                              className="rounded border-input text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{name}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchBrigade || yearFilter || selectedBrigadeNames.length > 0) && (
                <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Filtres actifs:</span>
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Tout effacer
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {searchBrigade && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                        Recherche: {searchBrigade}
                        <button onClick={() => setSearchBrigade("")}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {yearFilter && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                        Année: {yearFilter}
                        <button onClick={() => setYearFilter("")}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedBrigadeNames.map((name) => (
                      <span key={name} className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                        {name}
                        <button onClick={() => toggleBrigadeNameSelection(name)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sélection des brigades */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">Sélection des Brigades</h3>
                <div className="text-sm text-muted-foreground">
                  {filteredBrigadesList.length} brigades trouvées
                </div>
              </div>

              {/* Select All */}
              <div className="mb-3">
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrigades.length === filteredBrigadesList.length && filteredBrigadesList.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-medium text-foreground">Sélectionner tout</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedBrigades.length} brigades sélectionnées sur {filteredBrigadesList.length}
                    </div>
                  </div>
                </label>
              </div>

              {/* Brigades List */}
              <div className="max-h-60 overflow-y-auto border border-border rounded-lg">
                {filteredBrigadesList.map((brigade) => (
                  <label 
                    key={brigade.documentId} 
                    className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrigades.includes(brigade.documentId)}
                      onChange={() => toggleBrigadeSelection(brigade.documentId)}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {brigade.brigade_name?.nom || 'Sans nom'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Année: {extractYearFromDate(brigade.year)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Effectif: {brigade.effectif || 0}
                        </span>
                        <span>
                          Stagiaires: {brigade.stagiaires?.length || 0}
                        </span>
                        <span>
                          Spécialité: {brigade.specialite?.name || 'Aucune'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
                
                {filteredBrigadesList.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune brigade trouvée avec les filtres actuels
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Résumé de l'exportation</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Brigades sélectionnées</div>
                  <div className="font-semibold text-foreground text-lg">{selectedBrigades.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Type de fichier</div>
                  <div className="font-semibold text-foreground capitalize">{exportType}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total des stagiaires</div>
                  <div className="font-semibold text-foreground text-lg">
                    {brigadesToExport.reduce((total, brigade) => total + (brigade.stagiaires?.length || 0), 0)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Filtres actifs</div>
                  <div className="font-semibold text-foreground">
                    {[searchBrigade && "Recherche", yearFilter && "Année", selectedBrigadeNames.length > 0 && "Noms"]
                      .filter(Boolean).length || "Aucun"}
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
                onClick={handleStartExport}
                disabled={selectedBrigades.length === 0}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter ({selectedBrigades.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Export */}
      <ExportBrigadePDF
        open={activeExport === "pdf"}
        onClose={handleCloseExport}
        brigades={brigadesToExport}
        onExport={handleExportSuccess}
      />

      {/* Excel Export */}
      <ExportBrigadeExcel
        open={activeExport === "excel"}
        onClose={handleCloseExport}
        brigades={brigadesToExport}
        onExport={handleExportSuccess}
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
    </>
  );
}