"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/contexts/auth-context"
import {
  BarChart3,
  Building2,
  FileText,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Users,
  LogOut,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, disabled: false },
  { name: "Productos", href: "/productos", icon: Package, disabled: false },
  { name: "Clientes", href: "/clientes", icon: Users, disabled: true },
  { name: "Facturación", href: "/facturacion", icon: FileText, disabled: false },
  { name: "Stock", href: "/stock", icon: ShoppingCart, disabled: false },
  { name: "Reportes", href: "/reportes", icon: BarChart3, disabled: false },
  { name: "Configuración", href: "/configuracion", icon: Settings, disabled: false },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthContext()

  return (
    <div className="hidden lg:flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Building2 className="h-8 w-8 text-blue-600" />
        <h1 className="ml-3 text-xl font-semibold text-gray-900">
          Antonionovoa
        </h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          if (item.disabled) {
            return (
              <div
                key={item.name}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-not-allowed opacity-50"
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" />
                <span className="text-gray-500">{item.name}</span>
                <span className="ml-auto text-xs text-gray-400 italic">Próximamente</span>
              </div>
            )
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {user?.nombre?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.correo || 'usuario@example.com'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 