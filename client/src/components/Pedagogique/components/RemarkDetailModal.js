// components/Pedagogique/components/RemarkDetailModal.js
"use client";
import React from "react";
import { X, Calendar, User, BookOpen, Clock, FileText } from "lucide-react";
import { formatDateForDisplay } from "../../../utils/dateUtils";

export default function RemarkDetailModal({ remark, onClose }) {
  if (!remark) return null;

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

  const remarkData = getRemarkDisplayData(remark);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Détails de la remarque
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </h3>
                <p className="text-foreground font-medium">
                  {formatDateForDisplay(remarkData.date)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Instructeur
                </h3>
                <p className="text-foreground">
                  {remarkData.instructeur?.attributes?.first_name || remarkData.instructeur?.first_name} {remarkData.instructeur?.attributes?.last_name || remarkData.instructeur?.last_name}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horaire
                </h3>
                <p className="text-foreground font-medium">
                  {remarkData.start_time} - {remarkData.end_time}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Type
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  remarkData.type === 'positive' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {remarkData.type === 'positive' ? 'Positive' : 'Négative'}
                </span>
              </div>
            </div>
          </div>

          {/* Matière */}
          {remarkData.subject && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Matière
              </h3>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-foreground">
                  {remarkData.subject?.attributes?.title || remarkData.subject?.title}
                </p>
              </div>
            </div>
          )}

          {/* Contenu */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contenu
            </h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-foreground whitespace-pre-wrap">
                {remarkData.content}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}