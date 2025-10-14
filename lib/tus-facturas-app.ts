import { Invoice, Client, Product, TusFacturasAppData } from './types'

export function serializeInvoiceForTusFacturasApp(
  invoice: Invoice,
  usertoken: string,
  apikey: string
): TusFacturasAppData {
  // Mapear tipo de comprobante
  const tipoCbteMap: Record<string, string> = {
    'A': '1', // Factura A
    'B': '6', // Factura B
    'C': '11', // Factura C
    'NC': '3', // Nota de Crédito
  }

  // Mapear tipo de documento
  const documentoTipoMap: Record<string, string> = {
    'CUIT': 'CUIT',
    'DNI': 'DNI',
    'CUIL': 'CUIL',
  }

  // Mapear provincias (códigos de AFIP)
  const provinciaMap: Record<string, string> = {
    'Buenos Aires': '1',
    'Ciudad Autónoma de Buenos Aires': '2',
    'Catamarca': '3',
    'Chaco': '4',
    'Chubut': '5',
    'Córdoba': '6',
    'Corrientes': '7',
    'Entre Ríos': '8',
    'Formosa': '9',
    'Jujuy': '10',
    'La Pampa': '11',
    'La Rioja': '12',
    'Mendoza': '13',
    'Misiones': '14',
    'Neuquén': '15',
    'Río Negro': '16',
    'Salta': '17',
    'San Juan': '18',
    'San Luis': '19',
    'Santa Cruz': '20',
    'Santa Fe': '21',
    'Santiago del Estero': '22',
    'Tierra del Fuego': '23',
    'Tucumán': '24',
  }

  return {
    usertoken,
    apikey,
    cliente: {
      documento_tipo: documentoTipoMap[invoice.client.documentType] || 'CUIT',
      documento_nro: invoice.client.documentNumber,
      razon_social: invoice.client.businessName,
      email: invoice.client.email,
      domicilio: invoice.client.address,
      provincia: provinciaMap[invoice.client.province] || '1',
    },
    comprobante: {
      tipo_cbte: tipoCbteMap[invoice.type] || '1',
      pto_vta: '0001', // Punto de venta por defecto
      productos: invoice.items.map(item => ({
        codigo: item.code,
        descripcion: item.description,
        cantidad: item.quantity,
        precio_unitario: item.unitPrice,
        iva: item.iva,
      })),
    },
  }
}

export function validateTusFacturasAppData(data: TusFacturasAppData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validar campos requeridos
  if (!data.usertoken) errors.push('usertoken es requerido')
  if (!data.apikey) errors.push('apikey es requerido')

  // Validar cliente
  if (!data.cliente) {
    errors.push('cliente es requerido')
  } else {
    if (!data.cliente.documento_tipo) errors.push('documento_tipo es requerido')
    if (!data.cliente.documento_nro) errors.push('documento_nro es requerido')
    if (!data.cliente.razon_social) errors.push('razon_social es requerido')
    if (!data.cliente.email) errors.push('email es requerido')
    if (!data.cliente.domicilio) errors.push('domicilio es requerido')
    if (!data.cliente.provincia) errors.push('provincia es requerido')
  }

  // Validar comprobante
  if (!data.comprobante) {
    errors.push('comprobante es requerido')
  } else {
    if (!data.comprobante.tipo_cbte) errors.push('tipo_cbte es requerido')
    if (!data.comprobante.pto_vta) errors.push('pto_vta es requerido')
    
    if (!data.comprobante.productos || data.comprobante.productos.length === 0) {
      errors.push('productos es requerido y no puede estar vacío')
    } else {
      data.comprobante.productos.forEach((producto, index) => {
        if (!producto.codigo) errors.push(`producto ${index + 1}: codigo es requerido`)
        if (!producto.descripcion) errors.push(`producto ${index + 1}: descripcion es requerido`)
        if (producto.cantidad <= 0) errors.push(`producto ${index + 1}: cantidad debe ser mayor a 0`)
        if (producto.precio_unitario <= 0) errors.push(`producto ${index + 1}: precio_unitario debe ser mayor a 0`)
        if (producto.iva < 0) errors.push(`producto ${index + 1}: iva no puede ser negativo`)
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function generateTusFacturasAppExample(): TusFacturasAppData {
  return {
    usertoken: "xxxxx",
    apikey: "xxxxx",
    cliente: {
      documento_tipo: "CUIT",
      documento_nro: "30712293841",
      razon_social: "Ejemplo SRL",
      email: "cliente@ejemplo.com",
      domicilio: "Av. Siempre Viva 742",
      provincia: "2"
    },
    comprobante: {
      tipo_cbte: "1",
      pto_vta: "0001",
      productos: [
        {
          codigo: "PRD001",
          descripcion: "Producto de ejemplo",
          cantidad: 2,
          precio_unitario: 100.0,
          iva: 21
        }
      ]
    }
  }
}

export function formatTusFacturasAppData(data: TusFacturasAppData): string {
  return JSON.stringify(data, null, 2)
} 