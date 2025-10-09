// app/brigades/components/ExportBrigadeDialog.js
"use client";
import React, { useState } from "react";
import { Download, FileText, Table, X, Search, Check } from "lucide-react";
import ExportBrigadePDF from "./ExportBrigadePDF";
import ExportBrigadeExcel from "./ExportBrigadeExcel";

export default function ExportBrigadeDialog({
  open,
  onClose,
  brigades,
  filteredBrigades,
}) {
  const [activeExport, setActiveExport] = useState(null);
  const [selectedBrigades, setSelectedBrigades] = useState([]);
  const [searchBrigade, setSearchBrigade] = useState("");
  const [exportType, setExportType] = useState("pdf");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  if (!open) return null;

  // فلترة البريجادات حسب البحث
  const filteredBrigadesList = brigades.filter(brigade =>
    brigade.brigade_name?.nom?.toLowerCase().includes(searchBrigade.toLowerCase())
  );

  // تحديد/إلغاء تحديد كل البريجادات
  const toggleSelectAll = () => {
    if (selectedBrigades.length === filteredBrigadesList.length) {
      setSelectedBrigades([]);
    } else {
      setSelectedBrigades(filteredBrigadesList.map(b => b.documentId));
    }
  };

  // تحديد/إلغاء تحديد بريجاد معين
  const toggleBrigadeSelection = (brigadeId) => {
    setSelectedBrigades(prev =>
      prev.includes(brigadeId)
        ? prev.filter(id => id !== brigadeId)
        : [...prev, brigadeId]
    );
  };

  const handleExportSuccess = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000);
  };

  const handleCloseExport = () => {
    setActiveExport(null);
    setSelectedBrigades([]);
    setSearchBrigade("");
  };

  const handleStartExport = () => {
    if (selectedBrigades.length === 0) {
      setSnackbar({ open: true, message: "Veuillez sélectionner au moins une brigade", severity: "error" });
      return;
    }
    setActiveExport(exportType);
  };

  const brigadesToExport = selectedBrigades.length > 0 
    ? brigades.filter(b => selectedBrigades.includes(b.documentId))
    : [];

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exporter les Brigades
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Sélection du type d'exportation */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Type d'exportation</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setExportType("pdf")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    exportType === "pdf" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      exportType === "pdf" ? "bg-red-500/10" : "bg-muted"
                    }`}>
                      <FileText className={`h-6 w-6 ${
                        exportType === "pdf" ? "text-red-600" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-foreground">PDF</h4>
                      <p className="text-sm text-muted-foreground">Document formaté</p>
                    </div>
                    {exportType === "pdf" && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setExportType("excel")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    exportType === "excel" 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      exportType === "excel" ? "bg-green-500/10" : "bg-muted"
                    }`}>
                      <Table className={`h-6 w-6 ${
                        exportType === "excel" ? "text-green-600" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-foreground">Excel</h4>
                      <p className="text-sm text-muted-foreground">Données modifiables</p>
                    </div>
                    {exportType === "excel" && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Sélection des brigades */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Sélection des Brigades</h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher une brigade..."
                  value={searchBrigade}
                  onChange={(e) => setSearchBrigade(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                />
              </div>

              {/* Select All */}
              <div className="mb-3">
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrigades.length === filteredBrigadesList.length && filteredBrigadesList.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-medium text-foreground">Sélectionner tout</div>
                    <div className="text-sm text-muted-foreground">
                      {filteredBrigadesList.length} brigades trouvées
                    </div>
                  </div>
                </label>
              </div>

              {/* Brigades List */}
              <div className="max-h-60 overflow-y-auto border border-border rounded-lg">
                {filteredBrigadesList.map((brigade) => (
                  <label 
                    key={brigade.documentId} 
                    className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrigades.includes(brigade.documentId)}
                      onChange={() => toggleBrigadeSelection(brigade.documentId)}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {brigade.brigade_name?.nom || 'Sans nom'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Année: {new Date(brigade.year).getFullYear() + 1} • 
                        Effectif: {brigade.effectif || 0} • 
                        Stagiaires: {brigade.stagiaires?.length || 0}
                      </div>
                    </div>
                  </label>
                ))}
                
                {filteredBrigadesList.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune brigade trouvée
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Résumé</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Brigades sélectionnées</div>
                  <div className="font-semibold text-foreground">{selectedBrigades.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Type de fichier</div>
                  <div className="font-semibold text-foreground capitalize">{exportType}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                Annuler
              </button>
              <button
                onClick={handleStartExport}
                disabled={selectedBrigades.length === 0}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter ({selectedBrigades.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Export */}
      <ExportBrigadePDF
        open={activeExport === "pdf"}
        onClose={handleCloseExport}
        brigades={brigadesToExport}
        onExport={handleExportSuccess}
      />

      {/* Excel Export */}
      <ExportBrigadeExcel
        open={activeExport === "excel"}
        onClose={handleCloseExport}
        brigades={brigadesToExport}
        onExport={handleExportSuccess}
      />

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
    </>
  );
}