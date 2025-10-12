// utils/exportCertificate.js
import jsPDF from "jspdf";

export const exportCertificate = async (topPositive, filterType, selectedMonth, selectedYear, remarks) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [297, 210] // A4 landscape
    });

    // تحميل صورة الحدود
    let borderImage = null;
    try {
      const borderResponse = await fetch("/img/certificate-border.jpg");
      if (borderResponse.ok) {
        const borderBlob = await borderResponse.blob();
        borderImage = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(borderBlob);
        });
      }
    } catch (e) {
      console.warn("Could not load border image:", e);
    }

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

    // الصفحة الأولى مع الحدود
    if (borderImage) {
      doc.addImage(borderImage, 'JPEG', 0, 0, 297, 210);
    }

    // إضافة الشعار
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 138.5, 20, 20, 20); // مركز الصفحة، حجم 20x20
    }

    // التاريخ في أعلى اليسار
    const currentDate = new Date().toLocaleDateString('fr-FR');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Meknes, le ${currentDate}`, 30, 30);

    // النص في أعلى اليمين
    const rightX = 270;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    
    const maxWidth = Math.max(
      doc.getTextWidth("ROYAUME DU MAROC"),
      doc.getTextWidth("Forces Armées Royales"),
      doc.getTextWidth("Place d'arme meknes"),
      doc.getTextWidth("1 Bataillon de Setien des Transmissions")
    );

    doc.text("ROYAUME DU MAROC", rightX - (maxWidth - doc.getTextWidth("ROYAUME DU MAROC")) / 2, 25, { align: "right" });
    doc.text("Forces Armées Royales", rightX - (maxWidth - doc.getTextWidth("Forces Armées Royales")) / 2, 32, { align: "right" });
    doc.text("Place d'arme meknes", rightX - (maxWidth - doc.getTextWidth("Place d'arme meknes")) / 2, 39, { align: "right" });
    doc.text("1 Bataillon de Setien des Transmissions", rightX - (maxWidth - doc.getTextWidth("1 Bataillon de Setien des Transmissions")) / 2, 46, { align: "right" });

    // العنوان الرئيسي
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text("Certificat d'Honneur et de Reconnaissance", 148, 80, { align: "center" });

    // نص الشهادة
    const periodInfo = getPeriodTextForCertificate(filterType, selectedMonth, selectedYear);
    const instructorName = `${topPositive.first_name} ${topPositive.last_name}`;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    // النص الأول
    doc.setFont(undefined, 'bold');
    doc.text("Le Commandant du 1° Bataillon de Soutien des Transmissions,", 40, 110);
    doc.text("Monsieur M ElRRADI ANAS,", 40, 120);
    
    doc.setFont(undefined, 'normal');
    const text3 = `atteste que Monsieur ${instructorName}, enseignant au sein du bataillon, s'est distingué durant le ${periodInfo.period} de ${periodInfo.value} par son professionnalisme exemplaire, sa rigueur, ainsi que par son engagement constant dans l'accomplissement de ses missions pédagogiques et formatives.`;
    const splitText3 = doc.splitTextToSize(text3, 220);
    doc.text(splitText3, 40, 140);
    
    const text4 = `En reconnaissance de ses efforts remarquables et de son dévouement,`;
    const text5 = `la présente attestation lui est décernée en témoignage d'estime et d'appréciation,`;
    const text6 = `et pour saluer sa contribution à l'amélioration du niveau de formation`;
    const text7 = `et de discipline.`;

    doc.text(text4, 40, 170);
    doc.text(text5, 40, 177);
    doc.text(text6, 40, 184);
    doc.text(text7, 40, 191);

    // التوقيع في الأسفل
    doc.setFontSize(10);
    doc.text("Fait à 1° B.S.T, le " + currentDate, 200, 200, { align: "right" });
    doc.setFont(undefined, 'bold');
    doc.text("Le Commandant de la 1° B.S.T", 200, 207, { align: "right" });

    // الصفحة الثانية بدون حدود (3000px * 2000px تعادل 1056.66mm * 705.83mm)
    doc.addPage([1056.66, 705.83], 'landscape');

    // إضافة الشعار في الصفحة الثانية
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 518.33, 50, 20, 20); // مركز الصفحة
    }

    // التاريخ في أعلى اليسار
    doc.setFontSize(10);
    doc.text(`Meknes, le ${currentDate}`, 50, 40);

    // النص في أعلى اليمين
    const rightX2 = 1006.66;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    
    doc.text("ROYAUME DU MAROC", rightX2 - (maxWidth - doc.getTextWidth("ROYAUME DU MAROC")) / 2, 35, { align: "right" });
    doc.text("Forces Armées Royales", rightX2 - (maxWidth - doc.getTextWidth("Forces Armées Royales")) / 2, 42, { align: "right" });
    doc.text("Place d'arme meknes", rightX2 - (maxWidth - doc.getTextWidth("Place d'arme meknes")) / 2, 49, { align: "right" });
    doc.text("1 Bataillon de Setien des Transmissions", rightX2 - (maxWidth - doc.getTextWidth("1 Bataillon de Setien des Transmissions")) / 2, 56, { align: "right" });

    // عنوان الصفحة الثانية
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 139);
    doc.text(`Détail des Remarques - ${instructorName}`, 528.33, 100, { align: "center" });

    // معلومات الفترة
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Période: ${periodInfo.value}`, 528.33, 120, { align: "center" });

    // إحصائيات سريعة
    const positiveCount = topPositive.positive;
    const negativeCount = topPositive.negative;
    const totalCount = topPositive.total;
    const positivePercentage = ((positiveCount / totalCount) * 100).toFixed(1);
    const negativePercentage = ((negativeCount / totalCount) * 100).toFixed(1);

    doc.setFontSize(12);
    doc.text(`Total des remarques: ${totalCount}`, 100, 150);
    doc.setTextColor(0, 128, 0);
    doc.text(`Remarques positives: ${positiveCount} (${positivePercentage}%)`, 100, 165);
    doc.setTextColor(255, 0, 0);
    doc.text(`Remarques négatives: ${negativeCount} (${negativePercentage}%)`, 100, 180);
    doc.setTextColor(0, 0, 0);

    // جدول الملاحظات
    const tableTop = 220;
    const tableLeft = 50;
    const rowHeight = 25;
    const colWidths = [40, 80, 100, 500, 100, 80]; // عرض الأعمدة

    // عناوين الجدول
    doc.setFont(undefined, 'bold');
    doc.text("No.", tableLeft, tableTop);
    doc.text("Date", tableLeft + colWidths[0], tableTop);
    doc.text("Type", tableLeft + colWidths[0] + colWidths[1], tableTop);
    doc.text("Contenu", tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
    doc.text("Matière", tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);
    doc.text("Horaire", tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop);

    // بيانات الجدول
    doc.setFont(undefined, 'normal');
    const instructorRemarks = remarks.filter(remark => {
      const remarkData = remark.attributes || remark;
      const instructeur = remarkData.instructeur?.data || remarkData.instructeur;
      const instructorId = instructeur?.id || instructeur?.documentId;
      return instructorId === (topPositive.id || topPositive.documentId);
    });

    instructorRemarks.forEach((remark, index) => {
      const remarkData = remark.attributes || remark;
      const yPos = tableTop + (index + 1) * rowHeight;
      
      if (yPos > 650) {
        // إضافة صفحة جديدة إذا تجاوزت البيانات نهاية الصفحة
        doc.addPage([1056.66, 705.83], 'landscape');
        // إعادة رسم عناوين الجدول في الصفحة الجديدة
        doc.setFont(undefined, 'bold');
        doc.text("No.", tableLeft, 50);
        doc.text("Date", tableLeft + colWidths[0], 50);
        doc.text("Type", tableLeft + colWidths[0] + colWidths[1], 50);
        doc.text("Contenu", tableLeft + colWidths[0] + colWidths[1] + colWidths[2], 50);
        doc.text("Matière", tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], 50);
        doc.text("Horaire", tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], 50);
        doc.setFont(undefined, 'normal');
      }

      const currentY = yPos > 650 ? 50 + (index - Math.floor((650 - tableTop) / rowHeight) + 1) * rowHeight : yPos;

      doc.text((index + 1).toString(), tableLeft, currentY);
      doc.text(new Date(remarkData.date).toLocaleDateString('fr-FR'), tableLeft + colWidths[0], currentY);
      
      // لون النوع
      if (remarkData.type === 'positive') {
        doc.setTextColor(0, 128, 0);
      } else {
        doc.setTextColor(255, 0, 0);
      }
      doc.text(remarkData.type === 'positive' ? 'Positive' : 'Négative', tableLeft + colWidths[0] + colWidths[1], currentY);
      doc.setTextColor(0, 0, 0);
      
      const content = doc.splitTextToSize(remarkData.content || '', colWidths[3] - 10);
      doc.text(content, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], currentY);
      
      const subject = remarkData.subject?.data || remarkData.subject;
      doc.text(subject?.title || 'Non spécifié', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY);
      doc.text(`${remarkData.start_time} - ${remarkData.end_time}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY);
    });

    // حفظ الملف
    const fileName = `Certificat_${instructorName.replace(/\s+/g, '_')}_${periodInfo.value.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error("Error exporting certificate:", error);
    throw new Error("Erreur lors de l'exportation du certificat");
  }
};

const getPeriodTextForCertificate = (filterType, selectedMonth, selectedYear) => {
  switch (filterType) {
    case "month":
      return {
        period: "mois",
        value: new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      };
    case "year":
      return {
        period: "année",
        value: selectedYear
      };
    default:
      return {
        period: "période",
        value: "Non spécifiée"
      };
  }
};