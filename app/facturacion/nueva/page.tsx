"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  Trash2, 
  Save,
  FileText,
  Calculator,
  User,
  Package,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Settings,
  Download,
  Eye,
  CreditCard,
  Calendar,
  Building,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Product, Client, InvoiceItem, TusFacturasAppData } from "@/lib/types"
import { serializeInvoiceForTusFacturasApp, validateTusFacturasAppData } from "@/lib/tus-facturas-app"
import Link from "next/link"
import { ApiService } from "@/lib/api-service"
import type { Cliente as ClienteAfip, ValidarClienteAfipDTO, Producto } from "@/lib/api-types"

interface InvoiceFormData {
  type: 'A' | 'B' | 'C' | 'NC'
  clientId: string
  client?: Client
  items: InvoiceItem[]
  subtotal: number
  iva: number
  total: number
  paymentMethod: string
  dueDate: string
  notes: string
  afipResponsible: string
  pointOfSale: string
  caeNumber?: string
  caeExpiration?: string
  fiscalCondition: string
  paymentTerms: string
  currency: string
  exchangeRate: number
}

interface TusFacturasAppConfig {
  usertoken: string
  apikey: string
  isEnabled: boolean
}

export default function NuevaFacturaPage() {
  const [formData, setFormData] = useState<InvoiceFormData>({
    type: 'A',
    clientId: '',
    items: [],
    subtotal: 0,
    iva: 0,
    total: 0,
    paymentMethod: 'transfer',
    dueDate: '',
    notes: '',
    afipResponsible: 'Responsable Inscripto',
    pointOfSale: '0001',
    fiscalCondition: 'Responsable Inscripto',
    paymentTerms: 'Contado',
    currency: 'ARS',
    exchangeRate: 1
  })

  const [tusFacturasConfig, setTusFacturasConfig] = useState<TusFacturasAppConfig>({
    usertoken: '',
    apikey: '',
    isEnabled: false
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<'code' | 'name'>('code')
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState({ documentType: '96', documentNumber: '' })
  const [isSearchingClient, setIsSearchingClient] = useState(false)
  const [clientSearchError, setClientSearchError] = useState('')
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const apiService = new ApiService()

  // Cargar productos al montar el componente
  useEffect(() => {
    const cargarProductos = async () => {
      setIsLoadingProducts(true)
      try {
        const response: any = await apiService.obtenerProductos()
        // El backend devuelve { success: true, data: [...] }
        const productosData = response.data || []
        setProductos(productosData)
      } catch (error) {
        console.error('Error al cargar productos:', error)
        setProductos([])
      } finally {
        setIsLoadingProducts(false)
      }
    }
    cargarProductos()
  }, [])

  // Filtrar productos según búsqueda
  useEffect(() => {
    console.log('🔍 Filtrado - searchTerm:', searchTerm)
    console.log('🔍 Filtrado - searchType:', searchType)
    console.log('🔍 Filtrado - productos disponibles:', productos.length)
    
    if (searchTerm.trim() === '') {
      console.log('❌ Search term vacío, limpiando filtros')
      setFilteredProducts([])
      return
    }

    const filtered = productos.filter(product => {
      if (searchType === 'code') {
        const match = product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
        console.log(`  - Producto ${product.codigo}: ${match ? '✅ MATCH' : '❌ NO MATCH'}`)
        return match
      } else {
        const match = product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        console.log(`  - Producto ${product.nombre}: ${match ? '✅ MATCH' : '❌ NO MATCH'}`)
        return match
      }
    })
    
    console.log('✅ Productos filtrados:', filtered.length)
    console.log('📦 Productos filtrados:', filtered)
    setFilteredProducts(filtered)
  }, [searchTerm, searchType, productos])

  // Calcular totales cuando cambian los items
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity) - item.discount
    }, 0)
    
    const iva = formData.items.reduce((sum, item) => {
      const itemSubtotal = (item.unitPrice * item.quantity) - item.discount
      return sum + (itemSubtotal * item.iva / 100)
    }, 0)

    setFormData(prev => ({
      ...prev,
      subtotal,
      iva,
      total: subtotal + iva
    }))
  }, [formData.items])

  const handleAddProduct = () => {
    if (!selectedProduct) return

    const existingItemIndex = formData.items.findIndex(item => item.productId === selectedProduct.id.toString())
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad si el producto ya existe
      const updatedItems = [...formData.items]
      updatedItems[existingItemIndex].quantity += quantity
      updatedItems[existingItemIndex].total = 
        (updatedItems[existingItemIndex].unitPrice * updatedItems[existingItemIndex].quantity) - 
        updatedItems[existingItemIndex].discount
      
      setFormData(prev => ({ ...prev, items: updatedItems }))
    } else {
      // Agregar nuevo item
      const newItem: InvoiceItem = {
        productId: selectedProduct.id.toString(),
        code: selectedProduct.codigo,
        description: selectedProduct.nombre,
        quantity,
        unitPrice: selectedProduct.precio,
        iva: 21, // IVA por defecto
        discount,
        total: (selectedProduct.precio * quantity) - discount
      }
      
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }))
    }

    // Limpiar formulario y búsqueda
    setSelectedProduct(null)
    setQuantity(1)
    setDiscount(0)
    setSearchTerm('') // Limpiar campo de búsqueda
    setIsProductDialogOpen(false)
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, items: updatedItems }))
  }

  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Recalcular total del item
    const item = updatedItems[index]
    item.total = (item.unitPrice * item.quantity) - item.discount
    
    setFormData(prev => ({ ...prev, items: updatedItems }))
  }

  const handleSearchClient = async () => {
    if (!clientSearch.documentNumber) {
      setClientSearchError('Ingrese un número de documento')
      return
    }

    setIsSearchingClient(true)
    setClientSearchError('')

    try {
      const datos: ValidarClienteAfipDTO = {
        documento_nro: clientSearch.documentNumber,
        documento_tipo: clientSearch.documentType
      }

      const clienteAfip = await apiService.validarClienteAfip(datos)
      
      // Convertir el cliente de AFIP al formato local
      const client: Client = {
        id: clienteAfip.documento_nro,
        businessName: clienteAfip.razon_social,
        documentType: clienteAfip.documento_tipo === '96' ? 'CUIT' : 'DNI',
        documentNumber: clienteAfip.documento_nro,
        address: `${clienteAfip.direccion || ''}, ${clienteAfip.localidad || ''}`,
        province: clienteAfip.provincia || '',
        phone: '',
        email: '',
        createdAt: new Date(),
        createdBy: '1',
        updatedAt: new Date(),
        updatedBy: '1'
      }

      setFormData(prev => ({
        ...prev,
        clientId: client.id,
        client
      }))

      setIsClientDialogOpen(false)
      setClientSearch({ documentType: '96', documentNumber: '' })
    } catch (error: any) {
      setClientSearchError(error.message || 'Error al buscar cliente en AFIP')
    } finally {
      setIsSearchingClient(false)
    }
  }

  const handleSaveInvoice = async () => {
    if (!formData.clientId || formData.items.length === 0) {
      alert('Por favor complete el cliente y agregue al menos un producto')
      return
    }

    try {
      // Validar configuración de TusFacturasApp si está habilitada
      if (tusFacturasConfig.isEnabled) {
        if (!tusFacturasConfig.usertoken || !tusFacturasConfig.apikey) {
          alert('Por favor configure las credenciales de TusFacturasApp')
          return
        }
      }

      // Crear objeto Invoice para serialización
      const invoice = {
        id: Date.now().toString(),
        type: formData.type,
        number: `0001-${String(Date.now()).slice(-8)}`,
        clientId: formData.clientId,
        client: formData.client!,
        items: formData.items,
        subtotal: formData.subtotal,
        iva: formData.iva,
        total: formData.total,
        status: 'draft' as const,
        createdAt: new Date(),
        createdBy: '1',
        updatedAt: new Date(),
        updatedBy: '1'
      }

      // Si TusFacturasApp está habilitada, serializar datos
      if (tusFacturasConfig.isEnabled) {
        const tusFacturasData = serializeInvoiceForTusFacturasApp(
          invoice,
          tusFacturasConfig.usertoken,
          tusFacturasConfig.apikey
        )
        
        const validation = validateTusFacturasAppData(tusFacturasData)
        if (!validation.isValid) {
          alert(`Errores de validación: ${validation.errors.join(', ')}`)
          return
        }

        console.log('Datos para TusFacturasApp:', tusFacturasData)
      }

      console.log('Guardando factura:', formData)
      
      // Simular guardado exitoso
      alert('Factura guardada exitosamente')
      
      // Redirigir a la lista de facturas
      // router.push('/facturacion')
    } catch (error) {
      console.error('Error al guardar factura:', error)
      alert('Error al guardar la factura')
    }
  }

  const handleEmitInvoice = async () => {
    if (!tusFacturasConfig.isEnabled) {
      alert('TusFacturasApp no está configurado. Configure las credenciales primero.')
      return
    }

    try {
      // Aquí iría la lógica para emitir la factura a través de TusFacturasApp
      console.log('Emitiendo factura a través de TusFacturasApp...')
      
      // Simular emisión exitosa
      alert('Factura emitida exitosamente a AFIP')
      
      // Generar CAE (simulado)
      setFormData(prev => ({
        ...prev,
        caeNumber: `12345678901234`,
        caeExpiration: '20241231'
      }))
      
    } catch (error) {
      console.error('Error al emitir factura:', error)
      alert('Error al emitir la factura')
    }
  }

  const getClientName = () => {
    if (formData.client) {
      return formData.client.businessName
    }
    return 'Buscar cliente'
  }

  const getInvoiceTypeLabel = (type: string) => {
    switch (type) {
      case 'A': return 'Factura A'
      case 'B': return 'Factura B'
      case 'C': return 'Factura C'
      case 'NC': return 'Nota de Crédito'
      default: return type
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo'
      case 'transfer': return 'Transferencia'
      case 'card': return 'Tarjeta'
      case 'check': return 'Cheque'
      default: return method
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/facturacion">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nueva Factura</h1>
            <p className="text-gray-600">Crear un nuevo comprobante fiscal</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsConfigDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar AFIP
          </Button>
          <Button variant="outline" onClick={() => setIsPreviewDialogOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleSaveInvoice}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          <Button onClick={handleEmitInvoice} disabled={!tusFacturasConfig.isEnabled}>
            <FileText className="h-4 w-4 mr-2" />
            Emitir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Datos de la factura */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Datos de la Factura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceType">Tipo de Comprobante</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Factura A</SelectItem>
                      <SelectItem value="B">Factura B</SelectItem>
                      <SelectItem value="C">Factura C</SelectItem>
                      <SelectItem value="NC">Nota de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="pointOfSale">Punto de Venta</Label>
                  <Input
                    value={formData.pointOfSale}
                    onChange={(e) => setFormData(prev => ({ ...prev, pointOfSale: e.target.value }))}
                    placeholder="0001"
                  />
                </div>

                <div>
                  <Label htmlFor="afipResponsible">Condición IVA</Label>
                  <Select value={formData.afipResponsible} onValueChange={(value) => setFormData(prev => ({ ...prev, afipResponsible: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                      <SelectItem value="Monotributista">Monotributista</SelectItem>
                      <SelectItem value="Exento">Exento</SelectItem>
                      <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Forma de Pago</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">Pesos Argentinos</SelectItem>
                      <SelectItem value="USD">Dólares</SelectItem>
                      <SelectItem value="EUR">Euros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.currency !== 'ARS' && (
                  <div>
                    <Label htmlFor="exchangeRate">Cotización</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.exchangeRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: parseFloat(e.target.value) || 1 }))}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Observaciones</Label>
                <Textarea
                  placeholder="Observaciones adicionales..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{getClientName()}</p>
                  {formData.client && (
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <div className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        <span>{formData.client.documentType}: {formData.client.documentNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{formData.client.address}, {formData.client.province}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{formData.client.email}</span>
                      </div>
                      {formData.client.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{formData.client.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      {formData.clientId ? 'Cambiar Cliente' : 'Buscar Cliente'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Buscar Cliente en AFIP</DialogTitle>
                      <DialogDescription>
                        Ingrese el DNI o CUIT del cliente para validar sus datos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="documentType">Tipo de Documento</Label>
                        <Select 
                          value={clientSearch.documentType} 
                          onValueChange={(value) => setClientSearch(prev => ({ ...prev, documentType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="96">CUIT</SelectItem>
                            <SelectItem value="80">CUIL</SelectItem>
                            <SelectItem value="86">DNI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="documentNumber">Número de Documento</Label>
                        <Input
                          id="documentNumber"
                          placeholder="Ej: 20123456789"
                          value={clientSearch.documentNumber}
                          onChange={(e) => setClientSearch(prev => ({ ...prev, documentNumber: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchClient()}
                        />
                      </div>
                      {clientSearchError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                          <AlertCircle className="h-4 w-4" />
                          <span>{clientSearchError}</span>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsClientDialogOpen(false)
                            setClientSearch({ documentType: '96', documentNumber: '' })
                            setClientSearchError('')
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSearchClient}
                          disabled={isSearchingClient}
                        >
                          {isSearchingClient ? (
                            <>
                              <Search className="h-4 w-4 mr-2 animate-spin" />
                              Buscando...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Buscar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Productos
              </CardTitle>
              <CardDescription>
                Agregar productos a la factura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Búsqueda de productos */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar productos por código o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code">Código</SelectItem>
                      <SelectItem value="name">Nombre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Resultados de búsqueda */}
                {searchTerm && filteredProducts.length > 0 && (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    <div className="divide-y">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            setSelectedProduct(product)
                            setIsProductDialogOpen(true)
                          }}
                        >
                          <div>
                            <p className="font-medium">{product.nombre}</p>
                            <p className="text-sm text-gray-600">Código: {product.codigo}</p>
                            <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(product.precio)}</p>
                            <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                              {product.stock > 0 ? 'Disponible' : 'Sin stock'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchTerm && filteredProducts.length === 0 && (
                  <div className="border rounded-lg p-4 text-center text-gray-500">
                    No se encontraron productos
                  </div>
                )}
              </div>

              {/* Diálogo para configurar producto */}
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Agregar Producto</DialogTitle>
                  </DialogHeader>
                  {selectedProduct && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Producto Seleccionado</h4>
                        <p className="text-sm text-gray-600">{selectedProduct.nombre}</p>
                        <p className="text-sm text-gray-600">Código: {selectedProduct.codigo}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="quantity">Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="unitPrice">Precio Unitario</Label>
                          <Input
                            type="number"
                            value={selectedProduct.precio}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor="discount">Descuento</Label>
                          <Input
                            type="number"
                            min="0"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => {
                          setSelectedProduct(null)
                          setIsProductDialogOpen(false)
                        }}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddProduct}>
                          Agregar Producto
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Tabla de productos */}
              {formData.items.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>IVA %</TableHead>
                        <TableHead>Descuento</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.description}</p>
                              <p className="text-sm text-gray-600">{item.code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{item.iva}%</div>
                            {/* Select para futuras mejoras */}
                            {/* <Select 
                              value={item.iva.toString()} 
                              onValueChange={(value) => handleUpdateItem(index, 'iva', parseFloat(value))}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0%</SelectItem>
                                <SelectItem value="10.5">10.5%</SelectItem>
                                <SelectItem value="21">21%</SelectItem>
                                <SelectItem value="27">27%</SelectItem>
                              </SelectContent>
                            </Select> */}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => handleUpdateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho - Resumen */}
        <div className="space-y-6">
          {/* Resumen de la factura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(formData.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA:</span>
                  <span>{formatCurrency(formData.iva)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(formData.total)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Productos:</strong> {formData.items.length}</p>
                  <p><strong>Tipo:</strong> {getInvoiceTypeLabel(formData.type)}</p>
                  <p><strong>Punto de Venta:</strong> {formData.pointOfSale}</p>
                  <p><strong>Condición IVA:</strong> {formData.afipResponsible}</p>
                  <p><strong>Forma de Pago:</strong> {getPaymentMethodLabel(formData.paymentMethod)}</p>
                  <p><strong>Moneda:</strong> {formData.currency}</p>
                </div>
              </div>

              {/* CAE si está disponible */}
              {formData.caeNumber && (
                <div className="pt-4 border-t">
                  <div className="text-sm text-green-600 space-y-1">
                    <p><strong>CAE:</strong> {formData.caeNumber}</p>
                    <p><strong>Vencimiento CAE:</strong> {formData.caeExpiration}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estado de validación */}
          <Card>
            <CardHeader>
              <CardTitle>Validación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                {formData.clientId ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">Cliente seleccionado</span>
              </div>
              <div className="flex items-center space-x-2">
                {formData.items.length > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">Productos agregados</span>
              </div>
              <div className="flex items-center space-x-2">
                {formData.total > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">Total válido</span>
              </div>
              <div className="flex items-center space-x-2">
                {tusFacturasConfig.isEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">TusFacturasApp configurado</span>
              </div>
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={() => setIsPreviewDialogOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
              <Button className="w-full" variant="outline" onClick={handleSaveInvoice}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Borrador
              </Button>
              <Button className="w-full" onClick={handleEmitInvoice} disabled={!tusFacturasConfig.isEnabled}>
                <FileText className="h-4 w-4 mr-2" />
                Emitir a ARCA
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de configuración de TusFacturasApp */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configuración TusFacturasApp</DialogTitle>
            <DialogDescription>
              Configure las credenciales para integrar con AFIP
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="usertoken">User Token</Label>
              <Input
                type="password"
                value={tusFacturasConfig.usertoken}
                onChange={(e) => setTusFacturasConfig(prev => ({ ...prev, usertoken: e.target.value }))}
                placeholder="Ingrese su user token"
              />
            </div>
            <div>
              <Label htmlFor="apikey">API Key</Label>
              <Input
                type="password"
                value={tusFacturasConfig.apikey}
                onChange={(e) => setTusFacturasConfig(prev => ({ ...prev, apikey: e.target.value }))}
                placeholder="Ingrese su API key"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableTusFacturas"
                checked={tusFacturasConfig.isEnabled}
                onChange={(e) => setTusFacturasConfig(prev => ({ ...prev, isEnabled: e.target.checked }))}
              />
              <Label htmlFor="enableTusFacturas">Habilitar integración con AFIP</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsConfigDialogOpen(false)}>
              Guardar Configuración
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de vista previa */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa de la Factura</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Header de la factura */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{getInvoiceTypeLabel(formData.type)}</h2>
                  <p className="text-gray-600">Punto de Venta: {formData.pointOfSale}</p>
                  <p className="text-gray-600">Fecha: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold">TOTAL: {formatCurrency(formData.total)}</h3>
                  <p className="text-sm text-gray-600">{formData.currency}</p>
                </div>
              </div>
            </div>

            {/* Datos del cliente */}
            {formData.client && (
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Cliente</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Razón Social:</strong> {formData.client.businessName}</p>
                    <p><strong>Documento:</strong> {formData.client.documentType} {formData.client.documentNumber}</p>
                  </div>
                  <div>
                    <p><strong>Domicilio:</strong> {formData.client.address}</p>
                    <p><strong>Provincia:</strong> {formData.client.province}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Productos */}
            {formData.items.length > 0 && (
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Productos</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>IVA</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.code}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{item.iva}%</TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Totales */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(formData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA:</span>
                <span>{formatCurrency(formData.iva)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(formData.total)}</span>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {formData.notes && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Observaciones</h3>
                <p className="text-sm text-gray-600">{formData.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 