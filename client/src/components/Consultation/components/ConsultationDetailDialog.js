// app/consultations/components/ConsultationDetailDialog.js
"use client";
import React from "react";
import { X, Calendar, FileText, User, AlertCircle, Download } from "lucide-react";

export default function ConsultationDetailDialog({
  open,
  onClose,
  consultation,
  API_URL
}) {
  if (!open || !consultation) return null;

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
            Détails de la Consultation
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
          {/* Consultation Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Consultation du {formatDate(consultation.date)}
              </h3>
              <p className="text-muted-foreground mt-1">
                Informations complètes de la consultation médicale
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Consultation Information */}
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
                  Informations de la consultation
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Date</span>
                    </div>
                    <span className="font-medium text-foreground">{formatDate(consultation.date)}</span>
                  </div>

                  {consultation.file && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Document joint</span>
                      </div>
                      <a 
                        href={`${API_URL}${consultation.file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sidebar-primary hover:text-sidebar-primary/80 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">Télécharger</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stagiaire Information */}
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
                  Informations du stagiaire
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {consultation.stagiaire?.profile ? (
                      <img 
                        src={`${API_URL}${consultation.stagiaire.profile.formats?.thumbnail?.url || consultation.stagiaire.profile.url}`}
                        alt={`${consultation.stagiaire.first_name} ${consultation.stagiaire.last_name}`}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-foreground">
                        {consultation.stagiaire?.last_name} {consultation.stagiaire?.first_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        MLE: {consultation.stagiaire?.mle}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">CIN</p>
                      <p className="text-foreground font-medium">{consultation.stagiaire?.cin || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Grade</p>
                      <p className="text-foreground font-medium">{consultation.stagiaire?.grade || 'Non spécifié'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
              <AlertCircle className="inline h-5 w-5 mr-2" />
              Notes médicales
            </h4>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground whitespace-pre-wrap">
                {consultation.note || 'Aucune note disponible'}
              </p>
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
                <p className="text-foreground font-medium">{formatDate(consultation.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Modifié le</p>
                <p className="text-foreground font-medium">{formatDate(consultation.updatedAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Publié le</p>
                <p className="text-foreground font-medium">{formatDate(consultation.publishedAt)}</p>
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