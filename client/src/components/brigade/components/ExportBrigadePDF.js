// app/brigades/components/ExportBrigadePDF.js
"use client";
import React from "react";
import { Download, FileText, X } from "lucide-react";

export default function ExportBrigadePDF({
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
      // imports dynamiques
      const { jsPDF } = await import("jspdf");
      const autoTable = await import("jspdf-autotable");

      const doc = new jsPDF();

      // font par défaut
      doc.setFont("helvetica");

      // récupérer et nettoyer nom utilisateur
      const rawUserName = localStorage.getItem("userName") || "Utilisateur";
      const userNameClean = (rawUserName || "Utilisateur").replace(/\s+/g, " ").trim();
      // limiter longueur pour تجنب التكسير الطويل جداً
      const userName = userNameClean.length > 40 ? userNameClean.slice(0, 40) + "..." : userNameClean;

      const now = new Date();
      // format jj/mm/aaaa
      const pad = (n) => String(n).padStart(2, "0");
      const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

      // سنجهّز متغير شعار (DataURL) للاستخدام عبر الصفحات
      let logoDataUrl = null;
      try {
        const logoResponse = await fetch("/img/FarImg.png");
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          // convertir blob -> dataURL لأن jsPDF يتعامل معها بأريحية أكبر
          logoDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(logoBlob);
          });
        }
      } catch (e) {
        console.warn("Could not load logo image:", e);
        logoDataUrl = null;
      }

      // دالة ترسم الهيدر (شعار + نص يسار + نص يمين) لكل صفحة
      const drawHeader = (docInstance) => {
        const pageWidth = docInstance.internal.pageSize.getWidth
          ? docInstance.internal.pageSize.getWidth()
          : docInstance.internal.pageSize.width;
        const margin = 15;
        const rightX = pageWidth - margin;

        // شعار متمركز
        const imgWidth = 30;
        const imgHeight = 30;
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = 10;
        try {
          if (logoDataUrl) {
            docInstance.addImage(logoDataUrl, "PNG", imgX, imgY, imgWidth, imgHeight);
          }
        } catch (e) {
          // ignore
        }

        // يسار أعلى — utilisateur + date
        docInstance.setFontSize(10);
        docInstance.setFont("helvetica", "normal");
        docInstance.text(`Utilisateur: ${userName}`, margin, 18);
        docInstance.text(`Meknès, ${dateStr}`, margin, 24);

        // يمين أعلى — 4 أسطر محاذاة يمين
        docInstance.setFontSize(12);
        docInstance.setFont("helvetica", "bold");
        docInstance.text("ROYAUME DU MAROC", rightX, 16, { align: "right" });

        docInstance.setFontSize(10);
        docInstance.setFont("helvetica", "normal");
        docInstance.text("Forces Armées Royales", rightX, 22, { align: "right" });
        docInstance.text("Place d'arme meknes", rightX, 28, { align: "right" });
        docInstance.text("1 Bataillon de Setien des Transmissions", rightX, 34, { align: "right" });
      };

      // رسم الهيدر في الصفحة الأولى
      drawHeader(doc);

      // العنوان المركزي تحت الهيدر
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("RAPPORT DES BRIGADES", doc.internal.pageSize.getWidth() / 2, 60, { align: "center" });

      // خط تحت العنوان
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 65, doc.internal.pageSize.getWidth() - 20, 65);

      // إحصائيات
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Nombre total de brigades: ${brigades.length}`, 20, 75);
      doc.text(`Date d'exportation: ${now.toLocaleString("fr-FR")}`, 20, 80);

      // البدء بموضع المحتوى بعد العنوان والهيدر
      let startY = 90;

      // iterate brigades
      for (let index = 0; index < brigades.length; index++) {
        const brigade = brigades[index];

        // page break check
        if (startY > 250) {
          doc.addPage();
          drawHeader(doc);
          // إعادة وضع العنوان الصغير للصفحة الجديدة
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Rapport des Brigades - Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.getWidth() / 2, 50, {
            align: "center",
          });
          doc.text(`Exporté par: ${userName}`, 20, 55);
          doc.text(`Meknès, ${dateStr}`, 20, 60);

          startY = 70;
        }

        // بيانات البريجاد
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Brigade ${index + 1}: ${brigade.brigade_name?.nom || "Sans nom"}`, 20, startY);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        // تحقّق من وجود year قبل الاستخدام
        const yearLabel = brigade.year ? (new Date(brigade.year).getFullYear() + 1) : "N/A";
        doc.text(`Année: ${yearLabel}`, 20, startY + 7);
        doc.text(`Effectif: ${brigade.effectif || 0}`, 70, startY + 7);
        doc.text(`Spécialité: ${brigade.specialite?.name || "Aucune"}`, 120, startY + 7);
        doc.text(`Stage: ${brigade.stage?.name || "Aucun"}`, 170, startY + 7);

        startY += 20;

        // جدول المتدربين إذا وُجدوا
        if (brigade.stagiaires && brigade.stagiaires.length > 0) {
          const tableData = brigade.stagiaires.map((stagiaire, stagiaireIndex) => [
            (stagiaireIndex + 1).toString(),
            stagiaire.mle || "N/A",
            stagiaire.last_name || "N/A",
            stagiaire.first_name || "N/A",
            stagiaire.cin || "N/A",
            stagiaire.grade || "N/A",
          ]);

          autoTable.default(doc, {
            startY: startY,
            head: [["#", "MLE", "Nom", "Prénom", "CIN", "Grade"]],
            body: tableData,
            styles: {
              font: "helvetica",
              fontSize: 8,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [59, 130, 246],
              textColor: 255,
              fontStyle: "bold",
            },
            alternateRowStyles: {
              fillColor: [240, 240, 240],
            },
            margin: { left: 15, right: 15 },
            tableWidth: "auto",
            theme: "grid",
          });

          startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : startY + 40;
        } else {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text("Aucun stagiaire assigné", 20, startY);
          doc.setTextColor(0, 0, 0);
          startY += 10;
        }

        // فاصل بين البريجادات
        if (index < brigades.length - 1 && startY < 270) {
          doc.setDrawColor(200, 200, 200);
          doc.line(15, startY, doc.internal.pageSize.getWidth() - 15, startY);
          startY += 10;
        }
      }

      // أرقام الصفحات والتذييل
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.getWidth() / 2, 285, { align: "center" });

        // تذييل
        doc.setFontSize(7);
        doc.text(`Document généré par ${userName} - ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 292, { align: "center" });
      }

      // حفظ
      const fileName = `rapport_brigades_${now.getTime()}.pdf`;
      doc.save(fileName);

      onExport && onExport(`${brigades.length} brigades exportées en PDF avec succès`);
      onClose();
    } catch (error) {
      console.error("Error generating PDF:", error);
      onExport && onExport("Erreur lors de l'exportation PDF: " + (error?.message || error), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export PDF
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
            <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Prêt à exporter en PDF
            </h3>
            <p className="text-muted-foreground">
              {brigades.length} brigades seront exportées vers un fichier PDF formaté.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Détails de l'exportation</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-medium">PDF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brigades:</span>
                <span className="font-medium">{brigades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contenu:</span>
                <span className="font-medium">Détails complets avec stagiaires</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Logo:</span>
                <span className="font-medium">FAR.png</span>
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
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              Générer PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
