"use client"
import * as React from "react"
import {
  BookOpen,
  Bot,
  CalendarCheck2,
  Command,
  Frame,
  Gavel,
  Hospital,
  Library,
  LifeBuoy,
  Map,
  NotepadText,
  PieChart,
  Send,
  Settings2,
  ShieldUser,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"





const data = {
  user: {
    name: "hamza",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Users",
      url: "#",
      icon: ShieldUser,
    },
    {
      title: "Stagiaires",
      url: "#",
      icon: Users,
      isActive: true,
    },
    {
      title: "Stage",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Remarque",
      url: "#",
      icon: NotepadText,
    },{
      title: "Penition",
      url: "#",
      icon: Gavel,
    },{
      title: "Permission",
      url: "#",
      icon: CalendarCheck2,
    },{
      title: "Consultation",
      url: "#",
      icon: Hospital,
    },{
      title: "Specialite",
      url: "#",
      icon: Library,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg"  asChild>
              <a href="#">
                <div
                  className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Gestion</span>
                  <span className="truncate text-xs">Stagiaire</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
