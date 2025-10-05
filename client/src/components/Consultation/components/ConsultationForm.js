// app/consultations/components/ConsultationForm.js
"use client";
import React, { useState, useMemo } from "react";
import { X, Calendar, FileText, User, AlertCircle, Search } from "lucide-react";

export default function ConsultationForm({
  open,
  onClose,
  onSubmit,
  editingConsultation,
  loading,
  formData,
  setFormData,
  handleFileChange,
  stagiaires
}) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  const [searchStagiaire, setSearchStagiaire] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter stagiaires based on search
  const filteredStagiaires = useMemo(() => {
    if (!searchStagiaire) return stagiaires;
    
    return stagiaires.filter(stagiaire => 
      (stagiaire.mle?.toString() || '').toLowerCase().includes(searchStagiaire.toLowerCase()) ||
      (stagiaire.first_name?.toLowerCase() || '').includes(searchStagiaire.toLowerCase()) ||
      (stagiaire.last_name?.toLowerCase() || '').includes(searchStagiaire.toLowerCase()) ||
      (stagiaire.cin?.toString() || '').includes(searchStagiaire)
    );
  }, [stagiaires, searchStagiaire]);

  const getSelectedStagiaireName = () => {
    if (!formData.stagiaire) return "";
    const selected = stagiaires.find(s => s.documentId === formData.stagiaire);
    return selected ? `${selected.last_name} ${selected.first_name} (MLE: ${selected.mle})` : "";
  };

  const handleStagiaireSelect = (stagiaireId) => {
    handleInputChange('stagiaire', stagiaireId);
    setIsDropdownOpen(false);
    setSearchStagiaire("");
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingConsultation ? "Modifier la consultation" : "Nouvelle consultation"}
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
          <div className="space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Informations obligatoires
              </h3>
              
              {/* Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Date de consultation *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  required
                />
              </div>

              {/* Stagiaire with Search */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <User className="h-4 w-4" />
                  Stagiaire *
                </label>
                
                <div className="relative">
                  {/* Selected stagiaire display */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground text-left flex items-center justify-between"
                  >
                    <span className={formData.stagiaire ? "text-foreground" : "text-muted-foreground"}>
                      {formData.stagiaire ? getSelectedStagiaireName() : "Sélectionnez un stagiaire"}
                    </span>
                    <svg 
                      className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown with search */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
                      {/* Search input */}
                      <div className="p-2 border-b border-border">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <input
                            type="text"
                            placeholder="Rechercher par MLE, nom, prénom..."
                            value={searchStagiaire}
                            onChange={(e) => setSearchStagiaire(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground text-sm"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Stagiaire list */}
                      <div className="overflow-y-auto max-h-48">
                        {filteredStagiaires.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            Aucun stagiaire trouvé
                          </div>
                        ) : (
                          filteredStagiaires.map((stagiaire) => (
                            <button
                              key={stagiaire.documentId}
                              type="button"
                              onClick={() => handleStagiaireSelect(stagiaire.documentId)}
                              className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                                formData.stagiaire === stagiaire.documentId ? 'bg-sidebar-primary/10' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {stagiaire.profile ? (
                                  <img 
                                    src={`${API_URL}${stagiaire.profile.formats?.thumbnail?.url || stagiaire.profile.url}`}
                                    alt={`${stagiaire.first_name} ${stagiaire.last_name}`}
                                    className="w-8 h-8 rounded-lg object-cover border border-border"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-foreground truncate">
                                    {stagiaire.last_name} {stagiaire.first_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground flex gap-2">
                                    <span>MLE: {stagiaire.mle}</span>
                                    {stagiaire.cin && <span>CIN: {stagiaire.cin}</span>}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Notes médicales *
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="Notes et observations médicales..."
                  rows="4"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground resize-none"
                  required
                />
              </div>
            </div>

            {/* Optional File */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Document joint (optionnel)
              </h3>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <FileText className="h-4 w-4" />
                  Fichier
                </label>
                <div className="flex items-center gap-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Choisir un fichier
                    </div>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {formData.file && (
                    <span className="text-sm text-muted-foreground">
                      {formData.file instanceof File ? formData.file.name : 'Fichier existant'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Formats supportés: PDF, images, documents
                </p>
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
              disabled={loading.submit || !formData.date || !formData.stagiaire || !formData.note}
              className="flex-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg hover:bg-sidebar-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading.submit && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {editingConsultation ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}