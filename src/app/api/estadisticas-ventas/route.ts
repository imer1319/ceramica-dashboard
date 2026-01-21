import { NextRequest, NextResponse } from 'next/server'
import { getConnection } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = await getConnection()
    if (!pool) {
      return NextResponse.json(
        { error: 'No se pudo conectar a la base de datos' },
        { status: 500 }
      )
    }

    // Obtener parámetros de la URL o usar valores por defecto (mes actual)
    const { searchParams } = new URL(request.url)
    const currentDate = new Date()
    const currentMonth = parseInt(searchParams.get('mes') || (currentDate.getMonth() + 1).toString())
    const currentYear = parseInt(searchParams.get('anio') || currentDate.getFullYear().toString())
    
    // Validar parámetros
    if (currentMonth < 1 || currentMonth > 12) {
      return NextResponse.json(
        { error: 'El mes debe estar entre 1 y 12' },
        { status: 400 }
      )
    }
    
    if (currentYear < 2000 || currentYear > 2100) {
      return NextResponse.json(
        { error: 'El año debe estar entre 2000 y 2100' },
        { status: 400 }
      )
    }
    
    console.log(`[ESTADISTICAS_VENTAS] Consultando datos para ${currentMonth}/${currentYear}`)

    // Verificar existencia de tablas requeridas para evitar errores cuando el esquema no está disponible
    const requiredTables = ['VEN_FACTUR', 'VEN_FACTUR1', 'VEN_CODVTA', 'ART_ARTICU']
    const tablesQuery = `
      SELECT UPPER(TABLE_NAME) AS TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE UPPER(TABLE_NAME) IN (${requiredTables.map(t => `'${t.toUpperCase()}'`).join(', ')})
    `
    const tablesRes = await pool.request().query(tablesQuery)
    const existingTables: string[] = tablesRes.recordset.map((r: any) => r.TABLE_NAME)
    const missingTables = requiredTables.filter(t => !existingTables.includes(t))

    if (missingTables.length > 0) {
      console.warn('[ESTADISTICAS_VENTAS] ⚠️ Faltan tablas requeridas:', missingTables)
      const estadisticasFallback = {
        mes: currentMonth,
        anio: currentYear,
        resumenVentas: {
          TotalVentas: 0,
          TotalFacturacion: 0,
          TotalFacturacionNetoGravado: 0,
          PromedioVenta: 0
        },
        articulosMasVendidos: [],
        ventasDiarias: [],
        clientesRanking: [],
        diagnostico: { missingTables }
      }
      return NextResponse.json(estadisticasFallback)
    }

    // Query para obtener total de ventas mensuales (incluyendo notas de crédito como valores negativos)
    const ventasQuery = `
      SELECT 
        COUNT(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN 1 END) as TotalVentas,
        SUM(ISNULL(vf.FaTotal, 0) * ISNULL(vc.CVeSigno, 1)) as TotalFacturacion,
        SUM(ISNULL(vf.FaNetGr, 0) * ISNULL(vc.CVeSigno, 1)) as TotalFacturacionNetoGravado,
        AVG(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN ISNULL(vf.FaTotal, 0) END) as PromedioVenta
      FROM VEN_FACTUR vf
      LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId
      WHERE MONTH(vf.FaFecha) = @mes 
        AND YEAR(vf.FaFecha) = @anio
    `

    const ventasResult = await pool.request()
      .input('mes', currentMonth)
      .input('anio', currentYear)
      .query(ventasQuery)

    // Query para obtener artículos más vendidos - incluyendo notas de crédito
    const articulosQuery = `
      SELECT TOP 5
        art.ArtDescr as Descripcion,
        art.ArtCodigo as Codigo,
        SUM(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN ISNULL(vf1.DeCanti, 0) ELSE 0 END) as CantidadVendida,
        SUM(ISNULL(vf1.DeTotal, 0) * ISNULL(vc.CVeSigno, 1)) as TotalVentas,
        SUM((ISNULL(vf1.DeNetGr, 0) - (ISNULL(vf1.DePorDes, 0) * ISNULL(vf1.DeNetGr, 0) / 100)) * ISNULL(vc.CVeSigno, 1)) as TotalNetoGravadoConDescuento,
        CASE 
          WHEN SUM(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN ISNULL(vf1.DeCanti, 0) ELSE 0 END) > 0 
          THEN SUM(ISNULL(vf1.DeTotal, 0) * ISNULL(vc.CVeSigno, 1)) / SUM(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN ISNULL(vf1.DeCanti, 0) ELSE 0 END)
          ELSE 0 
        END as PrecioUnitarioPonderado
      FROM VEN_FACTUR vf
      INNER JOIN VEN_FACTUR1 vf1 ON vf.FaNroF1 = vf1.FaNroF1 
        AND vf.FaNroF2 = vf1.FaNroF2 
        AND vf.FaTipFa = vf1.FaTipFa 
        AND vf.CVeNroId = vf1.CVeNroId
      LEFT JOIN ART_ARTICU art ON vf1.ArtNroId = art.ArtNroId
      LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId
      WHERE MONTH(vf.FaFecha) = @mes 
        AND YEAR(vf.FaFecha) = @anio
        AND vf1.DeCanti > 0
      GROUP BY art.ArtDescr, art.ArtCodigo
      ORDER BY SUM(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN ISNULL(vf1.DeCanti, 0) ELSE 0 END) DESC
    `

    const articulosResult = await pool.request()
      .input('mes', currentMonth)
      .input('anio', currentYear)
      .query(articulosQuery)

    // Query para obtener ventas por día del mes (para gráfico) - incluyendo notas de crédito
    const ventasDiariasQuery = `
      SELECT 
        DAY(vf.FaFecha) as Dia,
        COUNT(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN 1 END) as CantidadVentas,
        SUM(ISNULL(vf.FaTotal, 0) * ISNULL(vc.CVeSigno, 1)) as TotalDia
      FROM VEN_FACTUR vf
      LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId
      WHERE MONTH(vf.FaFecha) = @mes 
        AND YEAR(vf.FaFecha) = @anio
      GROUP BY DAY(vf.FaFecha)
      ORDER BY DAY(vf.FaFecha)
    `

    const ventasDiariasResult = await pool.request()
      .input('mes', currentMonth)
      .input('anio', currentYear)
      .query(ventasDiariasQuery)

    // Query de diagnóstico para SUPERMAT
    const diagnosticoSupermat = `
      SELECT 
        vf.CliNroId,
        vf.FaNombr as NombreOriginal,
        UPPER(LTRIM(RTRIM(ISNULL(vf.FaNombr, '')))) as NombreNormalizado,
        vf.FaNetGr,
        vc.CVeSigno,
        vf.FaFecha,
        COUNT(*) OVER (PARTITION BY vf.CliNroId) as RegistrosPorCliente
      FROM VEN_FACTUR vf
      LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId
      WHERE MONTH(vf.FaFecha) = @mes 
        AND YEAR(vf.FaFecha) = @anio
        AND UPPER(LTRIM(RTRIM(ISNULL(vf.FaNombr, '')))) LIKE '%SUPERMAT%'
      ORDER BY vf.CliNroId, vf.FaFecha
    `

    // Query para obtener ranking de clientes por facturación mensual con detalle de productos
   const clientesRankingQuery = `
      WITH ClientesConFacturacion AS (
        SELECT 
          vf.CliNroId as ClienteId,
          SUM(ISNULL(vf.FaNetGr, 0) * ISNULL(vc.CVeSigno, 1)) as TotalFacturado,
          COUNT(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN 1 END) as CantidadFacturas,
          MAX(UPPER(LTRIM(RTRIM(ISNULL(vf.FaNombr, ''))))) as NombreCliente
        FROM VEN_FACTUR vf
        LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId
        WHERE MONTH(vf.FaFecha) = @mes 
          AND YEAR(vf.FaFecha) = @anio
          AND vf.CliNroId IS NOT NULL
          AND ISNULL(LTRIM(RTRIM(vf.FaNombr)), '') != ''
        GROUP BY vf.CliNroId
        HAVING SUM(ISNULL(vf.FaNetGr, 0) * ISNULL(vc.CVeSigno, 1)) > 0
      ),
      ClientesConsolidados AS (
        SELECT 
          ClienteId,
          NombreCliente,
          SUM(TotalFacturado) as TotalFacturado,
          SUM(CantidadFacturas) as CantidadFacturas -- Removed the trailing comma here
        FROM ClientesConFacturacion
        GROUP BY ClienteId, NombreCliente -- Added NombreCliente to GROUP BY
      )
      SELECT TOP 15
        NombreCliente,
        ClienteId,
        TotalFacturado,
        CantidadFacturas
      FROM ClientesConsolidados
      ORDER BY TotalFacturado DESC
    `

    const clientesRankingResult = await pool.request()
      .input('mes', currentMonth)
      .input('anio', currentYear)
      .query(clientesRankingQuery)

    // Ejecutar diagnóstico de SUPERMAT para debugging
    const diagnosticoResult = await pool.request()
      .input('mes', currentMonth)
      .input('anio', currentYear)
      .query(diagnosticoSupermat)

    console.log('[DIAGNOSTICO_SUPERMAT] Datos encontrados:', diagnosticoResult.recordset)

    // Query para obtener productos vendidos por cada cliente del ranking
    const productosClientesQuery = `
      SELECT 
        vf.CliNroId as ClienteId,
        ISNULL(RTRIM(art.ArtDescr), ISNULL(RTRIM(vf1.DeArtDescr), 'Producto sin descripción')) as ProductoDescripcion,
        ISNULL(RTRIM(art.ArtCodigo), '') as ProductoCodigo,
        SUM(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN ISNULL(vf1.DeCanti, 0) ELSE 0 END) as CantidadTotal,
        AVG(ISNULL(vf1.DePreUn, 0)) as PrecioUnitario,
        AVG(ISNULL(vf1.DePorDes, 0)) as PorcentajeDescuento,
        AVG(ISNULL(vf1.DePreUn, 0) * (1 - ISNULL(vf1.DePorDes, 0) / 100)) as PrecioUnitarioNetoConDescuento,
        SUM(ISNULL(vf1.DeNetGr, 0) * ISNULL(vc.CVeSigno, 1)) as TotalNetoGravado
      FROM VEN_FACTUR vf
      INNER JOIN VEN_FACTUR1 vf1 ON vf.FaNroF1 = vf1.FaNroF1 AND vf.FaNroF2 = vf1.FaNroF2 AND vf1.FaTipFa = vf.FaTipFa AND vf.CVeNroId = vf1.CVeNroId
      LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId
      LEFT JOIN ART_ARTICU art ON vf1.ArtNroId = art.ArtNroId
      WHERE MONTH(vf.FaFecha) = @mes 
        AND YEAR(vf.FaFecha) = @anio
        AND vf.CliNroId IS NOT NULL
        AND ISNULL(RTRIM(vf.FaNombr), '') != ''
        AND vf.CliNroId IN (
          SELECT TOP 15 vf2.CliNroId
          FROM VEN_FACTUR vf2
          LEFT JOIN VEN_CODVTA vc2 ON vf2.CVeNroId = vc2.CVeNroId
          WHERE MONTH(vf2.FaFecha) = @mes 
            AND YEAR(vf2.FaFecha) = @anio
            AND vf2.CliNroId IS NOT NULL
            AND ISNULL(RTRIM(vf2.FaNombr), '') != ''
          GROUP BY vf2.CliNroId
          HAVING SUM(ISNULL(vf2.FaTotal, 0) * ISNULL(vc2.CVeSigno, 1)) > 0
          ORDER BY SUM(ISNULL(vf2.FaTotal, 0) * ISNULL(vc2.CVeSigno, 1)) DESC
        )
      GROUP BY vf.CliNroId, 
               ISNULL(vf1.ArtNroId, 0),
               ISNULL(RTRIM(art.ArtDescr), ISNULL(RTRIM(vf1.DeArtDescr), 'Producto sin descripción')),
               ISNULL(RTRIM(art.ArtCodigo), '')
      HAVING SUM(CASE WHEN ISNULL(vc.CVeSigno, 1) > 0 THEN ISNULL(vf1.DeCanti, 0) ELSE 0 END) > 0
      ORDER BY vf.CliNroId, SUM(ISNULL(vf1.DeNetGr, 0) * ISNULL(vc.CVeSigno, 1)) DESC
    `

    const productosClientesResult = await pool.request()
      .input('mes', currentMonth)
      .input('anio', currentYear)
      .query(productosClientesQuery)

    // Agrupar productos por cliente
    const clientesConProductos = clientesRankingResult.recordset.map(cliente => ({
      ...cliente,
      productos: productosClientesResult.recordset.filter(producto => producto.ClienteId === cliente.ClienteId)
    }))

    const estadisticas = {
      mes: currentMonth,
      anio: currentYear,
      resumenVentas: ventasResult.recordset[0] || {
        TotalVentas: 0,
        TotalFacturacion: 0,
        TotalFacturacionNetoGravado: 0,
        PromedioVenta: 0
      },
      articulosMasVendidos: articulosResult.recordset || [],
      ventasDiarias: ventasDiariasResult.recordset || [],
      clientesRanking: clientesConProductos || []
    }

    console.log(`[ESTADISTICAS_VENTAS] ✅ Estadísticas obtenidas:`, {
      totalVentas: estadisticas.resumenVentas.TotalVentas,
      totalFacturacion: estadisticas.resumenVentas.TotalFacturacion,
      articulosEncontrados: estadisticas.articulosMasVendidos.length,
      clientesEncontrados: estadisticas.clientesRanking.length
    })

    return NextResponse.json(estadisticas)

  } catch (error) {
    console.error('[ESTADISTICAS_VENTAS] ❌ Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de ventas', details: errorMessage },
      { status: 500 }
    )
  }
}