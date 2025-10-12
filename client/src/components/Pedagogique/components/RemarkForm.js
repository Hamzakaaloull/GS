// components/Pedagogique/components/RemarkForm.js
"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, User, BookOpen, Clock, FileText, Plus, Check, Trash2 } from "lucide-react";
import { formatDateForDisplay, formatDateForAPI } from "@/hooks/dateUtils";

export default function RemarkForm({
  open,
  onClose,
  onSuccess,
  instructeurs,
  subjects
}) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [remarks, setRemarks] = useState([]);
  const [currentRemark, setCurrentRemark] = useState({
    type: "positive",
    content: "",
    instructeur: "",
    subject: "",
    start_time: "08:00",
    end_time: "09:00"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedDate("");
      setRemarks([]);
      setCurrentRemark({
        type: "positive",
        content: "",
        instructeur: "",
        subject: "",
        start_time: "08:00",
        end_time: "09:00"
      });
      setError("");
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setCurrentRemark(prev => ({ ...prev, [field]: value }));
  };

  const addRemark = () => {
    if (!currentRemark.instructeur || !currentRemark.content) {
      setError("Veuillez remplir l'instructeur et le contenu");
      return;
    }

    const newRemark = {
      id: Date.now(), // Temporary ID
      ...currentRemark,
      date: selectedDate
    };

    setRemarks(prev => [...prev, newRemark]);
    
    // Reset current remark form
    setCurrentRemark({
      type: "positive",
      content: "",
      instructeur: "",
      subject: "",
      start_time: "08:00",
      end_time: "09:00"
    });
    setError("");
  };

  const removeRemark = (index) => {
    setRemarks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (remarks.length === 0) {
      setError("Veuillez ajouter au moins une remarque");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const createPromises = remarks.map(async (remark) => {
        // Format time for Strapi (HH:mm:ss.SSS)
        const formatTimeForAPI = (time) => {
          if (time.includes('.')) return time;
          return time + ':00.000';
        };

        const requestData = {
          data: {
            date: `${remark.date}T00:00:00.000Z`,
            type: remark.type,
            content: remark.content,
            instructeur: remark.instructeur,
            subject: remark.subject || null,
            start_time: formatTimeForAPI(remark.start_time),
            end_time: formatTimeForAPI(remark.end_time)
          }
        };

        const res = await fetch(`${API_URL}/api/remark-instructeurs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error?.message || 'Erreur lors de la création');
        }

        return res.json();
      });

      await Promise.all(createPromises);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting remarks:', error);
      setError(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const getInstructeurName = (instructeurId) => {
    const instructeur = instructeurs.find(i => 
      i.id == instructeurId || i.documentId == instructeurId
    );
    return instructeur ? `${instructeur.first_name} ${instructeur.last_name}` : "Inconnu";
  };

  const getSubjectName = (subjectId) => {
    if (!subjectId) return "Non spécifié";
    const subject = subjects.find(s => 
      s.id == subjectId || s.documentId == subjectId
    );
    return subject ? subject.title : "Non spécifié";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Ajouter des remarques
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Erreur: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Sélection de la date */}
          <div className="bg-muted/30 rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Calendar className="h-4 w-4" />
              Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
              required
            />
          </div>

          {selectedDate && (
            <>
              {/* Compteur de remarques */}
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    Remarques pour le {formatDateForDisplay(selectedDate)}
                  </span>
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm">
                    {remarks.length} remarque(s)
                  </span>
                </div>
              </div>

              {/* Formulaire d'ajout d'une remarque */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Ajouter une nouvelle remarque
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Instructeur */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <User className="h-4 w-4" />
                      Instructeur *
                    </label>
                    <select
                      value={currentRemark.instructeur}
                      onChange={(e) => handleInputChange('instructeur', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      required
                    >
                      <option value="">Sélectionnez un instructeur</option>
                      {instructeurs.map((instructeur) => (
                        <option 
                          key={instructeur.id || instructeur.documentId} 
                          value={instructeur.id || instructeur.documentId}
                        >
                          {instructeur.first_name} {instructeur.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Matière */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <BookOpen className="h-4 w-4" />
                      Matière
                    </label>
                    <select
                      value={currentRemark.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                    >
                      <option value="">Sélectionnez une matière</option>
                      {subjects.map((subject) => (
                        <option 
                          key={subject.id || subject.documentId} 
                          value={subject.id || subject.documentId}
                        >
                          {subject.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Type */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <FileText className="h-4 w-4" />
                      Type *
                    </label>
                    <select
                      value={currentRemark.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      
                    >
                      <option value="positive">Positive</option>
                      <option value="negative">Négative</option>
                    </select>
                  </div>

                  {/* Heure de début */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      Heure de début *
                    </label>
                    <input
                      type="time"
                      value={currentRemark.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      required
                    />
                  </div>

                  {/* Heure de fin */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      Heure de fin *
                    </label>
                    <input
                      type="time"
                      value={currentRemark.end_time}
                      onChange={(e) => handleInputChange('end_time', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Contenu */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <FileText className="h-4 w-4" />
                    Contenu *
                  </label>
                  <textarea
                    value={currentRemark.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Détails de la remarque..."
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                    required
                  />
                </div>

                {/* Bouton d'ajout */}
                <button
                  type="button"
                  onClick={addRemark}
                  disabled={!currentRemark.instructeur || !currentRemark.content}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter cette remarque
                </button>
              </div>

              {/* Liste des remarques ajoutées */}
              {remarks.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    Remarques à enregistrer ({remarks.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {remarks.map((remark, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              remark.type === 'positive' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {remark.type === 'positive' ? 'Positive' : 'Négative'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {remark.start_time} - {remark.end_time}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {getInstructeurName(remark.instructeur)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {remark.content}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Matière: {getSubjectName(remark.subject)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeRemark(index)}
                          className="p-1 hover:bg-destructive/10 rounded text-destructive ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions finales */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || remarks.length === 0}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Confirmer ({remarks.length})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}