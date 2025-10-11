// components/Pedagogique/components/SubjectDetailModal.js
"use client";
import React from "react";
import { X, Download, FileText, BookOpen, Calendar, User, Building, Users } from "lucide-react";

export default function SubjectDetailModal({ subject, onClose, onDownload }) {
  if (!subject) return null;

  const subjectData = subject.attributes || subject;
  const content = subjectData.content || [];
  const specialite = subject.attributes?.specialite?.data?.attributes || subject.specialite;

  const getFileIcon = (file) => {
    const extension = file.ext?.toLowerCase() || file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'xls':
      case 'xlsx':
        return '📈';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📎';
    }
  };

  const handleViewFile = (file) => {
    const fileUrl = file.url.startsWith('http') ? file.url : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${file.url}`;
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Détails de la matière
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
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Titre
                </h3>
                <p className="text-foreground font-medium text-lg">{subjectData.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  {subjectData.is_militaire ? (
                    <Building className="h-4 w-4" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  Type
                </h3>
                <p className="text-foreground">
                  {subjectData.is_militaire ? "Matière d'interarme" : "Spécialité"}
                </p>
              </div>

              {!subjectData.is_militaire && specialite && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Spécialité
                  </h3>
                  <p className="text-foreground">{specialite.name}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de création
                </h3>
                <p className="text-foreground">
                  {subjectData.createdAt ? new Date(subjectData.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dernière modification
                </h3>
                <p className="text-foreground">
                  {subjectData.updatedAt ? new Date(subjectData.updatedAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-foreground whitespace-pre-wrap">
                {subjectData.description || 'Aucune description disponible'}
              </p>
            </div>
          </div>

          {/* Documents */}
          {content.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents ({content.length})
              </h3>
              <div className="space-y-3">
                {content.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getFileIcon(file)}</span>
                      <div>
                        <p className="text-foreground font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.ext?.toUpperCase()} • {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Taille inconnue'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewFile(file)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                        title="Voir le fichier"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDownload(file)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarques instructeurs */}
          {subjectData.remark_instructeurs && subjectData.remark_instructeurs.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Remarques des instructeurs ({subjectData.remark_instructeurs.length})
              </h3>
              <div className="space-y-3">
                {subjectData.remark_instructeurs.map((remark, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                    <p className="text-foreground">{remark.content}</p>
                    {remark.instructeur && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Par {remark.instructeur.name} • {remark.date ? new Date(remark.date).toLocaleDateString('fr-FR') : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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