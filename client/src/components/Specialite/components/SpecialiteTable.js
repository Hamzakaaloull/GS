// app/specialites/components/SpecialiteTable.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, BookOpen, Users, MapPin, Calendar } from "lucide-react";

export default function SpecialiteTable({
  specialites,
  loading,
  handleEdit,
  handleDelete,
  handleShowDetail,
  loadingDelete,
  selectedSpecialite,
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

  if (specialites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune spécialité trouvée</p>
      </div>
    );
  }

  const toggleDropdown = (documentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === documentId ? null : documentId);
  };

  const handleAction = (action, specialite, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch (action) {
      case 'view':
        handleShowDetail(specialite);
        break;
      case 'edit':
        handleEdit(specialite);
        break;
      case 'delete':
        handleDelete(specialite);
        break;
      default:
        break;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Nom</th>
            <th className="text-left p-4 font-semibold text-foreground">Description</th>
            <th className="text-left p-4 font-semibold text-foreground">Stagiaires</th>
            <th className="text-left p-4 font-semibold text-foreground">Brigades</th>
            <th className="text-left p-4 font-semibold text-foreground">Stages</th>
            <th className="text-right p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {specialites.map((specialite) => (
            <tr 
              key={specialite.documentId} 
              className="hover:bg-muted/30 transition-colors"
            >
              {/* Name */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">
                      {specialite.name}
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Description */}
              <td className="p-4">
                <div className="text-foreground max-w-md">
                  {specialite.description || 'Aucune description'}
                </div>
              </td>
              
              {/* Stagiaires */}
              <td className="p-4">
                <button
                  onClick={() => handleShowDetail(specialite)}
                  className="flex items-center gap-2 hover:text-primary transition-colors text-foreground"
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">
                    {specialite.stagiaires?.length || 0}
                  </span>
                </button>
              </td>
              
              {/* Brigades */}
              <td className="p-4">
                <button
                  onClick={() => handleShowDetail(specialite)}
                  className="flex items-center gap-2 hover:text-primary transition-colors text-foreground"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">
                    {specialite.brigades?.length || 0}
                  </span>
                </button>
              </td>
              
              {/* Stages */}
              <td className="p-4">
                <button
                  onClick={() => handleShowDetail(specialite)}
                  className="flex items-center gap-2 hover:text-primary transition-colors text-foreground"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    {specialite.stages?.length || 0}
                  </span>
                </button>
              </td>
              
              {/* Actions */}
              <td className="p-4">
                <div className="flex justify-end">
                  <div 
                    className="relative" 
                    ref={el => dropdownRefs.current[specialite.documentId] = el}
                  >
                    <button
                      onClick={(e) => toggleDropdown(specialite.documentId, e)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === specialite.documentId && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleAction('view', specialite, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <button
                            onClick={(e) => handleAction('edit', specialite, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleAction('delete', specialite, e)}
                            disabled={loadingDelete}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left disabled:opacity-50"
                          >
                            {loadingDelete && selectedSpecialite?.documentId === specialite.documentId ? (
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