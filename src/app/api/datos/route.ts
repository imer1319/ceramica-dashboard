import { NextResponse } from 'next/server'
import { getConnection } from '../../../lib/db'

export async function GET() {
  try {
    console.log('[API DATOS] 🔍 Consultando estructura y datos de ENT_MAEENTIDAD...')
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos')
    }

    // Descubrir columnas disponibles en la tabla
    const colsRes = await pool.request().query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'ENT_MAEENTIDAD'
      ORDER BY ORDINAL_POSITION
    `)

    const columns: string[] = colsRes.recordset.map((r: any) => r.COLUMN_NAME)
    if (columns.length === 0) {
      throw new Error('La tabla ENT_MAEENTIDAD no tiene columnas disponibles')
    }

    // Construir SELECT con alias en MAYÚSCULAS para compatibilidad con la UI
    const selectList = columns
      .map((name) => `[${name}] AS ${name.toUpperCase()}`)
      .join(',\n        ')

    // Ordenar por EntNroId si existe (ignorando mayúsculas/minúsculas), si no por la primera columna
    const orderColEntry = columns.find((c) => c.toLowerCase() === 'entnroid') || columns[0]
    const orderCol = `[${orderColEntry}]`

    const result = await pool.request().query(`
      SELECT 
        ${selectList}
      FROM ENT_MAEENTIDAD
      ORDER BY ${orderCol}
    `)

    console.log(`[API DATOS] ✅ ${result.recordset.length} registros obtenidos`)

    return NextResponse.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    })

  } catch (error: any) {
    console.error('[API DATOS] ❌ Error:', error.message)
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 500 }
    )
  }
}
