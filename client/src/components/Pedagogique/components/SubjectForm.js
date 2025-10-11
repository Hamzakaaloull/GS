// components/Pedagogique/components/SubjectForm.js
"use client";
import React, { useState, useEffect } from "react";
import { X, BookOpen, FileText, Upload, Trash2 } from "lucide-react";

export default function SubjectForm({
  open,
  onClose,
  onSuccess,
  subject
}) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: []
  });
  const [uploadingFiles, setUploadingFiles] = useState([]);

  useEffect(() => {
    if (subject) {
      setFormData({
        title: subject.title || "",
        description: subject.description || "",
        content: subject.content || []
      });
    } else {
      setFormData({
        title: "",
        description: "",
        content: []
      });
    }
  }, [subject]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(files.map(file => file.name));

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('files', file);

        const res = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        const data = await res.json();
        return data[0];
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter(file => file);

      setFormData(prev => ({
        ...prev,
        content: [...prev.content, ...validFiles]
      }));

    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Erreur lors du téléchargement des fichiers');
    } finally {
      setUploadingFiles([]);
    }
  };

  const removeFile = (fileId) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter(file => file.id !== fileId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = subject
        ? `${API_URL}/api/subjects/${subject.documentId}`
        : `${API_URL}/api/subjects`;

      const method = subject ? "PUT" : "POST";

      const requestData = {
        data: {
          title: formData.title,
          description: formData.description,
          content: formData.content.map(file => file.id)
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
        onClose();
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {subject ? "Modifier le sujet" : "Ajouter un sujet"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <BookOpen className="h-4 w-4" />
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Titre du sujet"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <FileText className="h-4 w-4" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description du sujet"
              rows={4}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
            />
          </div>

          {/* Documents */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Upload className="h-4 w-4" />
              Documents
            </label>
            
            {/* Upload de fichiers */}
            <div className="mb-4">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formats supportés: PDF, Word, Images, etc.
              </p>
            </div>

            {/* Liste des fichiers en cours de téléchargement */}
            {uploadingFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Téléchargement en cours:</p>
                {uploadingFiles.map((fileName, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                    {fileName}
                  </div>
                ))}
              </div>
            )}

            {/* Liste des fichiers téléchargés */}
            {formData.content.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Documents associés:</p>
                {formData.content.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {subject ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}