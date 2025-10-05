// components/UserForm.js
"use client";
import React from "react";
import { Camera, User, Mail, Lock, Shield, X } from "lucide-react";

export default function UserForm({
  open,
  onClose,
  onSubmit,
  editingUser,
  loading,
  formData,
  setFormData,
  selectedImage,
  handleImageChange,
  roles
}) {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {editingUser ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xl font-medium border-2 border-border">
                {selectedImage instanceof File ? (
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="Preview" 
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : selectedImage ? (
                  <img 
                    src={`${API_URL}${selectedImage}`} 
                    alt="Profile" 
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="absolute bottom-0 right-0 bg-sidebar-primary rounded-full p-1.5 border-2 border-card">
                  <Camera className="h-3 w-3 text-sidebar-primary-foreground" />
                </div>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <User className="h-4 w-4" />
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((f) => ({ ...f, username: e.target.value }))}
                placeholder="Entrez le nom d'utilisateur"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground dark:text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                placeholder="Entrez l'email"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground dark:text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Lock className="h-4 w-4" />
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                placeholder={editingUser ? "Laissez vide pour inchangé" : "Entrez le mot de passe"}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground dark:text-foreground placeholder:text-muted-foreground"
                required={!editingUser}
              />
              {editingUser && (
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide pour garder le mot de passe actuel
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Shield className="h-4 w-4" />
                Rôle
              </label>
              <select 
                value={formData.role} 
                onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground dark:text-foreground"
                required
              >
                <option value="">Sélectionnez un rôle</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading.submit}
              className="flex-1 px-4 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg hover:bg-sidebar-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading.submit && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              )}
              {editingUser ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}