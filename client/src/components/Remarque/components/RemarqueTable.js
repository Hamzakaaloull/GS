"use client";
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, User } from "lucide-react";
import { formatDateForDisplay } from '@/hooks/dateUtils';

export default function RemarqueTable({
  remarques,
  loading,
  handleEdit,
  handleDelete,
  handleShowDetail,
  loadingDelete,
  selectedRemarque,
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

  if (remarques.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune remarque trouvée</p>
      </div>
    );
  }

  const toggleDropdown = (documentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === documentId ? null : documentId);
  };

  const handleAction = (action, remarque, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch (action) {
      case 'view':
        handleShowDetail(remarque);
        break;
      case 'edit':
        handleEdit(remarque);
        break;
      case 'delete':
        handleDelete(remarque);
        break;
      default:
        break;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Date</th>
            <th className="text-left p-4 font-semibold text-foreground">Stagiaire</th>
            <th className="text-left p-4 font-semibold text-foreground">Contenu</th>
            <th className="text-left p-4 font-semibold text-foreground">Résultat</th>
            <th className="text-left p-4 font-semibold text-foreground">Type</th>
            <th className="text-right p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {remarques.map((remarque) => (
            <tr 
              key={remarque.documentId} 
              className="hover:bg-muted/30 transition-colors"
            >
              {/* Date */}
              <td className="p-4 text-muted-foreground">
                 {formatDateForDisplay(remarque.date)}
              </td>
              
              {/* Stagiaire */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-sm font-medium">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {remarque.stagiaire?.last_name} {remarque.stagiaire?.first_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      MLE: {remarque.stagiaire?.mle}
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Content */}
              <td className="p-4">
                <div className="max-w-xs truncate text-foreground">
                  {remarque.content || 'N/A'}
                </div>
              </td>
              
              {/* Result */}
              <td className="p-4">
                <div className="max-w-xs truncate text-muted-foreground">
                  {remarque.result || 'N/A'}
                </div>
              </td>
              
              {/* Type */}
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(remarque.type)}`}>
                  {remarque.type || 'N/A'}
                </span>
              </td>
              
              {/* Actions */}
              <td className="p-4">
                <div className="flex justify-end">
                  <div 
                    className="relative" 
                    ref={el => dropdownRefs.current[remarque.documentId] = el}
                  >
                    <button
                      onClick={(e) => toggleDropdown(remarque.documentId, e)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === remarque.documentId && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleAction('view', remarque, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <button
                            onClick={(e) => handleAction('edit', remarque, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleAction('delete', remarque, e)}
                            disabled={loadingDelete && selectedRemarque?.documentId === remarque.documentId}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left disabled:opacity-50"
                          >
                            {loadingDelete && selectedRemarque?.documentId === remarque.documentId ? (
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