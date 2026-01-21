import { NextRequest, NextResponse } from 'next/server'
import { crearTablasDetalleFactura } from '../../../lib/queries'

export async function POST() {
  try {
    console.log('[API DETALLE-FACTURA] 🚀 Iniciando creación de tablas...')
    
    const resultado = await crearTablasDetalleFactura()
    
    console.log('[API DETALLE-FACTURA] ✅ Tablas creadas exitosamente')
    
    return NextResponse.json({
      success: true,
      message: 'Tablas de detalle de factura creadas exitosamente',
      resultado: resultado
    })
    
  } catch (error: any) {
    console.error('[API DETALLE-FACTURA] ❌ Error:', error.message)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Error al crear las tablas de detalle de factura'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para crear tablas de detalle de factura',
    instructions: 'Usar método POST para crear las tablas'
  })
}