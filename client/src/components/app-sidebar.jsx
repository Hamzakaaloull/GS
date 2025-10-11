// app-sidebar.jsx
"use client"
import React, { useEffect, useState } from "react"
import { Command, BookOpen, Users, NotepadText, Gavel, Command as Cmd, Hospital, Library, LifeBuoy, Frame, ShieldUser, Group } from "lucide-react"
import Image from "next/image"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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

  // جميع عناصر التنقل الأساسية
  const allNavMainItems = [
    { 
      title: "Pedagogique", 
      url: "#", 
      icon: Hospital, 
      isActive: activeComponent === "Pedagogique",
      onClick: () => setActiveComponent("Pedagogique")
    },
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

  // تحديد عناصر التنقل بناءً على دور المستخدم
  const getNavItems = () => {
    if (!userRaw) return []
    
    const userRole = userRaw.role?.name || userRaw.role
    
    if (userRole === "admin") {
      return allNavMainItems
    } else if (userRole === "public") {
      return allNavMainItems.filter(item => 
        item.title !== "Pedagogique" && item.title !== "Users"
      )
    } else if (userRole === "chef_cellule") {
      return allNavMainItems.filter(item => item.title === "Pedagogique")
    } else if (userRole === "doctor") {
      return allNavMainItems.filter(item => item.title === "Consultation")
    } else {
      return allNavMainItems
    }
  }

  const navMain = getNavItems()
  
  const projects = [{ 
    title: "Assistance", 
    url: "#", 
    icon: LifeBuoy, 
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
          
          // تعيين المكون الافتراضي بناءً على دور المستخدم
          const userRole = user.role?.name || user.role
          if (userRole === "admin") {
            setActiveComponent("Users")
          } else if (userRole === "public") {
            setActiveComponent("Specialite")
          } else if (userRole === "chef_cellule") {
            setActiveComponent("Pedagogique")
          } else if (userRole === "doctor") {
            setActiveComponent("Consultation")
          } else {
            setActiveComponent("Users")
          }
          
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
  }, [setActiveComponent])

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
                <Image src="/img/FAR.png"  className="mr-2"   width={30} height={50} quality={100} alt="far"  />
               {/* <img src="https://upload.wikimedia.org/wikipedia/commons/a/a1/Moroccan_Armed_Force.png" alt="Logo" className="w-6 h-auto object-contain mr-1" /> */}
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
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
        {loading ? <div className="text-xs mt-2 px-3">Loading user…</div> : null}
        {error ? <div className="text-xs text-red-500 mt-2 px-3">{error}</div> : null}
      </SidebarFooter>
    </Sidebar>
  )
}