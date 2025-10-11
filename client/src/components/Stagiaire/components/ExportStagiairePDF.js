// components/ExportStagiairePDF.js
"use client";
import React from "react";
import { Download, FileText, X } from "lucide-react";
import { formatDateForDisplay, getYearFromDate } from '@/hooks/dateUtils';

export default function ExportStagiairePDF({
  open,
  onClose,
  stagiaires,
  onExport,
}) {
  const [loading, setLoading] = React.useState(false);

  if (!open) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = await import("jspdf-autotable");

      const doc = new jsPDF();
      doc.setFont("helvetica");

      // Récupérer les informations utilisateur
      const rawUserName = localStorage.getItem("userName") || "Utilisateur";
      const userNameClean = (rawUserName || "Utilisateur").replace(/\s+/g, " ").trim();
      const userName = userNameClean.length > 40 ? userNameClean.slice(0, 40) + "..." : userNameClean;

      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

      // Charger le logo
      let logoDataUrl = null;
      try {
        const logoResponse = await fetch("/img/FarImg.png");
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          logoDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(logoBlob);
          });
        }
      } catch (e) {
        console.warn("Could not load logo image:", e);
      }

      // Fonction pour dessiner l'en-tête
      const drawHeader = (docInstance) => {
        const pageWidth = docInstance.internal.pageSize.getWidth
          ? docInstance.internal.pageSize.getWidth()
          : docInstance.internal.pageSize.width;
        const margin = 15;
        const rightX = pageWidth - margin;

        // Logo centré
        const imgWidth = 20;
        const imgHeight = 20;
        const imgX =((pageWidth - imgWidth) / 2) - 10; // Décalage de 20 vers la gauche
        const imgY = 10;
        try {
          if (logoDataUrl) {
            docInstance.addImage(logoDataUrl, "PNG", imgX, imgY, imgWidth, imgHeight);
          }
        } catch (e) {
          // ignore
        }

        // Texte à gauche
        docInstance.setFontSize(10);
        docInstance.setFont("helvetica", "normal");
        docInstance.text(`Meknès, ${dateStr}`, margin, 16);
      for (let index = 0; index < stagiaires.length; index++) {
        const stagiaire = stagiaires[index];
        docInstance.text(`Fiche de: ${stagiaire.first_name || "N/A"} ${stagiaire.last_name || "N/A"}`, margin, 22);
   
        break; // Juste le premier stagiaire pour l'en-tête
      }
        // Texte à droite avec la même police
        docInstance.setFontSize(10);
        docInstance.setFont("helvetica", "normal");

          const maxWidth = Math.max(
            docInstance.getTextWidth("ROYAUME DU MAROC"),
            docInstance.getTextWidth("Forces Armées Royales"),
            docInstance.getTextWidth("Place d'arme meknes"),
            docInstance.getTextWidth("1 Bataillon de Setien des Transmissions")
          );

          docInstance.text("ROYAUME DU MAROC", rightX - (maxWidth - docInstance.getTextWidth("ROYAUME DU MAROC")) / 2, 16, { align: "right" });
          docInstance.text("Forces Armées Royales", rightX - (maxWidth - docInstance.getTextWidth("Forces Armées Royales")) / 2, 22, { align: "right" });
          docInstance.text("Place d'arme meknes", rightX - (maxWidth - docInstance.getTextWidth("Place d'arme meknes")) / 2, 28, { align: "right" });
          docInstance.text("1 Bataillon de Setien des Transmissions", rightX - (maxWidth - docInstance.getTextWidth("1 Bataillon de Setien des Transmissions")) / 2, 34, { align: "right" });

      };

      // Générer une fiche pour chaque stagiaire
      for (let index = 0; index < stagiaires.length; index++) {
        const stagiaire = stagiaires[index];
        
        if (index > 0) {
          doc.addPage();
        }

        // Dessiner l'en-tête
        drawHeader(doc);

        // Titre principal
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("FICHE DE RENSEIGNEMENT", doc.internal.pageSize.getWidth() / 2, 60, { align: "center" });

        // Ligne sous le titre
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 65, doc.internal.pageSize.getWidth() - 20, 65);

        let startY = 75;

        // Informations personnelles du stagiaire
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("INFORMATIONS PERSONNELLES", 20, startY);
        startY += 10;

        // Tableau des informations personnelles
        const personalInfoData = [
          ["Nom", stagiaire.last_name || "Non spécifié"],
          ["Prénom", stagiaire.first_name || "Non spécifié"],
          ["CIN", stagiaire.cin || "Non spécifié"],
          ["MLE", stagiaire.mle || "Non spécifié"],
          ["Grade", stagiaire.grade || "Non spécifié"],
          ["Date de naissance", formatDateForDisplay(stagiaire.date_naissance) || "Non spécifié"],
          ["Téléphone", stagiaire.phone || "Non spécifié"],
          ["Groupe sanguin", stagiaire.groupe_sanguaine || "Non spécifié"],
          ["Spécialité", stagiaire.specialite?.name || "Non spécifié"],
          ["Stage", stagiaire.stage?.name || "Non spécifié"],
          ["Brigade", stagiaire.brigade?.brigade_name?.nom || "Non spécifié"],
          ["Année de Stage", getYearFromDate(stagiaire.brigade?.year) || "Non spécifié"]
        ];

        autoTable.default(doc, {
          startY: startY,
          head: [["Champ", "Valeur"]],
          body: personalInfoData,
          styles: {
            font: "helvetica",
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
          margin: { left: 20, right: 20 },
          tableWidth: "auto",
        });

        startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : startY + 80;

        // Tableau des remarques
        if (stagiaire.remarques && stagiaire.remarques.length > 0) {
          if (startY > 200) {
            doc.addPage();
            drawHeader(doc);
            startY = 60;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("REMARQUES", 20, startY);
          startY += 10;

          const remarquesData = stagiaire.remarques.map(remarque => [
            formatDateForDisplay(remarque.date),
            remarque.content || "Non spécifié",
            remarque.result || "Non spécifié",
            remarque.type || "Non spécifié"
          ]);

          autoTable.default(doc, {
            startY: startY,
            head: [["Date", "Contenu", "Résultat", "Type"]],
            body: remarquesData,
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
            margin: { left: 20, right: 20 },
            tableWidth: "auto",
          });

          startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : startY + 40;
        }

        // Tableau des consultations
        if (stagiaire.consultations && stagiaire.consultations.length > 0) {
          if (startY > 200) {
            doc.addPage();
            drawHeader(doc);
            startY = 60;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("CONSULTATIONS", 20, startY);
          startY += 10;

          const consultationsData = stagiaire.consultations.map(consultation => [
            formatDateForDisplay(consultation.date),
            consultation.note || "Non spécifié"
          ]);

          autoTable.default(doc, {
            startY: startY,
            head: [["Date", "Note"]],
            body: consultationsData,
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
            margin: { left: 20, right: 20 },
            tableWidth: "auto",
          });

          startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : startY + 40;
        }

        // Tableau des punitions
        if (stagiaire.punitions && stagiaire.punitions.length > 0) {
          if (startY > 200) {
            doc.addPage();
            drawHeader(doc);
            startY = 60;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("PUNITIONS", 20, startY);
          startY += 10;

          const punitionsData = stagiaire.punitions.map(punition => [
            formatDateForDisplay(punition.date),
            punition.description || "Non spécifié",
            punition.motif || "Non spécifié"
          ]);

          autoTable.default(doc, {
            startY: startY,
            head: [["Date", "Description", "Motif"]],
            body: punitionsData,
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
            margin: { left: 20, right: 20 },
            tableWidth: "auto",
          });

          startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : startY + 40;
        }

        // Tableau des permissions
        if (stagiaire.permision && stagiaire.permision.length > 0) {
          if (startY > 200) {
            doc.addPage();
            drawHeader(doc);
            startY = 60;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("PERMISSIONS", 20, startY);
          startY += 10;

          const permissionsData = stagiaire.permision.map(permission => [
            formatDateForDisplay(permission.start_date),
            formatDateForDisplay(permission.end_date),
            permission.duration || "Non spécifié",
            permission.type || "Non spécifié"
          ]);

          autoTable.default(doc, {
            startY: startY,
            head: [["Date de début", "Date de fin", "Durée", "Type"]],
            body: permissionsData,
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
            margin: { left: 20, right: 20 },
            tableWidth: "auto",
          });
        }

        // Pied de page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.getWidth() / 2, 285, { align: "center" });
          doc.setFontSize(7);
          doc.text(`Document généré par ${userName} - ${dateStr}`, doc.internal.pageSize.getWidth() / 2, 292, { align: "center" });
        }
      }

      // Sauvegarder le PDF
      const fileName = `fiches_stagiaires_${now.getTime()}.pdf`;
      doc.save(fileName);

      onExport && onExport(`${stagiaires.length} fiche(s) de stagiaire(s) exportée(s) en PDF avec succès`);
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
            Export Fiches Stagiaires
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
            <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Prêt à exporter les fiches
            </h3>
            <p className="text-muted-foreground">
              {stagiaires.length} fiche(s) de stagiaire(s) seront exportées vers un fichier PDF formaté.
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
                <span className="text-muted-foreground">Stagiaires:</span>
                <span className="font-medium">{stagiaires.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contenu:</span>
                <span className="font-medium">Fiches complètes avec historique</span>
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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