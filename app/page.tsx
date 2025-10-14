"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  TrendingUp, 
  Package, 
  Users, 
  FileText, 
  AlertTriangle,
  Plus,
  Eye,
  RefreshCw
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { useProductos, useClientes, useVentas, useStock } from "@/hooks/use-api"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuthContext()

  // Hooks para obtener datos de la API
  const { productos, loading: loadingProductos, error: errorProductos, cargarProductos } = useProductos()
  const { clientes, loading: loadingClientes, error: errorClientes, cargarClientes } = useClientes()
  const { ventas, loading: loadingVentas, error: errorVentas, cargarVentas } = useVentas()
  const { movimientos, loading: loadingMovimientos, error: errorMovimientos, cargarMovimientosPorFecha } = useStock()

  useEffect(() => {
    if (!loading && !user) {
      // Usuario no autenticado - redirigir al login
      router.push("/login")
    }
  }, [user, loading, router])

  // Cargar datos al montar el componente si el usuario está autenticado
  useEffect(() => {
    if (user) {
      cargarProductos()
      cargarClientes()
      cargarVentas()
      
      // Cargar movimientos de los últimos 30 días
      const fechaFin = new Date().toISOString().split('T')[0]
      const fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      cargarMovimientosPorFecha(fechaInicio, fechaFin)
    }
  }, [user])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, mostrar loading (será redirigido)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Calcular estadísticas
  const totalProducts = productos?.length || 0
  const totalClients = clientes?.length || 0
  const totalVentas = ventas?.length || 0
  const totalRevenue = ventas?.reduce((sum, venta) => sum + venta.totalVenta, 0) || 0
  
  const lowStockProducts = productos?.filter(product => product.stock <= product.stockMinimo) || []
  const criticalStockProducts = productos?.filter(product => product.stock === 0) || []
  
  const recentVentas = ventas?.slice(0, 5) || []
  const recentMovements = movimientos?.slice(0, 5) || []

  const isLoading = loadingProductos || loadingClientes || loadingVentas || loadingMovimientos

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          {isLoading && (
            <Button variant="outline" disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Cargando...
            </Button>
          )}
          <Button asChild>
            <Link href="/facturacion/nueva">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nueva Factura</span>
              <span className="sm:hidden">Nueva</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Mostrar errores si existen */}
      {(errorProductos || errorClientes || errorVentas || errorMovimientos) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
          <p className="text-red-600 text-sm mt-1">
            {errorProductos && `Productos: ${errorProductos}`}
            {errorClientes && `Clientes: ${errorClientes}`}
            {errorVentas && `Ventas: ${errorVentas}`}
            {errorMovimientos && `Movimientos: ${errorMovimientos}`}
          </p>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {totalVentas} ventas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockProducts.length} con stock bajo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalVentas}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Productos con stock bajo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Stock Crítico
            </CardTitle>
            <CardDescription>
              Productos que requieren atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 w-full">
              {lowStockProducts.map((product) => (
                <div key={product.Id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2 w-full">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{product.nombre}</p>
                    <p className="text-sm text-gray-500 truncate">{product.codigo}</p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <Badge 
                      variant={product.stock === 0 ? "destructive" : "secondary"}
                      className={product.stock === 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {product.stock} unidades
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Mín: {product.stockMinimo}
                    </p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No hay productos con stock bajo
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Últimas ventas */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Ventas</CardTitle>
            <CardDescription>
              Ventas recientes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <div className="min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden sm:table-cell">ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="hidden sm:table-cell">Total</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentVentas.map((venta) => (
                      <TableRow key={venta.Id}>
                        <TableCell className="hidden sm:table-cell font-medium">
                          {venta.Id}
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium sm:hidden">Venta #{venta.Id}</p>
                            <p className="text-sm sm:text-base truncate">
                              {venta.cliente ? venta.cliente.apellidoYnombre : 'Cliente no disponible'}
                            </p>
                            <p className="text-xs text-gray-500 sm:hidden">{formatCurrency(venta.totalVenta)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{formatCurrency(venta.totalVenta)}</TableCell>
                        <TableCell>
                          <Badge className={
                            venta.estadoVenta === 'COMPLETADA' ? "bg-green-100 text-green-800" :
                            venta.estadoVenta === 'PENDIENTE' ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {venta.estadoVenta === 'COMPLETADA' ? 'Completada' : 
                             venta.estadoVenta === 'PENDIENTE' ? 'Pendiente' : 'Cancelada'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movimientos de stock recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos de Stock Recientes</CardTitle>
          <CardDescription>
            Últimos movimientos de entrada y salida de productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Producto</TableHead>
                    <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead className="hidden sm:table-cell">Motivo</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((movement) => (
                    <TableRow key={movement.Id}>
                      <TableCell className="hidden sm:table-cell font-medium">
                        {movement.producto?.nombre || 'Producto no disponible'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={movement.tipo === 'ENTRADA' ? 'default' : 'secondary'}>
                          {movement.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium sm:hidden">{movement.producto?.nombre || 'Producto no disponible'}</p>
                          <p className="text-sm sm:text-base">{movement.cantidad}</p>
                          <p className="text-xs text-gray-500 sm:hidden">
                            {movement.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{movement.motivo}</TableCell>
                      <TableCell className="text-sm">{formatDate(new Date(movement.fecha))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
