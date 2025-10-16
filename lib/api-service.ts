import { API_CONFIG, handleApiResponse, ApiError } from './api-config';
import {
  LoginDTO,
  Usuario,
  Producto,
  Categoria,
  Cliente,
  ValidarClienteAfipDTO,
  GenerarVentaDTO,
  VentaDTO,
  Venta,
  FacturaDTO,
  Factura,
  EmitirNotaDTO,
  NotaResponse,
  PdfVentaResponse,
  MedioPago,
  Moneda,
  TipoComprobante,
  Perfil,
  UnidadMedida,
  Configuracion,
  ActualizarStockDTO,
  AjustarStockDTO,
  AjustarStockResponse,
  ProductoStockBajo,
  ReporteStock,
  ActualizarStockMinimoDTO,
  ActualizarStockMinimoResponse,
  ActualizarEstados,
  StockMovimiento,
  NuevoMovimientoDTO,
  EstadoFactura,
  TipoFactura,
  Sucursal,
  EventoLog,
  AlicuotaIVA,
  ApiResponse
} from './api-types';

export class ApiService {
  private baseUrl = API_CONFIG.BASE_URL;
  private static authToken: string | null = null;

  static setToken(token: string | null) {
    ApiService.authToken = token;
  }

  private buildHeaders(): HeadersInit {
    const token = ApiService.authToken ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    return {
      ...API_CONFIG.HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // Método privado para hacer peticiones HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError(0, 'URL de API no configurada. Verifica la variable NEXT_PUBLIC_API_URL');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: this.buildHeaders(),
      mode: 'cors',
      credentials: 'omit',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        ApiService.setToken(null);
        if (typeof window !== 'undefined') localStorage.removeItem('token');
      }
      
      const data = await handleApiResponse<T>(response);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Error de conexión', error);
    }
  }

  // ==================== AUTENTICACIÓN ====================
  
  async autenticar(credentials: LoginDTO): Promise<Usuario> {
    return this.request<Usuario>('/usuarios/autenticar', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // ==================== PRODUCTOS ====================
  
  async crearProducto(producto: Omit<Producto, 'id'>): Promise<ApiResponse<Producto>> {
    return this.request<ApiResponse<Producto>>('/productos/crear', {
      method: 'POST',
      body: JSON.stringify(producto),
    });
  }

  async obtenerProducto(id: number): Promise<ApiResponse<Producto>> {
    return this.request<ApiResponse<Producto>>(`/productos/obtener/${id}`);
  }

  async obtenerProductos(): Promise<Producto[]> {
    return this.request<Producto[]>('/productos/obtener-todos');
  }

  async obtenerProductoPorCodigo(codigo: string): Promise<Producto> {
    return this.request<Producto>(`/productos/obtener-por-codigo/${codigo}`);
  }

  async obtenerProductosPorCategoria(idCategoria: number): Promise<Producto[]> {
    return this.request<Producto[]>(`/productos/obtener-por-categoria/${idCategoria}`);
  }

  async obtenerProductosConStockBajo(stockMinimo: number = 10): Promise<Producto[]> {
    return this.request<Producto[]>(`/productos/obtener-con-stock-bajo/${stockMinimo}`);
  }

  async editarProducto(producto: Producto): Promise<Producto> {
    return this.request<Producto>('/productos/editar', {
      method: 'POST',
      body: JSON.stringify(producto),
    });
  }

  async actualizarStock(datos: ActualizarStockDTO): Promise<boolean> {
    return this.request<boolean>('/productos/actualizar-stock', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  }

  async actualizarEstadoProducto(estado: ActualizarEstados): Promise<boolean> {
    return this.request<boolean>('/productos/actualizar-estado', {
      method: 'POST',
      body: JSON.stringify(estado),
    });
  }

  // ==================== CONTROL DE STOCK ====================

  async ajustarStock(id: number, datos: AjustarStockDTO): Promise<AjustarStockResponse> {
    return this.request<AjustarStockResponse>(`/productos/ajustar-stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  }

  async obtenerProductosStockBajo(): Promise<ApiResponse<ProductoStockBajo[]>> {
    return this.request<ApiResponse<ProductoStockBajo[]>>('/productos/stock-bajo');
  }

  async obtenerReporteStock(): Promise<ApiResponse<ReporteStock>> {
    return this.request<ApiResponse<ReporteStock>>('/productos/reporte-stock');
  }

  async actualizarStockMinimo(id: number, datos: ActualizarStockMinimoDTO): Promise<ActualizarStockMinimoResponse> {
    return this.request<ActualizarStockMinimoResponse>(`/productos/actualizar-stock-minimo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  }

  // ==================== CATEGORÍAS ====================

  async crearCategoria(categoria: Omit<Categoria, 'id'>): Promise<ApiResponse<Categoria>> {
    return this.request<ApiResponse<Categoria>>('/categorias/crear', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });
  }

  async obtenerCategoria(id: number): Promise<ApiResponse<Categoria>> {
    return this.request<ApiResponse<Categoria>>(`/categorias/obtener/${id}`);
  }

  async obtenerCategorias(): Promise<ApiResponse<Categoria[]>> {
    return this.request<ApiResponse<Categoria[]>>('/categorias/obtener-todos');
  }

  async actualizarCategoria(id: number, categoria: Categoria): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/categorias/actualizar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoria),
    });
  }

  async eliminarCategoria(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/categorias/eliminar/${id}`, {
      method: 'DELETE',
    });
  }

  async actualizarEstadoCategoria(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/categorias/actualizar-estado/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== CONFIGURACIONES ====================

  async crearConfiguracion(config: Omit<Configuracion, 'id'>): Promise<ApiResponse<Configuracion>> {
    return this.request<ApiResponse<Configuracion>>('/configuraciones/crear', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async obtenerConfiguracion(id: number): Promise<ApiResponse<Configuracion>> {
    return this.request<ApiResponse<Configuracion>>(`/configuraciones/obtener/${id}`);
  }

  async obtenerConfiguraciones(): Promise<ApiResponse<Configuracion[]>> {
    return this.request<ApiResponse<Configuracion[]>>('/configuraciones/obtener-todos');
  }

  async actualizarConfiguracion(id: number, config: Configuracion): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/configuraciones/actualizar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async eliminarConfiguracion(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/configuraciones/eliminar/${id}`, {
      method: 'DELETE',
    });
  }

  async actualizarEstadoConfiguracion(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/configuraciones/actualizar-estado/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== MEDIOS DE PAGO ====================

  async crearMedioPago(medioPago: Omit<MedioPago, 'id'>): Promise<ApiResponse<MedioPago>> {
    return this.request<ApiResponse<MedioPago>>('/mediospago/crear', {
      method: 'POST',
      body: JSON.stringify(medioPago),
    });
  }

  async obtenerMedioPago(id: number): Promise<ApiResponse<MedioPago>> {
    return this.request<ApiResponse<MedioPago>>(`/mediospago/obtener/${id}`);
  }

  async obtenerMediosPago(): Promise<ApiResponse<MedioPago[]>> {
    return this.request<ApiResponse<MedioPago[]>>('/mediospago/obtener-todos');
  }

  async actualizarMedioPago(id: number, medioPago: MedioPago): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/mediospago/actualizar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medioPago),
    });
  }

  async eliminarMedioPago(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/mediospago/eliminar/${id}`, {
      method: 'DELETE',
    });
  }

  async actualizarEstadoMedioPago(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/mediospago/actualizar-estado/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== MONEDAS ====================

  async crearMoneda(moneda: Omit<Moneda, 'id'>): Promise<ApiResponse<Moneda>> {
    return this.request<ApiResponse<Moneda>>('/monedas/crear', {
      method: 'POST',
      body: JSON.stringify(moneda),
    });
  }

  async obtenerMoneda(id: number): Promise<ApiResponse<Moneda>> {
    return this.request<ApiResponse<Moneda>>(`/monedas/obtener/${id}`);
  }

  async obtenerMonedas(): Promise<ApiResponse<Moneda[]>> {
    return this.request<ApiResponse<Moneda[]>>('/monedas/obtener-todos');
  }

  async actualizarMoneda(id: number, moneda: Moneda): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/monedas/actualizar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(moneda),
    });
  }

  async eliminarMoneda(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/monedas/eliminar/${id}`, {
      method: 'DELETE',
    });
  }

  async actualizarEstadoMoneda(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/monedas/actualizar-estado/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== TIPOS DE COMPROBANTE ====================

  async crearTipoComprobante(tipo: Omit<TipoComprobante, 'id'>): Promise<ApiResponse<TipoComprobante>> {
    return this.request<ApiResponse<TipoComprobante>>('/tiposcomprobante/crear', {
      method: 'POST',
      body: JSON.stringify(tipo),
    });
  }

  async obtenerTipoComprobante(id: number): Promise<ApiResponse<TipoComprobante>> {
    return this.request<ApiResponse<TipoComprobante>>(`/tiposcomprobante/obtener/${id}`);
  }

  async obtenerTiposComprobante(): Promise<ApiResponse<TipoComprobante[]>> {
    return this.request<ApiResponse<TipoComprobante[]>>('/tiposcomprobante/obtener-todos');
  }

  async actualizarTipoComprobante(id: number, tipo: TipoComprobante): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/tiposcomprobante/actualizar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tipo),
    });
  }

  async eliminarTipoComprobante(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/tiposcomprobante/eliminar/${id}`, {
      method: 'DELETE',
    });
  }

  async actualizarEstadoTipoComprobante(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/tiposcomprobante/actualizar-estado/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== UNIDADES DE MEDIDA ====================

  async crearUnidadMedida(unidad: Omit<UnidadMedida, 'id'>): Promise<ApiResponse<UnidadMedida>> {
    return this.request<ApiResponse<UnidadMedida>>('/unidadesmedida/crear', {
      method: 'POST',
      body: JSON.stringify(unidad),
    });
  }

  async obtenerUnidadMedida(id: number): Promise<ApiResponse<UnidadMedida>> {
    return this.request<ApiResponse<UnidadMedida>>(`/unidadesmedida/obtener/${id}`);
  }

  async obtenerUnidadesMedida(): Promise<ApiResponse<UnidadMedida[]>> {
    return this.request<ApiResponse<UnidadMedida[]>>('/unidadesmedida/obtener-todos');
  }

  async actualizarUnidadMedida(id: number, unidad: UnidadMedida): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/unidadesmedida/actualizar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(unidad),
    });
  }

  async eliminarUnidadMedida(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/unidadesmedida/eliminar/${id}`, {
      method: 'DELETE',
    });
  }

  async actualizarEstadoUnidadMedida(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/unidadesmedida/actualizar-estado/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== USUARIOS ====================

  async crearUsuario(usuario: Omit<Usuario, 'id'>): Promise<ApiResponse<Usuario>> {
    return this.request<ApiResponse<Usuario>>('/usuarios/crear', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  }

  async obtenerUsuario(id: number): Promise<ApiResponse<Usuario>> {
    return this.request<ApiResponse<Usuario>>(`/usuarios/obtener/${id}`);
  }

  async obtenerUsuarios(): Promise<ApiResponse<Usuario[]>> {
    return this.request<ApiResponse<Usuario[]>>('/usuarios/obtener-todos');
  }

  async actualizarUsuario(id: number, usuario: Usuario): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/usuarios/actualizar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    });
  }

  async eliminarUsuario(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/usuarios/eliminar/${id}`, {
      method: 'DELETE',
    });
  }

  async actualizarEstadoUsuario(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/usuarios/actualizar-estado/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== PERFILES ====================

  async crearPerfil(perfil: Omit<Perfil, 'id'>): Promise<ApiResponse<Perfil>> {
    return this.request<ApiResponse<Perfil>>('/perfiles/crear', {
      method: 'POST',
      body: JSON.stringify(perfil),
    });
  }

  async obtenerPerfil(id: number): Promise<ApiResponse<Perfil>> {
    return this.request<ApiResponse<Perfil>>(`/perfiles/obtener/${id}`);
  }

  async obtenerPerfiles(): Promise<ApiResponse<Perfil[]>> {
    return this.request<ApiResponse<Perfil[]>>('/perfiles/obtener-todos');
  }

  async actualizarPerfil(id: number, perfil: Perfil): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/perfiles/actualizar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(perfil),
    });
  }

  async eliminarPerfil(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/perfiles/eliminar/${id}`, {
      method: 'DELETE',
    });
  }

  async actualizarEstadoPerfil(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/perfiles/actualizar-estado/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== SUCURSALES ====================
  
  async obtenerSucursales(): Promise<Sucursal[]> {
    return this.request<Sucursal[]>('/sucursales/obtener-todas');
  }

  async obtenerSucursal(id: number): Promise<Sucursal> {
    return this.request<Sucursal>(`/sucursales/obtener/${id}`);
  }

  async crearSucursal(sucursal: Omit<Sucursal, 'Id'>): Promise<Sucursal> {
    return this.request<Sucursal>('/sucursales/nueva', {
      method: 'POST',
      body: JSON.stringify(sucursal),
    });
  }

  async editarSucursal(sucursal: Sucursal): Promise<Sucursal> {
    return this.request<Sucursal>('/sucursales/editar', {
      method: 'POST',
      body: JSON.stringify(sucursal),
    });
  }

  // ==================== STOCK (MOVIMIENTOS) ====================
  
  async obtenerStockActual(idProducto: number): Promise<number> {
    return this.request<number>(`/stock/stock-actual/${idProducto}`);
  }

  async verificarDisponibilidad(idProducto: number, cantidad: number): Promise<boolean> {
    return this.request<boolean>(`/stock/verificar-disponibilidad/${idProducto}/${cantidad}`);
  }

  async obtenerMovimientos(): Promise<StockMovimiento[]> {
    return this.request<StockMovimiento[]>('/stock/obtener-movimientos');
  }

  async obtenerMovimientosProducto(idProducto: number): Promise<StockMovimiento[]> {
    return this.request<StockMovimiento[]>(`/stock/obtener-por-producto/${idProducto}`);
  }

  async obtenerMovimientosPorFecha(fechaInicio: string, fechaFin: string): Promise<StockMovimiento[]> {
    return this.request<StockMovimiento[]>(`/stock/movimientos-fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  }

  async obtenerMovimientosVenta(idVenta: number): Promise<StockMovimiento[]> {
    return this.request<StockMovimiento[]>(`/stock/movimientos-venta/${idVenta}`);
  }

  async obtenerMovimientosFactura(idFactura: number): Promise<StockMovimiento[]> {
    return this.request<StockMovimiento[]>(`/stock/movimientos-factura/${idFactura}`);
  }

  async crearMovimientoStock(movimiento: NuevoMovimientoDTO): Promise<StockMovimiento> {
    return this.request<StockMovimiento>('/stock/nuevo-movimiento', {
      method: 'POST',
      body: JSON.stringify(movimiento),
    });
  }

  // ==================== VENTAS ====================
  
  async obtenerVenta(id: number): Promise<Venta> {
    return this.request<Venta>(`/ventas/obtener/${id}`);
  }

  async obtenerVentas(): Promise<Venta[]> {
    return this.request<Venta[]>('/ventas/obtener-todas');
  }

  async obtenerVentasPorSucursal(sucursal: string): Promise<Venta[]> {
    return this.request<Venta[]>(`/ventas/obtener-por-sucursal/${sucursal}`);
  }

  async generarVenta(venta: VentaDTO): Promise<Venta> {
    return this.request<Venta>('/ventas/generar', {
      method: 'POST',
      body: JSON.stringify(venta),
    });
  }

  async cancelarVenta(estado: ActualizarEstados): Promise<boolean> {
    return this.request<boolean>('/ventas/cancelar', {
      method: 'POST',
      body: JSON.stringify(estado),
    });
  }

  async actualizarEstadoVenta(estado: ActualizarEstados): Promise<boolean> {
    return this.request<boolean>('/ventas/actualizar-estado', {
      method: 'POST',
      body: JSON.stringify(estado),
    });
  }

  // ==================== FACTURAS ====================
  
  async obtenerFactura(id: number): Promise<Factura> {
    return this.request<Factura>(`/factura/obtener/${id}`);
  }

  async obtenerFacturas(): Promise<Factura[]> {
    return this.request<Factura[]>(`/factura/obtener-todas`);
  }

  async generarFactura(factura: FacturaDTO): Promise<Factura> {
    return this.request<Factura>('/factura/nueva', {
      method: 'POST',
      body: JSON.stringify(factura),
    });
  }

  async editarFactura(factura: Factura): Promise<Factura> {
    return this.request<Factura>('/factura/editar', {
      method: 'POST',
      body: JSON.stringify(factura),
    });
  }

  async cancelarFactura(estado: ActualizarEstados): Promise<boolean> {
    return this.request<boolean>('/factura/cancelar', {
      method: 'POST',
      body: JSON.stringify(estado),
    });
  }

  async actualizarEstadoFactura(estado: ActualizarEstados): Promise<boolean> {
    return this.request<boolean>('/factura/actualizar-estado', {
      method: 'POST',
      body: JSON.stringify(estado),
    });
  }

  async sincronizarEstadoFactura(id: number): Promise<boolean> {
    return this.request<boolean>(`/factura/sincronizar-estado/${id}`, {
      method: 'POST',
    });
  }

  // ==================== CLIENTES ====================
  
  async obtenerClientes(): Promise<Cliente[]> {
    return this.request<Cliente[]>('/clientes/obtener-todos');
  }

  async obtenerCliente(id: number): Promise<Cliente> {
    return this.request<Cliente>(`/clientes/obtener/${id}`);
  }

  async crearCliente(cliente: Omit<Cliente, 'Id'>): Promise<Cliente> {
    return this.request<Cliente>('/clientes/nuevo', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  }

  async editarCliente(cliente: Cliente): Promise<Cliente> {
    return this.request<Cliente>('/clientes/editar', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  }

  // ==================== CATEGORÍAS (MÉTODOS ADICIONALES) ====================
  
  async editarCategoria(categoria: Categoria): Promise<Categoria> {
    return this.request<Categoria>('/categoria/editar', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });
  }

  // ==================== MEDIOS DE PAGO (MÉTODOS ADICIONALES) ====================
  
  async editarMedioPago(mp: MedioPago): Promise<MedioPago> {
    return this.request<MedioPago>('/mediospago/editar', {
      method: 'POST',
      body: JSON.stringify(mp),
    });
  }

  // ==================== ESTADOS DE FACTURA ====================
  
  async obtenerEstadosFactura(): Promise<EstadoFactura[]> {
    return this.request<EstadoFactura[]>('/estados-factura/obtener-todos');
  }

  async obtenerEstadoFactura(id: number): Promise<EstadoFactura> {
    return this.request<EstadoFactura>(`/estados-factura/obtener/${id}`);
  }

  async crearEstadoFactura(dto: Omit<EstadoFactura,'Id'>): Promise<EstadoFactura> {
    return this.request<EstadoFactura>('/estadosfactura/nuevo', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async editarEstadoFactura(dto: EstadoFactura): Promise<EstadoFactura> {
    return this.request<EstadoFactura>('/estadosfactura/editar', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // ==================== TIPOS FACTURA ====================
  
  async obtenerTiposFactura(): Promise<TipoFactura[]> {
    return this.request<TipoFactura[]>(`/tiposfacturas/obtener-todos`);
  }

  async obtenerTipoFactura(id: number): Promise<TipoFactura> {
    return this.request<TipoFactura>(`/tiposfacturas/obtener/${id}`);
  }

  // ==================== UNIDADES DE MEDIDA (MÉTODOS ADICIONALES) ====================
  
  async editarUnidadMedida(um: UnidadMedida): Promise<UnidadMedida> {
    return this.request<UnidadMedida>('/unidadmedida/editar', {
      method: 'POST',
      body: JSON.stringify(um),
    });
  }

  // ==================== USUARIOS (MÉTODOS ADICIONALES) ====================
  
  async obtenerUsuariosPorSucursal(sucursal: string): Promise<Usuario[]> {
    return this.request<Usuario[]>(`/usuarios/obtener-por-sucursal/${sucursal}`);
  }

  async editarUsuario(usuario: Usuario): Promise<Usuario> {
    return this.request<Usuario>('/usuarios/editar', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  }

  // ==================== VENTAS Y FACTURACIÓN (NUEVOS ENDPOINTS) ====================

  async generarVentaNueva(venta: GenerarVentaDTO): Promise<ApiResponse<{ mensaje: string }>> {
    return this.request<ApiResponse<{ mensaje: string }>>('/ventas/generar', {
      method: 'POST',
      body: JSON.stringify(venta),
    });
  }

  async emitirNota(nota: EmitirNotaDTO): Promise<NotaResponse> {
    return this.request<NotaResponse>('/ventas/emitir-nota', {
      method: 'POST',
      body: JSON.stringify(nota),
    });
  }

  async obtenerPdfVenta(id: number): Promise<PdfVentaResponse> {
    return this.request<PdfVentaResponse>(`/ventas/${id}/pdf`);
  }

  // ==================== VALIDACIÓN DE CLIENTES (AFIP) ====================

  async validarClienteAfip(datos: ValidarClienteAfipDTO): Promise<Cliente> {
    return this.request<Cliente>('/cliente/validar-afip', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  }
}

// Exportar una instancia única del servicio
export const apiService = new ApiService();
