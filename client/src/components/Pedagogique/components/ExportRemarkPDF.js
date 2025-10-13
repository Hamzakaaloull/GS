// components/Pedagogique/components/ExportRemarkPDF.js
"use client";
import { formatDateForDisplay } from "@/hooks/dateUtils";

export const exportRemarksToPDF = async (remarks) => {
  try {
    const { jsPDF } = await import("jspdf");
    const autoTable = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFont("helvetica");

    // الحصول على التاريخ الحالي
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    // تحميل الشعار
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

    // دالة رسم الرأس
    const drawHeader = (docInstance) => {
      const pageWidth = docInstance.internal.pageSize.getWidth
        ? docInstance.internal.pageSize.getWidth()
        : docInstance.internal.pageSize.width;
      const margin = 15;

      // النص على اليسار
      docInstance.setFontSize(10);
      docInstance.setFont("helvetica", "normal");
      docInstance.text(`Meknès, le ${dateStr}`, margin, 16);

      // الشعار في المنتصف
      const imgWidth = 20;
      const imgHeight = 20;
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = 10;
      try {
        if (logoDataUrl) {
          docInstance.addImage(logoDataUrl, "PNG", imgX, imgY, imgWidth, imgHeight);
        }
      } catch (e) {
        // تجاهل الخطأ
      }

      // النص على اليمين
      const rightText = [
       "ROYAUME DU MAROC        ",
        "Forces Armées Royales        ",
        "Place d'Arme Meknès         ",
        "1 Bataillon de Setien des Transmissions"
      ];

      rightText.forEach((text, index) => {
        const textWidth = docInstance.getTextWidth(text);
        docInstance.text(text, pageWidth - margin - textWidth, 16 + (index * 5));
      });
    };

    // رسم الرأس
    drawHeader(doc);

    // العنوان الرئيسي
    doc.setFontSize(16);
    doc.setFont("helvetica", "sans-serif");
    doc.text("LISTE DES REMARQUES", doc.internal.pageSize.getWidth() / 2, 50, { align: "center" });

    // معلومات الفترة
    if (remarks.length > 0) {
      const dates = remarks.map(remark => new Date(remark.date));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      let periodText = "";
      if (minDate.getTime() === maxDate.getTime()) {
        periodText = `Période: ${formatDateForDisplay(minDate)}`;
      } else {
        periodText = `Période: Du ${formatDateForDisplay(minDate)} au ${formatDateForDisplay(maxDate)}`;
      }
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(periodText, doc.internal.pageSize.getWidth() / 2, 58, { align: "center" });
    }

    // إعداد بيانات الجدول
    const tableData = remarks.map((remark) => {
      const remarkData = remark;
      const instructeur = remarkData.instructeur?.data || remarkData.instructeur;
      const subject = remarkData.subject?.data || remarkData.subject;
      
      return [
        formatDateForDisplay(remarkData.date),
        `${instructeur?.first_name || ''} ${instructeur?.last_name || ''}`,
        subject?.title || 'Non spécifié',
        remarkData.type === 'positive' ? 'Positive' : 'Négative',
        `${remarkData.start_time} - ${remarkData.end_time}`,
        remarkData.content || ''
      ];
    });

    // إنشاء الجدول
    autoTable.default(doc, {
      startY: 65,
      head: [["Date", "Instructeur", "Matière", "Type", "Horaire", "Contenu"]],
      body: tableData,
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 3,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center"
      },
      bodyStyles: {
        halign: "left"
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: "center" }, // Date
        1: { cellWidth: 25, halign: "left" },   // Instructeur
        2: { cellWidth: 25, halign: "left" },   // Matière
        3: { cellWidth: 17, halign: "center" }, // Type
        4: { cellWidth: 30, halign: "center" }, // Horaire
        5: { cellWidth: 65, halign: "left" }    // Contenu (أوسع عمود للنص)
      },
      margin: { left: 15, right: 10 },
      tableWidth: "auto",
      didDrawPage: function (data) {
        // التوقيع في كل صفحة
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Fait à 1° B.S.T, le ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`, 170, 262, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text("Le Commandant de la 1° B.S.T", 172, 270, { align: "right" });
      }
    });

    // إضافة أرقام الصفحات
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // حفظ PDF
    const fileName = `remarques_${now.getTime()}.pdf`;
    doc.save(fileName);

    return true;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Erreur lors de la génération du PDF');
  }
};