"use client";
import React from "react";
import { X, PieChart } from "lucide-react";

export default function RemarqueStats({ open, onClose, data }) {
  if (!open) return null;

  const { positive, negative } = data;
  const total = positive + negative;
  
  const positivePercentage = total > 0 ? Math.round((positive / total) * 100) : 0;
  const negativePercentage = total > 0 ? Math.round((negative / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex  items-center justify-center z-50 p-4">
      <div className="bg-card border border-border h-full overflow-auto rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Statistiques des Remarques
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pie Chart Visualization */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Positive slice */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${positivePercentage * 2.513} ${100 * 2.513}`}
                />
                {/* Negative slice */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${negativePercentage * 2.513} ${100 * 2.513}`}
                  strokeDashoffset={`${-positivePercentage * 2.513}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend and Numbers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-medium text-foreground">Positives</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">{positive}</div>
                <div className="text-sm text-muted-foreground">{positivePercentage}%</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="font-medium text-foreground">Négatives</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">{negative}</div>
                <div className="text-sm text-muted-foreground">{negativePercentage}%</div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Résumé</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Total des remarques: {total}</p>
              <p>• Remarques positives: {positive} ({positivePercentage}%)</p>
              <p>• Remarques négatives: {negative} ({negativePercentage}%)</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}