// app/brigades/components/BrigadeDetailDialog.js
"use client";
import React, { useState } from "react";
import { X, MapPin, Users, BookOpen, Calendar, Search } from "lucide-react";

export default function BrigadeDetailDialog({
  open,
  onClose,
  brigade,
}) {
  const [activeTab, setActiveTab] = useState("stagiaires");
  const [searchQuery, setSearchQuery] = useState("");

  if (!open || !brigade) return null;

  const getFilteredItems = () => {
    if (activeTab === 'stagiaires') {
      const items = brigade.stagiaires || [];
      return items.filter(item =>
        item.mle?.toString().includes(searchQuery) ||
        item.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  };

  const renderItem = (item) => {
    switch (activeTab) {
      case 'stagiaires':
        return (
          <div key={item.documentId} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-foreground">
                {item.last_name} {item.first_name}
              </div>
              <div className="text-sm text-muted-foreground">
                MLE: {item.mle} • CIN: {item.cin || 'N/A'} • Grade: {item.grade || 'N/A'}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Détails de la Brigade
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
          {/* Brigade Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Informations de la Brigade</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium text-foreground">{brigade.nom}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Effectif</p>
                    <p className="font-medium text-foreground">{brigade.effectif || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 rounded-lg p-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Relations</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-secondary-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Spécialité</p>
                    <p className="font-medium text-foreground">
                      {brigade.specialite?.name || 'Aucune'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stage</p>
                    <p className="font-medium text-foreground">
                      {brigade.stage?.name || 'Aucun'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-lg font-medium text-foreground mb-2">Statistiques</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stagiaires assignés</p>
                    <p className="font-medium text-foreground">{brigade.stagiaires?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Relations */}
          <div className="bg-card border border-border rounded-lg">
            <div className="border-b border-border">
              <div className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("stagiaires")}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${
                    activeTab === "stagiaires"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Stagiaires ({brigade.stagiaires?.length || 0})
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher dans les stagiaires..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {getFilteredItems().length > 0 ? (
                  getFilteredItems().map(renderItem)
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Aucun stagiaire trouvé
                  </div>
                )}
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