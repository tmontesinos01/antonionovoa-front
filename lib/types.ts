export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  categories: string[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface Client {
  id: string;
  documentType: 'CUIT' | 'DNI' | 'CUIL';
  documentNumber: string;
  businessName: string;
  email: string;
  address: string;
  province: string;
  phone?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface InvoiceItem {
  productId: string;
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  iva: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  type: 'A' | 'B' | 'C' | 'NC'; // Factura A, B, C, Nota de Crédito
  number: string;
  clientId: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  iva: number;
  total: number;
  status: 'draft' | 'issued' | 'cancelled';
  issuedAt?: Date;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: Product;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  reference?: string;
  createdAt: Date;
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user: User;
  action: 'create' | 'update' | 'delete';
  entity: 'product' | 'client' | 'invoice' | 'category';
  entityId: string;
  details: string;
  createdAt: Date;
}

// Tipos para la serialización JSON de TusFacturasApp
export interface TusFacturasAppData {
  usertoken: string;
  apikey: string;
  cliente: {
    documento_tipo: string;
    documento_nro: string;
    razon_social: string;
    email: string;
    domicilio: string;
    provincia: string;
  };
  comprobante: {
    tipo_cbte: string;
    pto_vta: string;
    productos: Array<{
      codigo: string;
      descripcion: string;
      cantidad: number;
      precio_unitario: number;
      iva: number;
    }>;
  };
}

// Tipos para formularios
export interface ProductFormData {
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  categories: string[];
}

export interface ClientFormData {
  documentType: 'CUIT' | 'DNI' | 'CUIL';
  documentNumber: string;
  businessName: string;
  email: string;
  address: string;
  province: string;
  phone?: string;
}

export interface InvoiceFormData {
  type: 'A' | 'B' | 'C' | 'NC';
  clientId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
  }>;
} 