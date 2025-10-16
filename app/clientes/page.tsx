"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, Construction } from "lucide-react"

export default function ClientesPage() {
  return (
    <div className="p-4 sm:p-6 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-6">
              <Construction className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Módulo de Clientes</CardTitle>
          <CardDescription className="text-lg mt-2">
            Esta funcionalidad estará disponible próximamente
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Clock className="h-5 w-5" />
            <span>En desarrollo</span>
          </div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Estamos trabajando en traerte la mejor experiencia para gestionar tus clientes. 
            Pronto podrás crear, editar y administrar toda tu base de datos de clientes desde aquí.
          </p>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <Users className="h-5 w-5" />
              <span className="font-medium">Próximamente disponible</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
