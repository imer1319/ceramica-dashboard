import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = await getConnection()
    if (!pool) {
      return NextResponse.json(
        { success: false, error: 'No se pudo conectar a la base de datos', data: [] },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('prefix') || ''

    const query = `
      SELECT 
        UPPER(TABLE_SCHEMA) AS SchemaName,
        UPPER(TABLE_NAME)   AS TableName
      FROM INFORMATION_SCHEMA.TABLES
      ${prefix ? "WHERE UPPER(TABLE_NAME) LIKE UPPER(@prefix) + '%'" : ''}
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `

    const req = pool.request()
    if (prefix) req.input('prefix', prefix)
    const result = await req.query(query)

    return NextResponse.json({
      success: true,
      count: result.recordset.length,
      prefix: prefix || undefined,
      tables: result.recordset
    })
  } catch (error: any) {
    console.error('[API TABLAS] ❌ Error:', error.message)
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 500 }
    )
  }
}