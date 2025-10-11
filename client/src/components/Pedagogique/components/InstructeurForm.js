// components/Pedagogique/components/InstructeurForm.js
"use client";
import React, { useState, useEffect } from "react";
import { X, User, Phone, MapPin, Calendar, Award, Upload, Trash2 } from "lucide-react";

export default function InstructeurForm({
  open,
  onClose,
  onSuccess,
  instructeur,
  specialites = []
}) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mle: "",
    grade: "",
    specialite: null,
    phone: "",
    birth_day: "",
    adress: "",
    profile: null
  });
  const [uploadingProfile, setUploadingProfile] = useState(false);

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

  useEffect(() => {
    if (instructeur) {
      setFormData({
        first_name: instructeur.first_name || "",
        last_name: instructeur.last_name || "",
        mle: instructeur.mle || "",
        grade: instructeur.grade || "",
        specialite: instructeur.specialite?.documentId || null,
        phone: instructeur.phone || "",
        birth_day: instructeur.birth_day ? new Date(instructeur.birth_day).toISOString().split('T')[0] : "",
        adress: instructeur.adress || "",
        profile: instructeur.profile || null
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        mle: "",
        grade: "",
        specialite: null,
        phone: "",
        birth_day: "",
        adress: "",
        profile: null
      });
    }
  }, [instructeur]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProfile(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data && data[0]) {
        setFormData(prev => ({ ...prev, profile: data[0] }));
      }
    } catch (error) {
      console.error('Error uploading profile:', error);
      showAlert('Erreur lors du téléchargement de la photo', 'error');
    } finally {
      setUploadingProfile(false);
    }
  };

  const removeProfile = () => {
    setFormData(prev => ({ ...prev, profile: null }));
  };

  const showAlert = (message, type = 'info') => {
    const event = new CustomEvent('showSnackbar', {
      detail: { message, severity: type }
    });
    window.dispatchEvent(event);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = instructeur
        ? `${API_URL}/api/instructeurs/${instructeur.documentId}`
        : `${API_URL}/api/instructeurs`;

      const method = instructeur ? "PUT" : "POST";

      // بناء البيانات بنفس طريقة StagiaireForm
      const requestData = {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          mle: formData.mle,
          grade: formData.grade,
          phone: formData.phone,
          birth_day: formData.birth_day || null,
          adress: formData.adress
        }
      };

      // إضافة العلاقات إذا كانت موجودة
      if (formData.specialite) {
        requestData.data.specialite = formData.specialite;
      }

      if (formData.profile) {
        requestData.data.profile = formData.profile.id;
      }

      console.log("Sending data to API:", JSON.stringify(requestData, null, 2));
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await res.json();
      
      if (res.ok) {
        onSuccess();
        onClose();
        showAlert(instructeur ? "Instructeur modifié avec succès" : "Instructeur créé avec succès", 'success');
      } else {
        console.error('API Error Response:', responseData);
        throw new Error(responseData.error?.message || 'Erreur lors de l\'opération');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showAlert(error.message || 'Erreur lors de l\'enregistrement', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {instructeur ? "Modifier l'instructeur" : "Ajouter un instructeur"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Informations personnelles
              </h3>

              {/* Photo de profil */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <User className="h-4 w-4" />
                  Photo de profil
                </label>
                <div className="flex items-center gap-4">
                  {formData.profile ? (
                    <div className="relative">
                      <img
                        src={`${API_URL}${formData.profile.url}`}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border border-border"
                      />
                      <button
                        type="button"
                        onClick={removeProfile}
                        className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border border-border">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileUpload}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                    />
                    {uploadingProfile && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                        Téléchargement en cours...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prénom */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <User className="h-4 w-4" />
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Prénom de l'instructeur"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  required
                />
              </div>

              {/* Nom */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <User className="h-4 w-4" />
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Nom de l'instructeur"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  required
                />
              </div>

              {/* MLE */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Award className="h-4 w-4" />
                  MLE
                </label>
                <input
                  type="text"
                  value={formData.mle}
                  onChange={(e) => handleInputChange('mle', e.target.value)}
                  placeholder="Numéro MLE"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>

              {/* Grade */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Award className="h-4 w-4" />
                  Grade
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                >
                  <option value="">Sélectionnez un grade</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Colonne droite - Informations de contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Informations de contact
              </h3>

              {/* Téléphone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+212 6 00 00 00 00"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>

              {/* Date de naissance */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.birth_day}
                  onChange={(e) => handleInputChange('birth_day', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </label>
                <textarea
                  value={formData.adress}
                  onChange={(e) => handleInputChange('adress', e.target.value)}
                  placeholder="Adresse complète"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>

              {/* Spécialité */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Award className="h-4 w-4" />
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
            </div>
          </div>

          {/* Actions */}
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
              disabled={loading || !formData.first_name || !formData.last_name}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {instructeur ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}