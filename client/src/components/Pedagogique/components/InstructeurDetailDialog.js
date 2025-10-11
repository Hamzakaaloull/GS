// components/Pedagogique/components/InstructeurDetailDialog.js
"use client";
import React from "react";
import { X, User, Phone, MapPin, Calendar, Award, BookOpen } from "lucide-react";

export default function InstructeurDetailDialog({
  open,
  onClose,
  instructeur
}) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  if (!open || !instructeur) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Détails de l'Instructeur
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Photo et informations principales */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary">
              {instructeur.profile ? (
                <img
                  src={`${API_URL}${instructeur.profile.url}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">
                {instructeur.first_name} {instructeur.last_name}
              </h3>
              <p className="text-muted-foreground mt-1">
                {instructeur.grade || 'Grade non spécifié'}
              </p>
              {instructeur.mle && (
                <p className="text-muted-foreground">MLE: {instructeur.mle}</p>
              )}
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Informations professionnelles
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade:</span>
                    <span className="font-medium text-foreground">
                      {instructeur.grade || 'Non spécifié'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MLE:</span>
                    <span className="font-medium text-foreground">
                      {instructeur.mle || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spécialité:</span>
                    <span className="font-medium text-foreground">
                      {instructeur.specialite?.name || 'Aucune'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Informations personnelles
                </h4>
                <div className="space-y-2">
                  {instructeur.birth_day && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de naissance:</span>
                      <span className="font-medium text-foreground">
                        {new Date(instructeur.birth_day).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact
                </h4>
                <div className="space-y-2">
                  {instructeur.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Téléphone:</span>
                      <span className="font-medium text-foreground">
                        {instructeur.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {instructeur.adress && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </h4>
                  <p className="text-foreground">{instructeur.adress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques (si disponibles) */}
          <div className="bg-primary/10 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Statistiques
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Remarques</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Sujets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Disponibilité</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}