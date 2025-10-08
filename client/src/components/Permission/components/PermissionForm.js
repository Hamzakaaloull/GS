// app/permissions/components/PermissionForm.js
"use client";
import React, { useState, useMemo } from "react";
import { X, Calendar, Users, Search, User } from "lucide-react";
import { formatDateForInput, calculateDuration } from '@/hooks/dateUtils';

export default function PermissionForm({
  open,
  onClose,
  onSubmit,
  editingPermission,
  loading,
  formData,
  setFormData,
  stagiaires,
  permissionTypes
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStagiaireToggle = (stagiaireId) => {
    setFormData(prev => {
      const currentStagiaires = prev.stagiaires || [];
      if (currentStagiaires.includes(stagiaireId)) {
        return {
          ...prev,
          stagiaires: currentStagiaires.filter(id => id !== stagiaireId)
        };
      } else {
        return {
          ...prev,
          stagiaires: [...currentStagiaires, stagiaireId]
        };
      }
    });
  };

  const isStagiaireSelected = (stagiaireId) => {
    return formData.stagiaires.includes(stagiaireId);
  };

  const handleDateChange = (field, value) => {
    handleInputChange(field, value);
    
    // Calculate duration when both dates are set
    if (field === 'start_date' && formData.end_date) {
      const duration = calculateDuration(value, formData.end_date);
      handleInputChange('duration', duration.toString());
    } else if (field === 'end_date' && formData.start_date) {
      const duration = calculateDuration(formData.start_date, value);
      handleInputChange('duration', duration.toString());
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingPermission ? "Modifier la permission" : "Nouvelle permission"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dates Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Période de permission
              </h3>
              
              {/* Start Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Date de début *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleDateChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Date de fin *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleDateChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  Durée (jours) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  required
                  min="1"
                />
              </div>

              {/* Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  Type de permission *
                </label>
                <select 
                  value={formData.type} 
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  {permissionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stagiaires Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Stagiaires concernés *
              </h3>
              
              <div className="relative">
                {/* Search input */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un stagiaire..."
                    value={searchStagiaire}
                    onChange={(e) => setSearchStagiaire(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  />
                </div>

                {/* Selected stagiaires count */}
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">
                    {formData.stagiaires.length} stagiaire(s) sélectionné(s)
                  </p>
                </div>

                {/* Stagiaires list */}
                <div className="border border-border rounded-lg max-h-60 overflow-y-auto">
                  {filteredStagiaires.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Aucun stagiaire trouvé
                    </div>
                  ) : (
                    filteredStagiaires.map((stagiaire) => (
                      <label
                        key={stagiaire.documentId}
                        className={`flex items-center gap-3 p-3 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/30 transition-colors ${
                          isStagiaireSelected(stagiaire.documentId) ? 'bg-sidebar-primary/10' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isStagiaireSelected(stagiaire.documentId)}
                          onChange={() => handleStagiaireToggle(stagiaire.documentId)}
                          className="rounded border-border text-sidebar-primary focus:ring-sidebar-primary"
                        />
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
                      </label>
                    ))
                  )}
                </div>
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
              disabled={loading.submit || !formData.start_date || !formData.end_date || !formData.duration || !formData.type || formData.stagiaires.length === 0}
              className="flex-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg hover:bg-sidebar-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading.submit && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {editingPermission ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}