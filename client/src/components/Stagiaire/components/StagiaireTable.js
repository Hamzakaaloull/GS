// components/StagiaireTable.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, User } from "lucide-react";

export default function StagiaireTable({
  stagiaires,
  loading,
  API_URL,
  handleEdit,
  handleDelete,
  handleShowDetail,
  loadingDelete,
  selectedStagiaire,
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

  if (stagiaires.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun stagiaire trouvé</p>
      </div>
    );
  }

  const toggleDropdown = (documentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === documentId ? null : documentId);
  };

  const handleAction = (action, stagiaire, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch (action) {
      case 'view':
        handleShowDetail(stagiaire);
        break;
      case 'edit':
        handleEdit(stagiaire);
        break;
      case 'delete':
        handleDelete(stagiaire);
        break;
      default:
        break;
    }
  };

  // دالة لتحويل التاريخ إلى سنة
  const getYearFromDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).getFullYear();
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Photo</th>
            <th className="text-left p-4 font-semibold text-foreground">Nom & Prénom</th>
            <th className="text-left p-4 font-semibold text-foreground">MLE</th>
            <th className="text-left p-4 font-semibold text-foreground">CIN</th>
            <th className="text-left p-4 font-semibold text-foreground">Grade</th>
            <th className="text-left p-4 font-semibold text-foreground">Spécialité</th>
            <th className="text-left p-4 font-semibold text-foreground">Stage</th>
            <th className="text-left p-4 font-semibold text-foreground">Brigade</th>
            <th className="text-left p-4 font-semibold text-foreground">Année</th>
            <th className="text-right p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stagiaires.map((stagiaire) => (
            <tr 
              key={stagiaire.documentId} 
              className="hover:bg-muted/30 transition-colors"
            >
              {/* Profile Photo */}
              <td className="p-4">
                <div 
                  className="flex items-center justify-center cursor-pointer"
                  onClick={() => handleShowDetail(stagiaire)}
                >
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
                </div>
              </td>
              
              {/* Name */}
              <td className="p-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleShowDetail(stagiaire)}
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {stagiaire.last_name} {stagiaire.first_name}
                    </div>
                  </div>
                </div>
              </td>
              
              {/* MLE */}
              <td className="p-4 text-muted-foreground font-mono">
                {stagiaire.mle}
              </td>
              
              {/* CIN */}
              <td className="p-4 text-muted-foreground">
                {stagiaire.cin}
              </td>
              
              {/* Grade */}
              <td className="p-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {stagiaire.grade || 'N/A'}
                </span>
              </td>
              
              {/* Specialite */}
              <td className="p-4 text-muted-foreground">
                {stagiaire.specialite?.name || 'N/A'}
              </td>
              
              {/* Stage */}
              <td className="p-4 text-muted-foreground">
                {stagiaire.stage?.name || 'N/A'}
              </td>
              
              {/* Brigade */}
              <td className="p-4 text-muted-foreground">
                {stagiaire.brigade?.brigade_name?.nom || 'N/A'}
              </td>

              {/* Year */}
              <td className="p-4 text-muted-foreground">
           {new Date(stagiaire.brigade?.year).getFullYear() + 1}
              </td>
              
              {/* Actions */}
              <td className="p-4">
                <div className="flex justify-end">
                  <div 
                    className="relative" 
                    ref={el => dropdownRefs.current[stagiaire.documentId] = el}
                  >
                    <button
                      onClick={(e) => toggleDropdown(stagiaire.documentId, e)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === stagiaire.documentId && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleAction('view', stagiaire, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <button
                            onClick={(e) => handleAction('edit', stagiaire, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleAction('delete', stagiaire, e)}
                            disabled={loadingDelete && selectedStagiaire?.documentId === stagiaire.documentId}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left disabled:opacity-50"
                          >
                            {loadingDelete && selectedStagiaire?.documentId === stagiaire.documentId ? (
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