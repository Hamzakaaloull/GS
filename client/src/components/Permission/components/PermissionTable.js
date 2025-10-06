// app/permissions/components/PermissionTable.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, Calendar, Users } from "lucide-react";

export default function PermissionTable({
  permissions,
  loading,
  API_URL,
  handleEdit,
  handleDelete,
  handleShowDetail,
  loadingDelete,
  selectedPermission,
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

  if (permissions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune permission trouvée</p>
      </div>
    );
  }

  const toggleDropdown = (documentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === documentId ? null : documentId);
  };

  const handleAction = (action, permission, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(null);
    
    switch (action) {
      case 'view':
        handleShowDetail(permission);
        break;
      case 'edit':
        handleEdit(permission);
        break;
      case 'delete':
        handleDelete(permission);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1); // Add 1 day for display only
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Date de début</th>
            <th className="text-left p-4 font-semibold text-foreground">Date de fin</th>
            <th className="text-left p-4 font-semibold text-foreground">Type</th>
            <th className="text-left p-4 font-semibold text-foreground">Durée (jours)</th>
            <th className="text-left p-4 font-semibold text-foreground">Stagiaires</th>
            <th className="text-right p-4 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {permissions.map((permission) => (
            <tr 
              key={permission.documentId} 
              className="hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => handleShowDetail(permission)}
            >
              {/* Start Date */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {formatDate(permission.start_date)}
                  </span>
                </div>
              </td>
              
              {/* End Date */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {formatDate(permission.end_date)}
                  </span>
                </div>
              </td>
              
              {/* Type */}
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  permission.type === "Permission ordinaire" ? "bg-blue-100 text-blue-800" :
                  permission.type === "Permission exceptionnelle" ? "bg-green-100 text-green-800" :
                  permission.type === "Permission de longue durée" ? "bg-yellow-100 text-yellow-800" :
                  permission.type === "Permission pour convenances personnelles" ? "bg-purple-100 text-purple-800" :
                  permission.type === "Permission de convalescence" ? "bg-red-100 text-red-800" :
                  permission.type === "Permission pour raisons familiales graves" ? "bg-pink-100 text-pink-800" :
                  permission.type === "Permission libérale" ? "bg-indigo-100 text-indigo-800" :
                  permission.type === "Permission d'éloignement" ? "bg-orange-100 text-orange-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {permission.type || 'N/A'}
                </span>
              </td>
              
              {/* Duration */}
              <td className="p-4 text-muted-foreground font-mono">
                {permission.duration || '0'} jours
              </td>
              
              {/* Stagiaires Count */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    {permission.stagiaires?.length || 0} stagiaire(s)
                  </span>
                </div>
              </td>
              
              {/* Actions */}
              <td className="p-4">
                <div className="flex justify-end">
                  <div 
                    className="relative" 
                    ref={el => dropdownRefs.current[permission.documentId] = el}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(permission.documentId, e);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === permission.documentId && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleAction('view', permission, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <button
                            onClick={(e) => handleAction('edit', permission, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleAction('delete', permission, e)}
                            disabled={loadingDelete}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left disabled:opacity-50"
                          >
                            {loadingDelete && selectedPermission?.documentId === permission.documentId ? (
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