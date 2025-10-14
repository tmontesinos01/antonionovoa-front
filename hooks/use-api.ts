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
    console.log('[useAuth] Iniciando login', { correo: credentials.correo });
    const start = performance.now();
    setLoading(true);
    setError(null);
    try {
      const respuesta = await apiService.autenticar(credentials as any);
      console.log('[useAuth] Respuesta de login', respuesta);
      // El backend puede devolver { token, usuario } o solo usuario
      const token = (respuesta as any).token;
      const usuarioResp = (respuesta as any).usuario ?? respuesta;
      
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
      const total = Math.round(performance.now() - start);
      console.log('[useAuth] Login completado en', total, 'ms');
      return usuarioResp;
    } catch (err) {
      console.error('[useAuth] Error en login', err);
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

  const cargarProductos = () => {
    console.log('[useProductos] Cargando lista de productos');
    return execute(() => apiService.obtenerProductos())
      .then((res) => {
        console.log('[useProductos] Productos obtenidos', res);
        return res;
      })
      .catch((err) => {
        console.error('[useProductos] Error al cargar productos', err);
        throw err;
      });
  };
  const cargarProducto = (id: number) => {
    console.log('[useProductos] Obtener producto', id);
    return execute(() => apiService.obtenerProducto(id));
  };
  const cargarProductoPorCodigo = (codigo: string) => {
    console.log('[useProductos] Obtener producto por código', codigo);
    return execute(() => apiService.obtenerProductoPorCodigo(codigo));
  };
  const cargarProductosPorCategoria = (idCategoria: number) => {
    console.log('[useProductos] Obtener productos por categoría', idCategoria);
    return execute(() => apiService.obtenerProductosPorCategoria(idCategoria));
  };
  const cargarProductosStockBajo = (stockMinimo: number = 10) => {
    console.log('[useProductos] Obtener productos con stock bajo', stockMinimo);
    return execute(() => apiService.obtenerProductosConStockBajo(stockMinimo));
  };
  const crearProducto = (producto: Omit<Producto, 'Id'>) => {
    console.log('[useProductos] Creando producto', producto);
    return execute(() => apiService.crearProducto(producto));
  };
  const editarProducto = (producto: Producto) => {
    console.log('[useProductos] Editando producto', producto);
    return execute(() => apiService.editarProducto(producto));
  };
  const actualizarStockProducto = (dto: ActualizarStockDTO) => {
    console.log('[useProductos] Actualizando stock', dto);
    return execute(() => apiService.actualizarStock(dto));
  };
  const actualizarEstadoProducto = (estado: ActualizarEstados) => {
    console.log('[useProductos] Actualizando estado (isdelete)', estado);
    return execute(() => apiService.actualizarEstadoProducto(estado));
  };

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

  const cargarCategorias = () => {
    console.log('[useCategorias] Cargando lista de categorías');
    return execute(() => apiService.obtenerCategorias())
      .then((res) => {
        console.log('[useCategorias] Categorías obtenidas', res);
        return res;
      })
      .catch((err) => {
        console.error('[useCategorias] Error al cargar categorías', err);
        throw err;
      });
  };
  const cargarCategoria = (id: number) => execute(() => apiService.obtenerCategoria(id));
  const crearCategoria = (categoria: Omit<Categoria, 'Id'>) => {
    console.log('[useCategorias] Creando categoría', categoria);
    return execute(() => apiService.crearCategoria(categoria));
  };
  const editarCategoria = (categoria: Categoria) => {
    console.log('[useCategorias] Editando categoría', categoria);
    return execute(() => apiService.editarCategoria(categoria));
  };

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
  const editarPerfil = (p: Perfil) => execute(() => apiService.editarPerfil(p));

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

  const cargarEventosLog = () => execute(() => apiService.obtenerEventosLog());
  const cargarEventosPorUsuario = (idUsuario: number) => 
    execute(() => apiService.obtenerEventosPorUsuario(idUsuario));
  const cargarEventosPorModulo = (modulo: string) => 
    execute(() => apiService.obtenerEventosPorModulo(modulo));
  const cargarEventosPorFecha = (fechaInicio: string, fechaFin: string) => 
    execute(() => apiService.obtenerEventosPorFecha(fechaInicio, fechaFin));
  const registrarEvento = (evento: Omit<EventoLog, 'Id'>) => 
    execute(() => apiService.registrarEvento(evento));

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

  const cargarAlicuotas = () => execute(() => apiService.obtenerAlicuotasIVA());
  const cargarAlicuota = (id: number) => execute(() => apiService.obtenerAlicuotaIVA(id));
  const crearAlicuota = (dto: Omit<AlicuotaIVA,'Id'>) => execute(() => apiService.crearAlicuotaIVA(dto));
  const editarAlicuota = (alic: AlicuotaIVA) => execute(() => apiService.editarAlicuotaIVA(alic));

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
  const crearTipoFactura = (dto: Omit<TipoFactura,'Id'>) => execute(() => apiService.crearTipoFactura(dto));
  const editarTipoFactura = (tf: TipoFactura) => execute(() => apiService.editarTipoFactura(tf));

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
