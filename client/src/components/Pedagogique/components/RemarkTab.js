// components/Pedagogique/components/RemarkTab.js
"use client";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { Plus, Download, Search, Eye, X, Calendar, User, BookOpen, ChevronDown, ChevronUp, Filter, BarChart3, MoreVertical } from "lucide-react";
import RemarkForm from "./RemarkForm";
import ExportRemarkDialog from "./ExportRemarkDialog";
import ConfirmationDialog from "./ConfirmationDialog";
import { formatDateForDisplay } from "../../../hooks/dateUtils";

// Lazy load statistics component
const StatisticsDialog = lazy(() => import('./StatisticsDialog'));

export default function RemarkTab() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [remarks, setRemarks] = useState([]);
  const [instructeurs, setInstructeurs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openStatistics, setOpenStatistics] = useState(false);
  const [loading, setLoading] = useState({ global: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedInstructeur, setSelectedInstructeur] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [actionMenu, setActionMenu] = useState({ open: false, remark: null, x: 0, y: 0 });
  const [detailModal, setDetailModal] = useState({ open: false, remark: null });

  useEffect(() => {
    fetchRemarks();
    fetchInstructeurs();
    fetchSubjects();
  }, []);

  const fetchRemarks = async () => {
    setLoading(prev => ({ ...prev, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/remark-instructeurs?populate=instructeur&populate=subject`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setRemarks(data.data || []);
    } catch (error) {
      console.error("Error fetching remarks:", error);
      showSnackbar("Erreur lors du chargement des remarques", "error");
    } finally {
      setLoading(prev => ({ ...prev, global: false }));
    }
  };

  const fetchInstructeurs = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/instructeurs`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setInstructeurs(data.data || []);
    } catch (error) {
      console.error("Error fetching instructeurs:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/subjects`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setSubjects(data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000);
  };

  // Grouper les remarques par date
  const remarksByDate = remarks.reduce((acc, remark) => {
    if (!remark.attributes?.date && !remark.date) return acc;
    
    const date = formatDateForDisplay(remark.attributes?.date || remark.date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(remark);
    return acc;
  }, {});

  // Toggle l'expansion d'une date
  const toggleDateExpansion = (date) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  // Filtrer les dates
  const filteredDates = Object.keys(remarksByDate).filter(date => {
    const remarksForDate = remarksByDate[date];
    
    const matchesSearch = remarksForDate.some(remark => {
      const remarkData = remark.attributes || remark;
      const instructeur = remarkData.instructeur?.data || remarkData.instructeur;
      const subject = remarkData.subject?.data || remarkData.subject;
      
      return (
        (instructeur?.attributes?.first_name?.toLowerCase() || instructeur?.first_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (instructeur?.attributes?.last_name?.toLowerCase() || instructeur?.last_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (subject?.attributes?.title?.toLowerCase() || subject?.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (remarkData.content?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    });

    const matchesDate = !selectedDate || date === formatDateForDisplay(selectedDate);
    
    const matchesInstructeur = !selectedInstructeur || 
      remarksForDate.some(remark => {
        const remarkData = remark.attributes || remark;
        const instructeur = remarkData.instructeur?.data || remarkData.instructeur;
        return (instructeur?.id || instructeur?.documentId) == selectedInstructeur;
      });
    
    const matchesSubject = !selectedSubject || 
      remarksForDate.some(remark => {
        const remarkData = remark.attributes || remark;
        const subject = remarkData.subject?.data || remarkData.subject;
        return (subject?.id || subject?.documentId) == selectedSubject;
      });
    
    const matchesType = !selectedType || 
      remarksForDate.some(remark => {
        const remarkData = remark.attributes || remark;
        return remarkData.type === selectedType;
      });

    return matchesSearch && matchesDate && matchesInstructeur && matchesSubject && matchesType;
  });

  const openActionMenu = (e, remark) => {
    e.preventDefault();
    e.stopPropagation();
    setActionMenu({
      open: true,
      remark,
      x: e.clientX,
      y: e.clientY
    });
  };

  const closeActionMenu = () => {
    setActionMenu({ open: false, remark: null });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDate("");
    setSelectedInstructeur("");
    setSelectedSubject("");
    setSelectedType("");
  };

  const hasActiveFilters = searchQuery || selectedDate || selectedInstructeur || selectedSubject || selectedType;

  const getRemarkDisplayData = (remark) => {
    const remarkData = remark.attributes || remark;
    const instructeur = remarkData.instructeur?.data || remarkData.instructeur;
    const subject = remarkData.subject?.data || remarkData.subject;
    
    return {
      id: remark.id || remark.documentId,
      date: remarkData.date,
      type: remarkData.type,
      content: remarkData.content,
      start_time: remarkData.start_time,
      end_time: remarkData.end_time,
      instructeur: instructeur,
      subject: subject
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gestion des Remarques</h2>
          <p className="text-muted-foreground mt-1">
            {remarks.length} remarque(s) au total
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setOpenStatistics(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </button>
          <button 
            onClick={() => setOpenExport(true)}
            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter Fiche
          </button>
          <button 
            onClick={() => setOpenForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter Remarque
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          {/* Filtre par date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          {/* Filtre par instructeur */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select
              value={selectedInstructeur}
              onChange={(e) => setSelectedInstructeur(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground appearance-none"
            >
              <option value="">Tous les instructeurs</option>
              {instructeurs.map((instructeur) => (
                <option key={instructeur.id || instructeur.documentId} value={instructeur.id || instructeur.documentId}>
                  {instructeur.attributes?.first_name || instructeur.first_name} {instructeur.attributes?.last_name || instructeur.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par matière */}
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground appearance-none"
            >
              <option value="">Toutes les matières</option>
              {subjects.map((subject) => (
                <option key={subject.id || subject.documentId} value={subject.id || subject.documentId}>
                  {subject.attributes?.title || subject.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground appearance-none"
            >
              <option value="">Tous les types</option>
              <option value="positive">Positive</option>
              <option value="negative">Négative</option>
            </select>
          </div>
        </div>

        {/* Bouton effacer les filtres */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-foreground flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Effacer les filtres
            </button>
          </div>
        )}
      </div>

      {/* Liste des remarques groupées par date */}
      <div className="space-y-4">
        {loading.global ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredDates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune remarque trouvée</p>
          </div>
        ) : (
          filteredDates.map((date) => (
            <div key={date} className="bg-card border border-border rounded-lg overflow-hidden">
              {/* En-tête de date */}
              <button
                onClick={() => toggleDateExpansion(date)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground text-left">
                      {date}
                    </h3>
                    <p className="text-sm text-muted-foreground text-left">
                      {remarksByDate[date].length} remarque(s)
                    </p>
                  </div>
                </div>
                {expandedDates.has(date) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Contenu détaillé */}
              {expandedDates.has(date) && (
                <div className="border-t border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-semibold text-foreground">Instructeur</th>
                          <th className="text-left p-4 font-semibold text-foreground">Matière</th>
                          <th className="text-left p-4 font-semibold text-foreground">Type</th>
                          <th className="text-left p-4 font-semibold text-foreground">Heure</th>
                          <th className="text-left p-4 font-semibold text-foreground">Contenu</th>
                          <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {remarksByDate[date].map((remark) => {
                          const remarkData = getRemarkDisplayData(remark);
                          return (
                            <tr key={remarkData.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-primary" />
                                  <span className="text-foreground">
                                    {remarkData.instructeur?.attributes?.first_name || remarkData.instructeur?.first_name} {remarkData.instructeur?.attributes?.last_name || remarkData.instructeur?.last_name}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  <span className="text-foreground">
                                    {remarkData.subject?.attributes?.title || remarkData.subject?.title || 'Non spécifié'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  remarkData.type === 'positive' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                  {remarkData.type === 'positive' ? 'Positive' : 'Négative'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="text-foreground">
                                  {remarkData.start_time} - {remarkData.end_time}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-foreground max-w-md">
                                  {remarkData.content}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex justify-end">
                                  <button
                                    onClick={(e) => openActionMenu(e, remark)}
                                    className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground relative"
                                    title="Actions"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Menu d'actions contextuel */}
      {actionMenu.open && (
        <div 
          className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: actionMenu.x, top: actionMenu.y }}
        >
          <button
            onClick={() => {
              setDetailModal({ open: true, remark: actionMenu.remark });
              closeActionMenu();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Eye className="h-4 w-4" />
            Voir détails
          </button>
        </div>
      )}

      {/* Clic outside pour fermer le menu d'actions */}
      {actionMenu.open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeActionMenu}
        />
      )}

      {/* Formulaire Remarque */}
      <RemarkForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchRemarks}
        instructeurs={instructeurs}
        subjects={subjects}
      />

      {/* Dialogue d'exportation */}
      <ExportRemarkDialog
        open={openExport}
        onClose={() => setOpenExport(false)}
        remarks={remarks}
        instructeurs={instructeurs}
        subjects={subjects}
      />

      {/* Dialogue de statistiques */}
      <Suspense fallback={
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        {openStatistics && (
          <StatisticsDialog
            open={openStatistics}
            onClose={() => setOpenStatistics(false)}
            remarks={remarks}
            instructeurs={instructeurs}
          />
        )}
      </Suspense>

      {/* Modal de détail */}
      {detailModal.open && (
        <RemarkDetailModal
          remark={detailModal.remark}
          onClose={() => setDetailModal({ open: false, remark: null })}
        />
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`${
              snackbar.severity === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            } px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}
          >
            <span>{snackbar.message}</span>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="p-1 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}