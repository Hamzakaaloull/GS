// app/stages/components/StageForm.js
"use client";
import React, { useState } from "react";
import { X, Calendar, Users, BookOpen, MapPin, Search } from "lucide-react";

export default function StageForm({
  open,
  onClose,
  onSubmit,
  editingStage,
  loading,
  formData,
  setFormData,
  stagiaires,
  specialites,
  brigades
}) {
  const [searchStagiaires, setSearchStagiaires] = useState("");
  const [searchSpecialites, setSearchSpecialites] = useState("");
  const [searchBrigades, setSearchBrigades] = useState("");

  if (!open) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  // Filter options based on search
  const filteredStagiaires = stagiaires.filter(stagiaire =>
    stagiaire.mle?.toString().includes(searchStagiaires) ||
    stagiaire.first_name?.toLowerCase().includes(searchStagiaires.toLowerCase()) ||
    stagiaire.last_name?.toLowerCase().includes(searchStagiaires.toLowerCase())
  );

  const filteredSpecialites = specialites.filter(specialite =>
    specialite.name?.toLowerCase().includes(searchSpecialites.toLowerCase())
  );

  const filteredBrigades = brigades.filter(brigade =>
    brigade.nom?.toLowerCase().includes(searchBrigades.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingStage ? "Modifier le stage" : "Ajouter un nouveau stage"}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Informations de base
              </h3>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  Nom du stage *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nom du stage"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Date de début *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Date de fin *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description du stage"
                  rows="3"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>
            </div>

            {/* Relations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Relations
              </h3>

              {/* Stagiaires */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Users className="h-4 w-4" />
                  Stagiaires
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher par MLE, nom ou prénom..."
                      value={searchStagiaires}
                      onChange={(e) => setSearchStagiaires(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
                    {filteredStagiaires.map((stagiaire) => (
                      <label key={stagiaire.documentId} className="flex items-center gap-3 p-3 hover:bg-muted border-b border-border last:border-b-0">
                        <input
                          type="checkbox"
                          checked={formData.stagiaires.includes(stagiaire.documentId)}
                          onChange={(e) => handleMultiSelectChange('stagiaires', stagiaire.documentId, e.target.checked)}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-medium text-foreground">
                            {stagiaire.last_name} {stagiaire.first_name}
                          </div>
                          <div className="text-sm text-muted-foreground">MLE: {stagiaire.mle}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specialites */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <BookOpen className="h-4 w-4" />
                  Spécialités
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher une spécialité..."
                      value={searchSpecialites}
                      onChange={(e) => setSearchSpecialites(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
                    {filteredSpecialites.map((specialite) => (
                      <label key={specialite.documentId} className="flex items-center gap-3 p-3 hover:bg-muted border-b border-border last:border-b-0">
                        <input
                          type="checkbox"
                          checked={formData.specialites.includes(specialite.documentId)}
                          onChange={(e) => handleMultiSelectChange('specialites', specialite.documentId, e.target.checked)}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        <span className="text-foreground">{specialite.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brigades */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  Brigades
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher une brigade..."
                      value={searchBrigades}
                      onChange={(e) => setSearchBrigades(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
                    {filteredBrigades.map((brigade) => (
                      <label key={brigade.documentId} className="flex items-center gap-3 p-3 hover:bg-muted border-b border-border last:border-b-0">
                        <input
                          type="checkbox"
                          checked={formData.brigades.includes(brigade.documentId)}
                          onChange={(e) => handleMultiSelectChange('brigades', brigade.documentId, e.target.checked)}
                          className="rounded border-input text-primary focus:ring-primary"
                        />
                        <span className="text-foreground">{brigade.nom}</span>
                      </label>
                    ))}
                  </div>
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
              disabled={loading.submit}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading.submit && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {editingStage ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}