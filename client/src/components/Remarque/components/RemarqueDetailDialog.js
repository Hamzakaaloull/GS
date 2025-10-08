"use client";
import React from "react";
import { X, User, Calendar, FileText, Award, PieChart } from "lucide-react";
import { formatDateForDisplay } from '@/hooks/dateUtils';

export default function RemarqueDetailDialog({
  open,
  onClose,
  remarque,
  getStagiaireStats
}) {
  if (!open || !remarque) return null;

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Get statistics for this specific stagiaire
  const stagiaireStats = getStagiaireStats(remarque.stagiaire?.documentId);
  const totalStagiaire = stagiaireStats.positive + stagiaireStats.negative;
  const positivePercentage = totalStagiaire > 0 ? Math.round((stagiaireStats.positive / totalStagiaire) * 100) : 0;
  const negativePercentage = totalStagiaire > 0 ? Math.round((stagiaireStats.negative / totalStagiaire) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Détails de la Remarque
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
          {/* Header Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xl font-medium">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Remarque #{remarque.documentId}
              </h3>
              <p className="text-muted-foreground">
                Créée le {formatDateForDisplay(remarque.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">
                  Informations de base
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-foreground font-medium">{formatDateForDisplay(remarque.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(remarque.type)}`}>
                        {remarque.type || 'Non spécifié'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stagiaire Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">
                  Stagiaire
                </h4>
                
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nom & Prénom</p>
                    <p className="text-foreground font-medium">
                      {remarque.stagiaire?.last_name} {remarque.stagiaire?.first_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MLE: {remarque.stagiaire?.mle} | CIN: {remarque.stagiaire?.cin}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Grade: {remarque.stagiaire?.grade}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stagiaire Statistics */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Statistiques du Stagiaire
              </h4>
              
              <div className="bg-muted/30 rounded-lg p-4">
                {/* Pie Chart */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Positive slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray={`${positivePercentage * 2.513} ${100 * 2.513}`}
                      />
                      {/* Negative slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#ef4444"
                        strokeWidth="20"
                        strokeDasharray={`${negativePercentage * 2.513} ${100 * 2.513}`}
                        strokeDashoffset={`${-positivePercentage * 2.513}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">{totalStagiaire}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-foreground">Positives</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">{stagiaireStats.positive}</div>
                      <div className="text-xs text-muted-foreground">{positivePercentage}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-foreground">Négatives</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">{stagiaireStats.negative}</div>
                      <div className="text-xs text-muted-foreground">{negativePercentage}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content & Result */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Contenu
              </h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap">
                  {remarque.content || 'Aucun contenu'}
                </p>
              </div>
            </div>

            {remarque.result && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">
                  Résultat
                </h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap">
                    {remarque.result}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* System Information */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
              Informations système
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Créé le</p>
                <p className="text-foreground font-medium">{formatDateForDisplay(remarque.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Modifié le</p>
                <p className="text-foreground font-medium">{formatDateForDisplay(remarque.updatedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Publié le</p>
                <p className="text-foreground font-medium">{formatDateForDisplay(remarque.publishedAt)}</p>
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