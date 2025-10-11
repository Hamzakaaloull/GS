// utils/dateUtils.js

// دالة لضبط التاريخ لعرضه بشكل صحيح (إضافة يوم واحد)
export const adjustDateForDisplay = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    // إضافة 24 ساعة (يوم واحد) لتصحيح العرض
    return new Date(date.getTime() + (24 * 60 * 60 * 1000));
  } catch (error) {
    console.error('Error adjusting date for display:', dateString, error);
    return null;
  }
};
export const formatDateForAPI = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};
// دالة لتنسيق التاريخ للعرض
export const formatDateForDisplay = (dateString) => {
  const adjustedDate = adjustDateForDisplay(dateString);
  if (!adjustedDate) return 'غير محدد';
  
  return adjustedDate.toLocaleDateString('fr-FR');
};

// دالة لتحويل التاريخ إلى تنسيق YYYY-MM-DD لاستخدامه في حقل input type="date"
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    // إضافة يوم واحد لتصحيح التاريخ
    const adjustedDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', dateString, error);
    return '';
  }
};

// دالة لاستخراج السنة من التاريخ
export const getYearFromDate = (dateString) => {
  const adjustedDate = adjustDateForDisplay(dateString);
  if (!adjustedDate) return '';
  
  return adjustedDate.getFullYear();
};

// دالة لضبط التاريخ للتصفية
export const adjustDateForFilter = (dateString) => {
  const adjustedDate = adjustDateForDisplay(dateString);
  if (!adjustedDate) return null;
  
  return adjustedDate.toISOString().split('T')[0];
};

// دالة لحساب المدة بين تاريخين
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
};