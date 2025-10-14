"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Filter
} from "lucide-react"
import { mockProducts, mockStockMovements } from "@/lib/mock-data"
import { formatCurrency, formatDate, stockStatusColors } from "@/lib/utils"

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [products] = useState(mockProducts)
  const [movements] = useState(mockStockMovements)

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.product.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === "all" || movement.type === selectedType
    
    return matchesSearch && matchesType
  })

  const lowStockProducts = products.filter(product => product.stock <= product.minStock)
  const criticalStockProducts = products.filter(product => product.stock === 0)

  const totalStockValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0)
  const totalMovements = movements.length
  const recentMovements = movements.slice(0, 10)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Stock</h1>
          <p className="text-gray-600">Controla el inventario y movimientos de productos</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="sm:w-auto">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Entrada de Stock</span>
            <span className="sm:hidden">Entrada</span>
          </Button>
          <Button variant="outline" className="sm:w-auto">
            <TrendingDown className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Salida de Stock</span>
            <span className="sm:hidden">Salida</span>
          </Button>
        </div>
      </div>

      {/* Estadísticas de stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">
              {products.length} productos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{criticalStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Sin stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalMovements}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Productos con stock crítico */}
      {lowStockProducts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Productos con Stock Crítico
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Los siguientes productos requieren reposición inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="p-4 border border-yellow-300 rounded-lg bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.code}</p>
                    </div>
                    <Badge variant="destructive">
                      {product.stock} unidades
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-yellow-700">
                      Stock mínimo: {product.minStock} unidades
                    </p>
                    <p className="text-gray-600">
                      Valor: {formatCurrency(product.price * product.stock)}
                    </p>
                  </div>
                  <Button size="sm" className="mt-3 w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Reponer Stock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca y filtra movimientos de stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
            >
              <option value="all">Todos los movimientos</option>
              <option value="in">Entradas</option>
              <option value="out">Salidas</option>
            </select>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Más Filtros</span>
              <span className="sm:hidden">Filtros</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos de Stock</CardTitle>
          <CardDescription>
            {filteredMovements.length} movimientos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Producto</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="hidden lg:table-cell">Motivo</TableHead>
                  <TableHead className="hidden lg:table-cell">Referencia</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                  <TableHead className="hidden sm:table-cell">Stock Actual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="hidden sm:table-cell">
                      <div>
                        <p className="font-medium">{movement.product.name}</p>
                        <p className="text-sm text-gray-500">{movement.product.code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={movement.type === 'in' ? 'default' : 'secondary'}>
                        {movement.type === 'in' ? 'Entrada' : 'Salida'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium sm:hidden">{movement.product.name}</p>
                        <p className="text-sm sm:text-base font-medium">{movement.quantity}</p>
                        <p className="text-xs text-gray-500 sm:hidden">
                          {movement.type === 'in' ? 'Entrada' : 'Salida'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-gray-600">{movement.reason}</p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {movement.reference && (
                        <Badge variant="outline" className="text-xs">
                          {movement.reference}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <p className="text-sm text-gray-600">
                        {formatDate(movement.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-right">
                        <p className="font-medium">{movement.product.stock}</p>
                        <Badge 
                          variant={movement.product.stock <= movement.product.minStock ? 'destructive' : 'secondary'}
                          className={stockStatusColors[movement.product.stock === 0 ? 'critical' : 
                            movement.product.stock <= movement.product.minStock ? 'low' : 'normal']}
                        >
                          {movement.product.stock === 0 ? 'Sin stock' : 
                           movement.product.stock <= movement.product.minStock ? 'Bajo' : 'Normal'}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 