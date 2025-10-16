# Documentación API Backend - Antonio Novoa

## URL Base de la API
Las URLs están en lowercase. Ejemplo: `/productos/crear`, `/categorias/obtener-todos`

---

## 📋 MÓDULO: PRODUCTOS

### Base URL: `/productos`

#### 1. Crear Producto
- **Método:** `POST`
- **Ruta:** `/productos/crear`
- **Uso en Frontend:**
```typescript
import { apiService } from '@/lib/api-service';

const nuevoProducto = {
  idCategoria: 1,
  idUnidadMedida: 1,
  codigo: "PROD001",
  nombre: "Producto Ejemplo",
  precio: 100.00,
  stock: 50,
  stockMinimo: 10,
  descripcion: "Descripción del producto"
};

const response = await apiService.crearProducto(nuevoProducto);
if (response.success) {
  console.log("Producto creado:", response.data);
}
```

#### 2. Obtener Todos los Productos
- **Método:** `GET`
- **Ruta:** `/productos/obtener-todos`
- **Uso en Frontend:**
```typescript
const response = await apiService.obtenerProductos();
if (response.success) {
  const productos = response.data;
}
```

#### 3. Actualizar Stock
- **Método:** `PUT`
- **Ruta:** `/productos/actualizar-stock/{id}`
- **Uso en Frontend:**
```typescript
const response = await apiService.actualizarStock(1, { nuevoStock: 100 });
```

#### 4. Ajustar Stock (incrementar/decrementar)
- **Método:** `PUT`
- **Ruta:** `/productos/ajustar-stock/{id}`
- **Uso en Frontend:**
```typescript
// Entrada de stock (positivo)
const response = await apiService.ajustarStock(1, {
  cantidad: 50,
  motivo: "Compra de mercadería"
});

// Salida de stock (negativo)
const response = await apiService.ajustarStock(1, {
  cantidad: -10,
  motivo: "Venta al cliente"
});
```

#### 5. Obtener Productos con Stock Bajo
- **Método:** `GET`
- **Ruta:** `/productos/stock-bajo`
- **Uso en Frontend:**
```typescript
const response = await apiService.obtenerProductosStockBajo();
if (response.success) {
  const productosStockBajo = response.data;
}
```

#### 6. Obtener Reporte de Stock
- **Método:** `GET`
- **Ruta:** `/productos/reporte-stock`
- **Uso en Frontend:**
```typescript
const response = await apiService.obtenerReporteStock();
if (response.success) {
  const reporte = response.data;
  console.log("Total productos:", reporte.totalProductos);
  console.log("Valor inventario:", reporte.valorTotalInventario);
}
```

---

## 📦 MÓDULO: CATEGORÍAS

### Base URL: `/categorias`

#### Uso en Frontend:
```typescript
// Obtener todas las categorías
const response = await apiService.obtenerCategorias();

// Crear categoría
const nuevaCategoria = await apiService.crearCategoria({
  nombre: "Electrónica"
});

// Actualizar categoría
await apiService.actualizarCategoria(1, categoria);

// Eliminar (soft delete)
await apiService.actualizarEstadoCategoria(1);
```

---

## 💳 MÓDULO: MEDIOS DE PAGO

### Base URL: `/mediospago`

#### Uso en Frontend:
```typescript
// Obtener todos los medios de pago
const response = await apiService.obtenerMediosPago();

// Crear medio de pago
const nuevoMedioPago = await apiService.crearMedioPago({
  nombre: "Efectivo",
  prefijo: "EF"
});
```

---

## 💰 MÓDULO: MONEDAS

### Base URL: `/monedas`

#### Uso en Frontend:
```typescript
// Obtener todas las monedas
const response = await apiService.obtenerMonedas();

// Crear moneda
const nuevaMoneda = await apiService.crearMoneda({
  nombre: "Peso Argentino",
  prefijo: "ARS"
});
```

---

## 📄 MÓDULO: TIPOS DE COMPROBANTE

### Base URL: `/tiposcomprobante`

#### Uso en Frontend:
```typescript
// Obtener todos los tipos de comprobante
const response = await apiService.obtenerTiposComprobante();

// Crear tipo de comprobante
const nuevoTipo = await apiService.crearTipoComprobante({
  nombre: "Factura A",
  prefijo: "FA"
});
```

