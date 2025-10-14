"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
  BarChart3,
  Building2,
  FileText,
  Home,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Facturación", href: "/facturacion", icon: FileText },
  { name: "Stock", href: "/stock", icon: ShoppingCart },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Configuración", href: "/configuracion", icon: Settings },
]

export function MobileNavbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden w-full">
      <div className="flex h-16 items-center justify-between px-4 bg-white border-b border-gray-200 w-full">
        <div className="flex items-center min-w-0 flex-1">
          <Building2 className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <h1 className="ml-3 text-xl font-semibold text-gray-900 truncate">
            FacturaciónApp
          </h1>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="lg:hidden flex-shrink-0">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 max-w-[85vw]">
            <SheetTitle asChild>
              <VisuallyHidden>Menú de navegación</VisuallyHidden>
            </SheetTitle>
            <div className="flex h-full flex-col bg-white w-full">
              <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 w-full">
                <div className="flex items-center min-w-0 flex-1">
                  <Building2 className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <h1 className="ml-3 text-xl font-semibold text-gray-900 truncate">
                    FacturaciónApp
                  </h1>
                </div>
              </div>
              
              <nav className="flex-1 space-y-1 px-3 py-4 w-full overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors w-full",
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
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
              
              <div className="border-t border-gray-200 p-4 w-full">
                <div className="flex items-center min-w-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-700">A</span>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">Administrador</p>
                    <p className="text-xs text-gray-500 truncate">admin@empresa.com</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
} 