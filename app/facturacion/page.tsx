"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Search, 
  Eye, 
  Download, 
  FileText,
  Filter
} from "lucide-react"
import { formatCurrency, formatDate, invoiceStatusColors } from "@/lib/utils"
import Link from "next/link"
import { useFacturas } from "@/hooks/use-api"
import type { Factura } from "@/lib/api-types"

export default function FacturacionPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const { facturas, loading, error, cargarFacturas } = useFacturas()

  useEffect(() => {
    cargarFacturas()
  }, [])

  const filteredInvoices = (facturas || []).filter((invoice: Factura) => {
    const numero = (invoice as any).numeroComprobante || '';
    const clienteNombre = (invoice as any).cliente?.razon_social || '';
    const tipoFactura = (invoice as any).tipoFactura?.codigo || '';
    
    const matchesSearch = 
      numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === "all" || tipoFactura === selectedType
    
    return matchesSearch && matchesType
  })

  const getInvoiceTypeLabel = (type: string) => {
    switch (type) {
      case 'A': return 'Factura A'
      case 'B': return 'Factura B'
      case 'C': return 'Factura C'
      case 'NC': return 'Nota de Crédito'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador'
      case 'issued': return 'Emitida'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const totalRevenue = filteredInvoices.reduce((sum: number, invoice: Factura) => sum + ((invoice as any).total || 0), 0)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Facturación</h1>
          <p className="text-gray-600">Gestiona tus comprobantes fiscales</p>
        </div>
        <Link href="/facturacion/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nueva Factura</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredInvoices.length} facturas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas A</CardTitle>
            <Badge variant="outline" className="text-xs">A</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {(facturas || []).filter((i: Factura) => (i as any).tipoFactura?.codigo === 'A').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Emitidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas B</CardTitle>
            <Badge variant="outline" className="text-xs">B</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {(facturas || []).filter((i: Factura) => (i as any).tipoFactura?.codigo === 'B').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Emitidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notas de Crédito</CardTitle>
            <Badge variant="outline" className="text-xs">NC</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {(facturas || []).filter((i: Factura) => (i as any).tipoFactura?.codigo === 'NC').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Emitidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca y filtra facturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número de factura o cliente..."
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
              <option value="all">Todos los tipos</option>
              <option value="A">Factura A</option>
              <option value="B">Factura B</option>
              <option value="C">Factura C</option>
              <option value="NC">Nota de Crédito</option>
            </select>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Más Filtros</span>
              <span className="sm:hidden">Filtros</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
          <CardDescription>
            {filteredInvoices.length} facturas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Número</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                  <TableHead className="hidden sm:table-cell">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando facturas...
                    </TableCell>
                  </TableRow>
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron facturas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice: Factura) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="hidden sm:table-cell font-medium">
                        {(invoice as any).numeroComprobante || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {getInvoiceTypeLabel((invoice as any).tipoFactura?.codigo || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{(invoice as any).cliente?.razon_social || 'Sin cliente'}</p>
                          <div className="sm:hidden mt-1">
                            <p className="text-sm text-gray-600">{(invoice as any).numeroComprobante || 'N/A'}</p>
                            <Badge variant="outline" className="text-xs mr-2">
                              {getInvoiceTypeLabel((invoice as any).tipoFactura?.codigo || '')}
                            </Badge>
                            <span className="text-sm text-gray-600">{formatCurrency((invoice as any).total || 0)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {(invoice as any).fecha ? formatDate((invoice as any).fecha) : 'N/A'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-medium">
                        {formatCurrency((invoice as any).total || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge className={invoiceStatusColors[(invoice as any).estadoFactura?.codigo || 'draft']}>
                          {getStatusLabel((invoice as any).estadoFactura?.codigo || 'draft')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 