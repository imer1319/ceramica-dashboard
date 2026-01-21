import { NextRequest, NextResponse } from 'next/server'
import { obtenerDetalleFactura } from '../../../../lib/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const cveNroId = parseInt(searchParams.get('cveNroId') || '0')
    const faTipFa = searchParams.get('faTipFa') || ''
    const faNroF1 = parseInt(searchParams.get('faNroF1') || '0')
    const faNroF2 = parseInt(searchParams.get('faNroF2') || '0')
    
    if (!cveNroId || !faTipFa || !faNroF1 || !faNroF2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan parámetros requeridos: cveNroId, faTipFa, faNroF1, faNroF2'
        },
        { status: 400 }
      )
    }
    
    const facturaKeys = { CVeNroId: cveNroId, FaTipFa: faTipFa, FaNroF1: faNroF1, FaNroF2: faNroF2 }
    console.log(`[API FACTURA-DETALLE] 🔍 Obteniendo detalle para factura:`, facturaKeys)
    
    const detalles = await obtenerDetalleFactura(facturaKeys)
    
    console.log(`[API FACTURA-DETALLE] ✅ ${detalles.length} detalles obtenidos`)
    
    return NextResponse.json({
      success: true,
      data: detalles,
      count: detalles.length,
      facturaKeys: facturaKeys
    })
    
  } catch (error: any) {
    console.error('[API FACTURA-DETALLE] ❌ Error:', error.message)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: []
      },
      { status: 500 }
    )
  }
}