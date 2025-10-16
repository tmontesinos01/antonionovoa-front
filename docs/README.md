# Documentation - Antonio Novoa Frontend

## 📚 Available Documentation

### 1. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
**Complete API Reference**

Comprehensive documentation covering:
- All API endpoints organized by module
- Request/response formats
- TypeScript usage examples
- Error handling patterns
- Complete workflow examples
- Data types reference
- Configuration guide

**Use this when:** You need detailed information about a specific endpoint or want to understand the complete API structure.

---

### 2. [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
**Quick Reference Guide**

Quick access to:
- Common operations for each module
- Ready-to-use code snippets
- Sales workflow examples
- AFIP validation examples
- Error handling patterns
- Useful tips and tricks

**Use this when:** You need a quick code example or want to copy/paste a common operation.

---

### 3. [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)
**Migration Guide**

Details about the API integration update:
- All changes made to the codebase
- Breaking changes and how to handle them
- New features added
- Migration checklist
- Known issues and solutions

**Use this when:** You're updating existing code to work with the new API or want to understand what changed.

---

## 🚀 Quick Start

### First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Basic Usage

```typescript
import { apiService } from '@/lib/api-service';

// Example: Get all products
async function loadProducts() {
  try {
    const response = await apiService.obtenerProductos();
    if (response.success) {
      const productos = response.data;
      console.log('Products:', productos);
    } else {
      console.error('Error:', response.message);
    }
  } catch (error) {
    console.error('Connection error:', error);
  }
}
```

---

## 📖 Documentation Structure

```
docs/
├── README.md                    # This file - Documentation index
├── API_DOCUMENTATION.md         # Complete API reference
├── API_QUICK_REFERENCE.md       # Quick reference guide
└── MIGRATION_SUMMARY.md         # Migration guide
```

---

## 🎯 Common Tasks

