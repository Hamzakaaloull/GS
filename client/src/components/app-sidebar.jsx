"use client"
import React, { useEffect, useState } from "react"
import { Command, BookOpen, Users, NotepadText, Gavel, Command as Cmd, Hospital, Library, LifeBuoy, Frame, ShieldUser, Group } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useNavigation } from './navigation-context'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/**
 * API base -- ضعها في .env.local كـ NEXT_PUBLIC_API_URL أو غيّر القيمة هنا
 */
const API = process.env.NEXT_PUBLIC_STRAPI_API_URL;

/** قراءة JWT من localStorage تحت المفتاح "token" */
function getJwt() {
  if (typeof window === "undefined") return null
  try {
    const token = localStorage.getItem("token")
    return token || null
  } catch (e) {
    return null
  }
}

/**
 * محاولة استخراج رابط الصورة من مختلف الأشكال التي قد تُرجعها Strapi
 * لاحظ: لا نستخدم .attributes هنا
 */
function resolveAvatarUrl(user) {
  if (!user) return null

  const candidates = [
    // profile object (populate=profile) قد يكون: { data: { url } } أو { url }
    user.profile?.data?.url,
    user.profile?.url,
    // صيغ تحتوي على formats
    user.profile?.formats?.thumbnail?.url,
    user.profile?.data?.formats?.thumbnail?.url,
    // بعض الحالات نُخزن الصورة مباشرة في حقل avatar
    user.avatar,
    user.image,
    user.profile,
  ]

  for (const val of candidates) {
    if (!val) continue
    if (typeof val === "string") {
      if (val.startsWith("/")) return API.replace(/\/$/, "") + val
      if (val.startsWith("http")) return val
      // إن كان نصًا لكنه ليس رابطًا، نتجاهل
      continue
    }
    // إن كان object، حاول استخراج الحقول الشائعة
    if (typeof val === "object") {
      const url =
        val.url ||
        val.path ||
        val?.formats?.thumbnail?.url ||
        val?.formats?.small?.url ||
        val?.data?.url
      if (url) {
        if (url.startsWith("/")) return API.replace(/\/$/, "") + url
        if (url.startsWith("http")) return url
      }
    }
  }

  return null
}

export function AppSidebar(props) {
  const [userRaw, setUserRaw] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { activeComponent, setActiveComponent } = useNavigation()

  // إعدادات التنقل مع تحديد النشط ديناميكيًا
  const navMain = [
    { 
      title: "Users", 
      url: "#", 
      icon: ShieldUser, 
      isActive: activeComponent === "Users",
      onClick: () => setActiveComponent("Users")
    },
     { 
      title: "Specialite", 
      url: "#", 
      icon: Library, 
      isActive: activeComponent === "Specialite",
      onClick: () => setActiveComponent("Specialite")
    },
    { 
      title: "Stage", 
      url: "#", 
      icon: BookOpen, 
      isActive: activeComponent === "Stage",
      onClick: () => setActiveComponent("Stage")
    },
     { 
      title: "Brigade", 
      url: "#", 
      icon: Group, 
      isActive: activeComponent === "Brigade",
      onClick: () => setActiveComponent("Brigade")
    },
    { 
      title: "Stagiaires", 
      url: "#", 
      icon: Users, 
      isActive: activeComponent === "Stagiaires",
      onClick: () => setActiveComponent("Stagiaires")
    },
    
    { 
      title: "Remarque", 
      url: "#", 
      icon: NotepadText, 
      isActive: activeComponent === "Remarque",
      onClick: () => setActiveComponent("Remarque")
    },
    { 
      title: "Penition", 
      url: "#", 
      icon: Gavel, 
      isActive: activeComponent === "Penition",
      onClick: () => setActiveComponent("Penition")
    },
    { 
      title: "Permission", 
      url: "#", 
      icon: Cmd, 
      isActive: activeComponent === "Permission",
      onClick: () => setActiveComponent("Permission")
    },
    { 
      title: "Consultation", 
      url: "#", 
      icon: Hospital, 
      isActive: activeComponent === "Consultation",
      onClick: () => setActiveComponent("Consultation")
    },
  ]

  // const navSecondary = [{ title: "Support",
  //    url: "#",
  //     icon: LifeBuoy
  //    }]
  const projects = [{ title: "Assistance",
     url: "#", 
     icon: LifeBuoy , 
     isActive: activeComponent === "Assistance",
      onClick: () => setActiveComponent("Assistance")
     }]

  useEffect(() => {
    let mounted = true

    async function fetchUser() {
      setLoading(true)
      setError(null)

      const jwt = getJwt()
      if (!jwt) {
        setLoading(false)
        setError("No JWT token found in localStorage (key: \"token\")")
        return
      }

      try {
        // نطلب populate للـ profile و role
        const res = await fetch(`${API.replace(/\/$/, "")}/api/users/me?populate[profile]=*&populate[role]=*`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`HTTP ${res.status} — ${text}`)
        }

        const json = await res.json()
        console.log("Fetched user:", json)
        // محاولة استخراج المستخدم من response
        // Strapi قد يرجع المستخدم مباشرة أو داخل data
        const user = json?.data ? json.data : json
        if (mounted) {
          setUserRaw(user)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to fetch user")
          setLoading(false)
        }
      }
    }

    fetchUser()
    return () => {
      mounted = false
    }
  }, [])

  // تحضير كائن بيانات مبسط للاستخدام
  const data = React.useMemo(() => {
    const fallback = {
      user: {
        name: "Guest",
        email: "guest@example.com",
        avatar: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
        raw: null,
      },
    }

    if (!userRaw) return fallback

    const name = userRaw.username || userRaw.name || userRaw.fullName || userRaw.email || "User"
    const email = userRaw.email || ""
    const avatar = resolveAvatarUrl(userRaw) || "/avatars/default.jpg"

    return {
      user: {
        name,
        email,
        avatar,
        raw: userRaw,
      },
    }
  }, [userRaw])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
               <img src="https://upload.wikimedia.org/wikipedia/commons/a/a1/Moroccan_Armed_Force.png" alt="Logo" className="w-6 h-auto object-contain mr-1" />
                {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                </div> */}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium ">Gestion</span>
                  
                  <span className="truncate text-sm ">Des Stagiaires</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
        {/* <NavSecondary items={navSecondary} className="mt-auto" /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
        {loading ? <div className="text-xs mt-2 px-3">Loading user…</div> : null}
        {error ? <div className="text-xs text-red-500 mt-2 px-3">{error}</div> : null}
      </SidebarFooter>
    </Sidebar>
  )
}