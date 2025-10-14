// Tipos de datos según la API del backend

export interface LoginDTO {
  correo: string;
  clave: string;
}

export interface Usuario {
  Id: number;
  nombre: string;
  correo: string;
  clave?: string;
  telefono?: string;
  idPerfil: number;
  activo: boolean;
  sucursal: string;
  ultimoAcceso: string | null;
  fechaCreacion?: string;
}

export interface Producto {
  Id: number;
  idCategoria: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  descripcion?: string;
  categoria?: Categoria;
  IsDeleted?: boolean;
  RowVersion?: string;
}

export interface Categoria {
  Id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  fechaCreacion?: string;
}

export interface Cliente {
  Id: number;
  apellidoYnombre: string;
  email: string;
  telefono: string;
  direccion: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  cuit?: string;
  tipoDocumento: string; // CUIT, DNI, CUIL, etc.
  numeroDocumento: string;
  condicionIva?: string;
  fechaCreacion?: string;
}

export interface VentaDTO {
  idCliente: number;
  idUsuario: number;
  idMedioPago: number;
  fechaVenta: string;
  totalVenta: number;
  estadoVenta: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  sucursal: 'PINO' | 'MELAMINA';
  observaciones: string;
  detalle: VentaDetalle[];
}

export interface VentaDetalle {
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  total: number;
}

export interface Venta {
  Id: number;
  idCliente: number;
  idUsuario: number;
  idMedioPago: number;
  fechaVenta: string;
  totalVenta: number;
  estadoVenta: string;
  sucursal: string;
  observaciones: string;
  cliente?: Cliente;
  usuario?: Usuario;
  medioPago?: MedioPago;
  detalle?: VentaDetalle[];
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
  detalle?: FacturaDetalle[];
}

export interface FacturaDetalle {
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  total: number;
}

export interface Tributo {
  idTipoTributo: number;
  baseImponible: number;
  alicuota: number;
  importe: number;
}

export interface Factura {
  Id: number;
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
  cliente?: Cliente;
  estadoFactura?: EstadoFactura;
  tipoFactura?: TipoComprobante;
  detalle?: FacturaDetalle[];
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

export interface MedioPago {
  Id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface EstadoFactura {
  Id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface TipoComprobante {
  Id: number;
  nombre: string;
}

export interface TipoFactura {
  Id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface Perfil {
  Id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface UnidadMedida {
  Id: number;
  nombre: string;
  abreviatura: string;
  descripcion?: string;
  activa: boolean;
  fechaCreacion?: string;
}

// ==================== ALICUOTAS IVA ====================
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

export interface FacturaResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// ==================== PRODUCTOS ====================
// DTO para actualizar stock de un producto
export interface ActualizarStockDTO {
  id: number;
  nuevoStock: number;
  userLog: string;
}

// ==================== SUCURSALES ====================
export interface Sucursal {
  Id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  tipoProducto: string; // General, etc.
  activa: boolean;
  fechaCreacion?: string;
}