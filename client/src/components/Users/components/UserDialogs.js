// components/UserDialogs.js
"use client";
import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function UserDialogs({
  openConfirm,
  onCloseConfirm,
  handleDeleteConfirmed,
  loadingDelete,
  snackbar,
  onCloseSnackbar,
}) {
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        onCloseSnackbar();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar, onCloseSnackbar]);

  return (
    <>
      {/* Delete Confirmation Dialog */}
      {openConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Confirmation de suppression
              </h3>
            </div>
            <div className="p-6">
              <p className="text-foreground">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action
                est irréversible.
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-border">
              <button
                onClick={onCloseConfirm}
                disabled={loadingDelete}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={loadingDelete}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingDelete && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                )}
                {loadingDelete ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`rounded-lg border p-4 shadow-lg ${
            snackbar.severity === "success" 
              ? "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800" 
              : "bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-800"
          }`}>
            <div className="flex items-center gap-3">
              {snackbar.severity === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  snackbar.severity === "success" 
                    ? "text-green-800 dark:text-green-200" 
                    : "text-red-800 dark:text-red-200"
                }`}>
                  {snackbar.message}
                </p>
              </div>
              <button
                onClick={onCloseSnackbar}
                className="p-1 hover:bg-black/10 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}