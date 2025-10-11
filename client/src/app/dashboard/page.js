// page.jsx (Dashboard)
"use client"
import React, { useEffect, useState, Suspense, lazy } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { NavigationProvider, useNavigation } from '../../components/navigation-context'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ModeToggle from "@/components/button-tugle"

// Lazy load components
const Stagiaires = lazy(() => import("../../components/Stagiaire/page"))
const UsersPage = lazy(() => import("../../components/Users/page"))
const Stage = lazy(() => import("../../components/Stage/page"))
const Remarque = lazy(() => import("../../components/Remarque/page"))
const Penition = lazy(() => import("../../components/Penition/page"))
const Permission = lazy(() => import("../../components/Permission/page.js"))
const Consultation = lazy(() => import("../../components/Consultation/page"))
const Specialite = lazy(() => import("../../components/Specialite/page"))
const Brigade = lazy(() => import("../../components/brigade/page"))
const Assistance = lazy(() => import("../../components/Assistance/page"))
const Pedagogique = lazy(() => import("../../components/Pedagogique/page"))

// Composant de chargement
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
)

function MainContent() {
  const { activeComponent } = useNavigation()
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const token = localStorage.getItem("token")
        if (token) {
          const res = await fetch(`${API.replace(/\/$/, "")}/api/users/me?populate[role]=*`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (res.ok) {
            const userData = await res.json()
            const user = userData?.data ? userData.data : userData
            setUserRole(user.role?.name || user.role)
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error)
      }
    }

    fetchUserRole()
  }, [])

  const renderActiveComponent = () => {
    // Vérifications de sécurité basées sur le rôle
    if (userRole === "admin") {
      // Admin peut tout voir
      switch (activeComponent) {
        case 'Users': return <UsersPage />
        case 'Stagiaires': return <Stagiaires />
        case 'Stage': return <Stage />
        case 'Remarque': return <Remarque />
        case 'Penition': return <Penition />
        case 'Permission': return <Permission />
        case 'Consultation': return <Consultation />
        case 'Specialite': return <Specialite />
        case 'Brigade': return <Brigade />
        case 'Assistance': return <Assistance />
        case 'Pedagogique': return <Pedagogique />
        default: return <UsersPage />
      }
    } else if (userRole === "public") {
      // Public ne peut pas voir Pedagogique et Users
      if (activeComponent === "Pedagogique" || activeComponent === "Users") {
        return <Specialite />
      }
      switch (activeComponent) {
        case 'Stagiaires': return <Stagiaires />
        case 'Stage': return <Stage />
        case 'Remarque': return <Remarque />
        case 'Penition': return <Penition />
        case 'Permission': return <Permission />
        case 'Consultation': return <Consultation />
        case 'Specialite': return <Specialite />
        case 'Brigade': return <Brigade />
        case 'Assistance': return <Assistance />
        default: return <Specialite />
      }
    } else if (userRole === "chef_cellule") {
      // Chef cellule ne peut voir que Pedagogique
      if (activeComponent !== "Pedagogique") {
        return <Pedagogique />
      }
      return <Pedagogique />
    } else if (userRole === "doctor") {
      // Doctor ne peut voir que Consultation
      if (activeComponent !== "Consultation") {
        return <Consultation />
      }
      return <Consultation />
    } else {
      // Rôle non reconnu
      return <div>Rôle non autorisé</div>
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 bg-neutral-50" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <ModeToggle />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Tableau de bord</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{activeComponent}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<LoadingFallback />}>
          {renderActiveComponent()}
        </Suspense>
      </main>
    </SidebarInset>
  )
}

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/"
    } else {
      setIsAuthenticated(true)
    }
  }, [])

  if (!isAuthenticated) {
    return null
  }

  return (
    <NavigationProvider>
      <SidebarProvider>
        <AppSidebar />
        <MainContent />
      </SidebarProvider>
    </NavigationProvider>
  )
}