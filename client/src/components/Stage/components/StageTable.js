// app/stages/components/StageTable.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, Calendar, Users, BookOpen, MapPin } from "lucide-react";

export default function StageTable({
  stages,
  loading,
  handleEdit,
  handleDelete,
  handleShowDetail,
  loadingDelete,
  selectedStage,
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
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun stage trouvé</p>
      </div>
    );
  }

  const toggleDropdown = (documentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === documentId ? null : documentId);
  };

  const handleAction = (action, stage, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch (action) {
      case 'view':
        handleShowDetail(stage);
        break;
      case 'edit':
        handleEdit(stage);
        break;
      case 'delete':
        handleDelete(stage);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  // Create date in local timezone without timezone conversion
  const date = new Date(dateString);
  // Adjust for timezone offset
  const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  
  return adjustedDate.toLocaleDateString('fr-FR');
};

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Nom</th>
            <th className="text-left p-4 font-semibold text-foreground">Date de début</th>
            <th className="text-left p-4 font-semibold text-foreground">Date de fin</th>
            <th className="text-left p-4 font-semibold text-foreground">Stagiaires</th>
            <th className="text-left p-4 font-semibold text-foreground">Spécialités</th>
            <th className="text-left p-4 font-semibold text-foreground">Brigades</th>
            <th className="text-right p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stages.map((stage) => (
            <tr 
              key={stage.documentId} 
              className="hover:bg-muted/30 transition-colors"
            >
              {/* Name */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium text-foreground">
                      {stage.name}
                    </div>
                    {stage.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {stage.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              
              {/* Start Date */}
              <td className="p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(stage.start_date)}
                </div>
              </td>
              
              {/* End Date */}
              <td className="p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(stage.end_date)}
                </div>
              </td>
              
              {/* Stagiaires */}
              <td className="p-4">
                <button
                  onClick={() => handleShowDetail(stage)}
                  className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 daek:focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:cursor-pointer focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">
                    {stage.stagiaires?.length  || 0}
                  </span>
                </button>
              </td>
              
              {/* Specialites */}
              <td className="p-4">
                <button
                  onClick={() => handleShowDetail(stage)}
                  className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:cursor-pointer  focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">
                    {stage.specialites?.length || 0}
                  </span>
                </button>
              </td>
              
              {/* Brigades */}
              <td className="p-4">
                <button
                  onClick={() => handleShowDetail(stage)}
                  className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:cursor-pointer focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">
                    {stage.brigades?.length || 0}
                  </span>
                </button>
              </td>
              
              {/* Actions */}
              <td className="p-4">
                <div className="flex justify-end">
                  <div 
                    className="relative" 
                    ref={el => dropdownRefs.current[stage.documentId] = el}
                  >
                    <button
                      onClick={(e) => toggleDropdown(stage.documentId, e)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === stage.documentId && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleAction('view', stage, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <button
                            onClick={(e) => handleAction('edit', stage, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleAction('delete', stage, e)}
                            disabled={loadingDelete}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left disabled:opacity-50"
                          >
                            {loadingDelete && selectedStage?.documentId === stage.documentId ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-destructive"></div>
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