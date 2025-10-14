"use client"

import { useState } from "react"
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
import { mockInvoices, mockProducts, mockClients, mockStockMovements } from "@/lib/mock-data"
import { Invoice, Product, Client } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function ReportesPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [products] = useState<Product[]>(mockProducts)
  const [clients] = useState<Client[]>(mockClients)
  const [movements] = useState(mockStockMovements)

  // Cálculos de estadísticas
  const totalRevenue = invoices.reduce((sum: number, invoice: Invoice) => sum + invoice.total, 0)
  const totalInvoices = invoices.length
  const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0
  
  const topProducts = products
    .sort((a: Product, b: Product) => (b.price * b.stock) - (a.price * a.stock))
    .slice(0, 5)
  
  const topClients = clients
    .map((client: Client) => {
      const clientInvoices = invoices.filter((inv: Invoice) => inv.clientId === client.id)
      const totalSpent = clientInvoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0)
      return { ...client, totalSpent, invoiceCount: clientInvoices.length }
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)

  const monthlyRevenue = invoices.reduce((acc: Record<string, number>, invoice: Invoice) => {
    const month = new Date(invoice.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    acc[month] = (acc[month] || 0) + invoice.total
    return acc
  }, {} as Record<string, number>)

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
              {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {products.length} productos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Registrados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.code}</p>
                          <div className="sm:hidden mt-1">
                            <p className="text-xs text-gray-600">Stock: {product.stock}</p>
                            <p className="text-xs text-gray-600">{formatCurrency(product.price)} c/u</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(product.price * product.stock)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mejores clientes */}
        <Card>
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
                  {topClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.businessName}</p>
                          <p className="text-sm text-gray-500">
                            {client.documentType}: {client.documentNumber}
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
        </Card>
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
                    {invoices.filter(inv => 
                      new Date(inv.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) === month
                    ).length} facturas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatCurrency(revenue)}</p>
                  <Badge variant="outline" className="text-xs">
                    {((revenue / totalRevenue) * 100).toFixed(1)}% del total
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de movimientos de stock */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Movimientos de Stock</CardTitle>
          <CardDescription>
            Últimos movimientos de entrada y salida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.slice(0, 10).map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{movement.product.name}</p>
                      <p className="text-sm text-gray-500">{movement.product.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={movement.type === 'in' ? 'default' : 'secondary'}>
                      {movement.type === 'in' ? 'Entrada' : 'Salida'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{movement.quantity}</TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell>{formatDate(movement.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 