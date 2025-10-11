// components/ExportStagiaireModal.js
"use client";
import React, { useState, useEffect } from "react";
import { X, Search, Check, Download, Calendar, MapPin, BookOpen, Users, ChevronDown } from "lucide-react";

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

export default function ExportStagiaireModal({
  open,
  onClose,
  stagiaires = [],
  specialites = [],
  stages = [],
  brigades = [],
  grades = [],
  onExport,
}) {
  const [selectedStagiaires, setSelectedStagiaires] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New filter states
  const [yearFilter, setYearFilter] = useState("");
  const [selectedSpecialites, setSelectedSpecialites] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedBrigades, setSelectedBrigades] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  
  // Dropdown states
  const [isSpecialiteDropdownOpen, setIsSpecialiteDropdownOpen] = useState(false);
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const [isBrigadeDropdownOpen, setIsBrigadeDropdownOpen] = useState(false);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);

  // Ensure all props are arrays
  const safeStagiaires = Array.isArray(stagiaires) ? stagiaires : [];
  const safeSpecialites = Array.isArray(specialites) ? specialites : [];
  const safeStages = Array.isArray(stages) ? stages : [];
  const safeBrigades = Array.isArray(brigades) ? brigades : [];
  const safeGrades = Array.isArray(grades) ? grades : [];

  // Extract unique years for filter
  const uniqueYears = [...new Set(safeStagiaires
    .map(s => extractYearFromDate(s.brigade?.year))
    .filter(year => year)
  )].sort((a, b) => b - a); // Sort descending

  // Filter stagiaires based on search and filters
  const filteredStagiairesList = safeStagiaires.filter((stagiaire) => {
    // Search filter
    const matchesSearch = 
      (stagiaire.mle?.toString() || "").includes(searchQuery) ||
      (stagiaire.first_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (stagiaire.last_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (stagiaire.cin?.toString() || "").includes(searchQuery);

    // Year filter
    const stagiaireYear = extractYearFromDate(stagiaire.brigade?.year);
    const matchesYear = !yearFilter || stagiaireYear === yearFilter;

    // Specialite filter (multi-select)
    const matchesSpecialite = selectedSpecialites.length === 0 || 
      selectedSpecialites.includes(stagiaire.specialite?.documentId);

    // Stage filter (multi-select)
    const matchesStage = selectedStages.length === 0 || 
      selectedStages.includes(stagiaire.stage?.documentId);

    // Brigade filter (multi-select)
    const matchesBrigade = selectedBrigades.length === 0 || 
      selectedBrigades.includes(stagiaire.brigade?.documentId);

    // Grade filter (multi-select)
    const matchesGrade = selectedGrades.length === 0 || 
      selectedGrades.includes(stagiaire.grade);

    return matchesSearch && matchesYear && matchesSpecialite && matchesStage && matchesBrigade && matchesGrade;
  });

  // تحديد/إلغاء تحديد كل المتدربين
  const toggleSelectAll = () => {
    if (selectedStagiaires.length === filteredStagiairesList.length) {
      setSelectedStagiaires([]);
    } else {
      setSelectedStagiaires([...filteredStagiairesList]);
    }
  };

  // تحديد/إلغاء تحديد متدرب معين
  const toggleStagiaireSelection = (stagiaire) => {
    setSelectedStagiaires(prev =>
      prev.some(s => s.documentId === stagiaire.documentId)
        ? prev.filter(s => s.documentId !== stagiaire.documentId)
        : [...prev, stagiaire]
    );
  };

  // Multi-select functions
  const toggleSpecialiteSelection = (specialiteId) => {
    setSelectedSpecialites(prev =>
      prev.includes(specialiteId)
        ? prev.filter(id => id !== specialiteId)
        : [...prev, specialiteId]
    );
  };

  const toggleStageSelection = (stageId) => {
    setSelectedStages(prev =>
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const toggleBrigadeSelection = (brigadeId) => {
    setSelectedBrigades(prev =>
      prev.includes(brigadeId)
        ? prev.filter(id => id !== brigadeId)
        : [...prev, brigadeId]
    );
  };

  const toggleGradeSelection = (grade) => {
    setSelectedGrades(prev =>
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  // Select all functions
  const selectAllSpecialites = () => {
    if (selectedSpecialites.length === safeSpecialites.length) {
      setSelectedSpecialites([]);
    } else {
      setSelectedSpecialites(safeSpecialites.map(s => s.documentId));
    }
  };

  const selectAllStages = () => {
    if (selectedStages.length === safeStages.length) {
      setSelectedStages([]);
    } else {
      setSelectedStages(safeStages.map(s => s.documentId));
    }
  };

  const selectAllBrigades = () => {
    if (selectedBrigades.length === safeBrigades.length) {
      setSelectedBrigades([]);
    } else {
      setSelectedBrigades(safeBrigades.map(b => b.documentId));
    }
  };

  const selectAllGrades = () => {
    if (selectedGrades.length === safeGrades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades([...safeGrades]);
    }
  };

  const handleExport = () => {
    onExport(selectedStagiaires);
    handleClose();
  };

  const handleClose = () => {
    setSelectedStagiaires([]);
    setSearchQuery("");
    setYearFilter("");
    setSelectedSpecialites([]);
    setSelectedStages([]);
    setSelectedBrigades([]);
    setSelectedGrades([]);
    onClose();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setYearFilter("");
    setSelectedSpecialites([]);
    setSelectedStages([]);
    setSelectedBrigades([]);
    setSelectedGrades([]);
    setSelectedStagiaires([]);
  };

  // Get display names for active filters
  const getSpecialiteName = (id) => safeSpecialites.find(s => s.documentId === id)?.name || id;
  const getStageName = (id) => safeStages.find(s => s.documentId === id)?.name || id;
  const getBrigadeName = (id) => {
    const brigade = safeBrigades.find(b => b.documentId === id);
    return brigade?.brigade_name?.nom || id;
  };

  // Clear filters when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedStagiaires([]);
      setSearchQuery("");
      setYearFilter("");
      setSelectedSpecialites([]);
      setSelectedStages([]);
      setSelectedBrigades([]);
      setSelectedGrades([]);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter les Fiches des Stagiaires
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Filter Bar */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Filtres de sélection</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search by Name */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher par MLE, nom, prénom, CIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Grade Filter */}
              <div className="relative">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {selectedGrades.length === 0 
                        ? "Tous les grades" 
                        : `${selectedGrades.length} grade(s) sélectionné(s)`
                      }
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isGradeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isGradeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {/* Select All Option */}
                      <label className="flex items-center gap-3 p-3 border-b border-border hover:bg-muted transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedGrades.length === safeGrades.length}
                          onChange={selectAllGrades}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-medium text-foreground">Sélectionner tout</div>
                        </div>
                      </label>

                      {/* Grades List */}
                      {safeGrades.map((grade) => (
                        <label
                          key={grade}
                          className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGrades.includes(grade)}
                            onChange={() => toggleGradeSelection(grade)}
                            className="rounded border-input text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{grade}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Specialite Filter */}
              <div className="relative">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSpecialiteDropdownOpen(!isSpecialiteDropdownOpen)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {selectedSpecialites.length === 0 
                        ? "Toutes les spécialités" 
                        : `${selectedSpecialites.length} spécialité(s) sélectionnée(s)`
                      }
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isSpecialiteDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSpecialiteDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {/* Select All Option */}
                      <label className="flex items-center gap-3 p-3 border-b border-border hover:bg-muted transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSpecialites.length === safeSpecialites.length}
                          onChange={selectAllSpecialites}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-medium text-foreground">Sélectionner tout</div>
                        </div>
                      </label>

                      {/* Specialites List */}
                      {safeSpecialites.map((specialite) => (
                        <label
                          key={specialite.documentId}
                          className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSpecialites.includes(specialite.documentId)}
                            onChange={() => toggleSpecialiteSelection(specialite.documentId)}
                            className="rounded border-input text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{specialite.name}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stage Filter */}
              <div className="relative">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStageDropdownOpen(!isStageDropdownOpen)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {selectedStages.length === 0 
                        ? "Tous les stages" 
                        : `${selectedStages.length} stage(s) sélectionné(s)`
                      }
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isStageDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isStageDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {/* Select All Option */}
                      <label className="flex items-center gap-3 p-3 border-b border-border hover:bg-muted transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStages.length === safeStages.length}
                          onChange={selectAllStages}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-medium text-foreground">Sélectionner tout</div>
                        </div>
                      </label>

                      {/* Stages List */}
                      {safeStages.map((stage) => (
                        <label
                          key={stage.documentId}
                          className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStages.includes(stage.documentId)}
                            onChange={() => toggleStageSelection(stage.documentId)}
                            className="rounded border-input text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{stage.name}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Brigade Filter */}
              <div className="relative">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsBrigadeDropdownOpen(!isBrigadeDropdownOpen)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {selectedBrigades.length === 0 
                        ? "Toutes les brigades" 
                        : `${selectedBrigades.length} brigade(s) sélectionnée(s)`
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
                          checked={selectedBrigades.length === safeBrigades.length}
                          onChange={selectAllBrigades}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-medium text-foreground">Sélectionner tout</div>
                        </div>
                      </label>

                      {/* Brigades List */}
                      {safeBrigades.map((brigade) => (
                        <label
                          key={brigade.documentId}
                          className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrigades.includes(brigade.documentId)}
                            onChange={() => toggleBrigadeSelection(brigade.documentId)}
                            className="rounded border-input text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-foreground">
                              {brigade.brigade_name?.nom || 'Sans nom'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || yearFilter || selectedSpecialites.length > 0 || selectedStages.length > 0 || selectedBrigades.length > 0 || selectedGrades.length > 0) && (
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
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      Recherche: {searchQuery}
                      <button onClick={() => setSearchQuery("")}>
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
                  {selectedSpecialites.map((id) => (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      {getSpecialiteName(id)}
                      <button onClick={() => toggleSpecialiteSelection(id)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedStages.map((id) => (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      {getStageName(id)}
                      <button onClick={() => toggleStageSelection(id)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedBrigades.map((id) => (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      {getBrigadeName(id)}
                      <button onClick={() => toggleBrigadeSelection(id)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedGrades.map((grade) => (
                    <span key={grade} className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
                      {grade}
                      <button onClick={() => toggleGradeSelection(grade)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sélection des stagiaires */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground">Sélection des Stagiaires</h3>
              <div className="text-sm text-muted-foreground">
                {filteredStagiairesList.length} stagiaire(s) trouvé(s) • {selectedStagiaires.length} sélectionné(s)
              </div>
            </div>

            {/* Select All */}
            <div className="mb-3">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStagiaires.length === filteredStagiairesList.length && filteredStagiairesList.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-foreground">Sélectionner tout</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedStagiaires.length} stagiaires sélectionnés sur {filteredStagiairesList.length}
                  </div>
                </div>
              </label>
            </div>

            {/* Stagiaires List */}
            <div className="max-h-96 overflow-y-auto border border-border rounded-lg">
              {filteredStagiairesList.map((stagiaire) => (
                <label 
                  key={stagiaire.documentId} 
                  className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStagiaires.some(s => s.documentId === stagiaire.documentId)}
                    onChange={() => toggleStagiaireSelection(stagiaire)}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {stagiaire.last_name} {stagiaire.first_name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">MLE:</span> {stagiaire.mle || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">CIN:</span> {stagiaire.cin || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Grade:</span> {stagiaire.grade || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {stagiaire.specialite?.name || 'Aucune'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Stage: {stagiaire.stage?.name || 'Aucun'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Brigade: {stagiaire.brigade?.brigade_name?.nom || 'Aucune'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Année: {extractYearFromDate(stagiaire.brigade?.year) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
              
              {filteredStagiairesList.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun stagiaire trouvé avec les filtres actuels
                </div>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Résumé de l'exportation</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Stagiaires sélectionnés</div>
                <div className="font-semibold text-foreground text-lg">{selectedStagiaires.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Filtres actifs</div>
                <div className="font-semibold text-foreground">
                  {[searchQuery && "Recherche", yearFilter && "Année", selectedSpecialites.length > 0 && "Spécialités", selectedStages.length > 0 && "Stages", selectedBrigades.length > 0 && "Brigades", selectedGrades.length > 0 && "Grades"]
                    .filter(Boolean).length || "Aucun"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total trouvé</div>
                <div className="font-semibold text-foreground text-lg">{filteredStagiairesList.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Format</div>
                <div className="font-semibold text-foreground">PDF</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={selectedStagiaires.length === 0}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter ({selectedStagiaires.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}