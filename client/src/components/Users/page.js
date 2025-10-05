// app/users/page.js
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Shield, AlertCircle } from "lucide-react";
import UserTable from "./components/UserTable";
import UserForm from "./components/Userform";
import UserDialogs from "./components/UserDialogs";

export default function UsersPage() {
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    profile: null,
  });
  const [loading, setLoading] = useState({ 
    global: false, 
    delete: false, 
    submit: false,
    auth: true 
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" 
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAccessDenied(true);
        setLoading(p => ({ ...p, auth: false }));
        return;
      }

      const res = await fetch(
        `${API_URL}/api/users/me?populate=role`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );
      
      if (res.ok) {
        const userData = await res.json();
        setCurrentUser(userData);
        
        if (userData.role?.name !== 'admin') {
          setAccessDenied(true);
        } else {
          fetchUsers();
          fetchRoles();
        }
      } else {
        setAccessDenied(true);
      }
    } catch (err) {
      setAccessDenied(true);
    } finally {
      setLoading(p => ({ ...p, auth: false }));
    }
  }

  async function fetchUsers() {
    setLoading((p) => ({ ...p, global: true }));
    try {
      const res = await fetch(
        `${API_URL}/api/users?populate=role&populate=profile`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setUsers(data || []);
    } catch (error) {
      showSnackbar("Erreur lors du chargement des utilisateurs", "error");
    } finally {
      setLoading((p) => ({ ...p, global: false }));
    }
  }

  async function fetchRoles() {
    try {
      const res = await fetch(
        `${API_URL}/api/users-permissions/roles`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          } 
        }
      );
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (error) {
      showSnackbar("Erreur lors du chargement des rôles", "error");
    }
  }

  function handleOpen(user = null) {
    if (user) {
      setEditingUser(user.id);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        role: user.role?.id || "",
        profile: user.profile?.id || null,
      });
      setSelectedImage(user.profile?.url || null);
    } else {
      setEditingUser(null);
      setFormData({ 
        username: "", 
        email: "", 
        password: "", 
        role: "", 
        profile: null
      });
      setSelectedImage(null);
    }
    setOpen(true);
  }

  async function handleImageUpload(file) {
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await fetch(
        `${API_URL}/api/upload`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
          body: formData,
        }
      );
      const uploaded = await res.json();
      return uploaded[0].id;
    } catch (error) {
      showSnackbar("Erreur lors du téléchargement de l'image", "error");
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading((p) => ({ ...p, submit: true }));
    try {
      let profileId = formData.profile;
      if (selectedImage instanceof File) {
        profileId = await handleImageUpload(selectedImage);
      }

      const url = editingUser
        ? `${API_URL}/api/users/${editingUser}`
        : `${API_URL}/api/users`;
      const method = editingUser ? "PUT" : "POST";
      
      const body = {
        username: formData.username,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        role: formData.role,
        ...(profileId && { profile: profileId }),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Erreur lors de l'opération");
      }

      await fetchUsers();
      setOpen(false);
      showSnackbar(
        editingUser ? "Utilisateur modifié avec succès" : "Utilisateur créé avec succès", 
        "success"
      );
    } catch (err) {
      showSnackbar(err.message, "error");
    } finally {
      setLoading((p) => ({ ...p, submit: false }));
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setFormData((p) => ({ ...p, profile: null }));
    }
  }

  function confirmDelete(id) {
    setUserToDelete(id);
    setOpenConfirm(true);
  }

  async function handleDeleteConfirmed() {
    setLoading((p) => ({ ...p, delete: true }));
    try {
      await fetch(
        `${API_URL}/api/users/${userToDelete}`,
        {
          method: "DELETE",
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}` 
          },
        }
      );
      await fetchUsers();
      showSnackbar("Utilisateur supprimé avec succès", "success");
    } catch (error) {
      showSnackbar("Erreur lors de la suppression", "error");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
      setOpenConfirm(false);
      setUserToDelete(null);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  // إصلاح الفلترة - مقارنة صحيحة
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // إصلاح: مقارنة role.id مع selectedRoleFilter
    const matchesRole = !selectedRoleFilter || 
                       (user.role && user.role.id.toString() === selectedRoleFilter);
    
    return matchesSearch && matchesRole;
  });

  if (loading.auth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-primary"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="p-6">
        <div className="bg-destructive/15 text-destructive border border-destructive/50 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Accès refusé</p>
            <p className="text-sm mt-1">Seuls les administrateurs peuvent accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les utilisateurs et leurs permissions
          </p>
        </div>
        <button 
          onClick={() => handleOpen()} 
          className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Utilisateur
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground dark:text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <select 
            value={selectedRoleFilter} 
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-48 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:border-transparent text-foreground dark:text-foreground"
          >
            <option value="">Tous les rôles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id.toString()}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Utilisateurs</h2>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-sm">
              {filteredUsers.length}
            </span>
          </div>
        </div>
        <div className="p-0">
          <UserTable
            users={filteredUsers}
            loading={loading.global}
            API_URL={API_URL}
            currentUser={currentUser}
            handleEdit={handleOpen}
            handleDelete={confirmDelete}
            loadingDelete={loading.delete}
            userToDelete={userToDelete}
          />
        </div>
      </div>

      {/* User Form Dialog */}
      <UserForm
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        editingUser={editingUser}
        loading={loading}
        formData={formData}
        setFormData={setFormData}
        selectedImage={selectedImage}
        handleImageChange={handleImageChange}
        roles={roles}
      />

      {/* Confirmation Dialogs and Snackbar */}
      <UserDialogs
        openConfirm={openConfirm}
        onCloseConfirm={() => setOpenConfirm(false)}
        handleDeleteConfirmed={handleDeleteConfirmed}
        loadingDelete={loading.delete}
        snackbar={snackbar}
        onCloseSnackbar={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}