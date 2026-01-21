// app/api/entidades/route.ts
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    const result = await pool.request().query('SELECT TOP 10 * FROM CLIE_MAECLIENTES');
    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error('❌ Error en /api/clientes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
