// app/brigades/components/ExportBrigadeExcel.js
"use client";
import React from "react";
import { Download, Table, X } from "lucide-react";

export default function ExportBrigadeExcel({
  open,
  onClose,
  brigades,
  onExport,
}) {
  const [loading, setLoading] = React.useState(false);

  if (!open) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      // استيراد المكتبات ديناميكياً
      const XLSX = await import('xlsx');
      
      // إنشاء workbook جديد
      const wb = XLSX.utils.book_new();
      
      // ورقة بيانات البريجادات
      const brigadeData = brigades.map(brigade => ({
        'Nom de la Brigade': brigade.brigade_name?.nom || 'Sans nom',
        'Année': new Date(brigade.year).getFullYear() + 1,
        'Effectif': brigade.effectif || 0,
        'Spécialité': brigade.specialite?.name || 'Aucune',
        'Nombre de Stagiaires': brigade.stagiaires?.length || 0,
        'Stage': brigade.stage?.name || 'Aucun'
      }));
      
      const wsBrigades = XLSX.utils.json_to_sheet(brigadeData);
      
      // تحسين عرض الأعمدة
      const colWidths = [
        { wch: 25 }, // Nom de la Brigade
        { wch: 10 }, // Année
        { wch: 10 }, // Effectif
        { wch: 20 }, // Spécialité
        { wch: 18 }, // Nombre de Stagiaires
        { wch: 20 }  // Stage
      ];
      wsBrigades['!cols'] = colWidths;
      
      // إضافة الورقة إلى workbook
      XLSX.utils.book_append_sheet(wb, wsBrigades, "Brigades");
      
      // إنشاء أوراق للمتدربين لكل بريجاد
      brigades.forEach((brigade, index) => {
        if (brigade.stagiaires && brigade.stagiaires.length > 0) {
          const stagiaireData = brigade.stagiaires.map((stagiaire, stagiaireIndex) => ({
            '#': stagiaireIndex + 1,
            'MLE': stagiaire.mle || 'N/A',
            'Nom': stagiaire.last_name || 'N/A',
            'Prénom': stagiaire.first_name || 'N/A',
            'CIN': stagiaire.cin || 'N/A',
            'Grade': stagiaire.grade || 'N/A'
          }));
          
          const wsStagiaires = XLSX.utils.json_to_sheet(stagiaireData);
          
          // تحسين عرض الأعمدة للمتدربين
          const stagiaireColWidths = [
            { wch: 5 },  // #
            { wch: 15 }, // MLE
            { wch: 20 }, // Nom
            { wch: 20 }, // Prénom
            { wch: 15 }, // CIN
            { wch: 15 }  // Grade
          ];
          wsStagiaires['!cols'] = stagiaireColWidths;
          
          // اسم الورقة (محدود إلى 31 حرف)
          const sheetName = `Stagiaires_${index + 1}`.substring(0, 31);
          XLSX.utils.book_append_sheet(wb, wsStagiaires, sheetName);
        }
      });
      
      // معلومات المستند
      const now = new Date();
      const info = {
        Title: "Rapport des Brigades - Forces Armées Royales",
        Subject: "Exportation des données des brigades",
        Author: "Système de Gestion des Brigades",
        CreatedDate: now
      };
      wb.Props = info;
      
      // حفظ الملف
      const fileName = `brigades_${now.getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      onExport && onExport(`${brigades.length} brigades exportées en Excel avec succès`);
      onClose();
    } catch (error) {
      console.error("Error generating Excel:", error);
      onExport && onExport("Erreur lors de l'exportation Excel: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Table className="h-5 w-5" />
            Export Excel
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <Table className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Prêt à exporter en Excel
            </h3>
            <p className="text-muted-foreground">
              {brigades.length} brigades seront exportées vers un fichier Excel avec plusieurs onglets.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Structure du fichier</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Onglet principal:</span>
                <span className="font-medium">Liste des brigades</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Onglets supplémentaires:</span>
                <span className="font-medium">Détails par brigade</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-medium">XLSX (Excel)</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              Générer Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}