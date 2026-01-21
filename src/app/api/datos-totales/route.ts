import { NextResponse } from 'next/server'
import { getConnection } from '../../../lib/db'

export async function GET() {
  try {
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos')
    }

    console.log('[API DATOS-TOTALES] 🔍 Consultando totales de deudas y movimientos...')

    // Consulta para obtener totales de deudas y movimientos por entidad
    const result = await pool.request().query(`
      SELECT 
        e.Entnroid,
        ISNULL(CAST(e.Entnombr as NVARCHAR(100)), '') as Entnombr,
        ISNULL(CAST(e.Entemail as NVARCHAR(100)), '') as Entemail,
        ISNULL(CAST(e.EntRazSoc as NVARCHAR(100)), '') as EntRazSoc,
        ISNULL(CAST(e.EntTelef as NVARCHAR(100)), '') as EntTelef,
        -- Totales de deudas
        ISNULL(d.TotalDeudas, 0) as TotalDeudas,
        ISNULL(d.SaldoTotal, 0) as SaldoTotal,
        ISNULL(d.CantidadDeudas, 0) as CantidadDeudas,
        -- Totales de movimientos
        ISNULL(m.TotalMovimientos, 0) as TotalMovimientos,
        ISNULL(m.CantidadMovimientos, 0) as CantidadMovimientos
      FROM ENT_MAEENTIDAD e WITH (NOLOCK)
      LEFT JOIN (
        SELECT 
          EntNroId,
          SUM(DeuImpor) as TotalDeudas,
          SUM(DeuSaldo) as SaldoTotal,
          COUNT(*) as CantidadDeudas
        FROM CCT_Deudas WITH (NOLOCK)
        GROUP BY EntNroId
      ) d ON e.Entnroid = d.EntNroId
      LEFT JOIN (
        SELECT 
          EntNroId,
          SUM(ABS(MovImpor)) as TotalMovimientos,
          COUNT(*) as CantidadMovimientos
        FROM CCT_MOVIM WITH (NOLOCK)
        GROUP BY EntNroId
      ) m ON e.Entnroid = m.EntNroId
      WHERE e.Entnroid IS NOT NULL
      ORDER BY e.Entnroid
    `)

    console.log(`[API DATOS-TOTALES] ✅ ${result.recordset.length} registros obtenidos con totales`)

    return NextResponse.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    })

  } catch (error: any) {
    console.error('[API DATOS-TOTALES] ❌ Error:', error.message)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno del servidor',
        data: [],
        count: 0
      },
      { status: 500 }
    )
  }
}