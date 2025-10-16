"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  Package,
  Users
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useProductos } from "@/hooks/use-api"
// import { useClientes } from "@/hooks/use-api"
import { useFacturas } from "@/hooks/use-api"
import type { Producto, Cliente, Factura } from "@/lib/api-types"

export default function ReportesPage() {
  const { productos, loading: loadingProductos, cargarProductos } = useProductos()
  // const { clientes, loading: loadingClientes, cargarClientes } = useClientes()
  const { facturas, loading: loadingFacturas, cargarFacturas } = useFacturas()

  useEffect(() => {
    cargarProductos()
    // cargarClientes()
    cargarFacturas()
  }, [])

  // Cálculos de estadísticas
  const totalRevenue = (facturas || []).reduce((sum: number, factura: any) => sum + (factura.total || 0), 0)
  const totalInvoices = (facturas || []).length
  const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0
  
  const topProducts = (productos || [])
    .sort((a: Producto, b: Producto) => (b.precio * b.stock) - (a.precio * a.stock))
    .slice(0, 5)
  
  // const topClients = (clientes || [])
  //   .map((client: any) => {
  //     const clientInvoices = (facturas || []).filter((inv: any) => inv.cliente?.id === client.id)
  //     const totalSpent = clientInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0)
  //     return { ...client, totalSpent, invoiceCount: clientInvoices.length }
  //   })
  //   .sort((a, b) => b.totalSpent - a.totalSpent)
  //   .slice(0, 5)

  const monthlyRevenue = (facturas || []).reduce((acc: Record<string, number>, factura: any) => {
    if (factura.fecha) {
      const month = new Date(factura.fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      acc[month] = (acc[month] || 0) + (factura.total || 0)
    }
    return acc
  }, {} as Record<string, number>)

  const loading = loadingProductos || loadingFacturas // || loadingClientes

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del negocio</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="sm:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filtros de Fecha</span>
            <span className="sm:hidden">Filtros</span>
          </Button>
          <Button className="sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar Reporte</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {totalInvoices} facturas emitidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(averageInvoiceValue)}</div>
            <p className="text-xs text-muted-foreground">
              Por factura
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Stock</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency((productos || []).reduce((sum, p) => sum + (p.precio * p.stock), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {(productos || []).length} productos
            </p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{(clientes || []).length}</div>
            <p className="text-xs text-muted-foreground">
              Registrados
            </p>
          </CardContent>
        </Card> */}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Productos más valiosos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Valiosos</CardTitle>
            <CardDescription>
              Productos con mayor valor en stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="hidden sm:table-cell">Stock</TableHead>
                    <TableHead className="hidden sm:table-cell">Valor Unitario</TableHead>
                    <TableHead>Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.nombre}</p>
                          <p className="text-sm text-gray-500">{product.codigo}</p>
                          <div className="sm:hidden mt-1">
                            <p className="text-xs text-gray-600">Stock: {product.stock}</p>
                            <p className="text-xs text-gray-600">{formatCurrency(product.precio)} c/u</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatCurrency(product.precio)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(product.precio * product.stock)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mejores clientes */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Mejores Clientes</CardTitle>
            <CardDescription>
              Clientes con mayor facturación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden sm:table-cell">Facturas</TableHead>
                    <TableHead>Total Gastado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((client: any) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.razon_social || 'Sin nombre'}</p>
                          <p className="text-sm text-gray-500">
                            {client.documento_tipo}: {client.documento_nro}
                          </p>
                          <div className="sm:hidden mt-1">
                            <p className="text-xs text-gray-600">{client.invoiceCount} facturas</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{client.invoiceCount}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(client.totalSpent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Ingresos por mes */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Mes</CardTitle>
          <CardDescription>
            Evolución de las ventas en el tiempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(monthlyRevenue).map(([month, revenue]) => (
              <div key={month} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium capitalize">{month}</p>
                  <p className="text-sm text-gray-500">
                    {(facturas || []).filter((inv: any) => 
                      inv.fecha && new Date(inv.fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) === month
                    ).length} facturas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(revenue)}</p>
                  <Badge variant="outline" className="text-xs">
                    {totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(1) : 0}% del total
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Cargando datos...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}