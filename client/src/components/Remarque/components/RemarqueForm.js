"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Calendar, User, FileText, Award, Search } from "lucide-react";

export default function RemarqueForm({
  open,
  onClose,
  onSubmit,
  editingRemarque,
  loading,
  formData,
  setFormData,
  stagiaires,
  types
}) {
  const [stagiaireSearch, setStagiaireSearch] = useState("");
  const [showStagiaireDropdown, setShowStagiaireDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStagiaireDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!open) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStagiaireSelect = (stagiaire) => {
    setFormData(prev => ({ ...prev, stagiaire: stagiaire.documentId }));
    setStagiaireSearch(`${stagiaire.last_name} ${stagiaire.first_name} (MLE: ${stagiaire.mle}, CIN: ${stagiaire.cin})`);
    setShowStagiaireDropdown(false);
  };

  const filteredStagiaires = stagiaires.filter((stagiaire) => {
    const searchTerm = stagiaireSearch.toLowerCase();
    return (
      (stagiaire.mle?.toString() || '').includes(searchTerm) ||
      (stagiaire.first_name?.toLowerCase() || '').includes(searchTerm) ||
      (stagiaire.last_name?.toLowerCase() || '').includes(searchTerm) ||
      (stagiaire.cin?.toString() || '').includes(searchTerm)
    );
  });

  const selectedStagiaire = stagiaires.find(s => s.documentId === formData.stagiaire);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingRemarque ? "Modifier la remarque" : "Ajouter une nouvelle remarque"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Informations obligatoires
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Award className="h-4 w-4" />
                    Type *
                  </label>
                  <select 
                    required
                    value={formData.type} 
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  >
                    <option value="">Sélectionnez un type</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stagiaire Search */}
              <div className="relative" ref={dropdownRef}>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <User className="h-4 w-4" />
                  Stagiaire *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    value={stagiaireSearch}
                    onChange={(e) => {
                      setStagiaireSearch(e.target.value);
                      setShowStagiaireDropdown(true);
                    }}
                    onFocus={() => setShowStagiaireDropdown(true)}
                    placeholder="Rechercher par MLE, nom, prénom ou CIN..."
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                    required
                  />
                  
                  {showStagiaireDropdown && filteredStagiaires.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {filteredStagiaires.map((stagiaire) => (
                        <button
                          key={stagiaire.documentId}
                          type="button"
                          onClick={() => handleStagiaireSelect(stagiaire)}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
                        >
                          <div className="font-medium text-foreground">
                            {stagiaire.last_name} {stagiaire.first_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            MLE: {stagiaire.mle} | CIN: {stagiaire.cin} | Grade: {stagiaire.grade}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedStagiaire && (
                  <div className="mt-2 p-2 bg-muted/30 rounded-lg">
                    <p className="text-sm text-foreground font-medium">
                      Stagiaire sélectionné: {selectedStagiaire.last_name} {selectedStagiaire.first_name}
                    </p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <FileText className="h-4 w-4" />
                  Contenu *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Contenu de la remarque..."
                  rows="4"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground resize-none"
                  required
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Informations supplémentaires
              </h3>

              {/* Result */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <FileText className="h-4 w-4" />
                  Résultat
                </label>
                <textarea
                  value={formData.result}
                  onChange={(e) => handleInputChange('result', e.target.value)}
                  placeholder="Résultat de la remarque..."
                  rows="3"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading.submit || !formData.stagiaire}
              className="flex-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg hover:bg-sidebar-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading.submit && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {editingRemarque ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}