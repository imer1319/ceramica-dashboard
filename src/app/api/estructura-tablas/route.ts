import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get('tabla')
    
    if (!tableName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nombre de tabla requerido',
          data: []
        },
        { status: 400 }
      )
    }
    
    console.log(`[API ESTRUCTURA] 🔍 Consultando estructura de tabla: ${tableName}...`)
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    
    const result = await pool.request()
      .input('tableName', tableName)
      .query(`
        SELECT 
          COLUMN_NAME as nombre,
          DATA_TYPE as tipo,
          CHARACTER_MAXIMUM_LENGTH as longitud,
          IS_NULLABLE as nulo
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = @tableName
        ORDER BY ORDINAL_POSITION
      `)
    
    console.log(`[API ESTRUCTURA] ✅ ${result.recordset.length} columnas encontradas para ${tableName}`)
    
    return NextResponse.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
      tabla: tableName
    })
    
  } catch (error: any) {
    console.error('[API ESTRUCTURA] ❌ Error:', error.message)
    
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