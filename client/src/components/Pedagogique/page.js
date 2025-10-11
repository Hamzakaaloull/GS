// components/Pedagogique/page.js
"use client";
import React, { useState, useEffect } from "react";
import { BookOpen, Users, NotepadText, Plus, Download, Search, Filter, X } from "lucide-react";
import InstructeurTab from "./components/InstructeurTab";
import SubjectTab from "./components/SubjectTab";
import RemarkTab from "./components/RemarkTab";

export default function PedagogiquePage() {
  const [activeTab, setActiveTab] = useState("subject");
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "instructeur", label: "Instructeurs", icon: Users },
    { id: "subject", label: "Matières", icon: BookOpen },
    { id: "remark", label: "Remarques", icon: NotepadText }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pédagogique</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des instructeurs, matières et remarques pédagogiques
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-lg">
        <div className="border-b border-border">
          <div className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "instructeur" && <InstructeurTab />}
          {activeTab === "subject" && <SubjectTab />}
          {activeTab === "remark" && <RemarkTab />}
        </div>
      </div>
    </div>
  );
}