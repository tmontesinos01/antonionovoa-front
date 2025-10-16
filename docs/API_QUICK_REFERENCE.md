# API Quick Reference - Antonio Novoa

## 🚀 Inicio Rápido

### Importar el Servicio
```typescript
import { apiService } from '@/lib/api-service';
```

---

## 📦 Operaciones Comunes

### Productos

```typescript
// Listar todos
const { data: productos } = await apiService.obtenerProductos();

// Obtener uno
const { data: producto } = await apiService.obtenerProducto(1);

// Crear
const { data: nuevo } = await apiService.crearProducto({
  idCategoria: 1,
  idUnidadMedida: 1,
  codigo: "PROD001",
  nombre: "Producto",
  precio: 100,
  stock: 50,
  stockMinimo: 10,
  descripcion: "Descripción"
});

// Actualizar
await apiService.actualizarProducto(1, producto);

// Eliminar (soft delete)
await apiService.actualizarEstadoProducto(1);
```

### Stock

```typescript
// Establecer stock absoluto
await apiService.actualizarStock(1, { nuevoStock: 100 });

// Ajustar stock (entrada)
await apiService.ajustarStock(1, {
  cantidad: 50,
  motivo: "Compra"
});

// Ajustar stock (salida)
await apiService.ajustarStock(1, {
  cantidad: -10,
  motivo: "Venta"
});

// Productos con stock bajo
const { data: stockBajo } = await apiService.obtenerProductosStockBajo();

// Reporte de stock
const { data: reporte } = await apiService.obtenerReporteStock();
```

### Categorías

```typescript
// Listar
const { data: categorias } = await apiService.obtenerCategorias();

// Crear
await apiService.crearCategoria({ nombre: "Electrónica" });
```

### Medios de Pago

```typescript
// Listar
const { data: mediosPago } = await apiService.obtenerMediosPago();

// Crear
await apiService.crearMedioPago({
  nombre: "Efectivo",
  prefijo: "EF"
});
```

### Monedas

```typescript
// Listar
const { data: monedas } = await apiService.obtenerMonedas();

// Crear
await apiService.crearMoneda({
  nombre: "Peso Argentino",
  prefijo: "ARS"
});
```

### Tipos de Comprobante

```typescript
// Listar
const { data: tipos } = await apiService.obtenerTiposComprobante();

// Crear
await apiService.crearTipoComprobante({
  nombre: "Factura A",
  prefijo: "FA"
});
```

### Unidades de Medida

```typescript
// Listar
const { data: unidades } = await apiService.obtenerUnidadesMedida();

// Crear
await apiService.crearUnidadMedida({
  codigo: "UN",
  descripcion: "Unidad",
  activo: true
});
```

### Usuarios

```typescript
// Listar
const { data: usuarios } = await apiService.obtenerUsuarios();

// Crear
await apiService.crearUsuario({
  nombre: "Juan Pérez",
  clave: "password123",
  correo: "juan@example.com",
  idPerfil: 1
});
```

### Perfiles

```typescript
// Listar
const { data: perfiles } = await apiService.obtenerPerfiles();

// Crear
await apiService.crearPerfil({ nombre: "Administrador" });
```

### Configuraciones

```typescript
// Listar
const { data: configs } = await apiService.obtenerConfiguraciones();

// Crear
await apiService.crearConfiguracion({
  nombre: "EMPRESA_NOMBRE",
  valor: "Antonio Novoa"
});
```

---

## 🧾 Ventas y Facturación

### Flujo Completo de Venta

```typescript
// 1. Validar cliente en AFIP
const cliente = await apiService.validarClienteAfip({
  documento_nro: "20123456789",
  documento_tipo: "96" // CUIT
});

// 2. Generar venta
const venta = await apiService.generarVenta({
  idTipoComprobante: 1,
  idMedioPago: 1,
  idMoneda: 1,
  cliente: cliente,
  fecha: new Date().toISOString(),
  total: 1500.00,
  detalles: [
    {
      idProducto: 1,
      cantidad: 2,
      precioUnitario: 750.00,
      subtotal: 1500.00,
      descuento: 0,
      total: 1500.00
    }
  ],
  log: {
    fechaLog: new Date().toISOString(),
    userLog: "usuario@ejemplo.com"
  }
});

// 3. Obtener PDF (opcional)
const pdf = await apiService.obtenerPdfVenta(ventaId);
```

### Emitir Nota de Crédito

```typescript
const nota = await apiService.emitirNota({
  idTipo: 3,
  idVenta: 1,
  motivo: "Devolución",
  log: {
    fechaLog: new Date().toISOString(),
    userLog: "usuario@ejemplo.com"
  }
});
```

---

## 🔍 Validación AFIP

```typescript
// Validar CUIT
const cliente = await apiService.validarClienteAfip({
  documento_nro: "20123456789",
  documento_tipo: "96"
});

// Validar CUIL
const persona = await apiService.validarClienteAfip({
  documento_nro: "20123456789",
  documento_tipo: "80"
});
```

---

## 🔴 Manejo de Errores

```typescript
try {
  const response = await apiService.obtenerProductos();
  if (response.success) {
    const productos = response.data;
  } else {
    console.error(response.message);
  }
} catch (error) {
  console.error("Error de conexión:", error);
}
```

---

## 📝 Tipos de Documento AFIP

- `96` - CUIT
- `80` - CUIL
- `86` - CUIL (extranjero)
- `87` - CDI

---

## 🎯 Endpoints Principales

| Módulo | Endpoint Base |
|--------|---------------|
| Productos | `/productos` |
| Categorías | `/categorias` |
| Stock | `/productos/*-stock*` |
| Medios de Pago | `/mediospago` |
| Monedas | `/monedas` |
| Tipos Comprobante | `/tiposcomprobante` |
| Unidades Medida | `/unidadesmedida` |
| Usuarios | `/usuarios` |
| Perfiles | `/perfiles` |
| Configuraciones | `/configuraciones` |
| Ventas | `/ventas` |
| AFIP | `/cliente/validar-afip` |

---

## ⚙️ Configuración

### .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Autenticación
```typescript
import { ApiService } from '@/lib/api-service';

// Establecer token después del login
ApiService.setToken(token);

// Limpiar token al logout
ApiService.setToken(null);
```

---

## 📊 Respuestas Comunes

### Éxito
```typescript
{
  success: true,
  data: any,
  message?: string
}
```

### Error
```typescript
{
  success: false,
  message: string
}
```

---

## 🔧 Utilidades

### Formato de Fecha
```typescript
const fecha = new Date().toISOString(); // "2024-10-14T20:00:00Z"
```

### Soft Delete vs Hard Delete
```typescript
// Soft delete (marca como eliminado)
await apiService.actualizarEstadoProducto(id);

// Hard delete (elimina físicamente)
await apiService.eliminarProducto(id);
```

---

## 💡 Tips

1. **Todas las URLs son lowercase** - El backend convierte automáticamente
2. **Usar soft delete por defecto** - Preserva el historial
3. **Validar cliente antes de facturar** - Usar endpoint de AFIP
4. **Manejar errores apropiadamente** - Usar try/catch
5. **Verificar response.success** - Antes de acceder a data

---

## 📚 Más Información

Ver `docs/API_DOCUMENTATION.md` para documentación completa.
