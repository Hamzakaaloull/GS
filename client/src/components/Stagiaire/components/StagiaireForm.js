// components/StagiaireForm.js
"use client";
import React from "react";
import { X, User, IdCard, Calendar, Phone, Droplets, Camera } from "lucide-react";

export default function StagiaireForm({
  open,
  onClose,
  onSubmit,
  editingStagiaire,
  loading,
  formData,
  setFormData,
  handleImageChange,
  specialites,
  stages,
  brigades,
  grades
}) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  if (!open) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // دالة لاستخراج السنة من التاريخ
  const getYearFromDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).getFullYear();
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingStagiaire ? "Modifier le stagiaire" : "Ajouter un nouveau stagiaire"}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile & Personal Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-2xl font-medium border-2 border-border overflow-hidden">
                    {formData.profile instanceof File ? (
                      <img 
                        src={URL.createObjectURL(formData.profile)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : formData.profile && formData.profile.url ? (
                      <img 
                        src={`${API_URL}${formData.profile.url}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <User className="h-12 w-12" />
                    )}
                  </div>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="absolute bottom-2 right-2 bg-sidebar-primary rounded-full p-2 border-2 border-card">
                      <Camera className="h-4 w-4 text-sidebar-primary-foreground" />
                    </div>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Cliquez sur l'icône pour changer la photo
                </p>
              </div>

              {/* Required Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                  Informations obligatoires
                </h3>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <IdCard className="h-4 w-4" />
                    CIN *
                  </label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={(e) => handleInputChange('cin', e.target.value)}
                    placeholder="Numéro CIN"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <IdCard className="h-4 w-4" />
                    MLE *
                  </label>
                  <input
                    type="text"
                    value={formData.mle}
                    onChange={(e) => handleInputChange('mle', e.target.value)}
                    placeholder="Numéro MLE"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <User className="h-4 w-4" />
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Nom de famille"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <User className="h-4 w-4" />
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Prénom"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Columns - Additional Info & Relations */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                  Informations personnelles
                </h3>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    Grade *
                  </label>
                  <select 
                  required
                    value={formData.grade} 
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  >
                    <option value="">Sélectionnez un grade</option>
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Calendar className="h-4 w-4" />
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.date_naissance}
                onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Laisser vide si non spécifié
              </p>
            </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Numéro de téléphone"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Droplets className="h-4 w-4" />
                    Groupe sanguin
                  </label>
                  <input
                    type="text"
                    value={formData.groupe_sanguaine}
                    onChange={(e) => handleInputChange('groupe_sanguaine', e.target.value)}
                    placeholder="Groupe sanguin"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  />
                </div>
              </div>

              {/* Relations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                  Relations
                </h3>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    Spécialité
                  </label>
                               <select 
  value={formData.specialite || ""} 
  onChange={(e) => handleInputChange('specialite', e.target.value || null)}
  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
>
  <option value="">Sélectionnez une spécialité</option>
  {specialites.map((specialite) => (
    <option key={specialite.documentId} value={specialite.documentId}>
      {specialite.name}
    </option>
  ))}
</select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    Stage
                  </label>
                  <select 
                    value={formData.stage || ""} 
                    onChange={(e) => handleInputChange('stage', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  >
                    <option value="">Sélectionnez un stage</option>
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    Brigade
                  </label>
                  <select 
                    value={formData.brigade || ""} 
                    onChange={(e) => handleInputChange('brigade', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                  >
                    <option value="">Sélectionnez une brigade</option>
                    {brigades.map((brigade) => (
                      <option key={brigade.id} value={brigade.id}>
                        {brigade.brigade_name?.nom || 'Sans nom'} {brigade.year ? `(${getYearFromDate(brigade.year)})` : ''}
                      </option>
                    ))}
                  </select>
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
              className="flex-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg hover:bg-sidebar-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading.submit && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {editingStagiaire ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}