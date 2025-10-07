// app/not-found.js
"use client";

import React from 'react';
import Link from 'next/link';
import { Home, Search, ArrowRight, AlertCircle, RotateCcw, Navigation } from 'lucide-react';
import ModeToggle from '../components/button-tugle';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-black rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
        
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-sm text-muted-foreground">
            Code d'erreur: 404
          </div>
          <ModeToggle />
        </div>

        {/* Main Content */}
        <div className="text-center space-y-6">
          {/* Icon and Number */}
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="bg-destructive text-white px-3 py-1 rounded-full text-sm font-medium">
                404
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Page non trouvée
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Désolé, nous n'avons pas pu trouver la page que vous recherchez. 
              Elle a peut-être été déplacée ou supprimée.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium transition-colors shadow-sm hover:shadow"
            >
              <Home className="h-4 w-4" />
              Retour à l'accueil
              <ArrowRight className="h-4 w-4" />
            </Link>

            
          </div>
        </div>

        

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground">
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}