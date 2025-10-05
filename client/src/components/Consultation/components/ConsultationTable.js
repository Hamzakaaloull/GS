// app/consultations/components/ConsultationTable.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, FileText, User, Calendar } from "lucide-react";

export default function ConsultationTable({
  consultations,
  loading,
  API_URL,
  handleEdit,
  handleDelete,
  handleShowDetail,
  loadingDelete,
  selectedConsultation,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = Object.values(dropdownRefs.current).every(ref => {
        return ref && !ref.contains(event.target);
      });
      
      if (clickedOutside) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sidebar-primary"></div>
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune consultation trouvée</p>
      </div>
    );
  }

  const toggleDropdown = (documentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === documentId ? null : documentId);
  };

  const handleAction = (action, consultation, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch (action) {
      case 'view':
        handleShowDetail(consultation);
        break;
      case 'edit':
        handleEdit(consultation);
        break;
      case 'delete':
        handleDelete(consultation);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Date</th>
            <th className="text-left p-4 font-semibold text-foreground">Note</th>
            <th className="text-left p-4 font-semibold text-foreground">Fichier</th>
            <th className="text-left p-4 font-semibold text-foreground">Stagiaire</th>
            <th className="text-left p-4 font-semibold text-foreground">MLE</th>
            <th className="text-right p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {consultations.map((consultation) => (
            <tr 
              key={consultation.documentId} 
              className="hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => handleShowDetail(consultation)}
            >
              {/* Date */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {formatDate(consultation.date)}
                  </span>
                </div>
              </td>
              
              {/* Note */}
              <td className="p-4">
                <div className="max-w-xs">
                  <p className="text-foreground line-clamp-2">
                    {consultation.note || 'Aucune note'}
                  </p>
                </div>
              </td>
              
              {/* File */}
              <td className="p-4">
                {consultation.file ? (
                  <a 
                    href={`${API_URL}${consultation.file.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sidebar-primary hover:text-sidebar-primary/80 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Voir le fichier</span>
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm">Aucun fichier</span>
                )}
              </td>
              
              {/* Stagiaire */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {consultation.stagiaire?.profile ? (
                    <img 
                      src={`${API_URL}${consultation.stagiaire.profile.formats?.thumbnail?.url || consultation.stagiaire.profile.url}`}
                      alt={`${consultation.stagiaire.first_name} ${consultation.stagiaire.last_name}`}
                      className="w-8 h-8 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-foreground">
                      {consultation.stagiaire?.last_name} {consultation.stagiaire?.first_name}
                    </div>
                  </div>
                </div>
              </td>
              
              {/* MLE */}
              <td className="p-4 text-muted-foreground font-mono">
                {consultation.stagiaire?.mle || 'N/A'}
              </td>
              
              {/* Actions */}
              <td className="p-4">
                <div className="flex justify-end">
                  <div 
                    className="relative" 
                    ref={el => dropdownRefs.current[consultation.documentId] = el}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(consultation.documentId, e);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === consultation.documentId && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleAction('view', consultation, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <button
                            onClick={(e) => handleAction('edit', consultation, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleAction('delete', consultation, e)}
                            disabled={loadingDelete}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left disabled:opacity-50"
                          >
                            {loadingDelete && selectedConsultation?.documentId === consultation.documentId ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}