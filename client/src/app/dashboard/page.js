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

// Loading component
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
        console.error("Error fetching user role:", error)
      }
    }

    fetchUserRole()
  }, [])

  const renderActiveComponent = () => {
    if (userRole === "doctor" && activeComponent !== "Consultation") {
      return <Consultation />
    }
    
    if (userRole === "public" && activeComponent === "Users") {
      return <Specialite />
    }

    switch (activeComponent) {
      case 'Users':
        return userRole !== "public" ? <UsersPage /> : <Specialite />
      case 'Stagiaires':
        return userRole !== "doctor" ? <Stagiaires /> : <Consultation />
      case 'Stage':
        return userRole !== "doctor" ? <Stage /> : <Consultation />
      case 'Remarque':
        return userRole !== "doctor" ? <Remarque /> : <Consultation />
      case 'Penition':
        return userRole !== "doctor" ? <Penition /> : <Consultation />
      case 'Permission':
        return userRole !== "doctor" ? <Permission /> : <Consultation />
      case 'Consultation':
        return <Consultation />
      case 'Specialite':
        return <Specialite />
      case 'Brigade':
        return userRole !== "doctor" ? <Brigade /> : <Consultation />
      case 'Assistance':
        return <Assistance />
      default:
        if (userRole === "doctor") return <Consultation />
        if (userRole === "public") return <Specialite />
        return <UsersPage />
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
                <BreadcrumbLink href="#">dashbord</BreadcrumbLink>
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