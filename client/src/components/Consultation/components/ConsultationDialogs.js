// app/consultations/components/ConsultationDialogs.js
"use client";
import React from "react";
import { X, Check, AlertCircle } from "lucide-react";

export default function ConsultationDialogs({
  openConfirm,
  onCloseConfirm,
  handleDeleteConfirmed,
  loadingDelete,
  snackbar,
  onCloseSnackbar,
}) {
  return (
    <>
      {/* Confirmation Dialog */}
      {openConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Confirmation</h2>
              <button
                onClick={onCloseConfirm}
                className="p-1 hover:bg-muted rounded-full transition-colors text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-foreground">Êtes-vous sûr de vouloir supprimer cette consultation ?</p>
            </div>
            <div className="flex gap-3 p-4 border-t border-border">
              <button
                onClick={onCloseConfirm}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={loadingDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingDelete && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                )}
                Supprimer
              </button>
            </div>
          </div>
        </div>
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
            {snackbar.severity === "success" ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{snackbar.message}</span>
            <button
              onClick={onCloseSnackbar}
              className="p-1 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}