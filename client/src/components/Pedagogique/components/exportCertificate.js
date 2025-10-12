// components/Pedagogique/components/certificateExports.js
import jsPDF from "jspdf";

export const exportCertificate = async (instructor, periodInfo) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 210] // A4 landscape
  });

  try {
    // تحميل صورة الحدود
    let borderImage = null;
    try {
      const borderResponse = await fetch("/img/border.jpg");
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

    // إضافة صورة الحدود إذا كانت متوفرة
    if (borderImage) {
      doc.addImage(borderImage, 'JPEG', 0, 0, 297, 210);
    }

    // إضافة الشعار في المنتصف الأعلى
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 130, 30, 20, 20); // 20x20 في المنتصف
    }

    // التاريخ في أعلى اليسار
    const currentDate = new Date().toLocaleDateString('fr-FR');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Meknes, le ${currentDate}`, 50, 35);

    // النص في أعلى اليمين
    const rightX = 255;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const maxWidth = Math.max(
      doc.getTextWidth("ROYAUME DU MAROC"),
      doc.getTextWidth("Forces Armées Royales"),
      doc.getTextWidth("Place d'arme meknes"),
      doc.getTextWidth("1 Bataillon de Setien des Transmissions")
    );

    doc.text("ROYAUME DU MAROC", rightX - (maxWidth - doc.getTextWidth("ROYAUME DU MAROC")) / 2, 32, { align: "right" });
    doc.text("Forces Armées Royales", rightX - (maxWidth - doc.getTextWidth("Forces Armées Royales")) / 2, 38, { align: "right" });
    doc.text("Place d'arme meknes", rightX - (maxWidth - doc.getTextWidth("Place d'arme meknes")) / 2, 44, { align: "right" });
    doc.text("1 Bataillon de Setien des Transmissions", rightX - (maxWidth - doc.getTextWidth("1 Bataillon de Setien des Transmissions")) / 2, 50, { align: "right" });

    // العنوان الرئيسي
    doc.setFontSize(20);
    doc.setFont("French", 'bold');
    doc.setTextColor(16, 85, 201); // لون أزرق داكن
    doc.text("Certificat d'Honneur et de Reconnaissance", 148, 70, { align: "center" });

    // نص الشهادة
    const instructorName = `${instructor.first_name} ${instructor.last_name}`;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    // النص الأول
    const text1 = "Le Commandant du 1° Bataillon de Soutien des Transmissions,";
    const text2 = "Monsieur M ElRRADI ANAS,";
    
    doc.setFont(undefined, 'bold');
    doc.text(text1, 50, 90);
    doc.text(text2, 40, 97);
    
    // النص الرئيسي كفقرة واحدة مع تباعد الأسطر 1.5 وعرض أقل
    doc.setFont(undefined, 'normal');
    const mainText = `        Atteste que Monsieur ${instructorName}, enseignant au sein du bataillon, s'est distingué durant le ${periodInfo.period} de ${periodInfo.value} par son professionnalisme exemplaire, sa rigueur, ainsi que par son engagement constant dans l'accomplissement de ses missions pédagogiques et formatives. En reconnaissance de ses efforts remarquables et de son dévouement, la présente attestation lui est décernée en témoignage d'estime et d'appréciation, et pour saluer sa contribution à l'amélioration du niveau de formation et de discipline.`;
    
    // تقليل عرض النص ليتناسب مع الصفحة
    const splitMainText = doc.splitTextToSize(mainText, 220); // تقليل العرض من 220 إلى 180
    
    // حساب موضع النص مع تباعد 1.5 بين الأسطر
    let textY = 110;
    const lineHeight = 7; // تباعد 1.5 بين الأسطر
    
    splitMainText.forEach(line => {
      doc.text(line, 40, textY); // بدء من 50 بدلاً من 40
      textY += lineHeight;
    });

    // التوقيع في الأسفل
    doc.setFontSize(10);
    doc.text("Fait à 1° B.S.T, le " + currentDate, 257, 150, { align: "right" });
    doc.setFont(undefined, 'bold');
    doc.text("Le Commandant de la 1° B.S.T", 257, 160, { align: "right" });

    // حفظ الملف
    const fileName = `Certificat_${instructorName.replace(/\s+/g, '_')}_${periodInfo.value.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error("Error exporting certificate:", error);
    throw error;
  }
};

