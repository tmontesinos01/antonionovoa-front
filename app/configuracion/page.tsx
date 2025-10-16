"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings, 
  Save,
  Users,
  Building2,
  FileText,
  Database,
  Shield,
  Bell,
  Plus,
  Eye,
  EyeOff
} from "lucide-react"
import { mockActivityLogs } from "@/lib/mock-data"
import { formatDateTime } from "@/lib/utils"
import { useUsuarios } from "@/hooks/use-api"

export default function ConfiguracionPage() {
  const [activityLogs] = useState(mockActivityLogs)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    clave: "",
    telefono: "",
    idPerfil: "1",
    sucursal: "PINO"
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { usuarios, loading: loadingUsuarios, error: errorUsuarios, cargarUsuarios, crearUsuario } = useUsuarios()

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.clave.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setError(null)
    setSuccess(false)

    try {
      await crearUsuario({
        nombre: formData.nombre,
        correo: formData.correo,
        clave: formData.clave,
        // telefono: formData.telefono,
        idPerfil: parseInt(formData.idPerfil),
        // activo: true,
        // sucursal: formData.sucursal,
        // ultimoAcceso: null
      })
      
      setSuccess(true)
      setFormData({
        nombre: "",
        correo: "",
        clave: "",
        telefono: "",
        idPerfil: "1",
        sucursal: "PINO"
      })
      setIsDialogOpen(false)
      cargarUsuarios() // Recargar la lista
    } catch (err: any) {
      setError(err.message || "Error al crear el usuario")
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600">Gestiona la configuración del sistema</p>
        </div>
        <Button className="sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Guardar Cambios</span>
          <span className="sm:hidden">Guardar</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Datos de la Empresa
            </CardTitle>
            <CardDescription>
              Información fiscal y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Razón Social</label>
              <Input 
                placeholder="Nombre de la empresa"
                defaultValue="Mi Empresa SRL"
              />
            </div>
            <div>
              <label className="text-sm font-medium">CUIT</label>
              <Input 
                placeholder="30-12345678-9"
                defaultValue="30-12345678-9"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Domicilio Fiscal</label>
              <Input 
                placeholder="Dirección completa"
                defaultValue="Av. Siempre Viva 742, CABA"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                placeholder="contacto@empresa.com"
                defaultValue="contacto@empresa.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <Input 
                placeholder="011-1234-5678"
                defaultValue="011-1234-5678"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de facturación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Configuración de Facturación
            </CardTitle>
            <CardDescription>
              Parámetros para la emisión de comprobantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Punto de Venta</label>
              <Input 
                placeholder="0001"
                defaultValue="0001"
              />
            </div>
            <div>
              <label className="text-sm font-medium">IVA por defecto (%)</label>
              <Input 
                type="number"
                placeholder="21"
                defaultValue="21"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Moneda</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="ARS"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="EUR">Euros (EUR)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Formato de número de factura</label>
              <Input 
                placeholder="0001-00000001"
                defaultValue="0001-00000001"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription>
              Administra usuarios y permisos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingUsuarios && <p className="text-sm text-gray-500">Cargando usuarios...</p>}
              {errorUsuarios && <p className="text-sm text-red-600">Error: {errorUsuarios}</p>}

              {usuarios && usuarios.map(user => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2">
                  <div>
                    <p className="font-medium truncate max-w-xs">{user.nombre}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{user.correo}</p>
                  </div>
                  {/* <Badge variant={user.activo ? 'outline' : 'secondary'}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </Badge> */}
                </div>
              ))}

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                      Completa la información del usuario. Haz clic en guardar cuando hayas terminado.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert>
                        <AlertDescription>Usuario creado exitosamente</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <Input
                        id="nombre"
                        type="text"
                        placeholder="Nombre completo"
                        value={formData.nombre}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correo">Correo Electrónico</Label>
                      <Input
                        id="correo"
                        type="email"
                        placeholder="usuario@empresa.com"
                        value={formData.correo}
                        onChange={(e) => handleChange("correo", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        placeholder="+54 9 11 1234-5678"
                        value={formData.telefono}
                        onChange={(e) => handleChange("telefono", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="perfil">Perfil</Label>
                      <Select value={formData.idPerfil} onValueChange={(value) => handleChange("idPerfil", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Administrador</SelectItem>
                          <SelectItem value="2">Vendedor Pino</SelectItem>
                          <SelectItem value="3">Vendedor Melamina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sucursal">Sucursal</Label>
                      <Select value={formData.sucursal} onValueChange={(value) => handleChange("sucursal", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la sucursal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PINO">Pino</SelectItem>
                          <SelectItem value="MELAMINA">Melamina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clave">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="clave"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.clave}
                          onChange={(e) => handleChange("clave", e.target.value)}
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Crear Usuario
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Configuración de seguridad y respaldos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Frecuencia de respaldo</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="daily"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Retención de respaldos (días)</label>
              <Input 
                type="number"
                placeholder="30"
                defaultValue="30"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Autenticación de dos factores</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="enabled"
              >
                <option value="enabled">Habilitada</option>
                <option value="disabled">Deshabilitada</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Sesión automática (minutos)</label>
              <Input 
                type="number"
                placeholder="30"
                defaultValue="30"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración de notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura las alertas y notificaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Alertas de Stock</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stock bajo</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stock crítico</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Productos sin stock</span>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Notificaciones de Facturación</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Nueva factura creada</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Factura emitida</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Factura cancelada</span>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de actividad */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Actividad</CardTitle>
          <CardDescription>
            Últimas acciones realizadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs.slice(0, 10).map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.user.name}</p>
                      <p className="text-sm text-gray-500">{log.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.action === 'create' ? 'Crear' : 
                       log.action === 'update' ? 'Actualizar' : 'Eliminar'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {log.entity === 'product' ? 'Producto' :
                       log.entity === 'client' ? 'Cliente' :
                       log.entity === 'invoice' ? 'Factura' : 'Categoría'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">{log.details}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 