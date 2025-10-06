// app/punitions/components/PunitionDetailDialog.js
"use client";
import React, { useState, useMemo } from "react";
import { X, Calendar, User, Users, Search } from "lucide-react";

export default function PunitionDetailDialog({
  open,
  onClose,
  punition,
  API_URL
}) {
  const [searchStagiaire, setSearchStagiaire] = useState("");

  // Filter stagiaires based on search
  const filteredStagiaires = useMemo(() => {
    if (!punition || !punition.stagiaires) return [];
    if (!searchStagiaire) return punition.stagiaires;
    
    return punition.stagiaires.filter(stagiaire => 
      (stagiaire.mle?.toString() || '').toLowerCase().includes(searchStagiaire.toLowerCase()) ||
      (stagiaire.first_name?.toLowerCase() || '').includes(searchStagiaire.toLowerCase()) ||
      (stagiaire.last_name?.toLowerCase() || '').includes(searchStagiaire.toLowerCase()) ||
      (stagiaire.cin?.toString() || '').includes(searchStagiaire)
    );
  }, [punition, searchStagiaire]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (!open || !punition) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Détails de la Punition
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
          {/* Punition Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
                  Informations de la punition
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Date</span>
                    </div>
                    <span className="font-medium text-foreground">{formatDate(punition.date)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Motif</span>
                    </div>
                    <span className="font-medium text-foreground">{punition.motif || 'Non spécifié'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Nombre de stagiaires</span>
                    </div>
                    <span className="font-medium text-foreground">{punition.stagiaires?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
                  Description
                </h4>
                
                <div className="space-y-4">
                  <p className="text-foreground">
                    {punition.description || 'Aucune description fournie'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stagiaires List with Search */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
              Stagiaires concernés ({punition.stagiaires?.length || 0})
            </h4>
            
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un stagiaire..."
                  value={searchStagiaire}
                  onChange={(e) => setSearchStagiaire(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground"
                />
              </div>
            </div>

            {/* Stagiaires Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStagiaires.length === 0 ? (
                <div className="col-span-2 text-center py-4 text-muted-foreground">
                  {punition.stagiaires?.length === 0 
                    ? "Aucun stagiaire associé à cette punition" 
                    : "Aucun stagiaire trouvé"}
                </div>
              ) : (
                filteredStagiaires.map((stagiaire) => (
                  <div key={stagiaire.documentId} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
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
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground">
                          {stagiaire.last_name} {stagiaire.first_name}
                        </h5>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>MLE: {stagiaire.mle}</div>
                          {stagiaire.cin && <div>CIN: {stagiaire.cin}</div>}
                          {stagiaire.grade && <div>Grade: {stagiaire.grade}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
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