"use client"
import React, { useEffect } from "react"
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

// استيراد المكونات المنفصلة
import Stagiaires from "../../components/Stagiaire/page"
import UsersPage from "../../components/Users/page"
import Stage from "../../components/Stage/page"
import Remarque from "../../components/Remarque/page"
import Penition from "../../components/Penition/page"
import Permission from "../../components/Permission/page.js"
import Consultation from "../../components/Consultation/page"
import Specialite from "../../components/Specialite/page" 
import Brigade from "../../components/brigade/page"
import Assistance from "../../components/Assistance/page" // أضف هذا الاستيراد

function MainContent() {

  const { activeComponent } = useNavigation()
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'Users':
        return <UsersPage />
      case 'Stagiaires':
        return <Stagiaires />
      case 'Stage':
        return <Stage />
      case 'Remarque':
        return <Remarque />
      case 'Penition':
        return <Penition />
      case 'Permission':
        return <Permission />
      case 'Consultation':
        return <Consultation />
      case 'Specialite':
        return <Specialite />
      case 'Brigade':
        return <Brigade />
      case 'Assistance': // أضف هذا الحالة
        return <Assistance />
      default:
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
        {renderActiveComponent()}
      </main>
    </SidebarInset>
  )
}

export default function Page() {
  return (
    <NavigationProvider>
      <SidebarProvider>
        <AppSidebar />
        <MainContent />
      </SidebarProvider>
    </NavigationProvider>
  )
}