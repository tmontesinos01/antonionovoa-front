import { useState, useEffect } from 'react';
import { apiService, ApiService } from '@/lib/api-service';
import { ApiError } from '@/lib/api-config';
import {
  Usuario,
  Producto,
  Cliente,
  Venta,
  Factura,
  StockMovimiento,
  Categoria,
  MedioPago,
  EstadoFactura,
  Perfil,
  UnidadMedida,
  EventoLog,
  LoginDTO,
  VentaDTO,
  FacturaDTO,
  ActualizarStockDTO,
  ActualizarEstados,
  Sucursal,
  NuevoMovimientoDTO,
  AlicuotaIVA,
  TipoFactura
} from '@/lib/api-types';

// Hook genérico para manejar estados de carga y error
export function useApiState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async <R>(apiCall: () => Promise<R>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      // Solo almacenamos si el resultado es un array o si contiene data como array
      if (Array.isArray(result)) {
        setData(result as unknown as T);
      } else if (result && typeof result === 'object' && Array.isArray((result as any).data)) {
        setData((result as any).data as unknown as T);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}

// ==================== AUTENTICACIÓN ====================
export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginDTO) => {
    setLoading(true);
    setError(null);
    
    try {
      const respuesta = await apiService.autenticar(credentials as any);
      
      // El backend devuelve { success, message, data: { usuario } } o { token, usuario } o solo usuario
      const token = (respuesta as any).token;
      let usuarioResp: Usuario;
      
      // Intentar extraer el usuario de diferentes estructuras posibles
      if ((respuesta as any).data) {
        // Formato: { success, message, data: { usuario } }
        usuarioResp = (respuesta as any).data;
      } else if ((respuesta as any).usuario) {
        // Formato: { token, usuario }
        usuarioResp = (respuesta as any).usuario;
      } else {
        // Formato: usuario directo
        usuarioResp = respuesta as Usuario;
      }
      
      // Si no hay token, crear uno simulado para persistencia
      if (!token) {
        const simulatedToken = `simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        if (typeof window !== 'undefined') localStorage.setItem('token', simulatedToken);
        ApiService.setToken(simulatedToken);
      } else {
        if (typeof window !== 'undefined') localStorage.setItem('token', token);
        ApiService.setToken(token);
      }
      
      setUser(usuarioResp);
      return usuarioResp;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Error de autenticación';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    ApiService.setToken(null);
  };

  // Función para verificar si el usuario está autenticado
  const checkAuth = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return !!token;
  };

  return { user, loading, error, login, logout, checkAuth };
}

// ==================== PRODUCTOS ====================
export function useProductos() {
  const { data, loading, error, execute } = useApiState<Producto[]>();

  const cargarProductos = () => execute(() => apiService.obtenerProductos());
  const cargarProducto = (id: number) => execute(() => apiService.obtenerProducto(id));
  const cargarProductoPorCodigo = (codigo: string) => execute(() => apiService.obtenerProductoPorCodigo(codigo));
  const cargarProductosPorCategoria = (idCategoria: number) => execute(() => apiService.obtenerProductosPorCategoria(idCategoria));
  const cargarProductosStockBajo = (stockMinimo: number = 10) => execute(() => apiService.obtenerProductosConStockBajo(stockMinimo));
  const crearProducto = (producto: Omit<Producto, 'Id'>) => execute(() => apiService.crearProducto(producto));
  const editarProducto = (producto: Producto) => execute(() => apiService.editarProducto(producto));
  const actualizarStockProducto = (dto: ActualizarStockDTO) => execute(() => apiService.actualizarStock(dto));
  const actualizarEstadoProducto = (estado: ActualizarEstados) => execute(() => apiService.actualizarEstadoProducto(estado));

  return {
    productos: data,
    loading,
    error,
    cargarProductos,
    cargarProducto,
    cargarProductoPorCodigo,
    cargarProductosPorCategoria,
    cargarProductosStockBajo,
    crearProducto,
    editarProducto,
    actualizarStockProducto,
    actualizarEstadoProducto
  };
}

// ==================== CLIENTES ====================
export function useClientes() {
  const { data, loading, error, execute } = useApiState<Cliente[]>();

  const cargarClientes = () => execute(() => apiService.obtenerClientes());
  const cargarCliente = (id: number) => execute(() => apiService.obtenerCliente(id));
  const crearCliente = (cliente: Omit<Cliente, 'Id'>) => execute(() => apiService.crearCliente(cliente));
  const editarCliente = (cliente: Cliente) => execute(() => apiService.editarCliente(cliente));

  return {
    clientes: data,
    loading,
    error,
    cargarClientes,
    cargarCliente,
    crearCliente,
    editarCliente
  };
}

// ==================== VENTAS ====================
export function useVentas() {
  const { data, loading, error, execute } = useApiState<Venta[]>();

  const cargarVentas = () => execute(() => apiService.obtenerVentas());
  
  const cargarVentasPorSucursal = (sucursal: string) => execute(() => apiService.obtenerVentasPorSucursal(sucursal));
  const cargarVenta = (id: number) => execute(() => apiService.obtenerVenta(id));
  const generarVenta = (venta: VentaDTO) => execute(() => apiService.generarVenta(venta));
  const cancelarVenta = (id: number) => execute(() => apiService.cancelarVenta({ id, isdelete: true }));

  return {
    ventas: data,
    loading,
    error,
    cargarVentas,
    cargarVentasPorSucursal,
    cargarVenta,
    generarVenta,
    cancelarVenta
  };
}

// ==================== FACTURAS ====================
export function useFacturas() {
  const { data, loading, error, execute } = useApiState<Factura[]>();

  const cargarFactura = (id: number) => execute(() => apiService.obtenerFactura(id));
  const cargarFacturas = () => execute(() => apiService.obtenerFacturas());
  const generarFactura = (factura: FacturaDTO) => execute(() => apiService.generarFactura(factura));
  const editarFactura = (factura: Factura) => execute(() => apiService.editarFactura(factura));
  const cancelarFactura = (id: number) => execute(() => apiService.cancelarFactura({ id, isdelete: true }));
  const sincronizarEstado = (id: number) => execute(() => apiService.sincronizarEstadoFactura(id));

  return {
    facturas: data,
    loading,
    error,
    cargarFactura,
    cargarFacturas,
    generarFactura,
    editarFactura,
    cancelarFactura,
    sincronizarEstado
  };
}

// ==================== STOCK ====================
export function useStock() {
  const { data, loading, error, execute } = useApiState<StockMovimiento[]>();

  const cargarStockActual = (idProducto: number) => execute(() => apiService.obtenerStockActual(idProducto));
  const verificarDisponibilidad = (idProducto: number, cantidad: number) => 
    execute(() => apiService.verificarDisponibilidad(idProducto, cantidad));
  const cargarMovimientos = () => execute(() => apiService.obtenerMovimientos());
  const cargarMovimientosProducto = (idProducto: number) => 
    execute(() => apiService.obtenerMovimientosProducto(idProducto));
  const cargarMovimientosPorFecha = (fechaInicio: string, fechaFin: string) => 
    execute(() => apiService.obtenerMovimientosPorFecha(fechaInicio, fechaFin));
  const crearMovimientoStock = (mov: NuevoMovimientoDTO) => execute(() => apiService.crearMovimientoStock(mov));

  return {
    movimientos: data,
    loading,
    error,
    cargarStockActual,
    verificarDisponibilidad,
    cargarMovimientos,
    cargarMovimientosProducto,
    cargarMovimientosPorFecha,
    crearMovimientoStock
  };
}

// ==================== CATEGORÍAS ====================
export function useCategorias() {
  const { data, loading, error, execute } = useApiState<Categoria[]>();

  const cargarCategorias = () => execute(() => apiService.obtenerCategorias());
  const cargarCategoria = (id: number) => execute(() => apiService.obtenerCategoria(id));
  const crearCategoria = (categoria: Omit<Categoria, 'Id'>) => execute(() => apiService.crearCategoria(categoria));
  const editarCategoria = (categoria: Categoria) => execute(() => apiService.editarCategoria(categoria));

  return {
    categorias: data,
    loading,
    error,
    cargarCategorias,
    cargarCategoria,
    crearCategoria,
    editarCategoria
  };
}

// ==================== MEDIOS DE PAGO ====================
export function useMediosPago() {
  const { data, loading, error, execute } = useApiState<MedioPago[]>();

  const cargarMediosPago = () => execute(() => apiService.obtenerMediosPago());
  const cargarMedioPago = (id: number) => execute(() => apiService.obtenerMedioPago(id));
  const crearMedioPago = (mp: Omit<MedioPago,'Id'>) => execute(() => apiService.crearMedioPago(mp));
  const editarMedioPago = (mp: MedioPago) => execute(() => apiService.editarMedioPago(mp));

  return {
    mediosPago: data,
    loading,
    error,
    cargarMediosPago,
    cargarMedioPago,
    crearMedioPago,
    editarMedioPago
  };
}

// ==================== ESTADOS DE FACTURA ====================
export function useEstadosFactura() {
  const { data, loading, error, execute } = useApiState<EstadoFactura[]>();

  const cargarEstadosFactura = () => execute(() => apiService.obtenerEstadosFactura());
  const cargarEstadoFactura = (id: number) => execute(() => apiService.obtenerEstadoFactura(id));
  const crearEstadoFactura = (dto: Omit<EstadoFactura,'Id'>) => execute(() => apiService.crearEstadoFactura(dto));
  const editarEstadoFactura = (ef: EstadoFactura) => execute(() => apiService.editarEstadoFactura(ef));

  return {
    estadosFactura: data,
    loading,
    error,
    cargarEstadosFactura,
    cargarEstadoFactura,
    crearEstadoFactura,
    editarEstadoFactura
  };
}

// ==================== USUARIOS ====================
export function useUsuarios() {
  const { data, loading, error, execute } = useApiState<Usuario[]>();

  const cargarUsuarios = () => execute(() => apiService.obtenerUsuarios());
  const cargarUsuariosPorSucursal = (sucursal: string) => 
    execute(() => apiService.obtenerUsuariosPorSucursal(sucursal));
  const crearUsuario = (usuario: Omit<Usuario, 'Id'>) => execute(() => apiService.crearUsuario(usuario));
  const editarUsuario = (usuario: Usuario) => execute(() => apiService.editarUsuario(usuario));

  return {
    usuarios: data,
    loading,
    error,
    cargarUsuarios,
    cargarUsuariosPorSucursal,
    crearUsuario,
    editarUsuario
  };
}

// ==================== PERFILES ====================
export function usePerfiles() {
  const { data, loading, error, execute } = useApiState<Perfil[]>();

  const cargarPerfiles = () => execute(() => apiService.obtenerPerfiles());
  const cargarPerfil = (id: number) => execute(() => apiService.obtenerPerfil(id));
  const crearPerfil = (dto: Omit<Perfil,'Id'>) => execute(() => apiService.crearPerfil(dto));
  const editarPerfil = (p: Perfil) => execute(() => apiService.actualizarPerfil(p.id, p));

  return {
    perfiles: data,
    loading,
    error,
    cargarPerfiles,
    cargarPerfil,
    crearPerfil,
    editarPerfil
  };
}

// ==================== SUCURSALES ====================
export function useSucursales() {
  const { data, loading, error, execute } = useApiState<Sucursal[]>();

  const cargarSucursales = () => execute(() => apiService.obtenerSucursales());
  const cargarSucursal = (id: number) => execute(() => apiService.obtenerSucursal(id));
  const crearSucursal = (sucursal: Omit<Sucursal, 'Id'>) => execute(() => apiService.crearSucursal(sucursal));
  const editarSucursal = (sucursal: Sucursal) => execute(() => apiService.editarSucursal(sucursal));

  return {
    sucursales: data,
    loading,
    error,
    cargarSucursales,
    cargarSucursal,
    crearSucursal,
    editarSucursal
  };
}

// ==================== UNIDADES DE MEDIDA ====================
export function useUnidadesMedida() {
  const { data, loading, error, execute } = useApiState<UnidadMedida[]>();

  const cargarUnidadesMedida = () => execute(() => apiService.obtenerUnidadesMedida());
  const cargarUnidadMedida = (id: number) => execute(() => apiService.obtenerUnidadMedida(id));
  const crearUnidadMedida = (um: Omit<UnidadMedida,'Id'>) => execute(() => apiService.crearUnidadMedida(um));
  const editarUnidadMedida = (um: UnidadMedida) => execute(() => apiService.editarUnidadMedida(um));

  return {
    unidadesMedida: data,
    loading,
    error,
    cargarUnidadesMedida,
    cargarUnidadMedida,
    crearUnidadMedida,
    editarUnidadMedida
  };
}

// ==================== EVENTOS LOG ====================
export function useEventosLog() {
  const { data, loading, error, execute } = useApiState<EventoLog[]>();

  // Métodos de eventos log no implementados en el backend actual
  const cargarEventosLog = () => Promise.resolve([]);
  const cargarEventosPorUsuario = (idUsuario: number) => Promise.resolve([]);
  const cargarEventosPorModulo = (modulo: string) => Promise.resolve([]);
  const cargarEventosPorFecha = (fechaInicio: string, fechaFin: string) => Promise.resolve([]);
  const registrarEvento = (evento: Omit<EventoLog,'Id'>) => Promise.resolve({});

  return {
    eventosLog: data,
    loading,
    error,
    cargarEventosLog,
    cargarEventosPorUsuario,
    cargarEventosPorModulo,
    cargarEventosPorFecha,
    registrarEvento
  };
}

// ==================== ALICUOTAS IVA ====================
export function useAlicuotasIVA() {
  const { data, loading, error, execute } = useApiState<AlicuotaIVA[]>();

  // Métodos de alícuotas IVA no implementados en el backend actual
  const cargarAlicuotas = () => Promise.resolve([]);
  const cargarAlicuota = (id: number) => Promise.resolve(null);
  const crearAlicuota = (dto: Omit<AlicuotaIVA,'Id'>) => Promise.resolve({});
  const editarAlicuota = (alic: AlicuotaIVA) => Promise.resolve({});

  return {
    alicuotas: data,
    loading,
    error,
    cargarAlicuotas,
    cargarAlicuota,
    crearAlicuota,
    editarAlicuota
  };
}

// ==================== TIPOS FACTURA ====================
export function useTiposFactura() {
  const { data, loading, error, execute } = useApiState<TipoFactura[]>();

  const cargarTiposFactura = () => execute(() => apiService.obtenerTiposFactura());
  const cargarTipoFactura = (id: number) => execute(() => apiService.obtenerTipoFactura(id));
  // Métodos de crear/editar tipo factura no implementados en el backend actual
  const crearTipoFactura = (dto: Omit<TipoFactura,'Id'>) => Promise.resolve({});
  const editarTipoFactura = (tf: TipoFactura) => Promise.resolve({});

  return {
    tiposFactura: data,
    loading,
    error,
    cargarTiposFactura,
    cargarTipoFactura,
    crearTipoFactura,
    editarTipoFactura
  };
}
