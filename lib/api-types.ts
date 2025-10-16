// Tipos de datos según la API del backend

// ==================== BASE ====================
export interface EntidadBase {
  id: number;
  isDeleted: boolean;
  rowVersion?: Uint8Array;
  fechaCreacion?: string;
  userLog?: string;
  fechaLog?: string;
}

// ==================== AUTENTICACIÓN ====================
export interface LoginDTO {
  correo: string;
  clave: string;
}

// ==================== USUARIOS ====================
export interface Usuario extends EntidadBase {
  nombre: string;
  clave: string;
  correo: string;
  idPerfil: number;
}

// ==================== PRODUCTOS ====================
export interface Producto extends EntidadBase {
  idCategoria: number;
  idUnidadMedida: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  descripcion: string;
  categoria?: Categoria;
  unidadMedida?: UnidadMedida;
}

// ==================== CATEGORÍAS ====================
export interface Categoria extends EntidadBase {
  nombre: string;
}

// ==================== CLIENTES ====================
export interface Cliente {
  documento_tipo: string;
  documento_nro: string;
  razon_social: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigopostal: string;
  condicion_iva: string;
}

export interface ValidarClienteAfipDTO {
  documento_nro: string;
  documento_tipo: string; // Ej: "96" para CUIT, "80" para CUIL
}

// ==================== VENTAS ====================
export interface VentaDetalle {
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento: number;
  total: number;
}

export interface GenerarVentaDTO {
  idTipoComprobante: number;
  idMedioPago: number;
  idMoneda: number;
  cliente: Cliente;
  fecha: string;
  total: number;
  detalles: VentaDetalle[];
  log: {
    fechaLog: string;
    userLog: string;
  };
}

export interface Venta extends EntidadBase {
  idCliente: number;
  idUsuario: number;
  idMedioPago: number;
  fechaVenta: string;
  totalVenta: number;
  estadoVenta: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  sucursal: string;
  observaciones: string;
  cliente?: Cliente;
  usuario?: Usuario;
  detalle?: VentaDetalle[];
}

// ==================== FACTURAS ====================
export interface Factura extends EntidadBase {
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

export interface EmitirNotaDTO {
  idTipo: number;
  idVenta: number;
  motivo: string;
  log: {
    fechaLog: string;
    userLog: string;
  };
}

export interface NotaResponse {
  error: string;
  rta: string;
  cae: string;
  vencimiento_cae: string;
  comprobante_nro: string;
  comprobante_nro_completo: string;
  punto_venta: string;
  pdf: string;
}

export interface PdfVentaResponse {
  idVenta: number;
  pdfUrl: string;
  mensaje: string;
}

// ==================== STOCK ====================
export interface ActualizarStockDTO {
  nuevoStock: number;
}

export interface AjustarStockDTO {
  cantidad: number; // Positivo para entrada, negativo para salida
  motivo: string;
}

export interface AjustarStockResponse {
  success: boolean;
  message: string;
  data: {
    stockAnterior: number;
    ajuste: number;
    stockNuevo: number;
    motivo: string;
  };
}

export interface ProductoStockBajo {
  id: number;
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  diferencia: number;
}

export interface ReporteStock {
  totalProductos: number;
  productosConStock: number;
  productosSinStock: number;
  productosStockBajo: number;
  valorTotalInventario: number;
  stockPromedio: number;
}

export interface ActualizarStockMinimoDTO {
  nuevoStockMinimo: number;
}

export interface ActualizarStockMinimoResponse {
  success: boolean;
  message: string;
  data: {
    stockMinimoAnterior: number;
    stockMinimoNuevo: number;
  };
}

// ==================== MEDIOS DE PAGO ====================
export interface MedioPago extends EntidadBase {
  nombre: string;
  prefijo: string;
}

// ==================== MONEDAS ====================
export interface Moneda extends EntidadBase {
  nombre: string;
  prefijo: string;
}

// ==================== TIPOS DE COMPROBANTE ====================
export interface TipoComprobante extends EntidadBase {
  nombre: string;
  prefijo: string;
}

// ==================== PERFILES ====================
export interface Perfil extends EntidadBase {
  nombre: string;
}

// ==================== UNIDADES DE MEDIDA ====================
export interface UnidadMedida extends EntidadBase {
  codigo: string;
  descripcion: string;
  activo: boolean;
}

// ==================== CONFIGURACIONES ====================
export interface Configuracion extends EntidadBase {
  nombre: string;
  valor: string;
}

// ==================== TIPOS ADICIONALES (COMPATIBILIDAD) ====================
export interface VentaDTO {
  idCliente: number;
  idUsuario: number;
  idMedioPago: number;
  fechaVenta: string;
  totalVenta: number;
  estadoVenta: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  sucursal: string;
  observaciones: string;
  detalle: VentaDetalle[];
}

export interface FacturaDTO {
  idCliente: number;
  idUsuario: number;
  idTipoFactura: number;
  idEstadoFactura: number;
  fechaFactura: string;
  numeroFactura: string;
  subtotal: number;
  totalIva: number;
  totalFactura: number;
  observaciones?: string;
  detalle?: VentaDetalle[];
}

export interface StockMovimiento {
  Id: number;
  idProducto: number;
  idTipoMovimiento: number;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  motivo: string;
  fecha: string;
  idVenta?: number | null;
  idFactura?: number | null;
  producto?: Producto;
}

export interface NuevoMovimientoDTO {
  idProducto: number;
  idTipoMovimiento: number;
  cantidad: number;
  fecha: string;
  motivo: string;
  idVenta?: number | null;
  idFactura?: number | null;
  userLog: string;
}

export interface EstadoFactura {
  Id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface TipoFactura {
  Id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface Sucursal {
  Id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  tipoProducto: string;
  activa: boolean;
  fechaCreacion?: string;
}

export interface AlicuotaIVA {
  Id: number;
  porcentaje: number;
  descripcion: string;
  activa: boolean;
  fechaCreacion?: string;
}

export interface ActualizarEstados {
  id: number;
  isdelete: boolean;
}

export interface EventoLog {
  Id: number;
  idUsuario: number;
  accion: string;
  modulo: string;
  descripcion: string;
  datosAnteriores: string;
  datosNuevos: string;
  ipAddress: string;
  userAgent: string;
  fecha: string;
  usuario?: Usuario;
}

// ==================== RESPUESTAS COMUNES ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}