### Task: Create a Product
See: [API_QUICK_REFERENCE.md - Productos](./API_QUICK_REFERENCE.md#productos)

### Task: Manage Stock
See: [API_QUICK_REFERENCE.md - Stock](./API_QUICK_REFERENCE.md#stock)

### Task: Generate a Sale
See: [API_QUICK_REFERENCE.md - Ventas y Facturación](./API_QUICK_REFERENCE.md#-ventas-y-facturación)

### Task: Validate AFIP Client
See: [API_QUICK_REFERENCE.md - Validación AFIP](./API_QUICK_REFERENCE.md#-validación-afip)

### Task: Handle Errors
See: [API_QUICK_REFERENCE.md - Manejo de Errores](./API_QUICK_REFERENCE.md#-manejo-de-errores)

---

## 🔍 Finding Information

### By Module

| Module | Quick Ref | Full Docs |
|--------|-----------|-----------|
| Products | [Quick Ref](./API_QUICK_REFERENCE.md#productos) | [Full Docs](./API_DOCUMENTATION.md#-módulo-productos) |
| Stock | [Quick Ref](./API_QUICK_REFERENCE.md#stock) | [Full Docs](./API_DOCUMENTATION.md#-control-de-stock) |
| Categories | [Quick Ref](./API_QUICK_REFERENCE.md#categorías) | [Full Docs](./API_DOCUMENTATION.md#-módulo-categorías) |
| Payment Methods | [Quick Ref](./API_QUICK_REFERENCE.md#medios-de-pago) | [Full Docs](./API_DOCUMENTATION.md#-módulo-medios-de-pago) |
| Currencies | [Quick Ref](./API_QUICK_REFERENCE.md#monedas) | [Full Docs](./API_DOCUMENTATION.md#-módulo-monedas) |
| Receipt Types | [Quick Ref](./API_QUICK_REFERENCE.md#tipos-de-comprobante) | [Full Docs](./API_DOCUMENTATION.md#-módulo-tipos-de-comprobante) |
| Units | [Quick Ref](./API_QUICK_REFERENCE.md#unidades-de-medida) | [Full Docs](./API_DOCUMENTATION.md#-módulo-unidades-de-medida) |
| Users | [Quick Ref](./API_QUICK_REFERENCE.md#usuarios) | [Full Docs](./API_DOCUMENTATION.md#-módulo-usuarios) |
| Profiles | [Quick Ref](./API_QUICK_REFERENCE.md#perfiles) | [Full Docs](./API_DOCUMENTATION.md#-módulo-perfiles) |
| Config | [Quick Ref](./API_QUICK_REFERENCE.md#configuraciones) | [Full Docs](./API_DOCUMENTATION.md#-módulo-configuraciones) |
| Sales | [Quick Ref](./API_QUICK_REFERENCE.md#-ventas-y-facturación) | [Full Docs](./API_DOCUMENTATION.md#-módulo-ventas-y-facturación) |
| AFIP | [Quick Ref](./API_QUICK_REFERENCE.md#-validación-afip) | [Full Docs](./API_DOCUMENTATION.md#-módulo-validación-de-clientes-afip) |

### By Task Type

| Task | Documentation |
|------|---------------|
| CRUD Operations | [Quick Reference](./API_QUICK_REFERENCE.md#-operaciones-comunes) |
| Stock Management | [Quick Reference](./API_QUICK_REFERENCE.md#stock) |
| Sales Workflow | [Full Docs](./API_DOCUMENTATION.md#-ejemplo-de-flujo-completo-generar-una-venta) |
| Error Handling | [Quick Reference](./API_QUICK_REFERENCE.md#-manejo-de-errores) |
| Configuration | [Full Docs](./API_DOCUMENTATION.md#-configuración) |
| Migration | [Migration Summary](./MIGRATION_SUMMARY.md) |

---

## 💡 Tips

1. **Start with Quick Reference** - For most tasks, the quick reference has what you need
2. **Use Full Docs for Details** - When you need to understand the complete picture
3. **Check Migration Guide** - If you're updating existing code
4. **TypeScript Types** - All types are in `lib/api-types.ts`
5. **Console Logging** - The API service logs all requests/responses for debugging

---

## 🔧 Development Tools

### TypeScript Types
All API types are defined in:
```
lib/api-types.ts
```

### API Service
The main API service is in:
```
lib/api-service.ts
```

### API Configuration
Configuration and error handling:
```
lib/api-config.ts
```

### Backup
Old API service backup (for reference):
```
lib/api-service.backup.ts
```

---

## 📝 Code Examples

### Example 1: List Products
```typescript
const response = await apiService.obtenerProductos();
if (response.success) {
  const productos = response.data;
}
```

### Example 2: Create Product
```typescript
const response = await apiService.crearProducto({
  idCategoria: 1,
  idUnidadMedida: 1,
  codigo: "PROD001",
  nombre: "Producto",
  precio: 100,
  stock: 50,
  stockMinimo: 10,
  descripcion: "Descripción"
});
```

### Example 3: Adjust Stock
```typescript
await apiService.ajustarStock(1, {
  cantidad: -10,
  motivo: "Venta"
});
```

### Example 4: Generate Sale
```typescript
const cliente = await apiService.validarClienteAfip({
  documento_nro: "20123456789",
  documento_tipo: "96"
});

const venta = await apiService.generarVenta({
  idTipoComprobante: 1,
  idMedioPago: 1,
  idMoneda: 1,
  cliente: cliente,
  fecha: new Date().toISOString(),
  total: 1500.00,
  detalles: [...],
  log: {
    fechaLog: new Date().toISOString(),
    userLog: "usuario@ejemplo.com"
  }
});
```

---

## 🐛 Troubleshooting

### API Not Responding
1. Check if backend is running
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for errors

### 401 Unauthorized
1. Check if token is set: `ApiService.setToken(token)`
2. Verify token hasn't expired
3. Check authentication flow

### Type Errors
1. Check `lib/api-types.ts` for correct types
2. Ensure you're accessing `response.data` not `response` directly
3. Verify property names are camelCase (not PascalCase)

### Endpoint Not Found (404)
1. Verify endpoint URL is lowercase
2. Check API documentation for correct endpoint
3. Ensure backend has the endpoint implemented

---

## 📞 Support

For additional help:
1. Check the relevant documentation file
2. Review code examples in the docs
3. Check TypeScript types in `lib/api-types.ts`
4. Review the old implementation in `lib/api-service.backup.ts`

---

## 🔄 Keeping Documentation Updated

When making changes to the API:
1. Update `lib/api-types.ts` with new types
2. Update `lib/api-service.ts` with new methods
3. Update relevant documentation files
4. Add examples to quick reference if needed

---

## ✅ Documentation Checklist

- [x] Complete API documentation
- [x] Quick reference guide
- [x] Migration summary
- [x] Code examples
- [x] Error handling guide
- [x] Configuration guide
- [x] Troubleshooting section
- [x] TypeScript types
- [x] Backup of old implementation

---

Last Updated: October 14, 2024
