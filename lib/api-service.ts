import { API_CONFIG, handleApiResponse, ApiError } from './api-config';
import {
  LoginDTO,
  Usuario,
  Producto,
  Categoria,
  Cliente,
  VentaDTO,
  Venta,
  FacturaDTO,
  Factura,
  StockMovimiento,
  MedioPago,
  EstadoFactura,
  TipoFactura,
  Perfil,
  UnidadMedida,
  ActualizarEstados,
  EventoLog,
  FacturaResponse,
  ActualizarStockDTO,
  Sucursal,
  NuevoMovimientoDTO,
  AlicuotaIVA
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
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: this.buildHeaders(),
      mode: 'cors',
      credentials: 'omit',
      ...options,
    };

    // Log clave del flujo de autenticación y de cualquier llamada a la API
    console.log('[ApiService] Request', { url, options: config });

    try {
      const startTime = performance.now();
      const response = await fetch(url, config);
      const duration = Math.round(performance.now() - startTime);
      // Registramos el resultado para inspección
      console.log('[ApiService] Response', { url, status: response.status, durationMs: duration });
      // Si la sesión expiró, podemos lanzar un error específico 401
      if (response.status === 401) {
        // Limpia token almacenado
        ApiService.setToken(null);
        if (typeof window !== 'undefined') localStorage.removeItem('token');
      }
      const data = await handleApiResponse<T>(response);
      console.log('[ApiService] Response data', { url, data });
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

  // ==================== USUARIOS ====================
  async obtenerUsuarios(): Promise<Usuario[]> {
    return this.request<Usuario[]>('/usuarios/obtener-todas');
  }

  async obtenerUsuario(id: number): Promise<Usuario> {
    return this.request<Usuario>(`/usuarios/obtener/${id}`);
  }

  async obtenerUsuariosPorSucursal(sucursal: string): Promise<Usuario[]> {
    return this.request<Usuario[]>(`/usuarios/obtener-por-sucursal/${sucursal}`);
  }

  async crearUsuario(usuario: Omit<Usuario, 'Id'>): Promise<Usuario> {
    return this.request<Usuario>('/usuarios/nuevo', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  }

  async editarUsuario(usuario: Usuario): Promise<Usuario> {
    return this.request<Usuario>('/usuarios/editar', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  }

  async actualizarEstadoUsuario(estado: ActualizarEstados): Promise<boolean> {
    return this.request<boolean>('/usuarios/actualizar-estado', {
      method: 'POST',
      body: JSON.stringify(estado),
    });
  }

  // ==================== PRODUCTOS ====================
  async obtenerProductos(): Promise<Producto[]> {
    return this.request<Producto[]>('/productos/obtener-todos');
  }

  async obtenerProducto(id: number): Promise<Producto> {
    return this.request<Producto>(`/productos/obtener/${id}`);
  }

  async crearProducto(producto: Omit<Producto, 'Id'>): Promise<Producto> {
    return this.request<Producto>('/productos/nuevo', {
      method: 'POST',
      body: JSON.stringify(producto),
    });
  }

  async editarProducto(producto: Producto): Promise<Producto> {
    return this.request<Producto>('/productos/editar', {
      method: 'POST',
      body: JSON.stringify(producto),
    });
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

  // ==================== STOCK ====================
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
    return this.request<Factura>(`/facturas/obtener/${id}`);
  }

  async obtenerFacturas(): Promise<Factura[]> {
    return this.request<Factura[]>(`/facturas/obtener-todas`);
  }

  async generarFactura(factura: FacturaDTO): Promise<Factura> {
    return this.request<Factura>('/facturas/nueva', {
      method: 'POST',
      body: JSON.stringify(factura),
    });
  }

  async editarFactura(factura: Factura): Promise<Factura> {
    return this.request<Factura>('/facturas/editar', {
      method: 'POST',
      body: JSON.stringify(factura),
    });
  }

  async cancelarFactura(estado: ActualizarEstados): Promise<boolean> {
    return this.request<boolean>('/facturas/cancelar', {
      method: 'POST',
      body: JSON.stringify(estado),
    });
  }

  async actualizarEstadoFactura(estado: ActualizarEstados): Promise<boolean> {
    return this.request<boolean>('/facturas/actualizar-estado', {
      method: 'POST',
      body: JSON.stringify(estado),
    });
  }

  async sincronizarEstadoFactura(id: number): Promise<boolean> {
    return this.request<boolean>(`/facturas/sincronizar-estado/${id}`, {
      method: 'POST',
    });
  }

  async obtenerEstadoTuFacturaApp(id: number): Promise<FacturaResponse> {
    return this.request<FacturaResponse>(`/facturas/estado-tufacturaapp/${id}`);
  }

  async obtenerDatosNotaCredito(id: number): Promise<FacturaDTO> {
    return this.request<FacturaDTO>(`/facturas/datos-nota-credito/${id}`);
  }

  async obtenerPrefijoNotaCredito(prefijo: string): Promise<string> {
    return this.request<string>(`/facturas/prefijo-nota-credito/${prefijo}`);
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

  // ==================== CATEGORÍAS ====================
  async obtenerCategorias(): Promise<Categoria[]> {
    return this.request<Categoria[]>('/categoria/obtener-todos');
  }

  async obtenerCategoria(id: number): Promise<Categoria> {
    return this.request<Categoria>(`/categoria/obtener/${id}`);
  }

  async crearCategoria(categoria: Omit<Categoria, 'Id'>): Promise<Categoria> {
    return this.request<Categoria>('/categoria/nueva', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });
  }

  async editarCategoria(categoria: Categoria): Promise<Categoria> {
    return this.request<Categoria>('/categoria/editar', {
      method: 'POST',
      body: JSON.stringify(categoria),
    });
  }

  // ==================== PERFILES ====================
  async obtenerPerfiles(): Promise<Perfil[]> {
    return this.request<Perfil[]>('/perfiles/obtener-todos');
  }

  async obtenerPerfil(id: number): Promise<Perfil> {
    return this.request<Perfil>(`/perfiles/obtener/${id}`);
  }

  async crearPerfil(dto: Omit<Perfil,'Id'>): Promise<Perfil> {
    return this.request<Perfil>('/perfiles/nuevo', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async editarPerfil(dto: Perfil): Promise<Perfil> {
    return this.request<Perfil>('/perfiles/editar', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // ==================== MEDIOS DE PAGO ====================
  async obtenerMediosPago(): Promise<MedioPago[]> {
    return this.request<MedioPago[]>('/mediospago/obtener-todos');
  }

  async obtenerMedioPago(id: number): Promise<MedioPago> {
    return this.request<MedioPago>(`/mediospago/obtener/${id}`);
  }

  async crearMedioPago(mp: Omit<MedioPago,'Id'>): Promise<MedioPago> {
    return this.request<MedioPago>('/mediospago/nuevo', {
      method: 'POST',
      body: JSON.stringify(mp),
    });
  }

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

  async crearTipoFactura(dto: Omit<TipoFactura,'Id'>): Promise<TipoFactura> {
    return this.request<TipoFactura>(`/tiposfacturas/nuevo`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async editarTipoFactura(dto: TipoFactura): Promise<TipoFactura> {
    return this.request<TipoFactura>(`/tiposfacturas/editar`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  // ==================== UNIDADES DE MEDIDA ====================
  async obtenerUnidadesMedida(): Promise<UnidadMedida[]> {
    return this.request<UnidadMedida[]>('/unidadmedida/obtener-todos');
  }

  async obtenerUnidadMedida(id: number): Promise<UnidadMedida> {
    return this.request<UnidadMedida>(`/unidadmedida/obtener/${id}`);
  }

  async crearUnidadMedida(um: Omit<UnidadMedida,'Id'>): Promise<UnidadMedida> {
    return this.request<UnidadMedida>('/unidadmedida/nueva', {
      method: 'POST',
      body: JSON.stringify(um),
    });
  }

  async editarUnidadMedida(um: UnidadMedida): Promise<UnidadMedida> {
    return this.request<UnidadMedida>('/unidadmedida/editar', {
      method: 'POST',
      body: JSON.stringify(um),
    });
  }

  // ==================== ALICUOTAS IVA ====================
  async obtenerAlicuotasIVA(): Promise<AlicuotaIVA[]> {
    return this.request<AlicuotaIVA[]>('/alicuotaiva/obtener-todas');
  }

  async obtenerAlicuotaIVA(id: number): Promise<AlicuotaIVA> {
    return this.request<AlicuotaIVA>(`/alicuotaiva/obtener/${id}`);
  }

  async crearAlicuotaIVA(dto: Omit<AlicuotaIVA,'Id'>): Promise<AlicuotaIVA> {
    return this.request<AlicuotaIVA>('/alicuotaiva/nueva', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async editarAlicuotaIVA(alic: AlicuotaIVA): Promise<AlicuotaIVA> {
    return this.request<AlicuotaIVA>('/alicuotaiva/editar', {
      method: 'POST',
      body: JSON.stringify(alic),
    });
  }

  // ==================== EVENTOS LOG ====================
  async obtenerEventosLog(): Promise<EventoLog[]> {
    return this.request<EventoLog[]>('/eventos-log/obtener-todos');
  }

  async obtenerEventoLog(id: number): Promise<EventoLog> {
    return this.request<EventoLog>(`/eventos-log/obtener/${id}`);
  }

  async obtenerEventosPorUsuario(idUsuario: number): Promise<EventoLog[]> {
    return this.request<EventoLog[]>(`/eventos-log/obtener-por-usuario/${idUsuario}`);
  }

  async obtenerEventosPorModulo(modulo: string): Promise<EventoLog[]> {
    return this.request<EventoLog[]>(`/eventos-log/obtener-por-modulo/${modulo}`);
  }

  async obtenerEventosPorFecha(fechaInicio: string, fechaFin: string): Promise<EventoLog[]> {
    return this.request<EventoLog[]>(`/eventos-log/obtener-por-fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  }

  async registrarEvento(evento: Omit<EventoLog, 'Id'>): Promise<EventoLog> {
    return this.request<EventoLog>('/eventos-log/registrar', {
      method: 'POST',
      body: JSON.stringify(evento),
    });
  }
}

// Exportar una instancia única del servicio
export const apiService = new ApiService();
