// components/StagiaireDetailDialog.js
"use client";
import React from "react";
import { X, User, IdCard, Calendar, Phone, Droplets, BookOpen, Users, MapPin, Mail } from "lucide-react";

export default function StagiaireDetailDialog({
  open,
  onClose,
  stagiaire,
  API_URL
}) {
  if (!open || !stagiaire) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Détails du Stagiaire
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
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            {stagiaire.profile ? (
              <img 
                src={`${API_URL}${stagiaire.profile.formats?.thumbnail?.url || stagiaire.profile.url}`}
                alt={`${stagiaire.first_name} ${stagiaire.last_name}`}
                className="w-24 h-24 rounded-lg object-cover border-2 border-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-2xl font-medium">
                <User className="h-12 w-12" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-foreground">
                {stagiaire.last_name} {stagiaire.first_name}
              </h3>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">MLE: </span>
                  <span className="font-medium text-foreground">{stagiaire.mle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">CIN: </span>
                  <span className="font-medium text-foreground">{stagiaire.cin || 'Non spécifié'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
                  Informations personnelles
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Grade</span>
                    </div>
                    <span className="font-medium text-foreground">{stagiaire.grade || 'Non spécifié'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Date de naissance</span>
                    </div>
                    <span className="font-medium text-foreground">{formatDate(stagiaire.date_naissance)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Téléphone</span>
                    </div>
                    <span className="font-medium text-foreground">{stagiaire.phone || 'Non spécifié'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Groupe sanguin</span>
                    </div>
                    <span className="font-medium text-foreground">{stagiaire.groupe_sanguaine || 'Non spécifié'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
                  Informations académiques
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Spécialité</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {stagiaire.specialite?.name || 'Non spécifié'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Stage</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {stagiaire.stage?.name || 'Non spécifié'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Brigade</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {stagiaire.brigade?.nom || 'Non spécifié'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
              Informations système
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Créé le</p>
                <p className="text-foreground font-medium">{formatDate(stagiaire.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Modifié le</p>
                <p className="text-foreground font-medium">{formatDate(stagiaire.updatedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Publié le</p>
                <p className="text-foreground font-medium">{formatDate(stagiaire.publishedAt)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}