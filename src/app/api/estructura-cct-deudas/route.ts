import { NextResponse } from 'next/server'
import { getConnection } from '../../../lib/db'

export async function GET() {
  try {
    console.log('[API ESTRUCTURA CCT_DEUDAS] 🔍 Consultando estructura de tabla CCT_Deudas...')
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos')
    }
    
    // Consultar estructura de la tabla CCT_Deudas
    const result = await pool.request().query(`
      SELECT 
        COLUMN_NAME as nombre,
        DATA_TYPE as tipo,
        CHARACTER_MAXIMUM_LENGTH as longitud,
        IS_NULLABLE as nulo,
        ORDINAL_POSITION as posicion
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'CCT_Deudas'
      ORDER BY ORDINAL_POSITION
    `)
    
    console.log(`[API ESTRUCTURA CCT_DEUDAS] ✅ ${result.recordset.length} columnas encontradas`)
    
    // También consultar algunos registros de ejemplo para ver los datos
    const sampleResult = await pool.request().query(`
      SELECT TOP 3 * FROM CCT_Deudas
    `)
    
    return NextResponse.json({
      success: true,
      estructura: result.recordset,
      muestra: sampleResult.recordset,
      count: result.recordset.length
    })
    
  } catch (error: any) {
    console.error('[API ESTRUCTURA CCT_DEUDAS] ❌ Error:', error.message)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        estructura: [],
        muestra: []
      },
      { status: 500 }
    )
  }
}