---

## 📏 MÓDULO: UNIDADES DE MEDIDA

### Base URL: `/unidadesmedida`

#### Uso en Frontend:
```typescript
// Obtener todas las unidades de medida
const response = await apiService.obtenerUnidadesMedida();

// Crear unidad de medida
const nuevaUnidad = await apiService.crearUnidadMedida({
  codigo: "UN",
  descripcion: "Unidad",
  activo: true
});
```

---

## 👤 MÓDULO: USUARIOS

### Base URL: `/usuarios`

#### Uso en Frontend:
```typescript
// Obtener todos los usuarios
const response = await apiService.obtenerUsuarios();

// Crear usuario
const nuevoUsuario = await apiService.crearUsuario({
  nombre: "Juan Pérez",
  clave: "password123",
  correo: "juan@example.com",
  idPerfil: 1
});

// Actualizar usuario
await apiService.actualizarUsuario(1, usuario);
```

---

## 👥 MÓDULO: PERFILES

### Base URL: `/perfiles`

#### Uso en Frontend:
```typescript
// Obtener todos los perfiles
const response = await apiService.obtenerPerfiles();

// Crear perfil
const nuevoPerfil = await apiService.crearPerfil({
  nombre: "Administrador"
});
```

---

## ⚙️ MÓDULO: CONFIGURACIONES

### Base URL: `/configuraciones`

#### Uso en Frontend:
```typescript
// Obtener todas las configuraciones
const response = await apiService.obtenerConfiguraciones();

// Crear configuración
const nuevaConfig = await apiService.crearConfiguracion({
  nombre: "EMPRESA_NOMBRE",
  valor: "Antonio Novoa"
});

// Actualizar configuración
await apiService.actualizarConfiguracion(1, config);
```

---

## 🧾 MÓDULO: VENTAS Y FACTURACIÓN

### Base URL: `/ventas`

#### 1. Generar Venta y Factura
```typescript
import { apiService } from '@/lib/api-service';

// Primero validar el cliente en AFIP
const clienteValidado = await apiService.validarClienteAfip({
  documento_nro: "20123456789",
  documento_tipo: "96" // 96 = CUIT
});

// Luego generar la venta
const ventaDTO = {
  idTipoComprobante: 1,
  idMedioPago: 1,
  idMoneda: 1,
  cliente: clienteValidado,
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
};

const response = await apiService.generarVenta(ventaDTO);
if (response.success) {
  console.log(response.data.mensaje);
}
```

#### 2. Emitir Nota de Crédito/Débito
```typescript
const notaDTO = {
  idTipo: 3, // ID del tipo de comprobante (nota de crédito/débito)
  idVenta: 1,
  motivo: "Devolución de mercadería",
  log: {
    fechaLog: new Date().toISOString(),
    userLog: "usuario@ejemplo.com"
  }
};

const response = await apiService.emitirNota(notaDTO);
console.log("CAE:", response.cae);
console.log("PDF:", response.pdf);
```

#### 3. Obtener PDF de Venta
```typescript
const response = await apiService.obtenerPdfVenta(1);
console.log("URL del PDF:", response.pdfUrl);
```

---

## 🔍 MÓDULO: VALIDACIÓN DE CLIENTES (AFIP)

### Base URL: `/cliente`

#### Validar Cliente en AFIP
```typescript
const clienteValidado = await apiService.validarClienteAfip({
  documento_nro: "20123456789",
  documento_tipo: "96" // 96 = CUIT, 80 = CUIL
});

console.log("Razón Social:", clienteValidado.razon_social);
console.log("Dirección:", clienteValidado.direccion);
console.log("Condición IVA:", clienteValidado.condicion_iva);
```

---

## 🔴 MANEJO DE ERRORES

Todas las respuestas siguen este formato:

### Respuesta Exitosa
```typescript
{
  success: true,
  data: any,
  message?: string
}
```

### Respuesta de Error
```typescript
{
  success: false,
  message: string
}
```

### Manejo de Errores en Frontend
```typescript
try {
  const response = await apiService.obtenerProductos();
  if (response.success) {
    // Procesar datos
    const productos = response.data;
  } else {
    // Mostrar mensaje de error
    console.error(response.message);
  }
} catch (error) {
  // Error de conexión o error inesperado
  console.error("Error:", error);
}
```

