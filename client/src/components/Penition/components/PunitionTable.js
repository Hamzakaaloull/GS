// app/punitions/components/PunitionTable.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, Users } from "lucide-react";

export default function PunitionTable({
  punitions,
  loading,
  API_URL,
  handleEdit,
  handleDelete,
  handleShowDetail,
  loadingDelete,
  selectedPunition,
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
function addDays(dateLike, days = 1) {
  const d = new Date(dateLike); // نسخ التاريخ (يتعامل مع string أو Date)
  d.setDate(d.getDate() + days);
  return d;
}
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sidebar-primary"></div>
      </div>
    );
  }

  if (punitions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune punition trouvée</p>
      </div>
    );
  }

  const toggleDropdown = (documentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === documentId ? null : documentId);
  };

  const handleAction = (action, punition, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch (action) {
      case 'view':
        handleShowDetail(punition);
        break;
      case 'edit':
        handleEdit(punition);
        break;
      case 'delete':
        handleDelete(punition);
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
            <th className="text-left p-4 font-semibold text-foreground">Motif</th>
            <th className="text-left p-4 font-semibold text-foreground">Description</th>
            <th className="text-left p-4 font-semibold text-foreground">Stagiaires</th>
            <th className="text-right p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {punitions.map((punition) => (
            <tr 
              key={punition.documentId} 
              className="hover:bg-muted/30 transition-colors"
            >
              {/* Date */}
              <td className="p-4">
                <div className="text-foreground font-medium">
                  {formatDate(addDays(punition.date , 1))}
                </div>
              </td>
              
              {/* Motif */}
              <td className="p-4">
                <div className="max-w-xs">
                  <p className="text-foreground font-medium line-clamp-2">
                    {punition.motif || 'N/A'}
                  </p>
                </div>
              </td>
              
              {/* Description */}
              <td className="p-4">
                <div className="max-w-md">
                  <p className="text-foreground line-clamp-2">
                    {punition.description || 'Aucune description'}
                  </p>
                </div>
              </td>
              
              {/* Stagiaires Count */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {punition.stagiaires?.length || 0}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    stagiaire(s)
                  </span>
                </div>
              </td>
              
              {/* Actions */}
              <td className="p-4">
                <div className="flex justify-end">
                  <div 
                    className="relative" 
                    ref={el => dropdownRefs.current[punition.documentId] = el}
                  >
                    <button
                      onClick={(e) => toggleDropdown(punition.documentId, e)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === punition.documentId && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleAction('view', punition, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <button
                            onClick={(e) => handleAction('edit', punition, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleAction('delete', punition, e)}
                            disabled={loadingDelete}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left disabled:opacity-50"
                          >
                            {loadingDelete && selectedPunition?.documentId === punition.documentId ? (
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