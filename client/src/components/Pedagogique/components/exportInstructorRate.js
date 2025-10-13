// components/Pedagogique/components/exportInstructorRate.js
"use client";
import React from "react";

export const exportInstructorsTable = async (instructors, periodInfo, filterType) => {
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
        "ROYAUME DU MAROC        ",
        "Forces Armées Royales        ",
        "Place d'Arme Meknès         ",
        "1 Bataillon de Setien des Transmissions"
      ];

      rightText.forEach((text, index) => {
        docInstance.text(text, rightX, 16 + (index * 6), { align: "right" });
      });
    };

    // Draw header
    drawHeader(doc);

    // Main title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("STATISTIQUES DES INSTRUCTEURS", doc.internal.pageSize.getWidth() / 2, 50, { align: "center" });

    // Period information
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Période: ${periodInfo.value}`, doc.internal.pageSize.getWidth() / 2, 60, { align: "center" });

    // Prepare table data - sort by score (descending)
    const sortedInstructors = [...instructors].sort((a, b) => {
      const scoreA = a.positive + a.negative > 0 ? (a.positive / (a.positive + a.negative)) * 100 : 0;
      const scoreB = b.positive + b.negative > 0 ? (b.positive / (b.positive + b.negative)) * 100 : 0;
      return scoreB - scoreA;
    });

    const tableData = sortedInstructors.map((instructor, index) => {
      const totalRemarks = (instructor.positive || 0) + (instructor.negative || 0);
      const score = totalRemarks > 0 ? ((instructor.positive / totalRemarks) * 100).toFixed(2) : "0.00";
      
      return [
        (index + 1).toString(),
        instructor.name || `${instructor.first_name} ${instructor.last_name}`,
        (instructor.positive || 0).toString(),
        (instructor.negative || 0).toString(),
        `${score}%`
      ];
    });

    // Create the table
    autoTable.default(doc, {
      startY: 70,
      head: [["N°", "INSTRUCTEUR", "REMARQUES POSITIVES", "REMARQUES NÉGATIVES", "SCORE FINAL"]],
      body: tableData,
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 5,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [41, 128, 185], // Blue background
        textColor: [255, 255, 255], // White text
        fontStyle: "bold",
        halign: "center"
      },
      bodyStyles: {
        halign: "center"
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240] // Light gray for alternate rows
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" }, // N°
        1: { cellWidth: 60, halign: "left" },   // Instructeur
        2: { cellWidth: 30, halign: "center" }, // Remarques Positives
        3: { cellWidth: 30, halign: "center" }, // Remarques Négatives
        4: { cellWidth: 25, halign: "center" }  // Score Final
      },
      margin: { left: 20, right: 20 },
      tableWidth: "auto",
    });

    // Add summary section
    const finalY = doc.lastAutoTable.finalY + 20;
    
    // Calculate overall statistics
    const totalInstructors = instructors.length;
    const totalPositive = instructors.reduce((sum, instructor) => sum + (instructor.positive || 0), 0);
    const totalNegative = instructors.reduce((sum, instructor) => sum + (instructor.negative || 0), 0);
    const totalRemarks = totalPositive + totalNegative;
    const overallScore = totalRemarks > 0 ? ((totalPositive / totalRemarks) * 100).toFixed(2) : "0.00";

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("RÉSUMÉ GÉNÉRAL", 20, finalY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const summaryLines = [
      `Nombre total d'instructeurs: ${totalInstructors}`,
      `Remarques positives totales: ${totalPositive}`,
      `Remarques négatives totales: ${totalNegative}`,
      `Score général: ${overallScore}%`
    ];
    
    summaryLines.forEach((line, index) => {
      doc.text(line, 20, finalY + 10 + (index * 6));
    });

    // Add signature area at bottom right
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Commandant 1° B.S.T", doc.internal.pageSize.getWidth() - 20, pageHeight - 30, { align: "right" });

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: "center" });
    }

    // Save the PDF
    const fileName = `statistiques_instructeurs_${periodInfo.period}_${periodInfo.value.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

    return true;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Erreur lors de la génération du PDF');
  }
};