// app/brigades/components/BrigadeTable.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Calendar,
  MapPin,
} from "lucide-react";

export default function BrigadeTable({
  brigades,
  loading,
  handleEdit,
  handleDelete,
  handleShowDetail,
  loadingDelete,
  selectedBrigade,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = Object.values(dropdownRefs.current).every(
        (ref) => {
          return ref && !ref.contains(event.target);
        }
      );

      if (clickedOutside) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (brigades.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune brigade trouvée</p>
      </div>
    );
  }

  const toggleDropdown = (documentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(activeDropdown === documentId ? null : documentId);
  };

  const handleAction = (action, brigade, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(null);

    switch (action) {
      case "view":
        handleShowDetail(brigade);
        break;
      case "edit":
        handleEdit(brigade);
        break;
      case "delete":
        handleDelete(brigade);
        break;
      default:
        break;
    }
  };

  // دالة محسنة لاستخراج السنة من التاريخ
  const extractYearFromDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // استخدام UTC لتجنب مشاكل المنطقة الزمنية
      return date.getUTCFullYear().toString();
    } catch (error) {
      console.error("Error extracting year from date:", error);
      return "N/A";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold text-foreground">Nom</th>
            <th className="text-left p-4 font-semibold text-foreground">
              Année
            </th>
            <th className="text-left p-4 font-semibold text-foreground">
              Effectif
            </th>
            <th className="text-left p-4 font-semibold text-foreground">
              Spécialité
            </th>
            <th className="text-left p-4 font-semibold text-foreground">
              Stagiaires
            </th>
            <th className="text-left p-4 font-semibold text-foreground">
              Stage
            </th>
            <th className="text-right p-4 font-semibold text-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {brigades.map((brigade) => (
            <tr
              key={brigade.documentId}
              className="hover:bg-muted/30 transition-colors"
            >
              {/* Name */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-foreground">
                      {brigade.brigade_name?.nom || "Aucun nom"}
                    </div>
                  </div>
                </div>
              </td>

              {/* Year */}
              <td className="p-4">
                <div className="text-foreground font-medium">
                  {new Date(brigade.year).getFullYear() + 1}
                </div>
              </td>

              {/* Effectif */}
              <td className="p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{brigade.effectif || 0}</span>
                </div>
              </td>

              {/* Specialite */}
              <td className="p-4">
                <div
                  className={`inline-block px-2.5 py-1 rounded-md text-sm transition-all
              ${
               brigade.specialite?.name === "Informatique" 
                  ? "inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 inset-ring inset-ring-green-500/20"
                : brigade.specialite?.name === "Technique" 
                  ? "inline-flex items-center w-max rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 inset-ring inset-ring-red-500/20"
                  : "text-foreground bg-secondary/10"
              }`}
                          >
                  {brigade.specialite?.name || "Aucune"}
                </div>
              </td>

              {/* Stagiaires */}
              <td className="p-4">
                <button
                  onClick={() => handleShowDetail(brigade)}
                  className="flex items-center gap-2 hover:text-primary transition-colors text-foreground"
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">
                    {brigade.stagiaires?.length || 0}
                  </span>
                </button>
              </td>

              {/* Stage */}
              <td className="p-4">
                <div className="text-foreground">
                  {brigade.stage?.name || "Aucun"}
                </div>
              </td>

              {/* Actions */}
              <td className="p-4">
                <div className="flex justify-end">
                  <div
                    className="relative"
                    ref={(el) =>
                      (dropdownRefs.current[brigade.documentId] = el)
                    }
                  >
                    <button
                      onClick={(e) => toggleDropdown(brigade.documentId, e)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeDropdown === brigade.documentId && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <button
                            onClick={(e) => handleAction("view", brigade, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Eye className="h-4 w-4" />
                            Voir détails
                          </button>
                          <button
                            onClick={(e) => handleAction("edit", brigade, e)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleAction("delete", brigade, e)}
                            disabled={loadingDelete}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left disabled:opacity-50"
                          >
                            {loadingDelete &&
                            selectedBrigade?.documentId ===
                              brigade.documentId ? (
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
