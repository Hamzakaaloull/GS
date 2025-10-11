// components/Pedagogique/components/RemarkForm.js
"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, User, BookOpen, Clock, FileText } from "lucide-react";

export default function RemarkForm({
  open,
  onClose,
  onSuccess,
  remark,
  instructeurs,
  subjects
}) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showRemarkForm, setShowRemarkForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    type: "positive",
    content: "",
    instructeur: null,
    subject: null,
    start_time: "08:00",
    end_time: "09:00"
  });

  useEffect(() => {
    if (remark) {
      setFormData({
        date: remark.date ? new Date(remark.date).toISOString().split('T')[0] : "",
        type: remark.type || "positive",
        content: remark.content || "",
        instructeur: remark.instructeur?.documentId || null,
        subject: remark.subject?.documentId || null,
        start_time: remark.start_time || "08:00",
        end_time: remark.end_time || "09:00"
      });
      setShowRemarkForm(true);
    } else {
      setFormData({
        date: "",
        type: "positive",
        content: "",
        instructeur: null,
        subject: null,
        start_time: "08:00",
        end_time: "09:00"
      });
    }
  }, [remark]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelection = () => {
    if (!selectedDate) {
      alert("Veuillez sélectionner une date");
      return;
    }
    setFormData(prev => ({ ...prev, date: selectedDate }));
    setShowRemarkForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = remark
        ? `${API_URL}/api/remark-instructeurs/${remark.documentId}`
        : `${API_URL}/api/remark-instructeurs`;

      const method = remark ? "PUT" : "POST";

      const requestData = {
        data: {
          date: formData.date ? `${formData.date}T00:00:00.000Z` : null,
          type: formData.type,
          content: formData.content,
          instructeur: formData.instructeur ? { connect: [formData.instructeur] } : { disconnect: [] },
          subject: formData.subject ? { connect: [formData.subject] } : { disconnect: [] },
          start_time: formData.start_time,
          end_time: formData.end_time
        }
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestData),
      });

      if (res.ok) {
        onSuccess();
        if (remark) {
          onClose();
        } else {
          // Réinitialiser le formulaire pour ajouter une autre remarque
          setFormData({
            date: formData.date, // Garder la même date
            type: "positive",
            content: "",
            instructeur: null,
            subject: null,
            start_time: "08:00",
            end_time: "09:00"
          });
        }
      } else {
        throw new Error('Erreur lors de l\'opération');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowRemarkForm(false);
    setSelectedDate("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {remark ? "Modifier la remarque" : showRemarkForm ? "Ajouter une remarque" : "Sélectionner la date"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!showRemarkForm ? (
          // Étape 1: Sélection de la date
          <div className="p-6 space-y-6">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Sélectionnez la date
              </h3>
              <p className="text-muted-foreground">
                Choisissez la date pour laquelle vous souhaitez ajouter des remarques
              </p>
            </div>

            <div>
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDateSelection}
                disabled={!selectedDate}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Continuer
              </button>
            </div>
          </div>
        ) : (
          // Étape 2: Formulaire de remarque
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date (affichage seulement) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Calendar className="h-4 w-4" />
                Date
              </label>
              <div className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-foreground">
                {new Date(formData.date).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instructeur */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <User className="h-4 w-4" />
                  Instructeur *
                </label>
                <select
                  value={formData.instructeur || ""}
                  onChange={(e) => handleInputChange('instructeur', e.target.value || null)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  required
                >
                  <option value="">Sélectionnez un instructeur</option>
                  {instructeurs.map((instructeur) => (
                    <option key={instructeur.documentId} value={instructeur.documentId}>
                      {instructeur.first_name} {instructeur.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sujet */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <BookOpen className="h-4 w-4" />
                  Sujet
                </label>
                <select
                  value={formData.subject || ""}
                  onChange={(e) => handleInputChange('subject', e.target.value || null)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                >
                  <option value="">Sélectionnez un sujet</option>
                  {subjects.map((subject) => (
                    <option key={subject.documentId} value={subject.documentId}>
                      {subject.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <FileText className="h-4 w-4" />
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  required
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
                  value={formData.start_time}
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
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  required
                />
              </div>
            </div>

            {/* Contenu */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <FileText className="h-4 w-4" />
                Contenu *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Détails de la remarque..."
                rows={4}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {!remark && (
                <button
                  type="button"
                  onClick={() => setShowRemarkForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
                >
                  Changer de date
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !formData.instructeur || !formData.content}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                )}
                {remark ? "Modifier" : "Ajouter"}
              </button>
              {!remark && (
                <button
                  type="button"
                  onClick={() => {
                    handleSubmit(new Event('submit'));
                    setFormData({
                      date: formData.date,
                      type: "positive",
                      content: "",
                      instructeur: null,
                      subject: null,
                      start_time: "08:00",
                      end_time: "09:00"
                    });
                  }}
                  disabled={loading || !formData.instructeur || !formData.content}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Ajouter et continuer
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}