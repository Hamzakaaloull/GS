// components/Pedagogique/components/StatisticsDialog.js
"use client";
import React, { useMemo, useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Award, Frown, Calendar, Filter, Download, Table } from "lucide-react";
import { exportCertificate } from "./exportCertificate";

export default function StatisticsDialog({ open, onClose, remarks, instructeurs }) {
  const [filterType, setFilterType] = useState("month");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportingTable, setExportingTable] = useState(false);

  // تهيئة التواريخ الافتراضية
  useEffect(() => {
    if (open) {
      const now = new Date();
      setSelectedDate(now.toISOString().split('T')[0]);
      setSelectedMonth(now.toISOString().substring(0, 7));
      setSelectedYear(now.getFullYear().toString());
    }
  }, [open]);

  const statistics = useMemo(() => {
    if (!remarks.length) return null;

    // تصفية الملاحظات حسب الفلتر المحدد
    const filteredRemarks = remarks.filter(remark => {
      const remarkData = remark.attributes || remark;
      const remarkDate = new Date(remarkData.date);
      
      switch (filterType) {
        case "day":
          return remarkData.date === selectedDate;
        
        case "month":
          const remarkMonth = remarkDate.toISOString().substring(0, 7);
          return remarkMonth === selectedMonth;
        
        case "year":
          const remarkYear = remarkDate.getFullYear().toString();
          return remarkYear === selectedYear;
        
        default:
          return true;
      }
    });

    if (filteredRemarks.length === 0) return null;

    // Count by type
    const typeCounts = filteredRemarks.reduce((acc, remark) => {
      const type = remark.attributes?.type || remark.type || 'non_specifie';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, { positive: 0, negative: 0, non_specifie: 0 });

    // Count by instructor
    const instructorStats = {};
    filteredRemarks.forEach(remark => {
      const remarkData = remark.attributes || remark;
      const instructeur = remarkData.instructeur?.data || remarkData.instructeur;
      const instructorId = instructeur?.id || instructeur?.documentId;
      
      if (instructorId) {
        if (!instructorStats[instructorId]) {
          instructorStats[instructorId] = {
            id: instructorId,
            positive: 0,
            negative: 0,
            total: 0,
            name: `${instructeur?.first_name} ${instructeur?.last_name}`,
            first_name: instructeur?.first_name,
            last_name: instructeur?.last_name
          };
        }
        
        const type = remarkData.type || 'non_specifie';
        instructorStats[instructorId][type]++;
        instructorStats[instructorId].total++;
      }
    });

    // Find top positive and negative instructors
    const instructorsArray = Object.values(instructorStats);
    const topPositive = instructorsArray
      .filter(instructor => instructor.positive > 0)
      .sort((a, b) => b.positive - a.positive)[0];
    
    const topNegative = instructorsArray
      .filter(instructor => instructor.negative > 0)
      .sort((a, b) => b.negative - a.negative)[0];

    return {
      typeCounts,
      total: filteredRemarks.length,
      topPositive,
      topNegative,
      filteredRemarks,
      instructorStats: instructorsArray.sort((a, b) => b.positive - a.positive)
    };
  }, [remarks, filterType, selectedDate, selectedMonth, selectedYear]);

  const getPercentage = (count) => {
    if (!statistics || statistics.total === 0) return "0.0";
    return ((count / statistics.total) * 100).toFixed(1);
  };

  const getFilterDisplayText = () => {
    switch (filterType) {
      case "day":
        return new Date(selectedDate).toLocaleDateString('fr-FR');
      case "month":
        return new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case "year":
        return selectedYear;
      default:
        return "";
    }
  };

  const handleExportCertificate = async () => {
    if (!statistics?.topPositive) {
      alert("Aucun instructeur positif trouvé pour exporter le certificat");
      return;
    }

    if (filterType === "day") {
      alert("Le certificat ne peut être exporté que pour une période mensuelle ou annuelle");
      return;
    }

    setExporting(true);
    try {
      const periodInfo = {
        period: filterType === "month" ? "mois" : "année",
        value: filterType === "month" 
          ? new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
          : selectedYear
      };
      
      await exportCertificate(statistics.topPositive, periodInfo);
    } catch (error) {
      console.error("Error exporting certificate:", error);
      alert("Erreur lors de l'exportation du certificat");
    } finally {
      setExporting(false);
    }
  };

  const handleExportTable = async () => {
    if (!statistics?.instructorStats || statistics.instructorStats.length === 0) {
      alert("Aucune donnée disponible pour exporter le tableau");
      return;
    }

    setExportingTable(true);
    try {
      const periodInfo = {
        period: filterType === "month" ? "mois" : filterType === "year" ? "année" : "jour",
        value: getFilterDisplayText()
      };
      
      await exportInstructorsTable(statistics.instructorStats, periodInfo, filterType);
    } catch (error) {
      console.error("Error exporting table:", error);
      alert("Erreur lors de l'exportation du tableau");
    } finally {
      setExportingTable(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistiques des Remarques
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* فلاتر الإحصائيات */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres des Statistiques
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleExportTable}
                  disabled={exportingTable || !statistics?.instructorStats}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 text-sm"
                >
                  {exportingTable ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Table className="h-4 w-4" />
                  )}
                  Exporter Tableau
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* نوع الفلتر */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Période
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                >
                  <option value="day">Jour</option>
                  <option value="month">Mois</option>
                  <option value="year">Année</option>
                </select>
              </div>

              {/* اختيار التاريخ حسب نوع الفلتر */}
              {filterType === "day" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  />
                </div>
              )}

              {filterType === "month" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mois
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  />
                </div>
              )}

              {filterType === "year" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Année
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* عرض الفلتر المحدد */}
            <div className="mt-3 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Période sélectionnée: {getFilterDisplayText()}
                </span>
              </div>
            </div>
          </div>

          {!statistics ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune donnée disponible pour la période sélectionnée</p>
            </div>
          ) : (
            <>
              {/* Résumé général */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statistics.typeCounts.positive}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Positives
                  </div>
                  <div className="text-xs text-green-500 dark:text-green-300 mt-1">
                    {getPercentage(statistics.typeCounts.positive)}%
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {statistics.typeCounts.negative}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Négatives
                  </div>
                  <div className="text-xs text-red-500 dark:text-red-300 mt-1">
                    {getPercentage(statistics.typeCounts.negative)}%
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statistics.total}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Total
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                    100%
                  </div>
                </div>
              </div>

              {/* Diagramme circulaire simplifié */}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-medium text-foreground mb-4 text-center">
                  Répartition des types de remarques
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Cercle de fond */}
                    <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    
                    {/* Segment positif */}
                    <div
                      className="absolute inset-0 rounded-full bg-green-500"
                      style={{
                        clipPath: `conic-gradient(from 0deg, green 0%, green ${getPercentage(statistics.typeCounts.positive)}%, transparent ${getPercentage(statistics.typeCounts.positive)}%)`
                      }}
                    ></div>
                    
                    {/* Segment négatif */}
                    <div
                      className="absolute inset-0 rounded-full bg-red-500"
                      style={{
                        clipPath: `conic-gradient(from ${getPercentage(statistics.typeCounts.positive)}deg, red ${getPercentage(statistics.typeCounts.positive)}%, red ${parseFloat(getPercentage(statistics.typeCounts.positive)) + parseFloat(getPercentage(statistics.typeCounts.negative))}%, transparent ${parseFloat(getPercentage(statistics.typeCounts.positive)) + parseFloat(getPercentage(statistics.typeCounts.negative))}%)`
                      }}
                    ></div>

                    {/* Centre */}
                    <div className="absolute inset-8 rounded-full bg-card"></div>
                    
                    {/* Texte au centre */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{statistics.total}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Légende */}
                <div className="flex justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Positives ({getPercentage(statistics.typeCounts.positive)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Négatives ({getPercentage(statistics.typeCounts.negative)}%)</span>
                  </div>
                </div>
              </div>

              {/* Top instructeurs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meilleur instructeur (positif) */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-foreground">Meilleur Instructeur</h3>
                    </div>
                    {filterType !== "day" && statistics.topPositive && (
                      <button
                        onClick={handleExportCertificate}
                        disabled={exporting}
                        className="bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 text-sm"
                      >
                        {exporting ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        Exporter Certificat
                      </button>
                    )}
                  </div>
                  {statistics.topPositive ? (
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {statistics.topPositive.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {statistics.topPositive.positive} remarque(s) positive(s)
                      </div>
                      <div className="text-xs text-green-500 dark:text-green-300 mt-2">
                        {((statistics.topPositive.positive / statistics.topPositive.total) * 100).toFixed(1)}% de remarques positives
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Aucune donnée disponible</div>
                  )}
                </div>

                {/* Instructeur avec le plus de négatifs */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Frown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    <h3 className="text-lg font-semibold text-foreground">À améliorer</h3>
                  </div>
                  {statistics.topNegative ? (
                    <div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                        {statistics.topNegative.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {statistics.topNegative.negative} remarque(s) négative(s)
                      </div>
                      <div className="text-xs text-red-500 dark:text-red-300 mt-2">
                        {((statistics.topNegative.negative / statistics.topNegative.total) * 100).toFixed(1)}% de remarques négatives
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Aucune donnée disponible</div>
                  )}
                </div>
              </div>

              {/* Détails supplémentaires */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-3">Détails par type</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Remarques positives:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {statistics.typeCounts.positive} ({getPercentage(statistics.typeCounts.positive)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Remarques négatives:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {statistics.typeCounts.negative} ({getPercentage(statistics.typeCounts.negative)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Remarques non spécifiées:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {statistics.typeCounts.non_specifie} ({getPercentage(statistics.typeCounts.non_specifie)}%)
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}