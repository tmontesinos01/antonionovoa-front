"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileNavbar } from "@/components/mobile-navbar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Rutas que no deben mostrar el sidebar
  const publicRoutes = ['/login', '/registro']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Si es una ruta pública, mostrar solo el contenido sin sidebar
  if (isPublicRoute) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }
  
  // Para todas las demás rutas, mostrar el layout completo con sidebar
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNavbar />
        <main className="flex-1 overflow-auto w-full">
          <div className="w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
