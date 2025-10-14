"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users,
  Mail,
  Phone
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useClientes } from "@/hooks/use-api"

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { clientes: clients, loading, error, cargarClientes } = useClientes()

  useEffect(() => {
    cargarClientes()
  }, [])

  const filteredClients = (clients || []).filter(client =>
    client.apellidoYnombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.numeroDocumento.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'CUIT': return 'CUIT'
      case 'DNI': return 'DNI'
      case 'CUIL': return 'CUIL'
      default: return type
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestiona tu base de datos de clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nuevo Cliente</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Completa la información del cliente. Haz clic en guardar cuando hayas terminado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="documentType" className="text-right">
                  Tipo Doc.
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUIT">CUIT</SelectItem>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CUIL">CUIL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="documentNumber" className="text-right">
                  Número
                </Label>
                <Input
                  id="documentNumber"
                  placeholder="Número de documento"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="businessName" className="text-right">
                  Razón Social
                </Label>
                <Input
                  id="businessName"
                  placeholder="Razón social o nombre"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@empresa.com"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  placeholder="+54 11 1234-5678"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Domicilio
                </Label>
                <Input
                  id="address"
                  placeholder="Dirección completa"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="province" className="text-right">
                  Provincia
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                    <SelectItem value="CABA">CABA</SelectItem>
                    <SelectItem value="Córdoba">Córdoba</SelectItem>
                    <SelectItem value="Santa Fe">Santa Fe</SelectItem>
                    <SelectItem value="Mendoza">Mendoza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Guardar Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca y filtra clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por razón social, documento o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exportar</span>
              <span className="sm:hidden">Exportar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredClients.length} clientes encontrados
            {error && (
              <span className="text-red-600 ml-2">Error: {error}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Documento</TableHead>
                  <TableHead>Razón Social</TableHead>
                  <TableHead className="hidden lg:table-cell">Contacto</TableHead>
                  <TableHead className="hidden lg:table-cell">Domicilio</TableHead>
                  <TableHead className="hidden sm:table-cell">Provincia</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha Alta</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.Id}>
                    <TableCell className="hidden sm:table-cell">
                      <div>
                        <Badge variant="outline" className="text-xs mb-1">
                          {getDocumentTypeLabel(client.tipoDocumento)}
                        </Badge>
                        <p className="font-medium">{client.numeroDocumento}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.apellidoYnombre}</p>
                        <div className="sm:hidden mt-1">
                          <Badge variant="outline" className="text-xs mr-2">
                            {getDocumentTypeLabel(client.tipoDocumento)}
                          </Badge>
                          <span className="text-sm text-gray-600">{client.numeroDocumento}</span>
                        </div>
                        <div className="sm:hidden mt-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email}
                          </div>
                          {client.telefono && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {client.telefono}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {client.email}
                        </div>
                        {client.telefono && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            {client.telefono}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {client.direccion}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {client.provincia}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <p className="text-sm text-gray-600">
                        {formatDate(client.fechaCreacion || "")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de clientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{clients ? clients.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con CUIT</CardTitle>
            <Badge variant="outline" className="text-xs">CUIT</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {(clients || []).filter(c => c.tipoDocumento === 'CUIT').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Empresas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con DNI</CardTitle>
            <Badge variant="outline" className="text-xs">DNI</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {(clients || []).filter(c => c.tipoDocumento === 'DNI').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Personas físicas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 