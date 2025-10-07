// app/brigades/components/BrigadeForm.js
"use client";
import React, { useState } from "react";
import { X, MapPin, Users, BookOpen, Calendar, Search, Plus } from "lucide-react";

export default function BrigadeForm({
  open,
  onClose,
  onSubmit,
  editingBrigade,
  loading,
  formData,
  setFormData,
  stagiaires,
  specialites,
  stages,
  brigadeNames,
  fetchBrigadeNames
}) {
  const [searchStagiaires, setSearchStagiaires] = useState("");
  const [showNewBrigadeName, setShowNewBrigadeName] = useState(false);
  const [newBrigadeName, setNewBrigadeName] = useState("");

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

  const handleAddNewBrigadeName = async () => {
    if (!newBrigadeName.trim()) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
      const res = await fetch(`${API_URL}/api/brigade-names`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          data: {
            nom: newBrigadeName.trim()
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Set the newly created brigade name as selected
        handleInputChange('brigade_name', data.data.documentId);
        setShowNewBrigadeName(false);
        setNewBrigadeName("");
        // Refresh brigade names list
        await fetchBrigadeNames();
      }
    } catch (error) {
      console.error("Error adding new brigade name:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingBrigade ? "Modifier la brigade" : "Ajouter une nouvelle brigade"}
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
              
              {/* Year */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Année *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="2024"
                  min="2000"
                  max="2030"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  required
                />
              </div>

              {/* Brigade Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  Nom de la brigade *
                </label>
                
                {!showNewBrigadeName ? (
                  <div className="space-y-2">
                    <select 
                      value={formData.brigade_name || ""} 
                      onChange={(e) => handleInputChange('brigade_name', e.target.value || null)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      required
                    >
                      <option value="">Sélectionnez un nom de brigade</option>
                      {brigadeNames.map((brigadeName) => (
                        <option key={brigadeName.documentId} value={brigadeName.documentId}>
                          {brigadeName.nom}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewBrigadeName(true)}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Ajouter un nouveau nom de brigade
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newBrigadeName}
                        onChange={(e) => setNewBrigadeName(e.target.value)}
                        placeholder="Nouveau nom de brigade"
                        className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewBrigadeName}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewBrigadeName(false)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Users className="h-4 w-4" />
                  Effectif
                </label>
                <input
                  type="number"
                  value={formData.effectif}
                  onChange={(e) => handleInputChange('effectif', e.target.value)}
                  placeholder="Effectif de la brigade"
                  min="0"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>
            </div>

            {/* Relations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Relations
              </h3>

              {/* Specialite */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <BookOpen className="h-4 w-4" />
                  Spécialité
                </label>
                <select 
                  value={formData.specialite || ""} 
                  onChange={(e) => handleInputChange('specialite', e.target.value || null)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                >
                  <option value="">Sélectionnez une spécialité</option>
                  {specialites.map((specialite) => (
                    <option key={specialite.documentId} value={specialite.documentId}>
                      {specialite.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Stage
                </label>
                <select 
                  value={formData.stage || ""} 
                  onChange={(e) => handleInputChange('stage', e.target.value || null)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                >
                  <option value="">Sélectionnez un stage</option>
                  {stages.map((stage) => (
                    <option key={stage.documentId} value={stage.documentId}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>

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
              disabled={loading.submit || !formData.year || !formData.brigade_name}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading.submit && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {editingBrigade ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}