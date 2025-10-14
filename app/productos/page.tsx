"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  RefreshCw
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useProductos, useCategorias } from "@/hooks/use-api"
import { Producto } from "@/lib/api-types"

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // Estado del formulario nuevo producto
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    stockMin: "",
    idCategoria: ""
  })
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<string>("all")
  
  // Hooks para obtener datos de la API
  const { productos, loading: loadingProductos, error: errorProductos, cargarProductos, cargarProducto, crearProducto, editarProducto, actualizarEstadoProducto } = useProductos()
  const { categorias, loading: loadingCategorias, error: errorCategorias, cargarCategorias } = useCategorias()

  // Log cambios en la lista de productos y su clasificación
  useEffect(() => {
    if (productos) {
      const activosCnt = productos.filter(p => p.stock > 0).length
      const sinStockCnt = productos.filter(p => p.stock === 0).length
      console.log('[ProductosPage] Estado listas -> activos:', activosCnt, 'sinStock:', sinStockCnt)
      // Log RowVersion de productos sin stock para debug
      productos.filter(p => p.stock === 0).forEach(p => {
        console.log(`[DEBUG] Producto ${p.Id} sin stock - RowVersion: ${p.RowVersion}`)
      })
    }
  }, [productos])
  
  const handleInput = (field: string) => (e: any) => {
    setForm({ ...form, [field]: e.target.value })
  }

  const handleEditProduct = (product: Producto) => {
    console.log('[ProductosPage] Editando producto directo (sin refetch)', product.Id)
    setEditingProduct(product)
    setForm({
      codigo: product.codigo,
      nombre: product.nombre,
      descripcion: product.descripcion ?? "",
      precio: String(product.precio),
      stock: String(product.stock),
      stockMin: String(product.stockMinimo),
      idCategoria: String(product.idCategoria)
    })
    setIsDialogOpen(true)
  }

  const handleSaveProducto = async () => {
    try {
      if (editingProduct) {
        console.log('[ProductosPage] Editando producto', editingProduct.Id)
        const markDelete = Number(form.stock) === 0;
        const updatePayload: any = {
          ...editingProduct, // incluye RowVersion necesario
          idCategoria: Number(form.idCategoria),
          codigo: form.codigo,
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: Number(form.precio),
          stock: Number(form.stock),
          stockMinimo: Number(form.stockMin),
          fechaLog: new Date().toISOString(),
          userLog: 'admin@antonionovoa.com'
        }
        console.log('[ProductosPage] Payload editar', updatePayload)
        await editarProducto(updatePayload)
        await actualizarEstadoProducto({ id: editingProduct.Id, isdelete: markDelete, userLog: 'admin@antonionovoa.com' } as any)
        console.log('[ProductosPage] Estado actualizado isdelete', markDelete)
        // Refrescar lista inmediatamente para tener RowVersion actualizados
        await cargarProductos()
      } else {
        console.log('[ProductosPage] Creando producto', form)
        const markDeleteCreate = Number(form.stock) === 0;
        const created = await crearProducto({
          idCategoria: Number(form.idCategoria),
          codigo: form.codigo,
          nombre: form.nombre,
          descripcion: form.descripcion,
          precio: Number(form.precio),
          stock: Number(form.stock),
          stockMinimo: Number(form.stockMin),
          fechaCreacion: new Date().toISOString(),
          userLog: 'admin@antonionovoa.com'
        } as any)
        console.log('[ProductosPage] Producto creado id', created.Id)
        if (markDeleteCreate) {
          await actualizarEstadoProducto({ id: created.Id, isdelete: true, userLog: 'admin@antonionovoa.com' } as any)
          // Refrescar lista después de actualizar estado
          await cargarProductos()
        }
      }
      // Solo cargar si no se hizo arriba
      if (!editingProduct || Number(form.stock) > 0) {
        await cargarProductos()
      }
      setIsDialogOpen(false)
      setForm({ codigo:"", nombre:"", descripcion:"", precio:"", stock:"", stockMin:"", idCategoria:"" })
      setEditingProduct(null)
    } catch (err) {
      console.error('[ProductosPage] Error al guardar producto', err)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('[ProductosPage] Montaje: solicitando datos');
    cargarProductos()
    cargarCategorias()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!productos) return []
    const term = searchTerm.trim().toLowerCase()
    return productos.filter((product) => {
      const matchesSearch = term === '' ? true : (
        product.nombre.toLowerCase().includes(term) ||
        product.codigo.toLowerCase().includes(term)
      )
      const matchesCategoria = selectedCategoria === 'all' ? true : product.idCategoria === Number(selectedCategoria)
      return matchesSearch && matchesCategoria
    })
  }, [productos, searchTerm, selectedCategoria])

  const activos = filteredProducts.filter(p => p.stock > 0)
  const sinStock = filteredProducts.filter(p => p.stock === 0)

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'critical' as const, label: 'Sin stock' }
    if (stock <= 5) return { status: 'low' as const, label: 'Stock bajo' }
    return { status: 'normal' as const, label: 'Normal' }
  }

  const isLoading = loadingProductos || loadingCategorias

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600">Gestiona tu catálogo de productos</p>
        </div>
        <div className="flex space-x-2">
          {isLoading && (
            <Button variant="outline" disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Cargando...
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nuevo Producto</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
              <DialogDescription>
                Completa la información del producto. Haz clic en guardar cuando hayas terminado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Código
                </Label>
                <Input
                  id="code"
                  value={form.codigo}
                  onChange={handleInput('codigo')}
                  placeholder="PROD-001"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={form.nombre}
                  onChange={handleInput('nombre')}
                  placeholder="Nombre del producto"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={form.descripcion}
                  onChange={handleInput('descripcion')}
                  placeholder="Descripción del producto"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Precio
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={form.precio}
                  onChange={handleInput('precio')}
                  placeholder="0.00"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleInput('stock')}
                  placeholder="0"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minStock" className="text-right">
                  Stock Mín.
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  value={form.stockMin}
                  onChange={handleInput('stockMin')}
                  placeholder="0"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categories" className="text-right">
                  Categorías
                </Label>
                <Select value={form.idCategoria} onValueChange={(val)=>setForm({...form,idCategoria:val})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias?.map((category) => (
                      <SelectItem key={category.Id} value={category.Id.toString()}>
                        {category.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingProduct(null); }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProducto}>
                {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca y filtra productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="sm:w-auto flex items-center">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categorias?.map((cat) => (
                  <SelectItem key={cat.Id} value={cat.Id.toString()}>{cat.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de productos activos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Activos</CardTitle>
          <CardDescription>
            {activos.length} productos encontrados
            {(errorProductos || errorCategorias) && (
              <span className="text-red-600 ml-2">
                Error: {errorProductos || errorCategorias}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden lg:table-cell">Categorías</TableHead>
                  <TableHead className="hidden sm:table-cell">Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="hidden sm:table-cell">Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activos.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  const categoria = categorias?.find(cat => cat.Id === product.idCategoria)
                  return (
                    <TableRow key={product.Id}>
                      <TableCell className="hidden sm:table-cell font-medium">
                        {product.codigo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.nombre}</p>
                          <p className="text-sm text-gray-500 sm:hidden">{product.codigo}</p>
                          <div className="flex flex-wrap gap-1 mt-1 lg:hidden">
                            {categoria && (
                              <Badge variant="outline" className="text-xs">
                                {categoria.nombre}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {categoria && (
                            <Badge variant="outline" className="text-xs">
                              {categoria.nombre}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell font-medium">
                        {formatCurrency(product.precio)}
                      </TableCell>
                      <TableCell>
                        <div className="text-left sm:text-right">
                          <p className="font-medium">{product.stock}</p>
                          <p className="text-xs text-gray-500">
                            Mín: {product.stockMinimo}
                          </p>
                          <p className="text-xs text-gray-500 sm:hidden">
                            {formatCurrency(product.precio)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge 
                          variant={stockStatus.status === 'critical' ? 'destructive' : 'secondary'}
                          className={
                            stockStatus.status === 'critical' ? "bg-red-100 text-red-800" :
                            stockStatus.status === 'low' ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }
                        >
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Productos sin stock */}
      {sinStock.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Sin Stock
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Productos cuyo stock es 0
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sinStock.map(p => (
                    <TableRow key={p.Id}>
                      <TableCell>{p.codigo}</TableCell>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>{categorias?.find(c=>c.Id===p.idCategoria)?.nombre}</TableCell>
                      <TableCell>{formatCurrency(p.precio)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleEditProduct(p)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}