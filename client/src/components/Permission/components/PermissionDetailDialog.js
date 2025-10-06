// app/permissions/components/PermissionDetailDialog.js
"use client";
import React, { useState, useMemo } from "react";
import { X, Calendar, Users, User, IdCard, MapPin, Search } from "lucide-react";

export default function PermissionDetailDialog({
  open,
  onClose,
  permission,
  API_URL
}) {
  const [searchStagiaire, setSearchStagiaire] = useState("");

  // Filter stagiaires based on search
  const filteredStagiaires = useMemo(() => {
    if (!permission?.stagiaires) return [];
    if (!searchStagiaire) return permission.stagiaires;
    
    return permission.stagiaires.filter(stagiaire => 
      (stagiaire.mle?.toString() || '').toLowerCase().includes(searchStagiaire.toLowerCase()) ||
      (stagiaire.first_name?.toLowerCase() || '').includes(searchStagiaire.toLowerCase()) ||
      (stagiaire.last_name?.toLowerCase() || '').includes(searchStagiaire.toLowerCase()) ||
      (stagiaire.cin?.toString() || '').includes(searchStagiaire)
    );
  }, [permission?.stagiaires, searchStagiaire]);

  if (!open || !permission) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      const date = new Date(dateString);
      date.setDate(date.getDate() + 1); // Add 1 day for display only
      return date.toLocaleDateString('fr-FR');
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
            Détails de la Permission
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
          {/* Permission Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {permission.type}
              </h3>
              <p className="text-muted-foreground mt-1">
                Informations complètes de la permission
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Permission Information */}
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
                  Informations de la permission
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Date de début</span>
                    </div>
                    <span className="font-medium text-foreground">{formatDate(permission.start_date)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Date de fin</span>
                    </div>
                    <span className="font-medium text-foreground">{formatDate(permission.end_date)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Durée</span>
                    </div>
                    <span className="font-medium text-foreground">{permission.duration} jours</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Type</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      permission.type === "Permission ordinaire" ? "bg-blue-100 text-blue-800" :
                      permission.type === "Permission exceptionnelle" ? "bg-green-100 text-green-800" :
                      permission.type === "Permission de longue durée" ? "bg-yellow-100 text-yellow-800" :
                      permission.type === "Permission pour convenances personnelles" ? "bg-purple-100 text-purple-800" :
                      permission.type === "Permission de convalescence" ? "bg-red-100 text-red-800" :
                      permission.type === "Permission pour raisons familiales graves" ? "bg-pink-100 text-pink-800" :
                      permission.type === "Permission libérale" ? "bg-indigo-100 text-indigo-800" :
                      permission.type === "Permission d'éloignement" ? "bg-orange-100 text-orange-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {permission.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stagiaires Summary */}
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
                  <Users className="inline h-5 w-5 mr-2" />
                  Stagiaires concernés ({permission.stagiaires?.length || 0})
                </h4>
                
                <div className="space-y-3">
                  {permission.stagiaires?.slice(0, 3).map((stagiaire) => (
                    <div key={stagiaire.documentId} className="flex items-center gap-3">
                      {stagiaire.profile ? (
                        <img 
                          src={`${API_URL}${stagiaire.profile.formats?.thumbnail?.url || stagiaire.profile.url}`}
                          alt={`${stagiaire.first_name} ${stagiaire.last_name}`}
                          className="w-10 h-10 rounded-lg object-cover border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-foreground">
                          {stagiaire.last_name} {stagiaire.first_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          MLE: {stagiaire.mle}
                        </div>
                      </div>
                    </div>
                  ))}
                  {permission.stagiaires?.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      + {permission.stagiaires.length - 3} autre(s) stagiaire(s)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stagiaires Details with Search */}
          {permission.stagiaires && permission.stagiaires.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-foreground">
                  Détails des stagiaires ({filteredStagiaires.length})
                </h4>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un stagiaire..."
                    value={searchStagiaire}
                    onChange={(e) => setSearchStagiaire(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground text-sm"
                  />
                </div>
              </div>
              
              {filteredStagiaires.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Aucun stagiaire trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStagiaires.map((stagiaire) => (
                    <div key={stagiaire.documentId} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {stagiaire.profile ? (
                          <img 
                            src={`${API_URL}${stagiaire.profile.formats?.thumbnail?.url || stagiaire.profile.url}`}
                            alt={`${stagiaire.first_name} ${stagiaire.last_name}`}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                            <User className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-foreground">
                            {stagiaire.last_name} {stagiaire.first_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            MLE: {stagiaire.mle}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <IdCard className="h-3 w-3 text-muted-foreground" />
                          <span>CIN: {stagiaire.cin || 'Non spécifié'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Grade: {stagiaire.grade || 'Non spécifié'}</span>
                        </div>
                        {stagiaire.brigade?.nom && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>Brigade: {stagiaire.brigade.nom}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* System Information */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
              Informations système
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Créé le</p>
                <p className="text-foreground font-medium">{formatDate(permission.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Modifié le</p>
                <p className="text-foreground font-medium">{formatDate(permission.updatedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Publié le</p>
                <p className="text-foreground font-medium">{formatDate(permission.publishedAt)}</p>
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