// components/Pedagogique/components/exportInstructeurPdf.js
"use client";
import { formatDateForDisplay } from "../../../hooks/dateUtils";

export const exportInstructeurToPDF = async (instructeurs) => {
  try {
    const { jsPDF } = await import("jspdf");
    const autoTable = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFont("helvetica");

    // Get current date
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    // Load logo
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

    // Header drawing function
    const drawHeader = (docInstance) => {
      const pageWidth = docInstance.internal.pageSize.getWidth
        ? docInstance.internal.pageSize.getWidth()
        : docInstance.internal.pageSize.width;
      const margin = 15;
      const rightX = pageWidth - margin;

      // Logo centered
      const imgWidth = 20;
      const imgHeight = 20;
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = 10;
      try {
        if (logoDataUrl) {
          docInstance.addImage(logoDataUrl, "PNG", imgX, imgY, imgWidth, imgHeight);
        }
      } catch (e) {
        // ignore
      }

      // Left text
      docInstance.setFontSize(10);
      docInstance.setFont("helvetica", "normal");
      docInstance.text(`Meknès, le ${dateStr}`, margin, 16);

      // Right text
      const rightText = [
        "ROYAUME DU MAROC       ",
        "Forces Armées Royales        ",
        "Place d'arme meknes          ",
        "1 Bataillon de Setien des Transmissions"
      ];

      rightText.forEach((text, index) => {
        docInstance.text(text, rightX, 16 + (index * 6), { align: "right" });
      });
    };

    // Generate a page for each instructor
    for (let index = 0; index < instructeurs.length; index++) {
      const instructeur = instructeurs[index];
      
      if (index > 0) {
        doc.addPage();
      }

      // Draw header
      drawHeader(doc);

      // Main title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("FICHE INSTRUCTEUR", doc.internal.pageSize.getWidth() / 2, 50, { align: "center" });

      // Ligne sous le titre
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 55, doc.internal.pageSize.getWidth() - 20, 55);

      let startY = 65;

      // Profile photo if available
      if (instructeur.profile) {
        try {
          const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${instructeur.profile.url}`);
          if (profileResponse.ok) {
            const profileBlob = await profileResponse.blob();
            const profileDataUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(profileBlob);
            });
            
            doc.addImage(profileDataUrl, "JPEG", 20, startY, 30, 30);
            startY += 35;
          }
        } catch (e) {
          console.warn("Could not load profile image:", e);
        }
      }

      // Informations personnelles de l'instructeur
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMATIONS PERSONNELLES", 20, startY);
      startY += 10;

      // Tableau des informations personnelles
      const personalInfoData = [
        ["Nom", instructeur.last_name || "Non spécifié"],
        ["Prénom", instructeur.first_name || "Non spécifié"],
        ["MLE", instructeur.mle || "Non spécifié"],
        ["Grade", instructeur.grade || "Non spécifié"],
        ["Spécialité", instructeur.specialite?.name || "Non spécifié"],
        ["CIN", instructeur.cin || "Non spécifié"],
        ["Téléphone", instructeur.phone || "Non spécifié"],
        ["Date de naissance", formatDateForDisplay(instructeur.date_naissance) || "Non spécifié"],
        ["Adresse", instructeur.adress || "Non spécifié"]
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

      // Note: We are not including the rate because we don't have it in the InstructeurTab context.
      // If you want to include rate, you would need to pass remarks data and calculate it.

      // Pied de page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.getWidth() / 2, 285, { align: "center" });
      }
    }

    // Sauvegarder le PDF
    const fileName = `fiches_instructeurs_${now.getTime()}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};