---

## 📝 NOTAS IMPORTANTES

1. **Todas las URLs están en lowercase**: La API usa un transformador que convierte todas las rutas a minúsculas.

2. **Formato de fechas**: Usar formato ISO 8601
   ```typescript
   const fecha = new Date().toISOString(); // "2024-10-14T20:00:00Z"
   ```

3. **Soft Delete vs Hard Delete**:
   - `eliminarProducto(id)` - Elimina físicamente el registro
   - `actualizarEstadoProducto(id)` - Marca como eliminado (isDeleted = true)

4. **Control de Stock**:
   - `actualizarStock()` - Establece un valor absoluto
   - `ajustarStock()` - Incrementa o decrementa (usa valores positivos o negativos)

5. **Autenticación**: El token se maneja automáticamente por el servicio
   ```typescript
   import { ApiService } from '@/lib/api-service';
   
   // Después del login
   ApiService.setToken(token);
   ```

---

## 🚀 EJEMPLO DE FLUJO COMPLETO: GENERAR UNA VENTA

```typescript
import { apiService } from '@/lib/api-service';

async function generarVentaCompleta() {
  try {
    // 1. Validar cliente en AFIP
    const clienteValidado = await apiService.validarClienteAfip({
      documento_nro: "20123456789",
      documento_tipo: "96"
    });

    // 2. Obtener productos disponibles
    const productosResponse = await apiService.obtenerProductos();
    const productos = productosResponse.data;

    // 3. Obtener datos de configuración
    const tiposComprobanteResponse = await apiService.obtenerTiposComprobante();
    const mediosPagoResponse = await apiService.obtenerMediosPago();
    const monedasResponse = await apiService.obtenerMonedas();

    // 4. Generar la venta
    const ventaDTO = {
      idTipoComprobante: tiposComprobanteResponse.data[0].id,
      idMedioPago: mediosPagoResponse.data[0].id,
      idMoneda: monedasResponse.data[0].id,
      cliente: clienteValidado,
      fecha: new Date().toISOString(),
      total: 1500.00,
      detalles: [
        {
          idProducto: productos[0].id,
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
    };

    const ventaResponse = await apiService.generarVenta(ventaDTO);
    
    if (ventaResponse.success) {
      console.log("Venta generada exitosamente");
      
      // 5. Obtener el PDF de la factura (si se necesita)
      // const pdfResponse = await apiService.obtenerPdfVenta(ventaId);
      // window.open(pdfResponse.pdfUrl, '_blank');
    }
  } catch (error) {
    console.error("Error al generar venta:", error);
  }
}
```

---

## 📊 TIPOS DE DATOS COMUNES

### EntidadBase
Todas las entidades heredan de esta clase base:
```typescript
interface EntidadBase {
  id: number;
  isDeleted: boolean;
  rowVersion?: Uint8Array;
  fechaCreacion?: string;
  userLog?: string;
  fechaLog?: string;
}
```

### Producto
```typescript
interface Producto extends EntidadBase {
  idCategoria: number;
  idUnidadMedida: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  descripcion: string;
}
```

### Cliente
```typescript
interface Cliente {
  documento_tipo: string;
  documento_nro: string;
  razon_social: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigopostal: string;
  condicion_iva: string;
}
```

### Venta
```typescript
interface Venta extends EntidadBase {
  observaciones: string;
  total: number;
  documento_tipo: string;
  documento_nro: string;
  razon_social: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigopostal: string;
  condicion_iva: string;
}
```

### Factura
```typescript
interface Factura extends EntidadBase {
  idVenta: number;
  idEstado: number;
  idMoneda: number;
  idMedioPago: number;
  idTipoComprobante: number;
  cae: string;
  vencimientoCae: string;
  numeroComprobante: string;
  comprobanteCompleto: string;
  puntoVenta: string;
  pdfUrl: string;
  mensajeAfip: string;
}
```

---

## 🔧 CONFIGURACIÓN

### Variables de Entorno
Crear un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### API Config
El archivo `lib/api-config.ts` contiene la configuración base:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}
```

---

## 📞 SOPORTE

Para más información sobre la API, consulta:
- Código fuente del backend
- Este archivo de documentación
- El archivo `lib/api-types.ts` para ver todas las interfaces TypeScript disponibles
