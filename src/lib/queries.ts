import { getConnection } from './db'
import { Cliente } from './types'

// Interfaz para proveedores
export interface ProveedorDB {
  id: number
  nombre: string
  email: string
  telefono: string
  direccion: string
  fecha_registro: Date
  activo: boolean
  ProNroId: number
  ProContac?: string
  ProOrdPag?: string
  ProRubCon?: string
  IvPNroId?: number
  ZoFNroId?: number
  ProNroCai?: string
  ProVtoCai?: string
  ProObser?: string
  ProEstad?: string
  ProFeEst?: string
  ProUslog?: string
  ProFeLog?: string
  ProRubConPago?: string
  msrepl_tran_version?: string
  ProDocIdeVen?: string
  ProConFis?: string
  ProTipComAfi?: string
}

// Interfaz para clientes
export interface ClienteDB {
  id: number
  nombre: string
  email: string
  telefono: string
  direccion: string
  fecha_registro: Date
  activo: boolean
  CliNroId: number
  CliConta?: string
  CliNotas?: string
  IvCNroId?: number
  ZoFNroId?: number
  CliLimCr?: number
  CliEstad?: string
  CliFeEst?: string
  CliUsLog?: string
  CliFeLog?: string
  CliPanta?: string
  CliLprNroId?: number
  GesNroId?: number
  GAfNroid?: number
  CliValida?: string
  CliCodigo?: string
  CliLimChe?: number
  CliPlaChe?: string
  CliPlaCre?: string
  CliSucNroid?: number
  ZoVNroId?: number
  CliPunTipo?: string
}



export async function getEntidades(): Promise<Cliente[]> {
  console.log('[DB] 🚀 Iniciando consulta de entidades...')
  
  try {
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos')
    }
    console.log('[DB] 🔍 Verificando estructura de la base de datos...')
    
    // Primero verificar si la tabla existe y su estructura
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'Ent_maeentidad'
    `)
    
    // Verificar estructura de columnas si la tabla existe
    if (tableCheck.recordset.length > 0) {
      console.log('[DB] 📋 Tabla existe. Verificando estructura...')
      const columnCheck = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Ent_maeentidad'
        ORDER BY ORDINAL_POSITION
      `)
      console.log('[DB] 📊 Estructura actual:', columnCheck.recordset)
    }
    
    if (tableCheck.recordset.length === 0) {
      console.log('[DB] 📋 Tabla Ent_maeentidad no existe. Creando tabla...')
      
      // Crear la tabla
      await pool.request().query(`
        CREATE TABLE Ent_maeentidad (
          Entnroid INT IDENTITY(1,1) PRIMARY KEY,
          Entnombr NVARCHAR(100) NOT NULL,
          Entemail NVARCHAR(100) NULL,
          EntRazSoc NVARCHAR(100) NULL,
          EntDomic NVARCHAR(100) NULL,
          EntLocal NVARCHAR(100) NULL,
          EntProvi NVARCHAR(100) NULL,
          EntCodPo NVARCHAR(100) NULL,
          EntTelef NVARCHAR(100) NULL,
          EntCUIT NVARCHAR(100) NULL,
          EntActEc NVARCHAR(100) NULL,
          EntUsLog NVARCHAR(100) NULL,
          EntFeLog NVARCHAR(100) NULL,
          EntSedronar NVARCHAR(100) NULL,
          EntTelef2 NVARCHAR(100) NULL,
          EntCodigo NVARCHAR(100) NULL
        )
      `)
      
      console.log('[DB] ✅ Tabla creada exitosamente')
    }
    
    console.log('[DB] 🔍 Ejecutando consulta SQL...')
    
    const result = await pool.request().query(`
      SELECT TOP 100 
        CAST(Entnroid as INT) as id,
        CAST(Entnombr as NVARCHAR(100)) as nombre,
        CAST(Entemail as NVARCHAR(100)) as email,
        CAST(EntRazSoc as NVARCHAR(100)) as razon_social,
        CAST(EntDomic as NVARCHAR(100)) as domicilio,
        CAST(EntLocal as NVARCHAR(100)) as localidad,
        CAST(EntProvi as NVARCHAR(100)) as provincia,
        CAST(EntCodPo as NVARCHAR(100)) as codigo_postal,
        CAST(EntTelef as NVARCHAR(100)) as telefono,
        CAST(EntCUIT as NVARCHAR(100)) as EntCUIT,
        CAST(EntActEc as NVARCHAR(100)) as EntActEc,
        RTRIM(EntUsLog) as EntUsLog,
        CONVERT(NVARCHAR(100), EntFeLog, 120) as EntFeLog,
        RTRIM(EntSedronar) as EntSedronar,
        RTRIM(EntTelef2) as EntTelef2,
        CAST(EntCodigo as NVARCHAR(100)) as EntCodigo
      FROM Ent_maeentidad
      ORDER BY Entnroid
    `)
    
    console.log(`[DB] ✅ Consulta exitosa: ${result.recordset.length} registros obtenidos`)
    console.log('[DB] 📋 Primeros registros:', result.recordset.slice(0, 3))
    
    return result.recordset
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[DB] ❌ ERROR CRÍTICO - No se pudo conectar a SQL Server:', errorMessage)
    console.error('[DB] 🔧 Revisa la configuración de conexión en .env.local')
    console.error('[DB] 💡 Opciones: 1) Configurar servidor local, 2) Verificar servidor remoto')
    
    // NO usar datos de prueba - mostrar el error real
    throw new Error(`Conexión SQL fallida: ${errorMessage}`)
  }
}

export async function getClientes(): Promise<ClienteDB[]> {
  console.log('[CLIENTES] 🚀 Iniciando consulta de clientes...')
  
  try {
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos')
    }
    console.log('[CLIENTES] 🔍 Verificando estructura de la tabla CLIE_MAECLIENTES...')
    
    // Verificar si la tabla existe
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'CLIE_MAECLIENTES'
    `)
    
    // Verificar estructura de columnas si la tabla existe
    if (tableCheck.recordset.length > 0) {
      console.log('[CLIENTES] 📋 Tabla existe. Verificando estructura...')
      const columnCheck = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'CLIE_MAECLIENTES'
        ORDER BY ORDINAL_POSITION
      `)
      console.log('[CLIENTES] 📊 Estructura actual:', columnCheck.recordset)
    }
    
    if (tableCheck.recordset.length === 0) {
      console.log('[CLIENTES] 📋 Tabla CLIE_MAECLIENTES no existe. Creando tabla...')
      
      // Crear la tabla con todas las columnas reales
      await pool.request().query(`
        CREATE TABLE CLIE_MAECLIENTES (
          CliNroId INT IDENTITY(1,1) PRIMARY KEY,
          CliConta NVARCHAR(100) NULL,
          CliNotas NVARCHAR(500) NULL,
          IvCNroId INT NULL,
          ZoFNroId INT NULL,
          CliLimCr DECIMAL(18,2) NULL,
          CliEstad NVARCHAR(50) NULL,
          CliFeEst DATETIME NULL,
          CliUsLog NVARCHAR(50) NULL,
          CliFeLog DATETIME NULL,
          CliPanta NVARCHAR(100) NULL,
          CliLprNroId INT NULL,
          GesNroId INT NULL,
          GAfNroid INT NULL,
          CliValida NVARCHAR(50) NULL,
          CliCodigo NVARCHAR(50) NULL,
          CliLimChe DECIMAL(18,2) NULL,
          CliPlaChe NVARCHAR(50) NULL,
          CliPlaCre NVARCHAR(50) NULL,
          CliSucNroid INT NULL,
          msrepl_tran_version UNIQUEIDENTIFIER NULL,
          ZoVNroId INT NULL,
          CliPunTipo NVARCHAR(50) NULL
        )
      `)
      
      console.log('[CLIENTES] ✅ Tabla creada exitosamente')
    }
    
    console.log('[CLIENTES] 🔍 Ejecutando consulta SQL...')
    
    const result = await pool.request().query(`
      SELECT TOP 100 
        CAST(CliNroId as INT) as id,
        ISNULL(CAST(CliConta as NVARCHAR(100)), 'Sin nombre') as nombre,
        ISNULL(CAST(CliNotas as NVARCHAR(100)), 'Sin email') as email,
        ISNULL(CAST(CliCodigo as NVARCHAR(50)), 'Sin teléfono') as telefono,
        ISNULL(CAST(CliPanta as NVARCHAR(100)), 'Sin dirección') as direccion,
        ISNULL(CliFeLog, GETDATE()) as fecha_registro,
        CASE WHEN CliEstad = 'A' THEN 1 ELSE 0 END as activo,
        CAST(CliNroId as INT) as CliNroId,
        ISNULL(CAST(CliConta as NVARCHAR(100)), '') as CliConta,
        ISNULL(CAST(CliNotas as NVARCHAR(500)), '') as CliNotas,
        ISNULL(CAST(IvCNroId as NVARCHAR(100)), '') as IvCNroId,
        ISNULL(CAST(ZoFNroId as NVARCHAR(100)), '') as ZoFNroId,
        ISNULL(CAST(CliLimCr as NVARCHAR(100)), '') as CliLimCr,
        ISNULL(CAST(CliEstad as NVARCHAR(100)), '') as CliEstad,
        ISNULL(CONVERT(NVARCHAR(100), CliFeEst, 120), '') as CliFeEst,
        ISNULL(RTRIM(CliUsLog), '') as CliUsLog,
        ISNULL(CONVERT(NVARCHAR(100), CliFeLog, 120), '') as CliFeLog,
        ISNULL(CAST(CliPanta as NVARCHAR(100)), '') as CliPanta,
        ISNULL(CAST(CliLprNroId as NVARCHAR(100)), '') as CliLprNroId,
        ISNULL(CAST(GesNroId as NVARCHAR(100)), '') as GesNroId,
        ISNULL(CAST(GAfNroid as NVARCHAR(100)), '') as GAfNroid,
        ISNULL(CAST(CliValida as NVARCHAR(100)), '') as CliValida,
        ISNULL(CAST(CliCodigo as NVARCHAR(100)), '') as CliCodigo,
        ISNULL(CAST(CliLimChe as NVARCHAR(100)), '') as CliLimChe,
        ISNULL(CAST(CliPlaChe as NVARCHAR(100)), '') as CliPlaChe,
        ISNULL(CAST(CliPlaCre as NVARCHAR(100)), '') as CliPlaCre,
        ISNULL(CAST(CliSucNroid as NVARCHAR(100)), '') as CliSucNroid,
        ISNULL(CAST(msrepl_tran_version as NVARCHAR(100)), '') as msrepl_tran_version,
        ISNULL(CAST(ZoVNroId as NVARCHAR(100)), '') as ZoVNroId,
        ISNULL(CAST(CliPunTipo as NVARCHAR(100)), '') as CliPunTipo
      FROM CLIE_MAECLIENTES
      ORDER BY CliNroId
    `)
    
    console.log(`[CLIENTES] ✅ Consulta exitosa: ${result.recordset.length} registros obtenidos`)
    console.log('[CLIENTES] 📋 Primeros registros:', result.recordset.slice(0, 3))
    
    return result.recordset
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[CLIENTES] ❌ ERROR CRÍTICO - No se pudo conectar a SQL Server:', errorMessage)
    console.error('[CLIENTES] 🔧 Revisa la configuración de conexión en .env.local')
    console.error('[CLIENTES] 💡 Opciones: 1) Configurar servidor local, 2) Verificar servidor remoto')
    
    // NO usar datos de prueba - mostrar el error real
    throw new Error(`Conexión SQL fallida para clientes: ${errorMessage}`)
  }
}

// Interfaz para datos relacionados
export interface DatosRelacionados {
  entidad?: {
    Entnroid: number
    Entnombr?: string
    Entemail?: string
    EntRazSoc?: string
    EntDomic?: string
    EntLocal?: string
    EntProvi?: string
    EntCodPo?: string
    EntTelef?: string
    EntCUIT?: string
    EntActEc?: string
  }
  cliente?: {
    CliNroId: number
    CliConta?: string
    CliNotas?: string
    CliEstad?: string
    CliCodigo?: string
  }
  proveedor?: {
    ProNroId: number
    ProContac?: string
    ProObser?: string
    ProEstad?: string
    ProRubCon?: string
  }
  deuda?: {
    SucNroId: number
    DeuNroId: number
    EntNroId: number
    DeuImpor: number
    DeuSaldo: number
    DeuFecha: string
    DeuCodCom: number
    DeuTipfa: string
    DeuNroF1: number
    DeuNroF2: number
    DeudaNumero: string
  }[]
  movimientos?: {
    SucNroId: number
    MovNroId: number
    CtmNroId: string
    EntNroId: number
    MovImpor: number
    MovFecha: string
  }[]
  facturas?: {
    FactNroId: number
    FactNumero: string
    FactFecha: string
    FactTipo: string
    FactTotal: number
    FaNetGr: number
    FactEstado: string
    EntNroId: number
  }[]
  movimientosCCT?: {
    MovimCCTId: number
    Fecha: string
    Importe: number
    Concepto: string
    Estado: string
  }[]
  movimientosLevel1?: {
    SucNroId: number
    MovNroId: number
    DeuNroId: number
    CCCNroId?: number
    MovImpDe?: number
    DeuDeuNroId?: number
    DeuSucNroId?: number
    CCCDescr?: string
    CCCSigno?: number
  }[]
  movimientosCombinados?: {
    SucNroId: number
    MovNroId: number
    CtmNroId: string
    EntNroId: number
    MovImpor: number
    MovFecha: string
    DeuNroId?: number
    CCCNroId?: number
    MovImpDe?: number
    CCCDescr?: string
    CCCSigno?: number
    Debe: number
    Haber: number
  }[]
}

// Función para obtener datos relacionados por ID
export async function getDatosRelacionados(entidadId: number): Promise<DatosRelacionados> {
  console.log(`[RELACIONADOS] 🔍 Buscando datos relacionados para entidad ID: ${entidadId}...`)
  
  try {
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos')
    }
    const resultado: DatosRelacionados = {}
    
    // Buscar datos de la entidad principal
    try {
      const entidadResult = await pool.request()
        .input('id', entidadId)
        .query(`
          SELECT TOP 1
            Entnroid,
            CAST(Entnombr as NVARCHAR(100)) as Entnombr,
            CAST(Entemail as NVARCHAR(100)) as Entemail,
            CAST(EntRazSoc as NVARCHAR(100)) as EntRazSoc,
            CAST(EntDomic as NVARCHAR(100)) as EntDomic,
            CAST(EntLocal as NVARCHAR(100)) as EntLocal,
            CAST(EntProvi as NVARCHAR(100)) as EntProvi,
            CAST(EntCodPo as NVARCHAR(100)) as EntCodPo,
            CAST(EntTelef as NVARCHAR(100)) as EntTelef,
            CAST(EntCUIT as NVARCHAR(100)) as EntCUIT,
            CAST(EntActEc as NVARCHAR(100)) as EntActEc
          FROM ENT_MAEENTIDAD 
          WHERE Entnroid = @id
        `)
      
      if (entidadResult.recordset.length > 0) {
        resultado.entidad = entidadResult.recordset[0]
        console.log(`[RELACIONADOS] ✅ Entidad encontrada para ID ${entidadId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log(`[RELACIONADOS] ⚠️ No se encontró entidad para ID ${entidadId}:`, errorMessage)
    }

    // Buscar cliente con el mismo ID
    try {
      const clienteResult = await pool.request()
        .input('id', entidadId)
        .query(`
          SELECT TOP 1
            CliNroId,
            CAST(CliConta as NVARCHAR(100)) as CliConta,
            CAST(CliNotas as NVARCHAR(500)) as CliNotas,
            CAST(CliEstad as NVARCHAR(100)) as CliEstad,
            CAST(CliCodigo as NVARCHAR(50)) as CliCodigo
          FROM CLIE_MAECLIENTES 
          WHERE CliNroId = @id
        `)
      
      if (clienteResult.recordset.length > 0) {
        resultado.cliente = clienteResult.recordset[0]
        console.log(`[RELACIONADOS] ✅ Cliente encontrado para ID ${entidadId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log(`[RELACIONADOS] ⚠️ No se encontró cliente para ID ${entidadId}:`, errorMessage)
    }
    
    // Buscar proveedor con el mismo ID
    try {
      const proveedorResult = await pool.request()
        .input('id', entidadId)
        .query(`
          SELECT TOP 1
            ProNroId,
            CAST(ProContac as NVARCHAR(100)) as ProContac,
            CAST(ProObser as NVARCHAR(500)) as ProObser,
            CAST(ProEstad as NVARCHAR(100)) as ProEstad,
            CAST(ProRubCon as NVARCHAR(100)) as ProRubCon
          FROM PROV_MAEPROV 
          WHERE ProNroId = @id
        `)
      
      if (proveedorResult.recordset.length > 0) {
        resultado.proveedor = proveedorResult.recordset[0]
        console.log(`[RELACIONADOS] ✅ Proveedor encontrado para ID ${entidadId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log(`[RELACIONADOS] ⚠️ No se encontró proveedor para ID ${entidadId}:`, errorMessage)
    }
    
    // Buscar deudas relacionadas con la entidad (solo clientes CLI)
    try {
      const deudaResult = await pool.request()
          .input('id', entidadId)
          .query(`
          SELECT TOP 10
            cd.SucNroId,
            cd.DeuNroId,
            cd.EntNroId,
            cd.DeuImpor,
            cd.DeuSaldo,
            cd.DeuFecha,
            cd.DeuCodCom,
            cd.DeuTipfa,
            cd.DeuNroF1,
            cd.DeuNroF2,
            ISNULL(
              SUBSTRING(ISNULL(cc.CCCDescr, ''), 1, 3) + ' ' + 
              ISNULL(cd.DeuTipfa, '') + '-' + 
              RIGHT('0000' + ISNULL(CAST(cd.DeuNroF1 as NVARCHAR), '0'), 4) + '-' + 
              RIGHT('00000000' + ISNULL(CAST(cd.DeuNroF2 as NVARCHAR), '0'), 8),
              cd.DeuNroId
            ) as DeudaNumero,
            'CLI' as TipoEntidad
          FROM CCT_Deudas cd WITH (NOLOCK)
          LEFT JOIN CCT_CODCCT cc WITH (NOLOCK) ON cd.DeuCodCom = cc.CCCNroId
          INNER JOIN CLIE_MAECLIENTES cli WITH (NOLOCK) ON cd.EntNroId = cli.CliNroId
          WHERE cd.EntNroId = @id
          ORDER BY cd.DeuFecha DESC, cd.DeuNroId DESC
        `)
      
      if (deudaResult.recordset.length > 0) {
        resultado.deuda = deudaResult.recordset
        console.log(`[RELACIONADOS] ✅ ${deudaResult.recordset.length} deudas de clientes encontradas para ID ${entidadId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log(`[RELACIONADOS] ⚠️ No se encontraron deudas de clientes para ID ${entidadId}:`, errorMessage)
    }
    
    // Buscar movimientos relacionados con la entidad (solo clientes CLI)
    try {
      const movimResult = await pool.request()
        .input('id', entidadId)
        .query(`
          SELECT TOP 5
            m.SucNroId,
            m.MovNroId,
            m.CtmNroId,
            m.EntNroId,
            m.MovImpor,
            m.MovFecha,
            'CLI' as TipoEntidad
          FROM CCT_MOVIM m WITH (NOLOCK)
          INNER JOIN CLIE_MAECLIENTES cli WITH (NOLOCK) ON m.EntNroId = cli.CliNroId
          WHERE m.EntNroId = @id
          ORDER BY m.MovFecha DESC, m.MovNroId DESC
        `)
      
      if (movimResult.recordset.length > 0) {
        resultado.movimientos = movimResult.recordset
        console.log(`[RELACIONADOS] ✅ ${movimResult.recordset.length} movimientos encontrados para ID ${entidadId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log(`[RELACIONADOS] ⚠️ No se encontraron movimientos para ID ${entidadId}:`, errorMessage)
    }
    
    // Buscar facturas relacionadas con la entidad (todas las facturas)
    try {
      const facturasResult = await pool.request()
        .input('id', entidadId)
        .query(`
          SELECT
            ROW_NUMBER() OVER(ORDER BY vf.FaFecha DESC) as FactNroId,
            ISNULL(
              SUBSTRING(ISNULL(vc.CVeAbrev, ''), 1, 3) + ' ' + 
              ISNULL(vf.FaTipFa, '') + '-' + 
              RIGHT('0000' + ISNULL(CAST(vf.FaFisPun as NVARCHAR), '0'), 4) + '-' + 
              RIGHT('00000000' + ISNULL(CAST(vf.FaFiscal as NVARCHAR), '0'), 8),
              ''
            ) as FactNumero,
            ISNULL(CONVERT(NVARCHAR(100), vf.FaFecha, 126), '') as FactFecha,
            ISNULL(RTRIM(vc.CVeDescr), '') as FactTipo,
            ISNULL(CAST(vf.FaTotal as FLOAT), 0) as FactTotal,
            ISNULL(CAST(vf.FaNetGr as FLOAT), 0) as FaNetGr,
            ISNULL(vf.FaEstad, '') as FactEstado,
            vf.CliNroId as EntNroId,
            vf.CVeNroId,
            vf.FaTipFa,
            vf.FaNroF1,
            vf.FaNroF2
          FROM VEN_FACTUR vf WITH (NOLOCK)
          LEFT JOIN VEN_CODVTA vc WITH (NOLOCK) ON vf.CVeNroId = vc.CVeNroId
          WHERE vf.CliNroId = @id
          ORDER BY vf.FaFecha DESC
        `)
      
      if (facturasResult.recordset.length > 0) {
        resultado.facturas = facturasResult.recordset
        console.log(`[RELACIONADOS] ✅ ${facturasResult.recordset.length} facturas encontradas para ID ${entidadId}`)
      } else {
        console.log(`[RELACIONADOS] ⚠️ No se encontraron facturas para ID ${entidadId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log(`[RELACIONADOS] ⚠️ Error al buscar facturas para ID ${entidadId}:`, errorMessage)
    }
    
    // Nota: CCT_MOVIMCCT no existe en la base de datos actual
    // Se comenta esta sección hasta que se confirme la estructura correcta
    /*
    // Buscar movimientos de cuenta corriente relacionados con la entidad
    try {
      const movimCCTResult = await pool.request()
        .input('id', entidadId)
        .query(`
          SELECT TOP 10
            CAST(ROW_NUMBER() OVER(ORDER BY CCT_MOVIMCCT.MovimCCTId) as INT) as MovimCCTId,
            ISNULL(CONVERT(NVARCHAR(100), Fecha, 103), '') as Fecha,
            ISNULL(CAST(Importe as FLOAT), 0) as Importe,
            ISNULL(CAST(Concepto as NVARCHAR(500)), '') as Concepto,
            ISNULL(CAST(Estado as NVARCHAR(100)), '') as Estado
          FROM CCT_MOVIMCCT 
          WHERE EntNroId = @id
          ORDER BY Fecha DESC
        `)
      
      if (movimCCTResult.recordset.length > 0) {
        resultado.movimientosCCT = movimCCTResult.recordset
        console.log(`[RELACIONADOS] ✅ ${movimCCTResult.recordset.length} movimientos CCT encontrados para ID ${entidadId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log(`[RELACIONADOS] ⚠️ No se encontraron movimientos CCT para ID ${entidadId}:`, errorMessage)
    }
    */
    
    // Buscar movimientos Level1 relacionados con la entidad (optimizado con índices)
    try {
      const movimLevel1Result = await pool.request()
        .input('id', entidadId)
        .query(`
          SELECT TOP 3
            ml.SucNroId,
            ml.MovNroId,
            ml.DeuNroId,
            ml.CCCNroId,
            ml.MovImpDe,
            ml.DeuDeuNroId,
            ml.DeuSucNroId,
            ISNULL(CAST(cc.CCCDescr as NVARCHAR(30)), '') as CCCDescr,
            ISNULL(cc.CCCSigno, 0) as CCCSigno
          FROM CCT_MOVIMCCT_MOVIMLEVEL1 ml WITH (NOLOCK)
          INNER JOIN (
            SELECT TOP 3 MovNroId 
            FROM CCT_MOVIM WITH (NOLOCK)
            WHERE EntNroId = @id
            ORDER BY MovFecha DESC, MovNroId DESC
          ) m ON ml.MovNroId = m.MovNroId
          LEFT JOIN CCT_CODCCT cc WITH (NOLOCK) ON ml.CCCNroId = cc.CCCNroId
          ORDER BY ml.MovNroId DESC
        `)
      
      if (movimLevel1Result.recordset.length > 0) {
        resultado.movimientosLevel1 = movimLevel1Result.recordset
        console.log(`[RELACIONADOS] ✅ ${movimLevel1Result.recordset.length} movimientos Level1 encontrados para ID ${entidadId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log(`[RELACIONADOS] ⚠️ No se encontraron movimientos Level1 para ID ${entidadId}:`, errorMessage)
    }

    // Buscar movimientos combinados (regulares + Level1) con columnas Debe y Haber (máxima optimización)
    try {
      const movimCombinadosResult = await pool.request()
        .input('id', entidadId)
        .query(`
          SELECT TOP 3
            m.SucNroId,
            m.MovNroId,
            m.CtmNroId,
            m.EntNroId,
            m.MovImpor,
            m.MovFecha,
            ml.DeuNroId,
            ml.CCCNroId,
            ml.MovImpDe,
            ISNULL(CAST(cc.CCCDescr as NVARCHAR(30)), '') as CCCDescr,
            ISNULL(cc.CCCSigno, 0) as CCCSigno,
            CASE 
              WHEN ISNULL(cc.CCCSigno, 0) = 1 THEN ISNULL(ml.MovImpDe, 0)
              ELSE 0
            END as Debe,
            CASE 
              WHEN ISNULL(cc.CCCSigno, 0) = -1 THEN ISNULL(ml.MovImpDe, 0)
              ELSE 0
            END as Haber
          FROM (
            SELECT TOP 3 m.SucNroId, m.MovNroId, m.CtmNroId, m.EntNroId, m.MovImpor, m.MovFecha
            FROM CCT_MOVIM m WITH (NOLOCK)
            INNER JOIN CLIE_MAECLIENTES cli WITH (NOLOCK) ON m.EntNroId = cli.CliNroId
            WHERE m.EntNroId = @id
            ORDER BY m.MovFecha DESC, m.MovNroId DESC
          ) m
          LEFT JOIN CCT_MOVIMCCT_MOVIMLEVEL1 ml WITH (NOLOCK) ON m.MovNroId = ml.MovNroId
          LEFT JOIN CCT_CODCCT cc WITH (NOLOCK) ON ml.CCCNroId = cc.CCCNroId
          ORDER BY m.MovFecha DESC, m.MovNroId DESC
        `)
      
      if (movimCombinadosResult.recordset.length > 0) {
        resultado.movimientosCombinados = movimCombinadosResult.recordset
        console.log(`[RELACIONADOS] ✅ ${movimCombinadosResult.recordset.length} movimientos combinados encontrados para ID ${entidadId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.log(`[RELACIONADOS] ⚠️ No se encontraron movimientos combinados para ID ${entidadId}:`, errorMessage)
    }
    
    return resultado
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error(`[RELACIONADOS] ❌ Error al buscar datos relacionados para ID ${entidadId}:`, errorMessage)
    return {}
  }
}

export async function getProveedores(): Promise<ProveedorDB[]> {
  console.log('[PROVEEDORES] 🚀 Iniciando consulta de proveedores...')
  
  try {
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos')
    }
    console.log('[PROVEEDORES] 🔍 Verificando estructura de la tabla PROV_MAEPROV...')
    
    // Verificar si la tabla existe
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'PROV_MAEPROV'
    `)
    
    // Verificar estructura de columnas si la tabla existe
    if (tableCheck.recordset.length > 0) {
      console.log('[PROVEEDORES] 📋 Tabla existe. Verificando estructura...')
      const columnCheck = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'PROV_MAEPROV'
        ORDER BY ORDINAL_POSITION
      `)
      console.log('[PROVEEDORES] 📊 Estructura actual:', columnCheck.recordset)
    }
    
    if (tableCheck.recordset.length === 0) {
      console.log('[PROVEEDORES] 📋 Tabla PROV_MAEPROV no existe. Creando tabla...')
      
      // Crear la tabla con todas las columnas reales
      await pool.request().query(`
        CREATE TABLE PROV_MAEPROV (
          ProNroId INT IDENTITY(1,1) PRIMARY KEY,
          ProContac NVARCHAR(100) NULL,
          ProOrdPag NVARCHAR(100) NULL,
          ProRubCon NVARCHAR(100) NULL,
          IvPNroId INT NULL,
          ZoFNroId INT NULL,
          ProNroCai NVARCHAR(100) NULL,
          ProVtoCai NVARCHAR(100) NULL,
          ProObser NVARCHAR(500) NULL,
          ProEstad NVARCHAR(50) NULL,
          ProFeEst DATETIME NULL,
          ProUslog NVARCHAR(50) NULL,
          ProFeLog DATETIME NULL,
          ProRubConPago NVARCHAR(100) NULL,
          msrepl_tran_version UNIQUEIDENTIFIER NULL,
          ProDocIdeVen NVARCHAR(100) NULL,
          ProConFis NVARCHAR(100) NULL,
          ProTipComAfi NVARCHAR(100) NULL
        )
      `)
      
      console.log('[PROVEEDORES] ✅ Tabla creada exitosamente')
    }
    
    console.log('[PROVEEDORES] 🔍 Ejecutando consulta SQL...')
    
    const result = await pool.request().query(`
      SELECT TOP 100 
        CAST(ProNroId as INT) as id,
        ISNULL(CAST(ProContac as NVARCHAR(100)), 'Sin nombre') as nombre,
        ISNULL(CAST(ProObser as NVARCHAR(100)), 'Sin email') as email,
        ISNULL(CAST(ProDocIdeVen as NVARCHAR(100)), 'Sin teléfono') as telefono,
        ISNULL(CAST(ProRubCon as NVARCHAR(100)), 'Sin dirección') as direccion,
        ISNULL(ProFeLog, GETDATE()) as fecha_registro,
        CASE WHEN ProEstad = 'A' THEN 1 ELSE 0 END as activo,
        CAST(ProNroId as INT) as ProNroId,
        ISNULL(CAST(ProContac as NVARCHAR(100)), '') as ProContac,
        ISNULL(CAST(ProOrdPag as NVARCHAR(100)), '') as ProOrdPag,
        ISNULL(CAST(ProRubCon as NVARCHAR(100)), '') as ProRubCon,
        ISNULL(CAST(IvPNroId as NVARCHAR(100)), '') as IvPNroId,
        ISNULL(CAST(ZoFNroId as NVARCHAR(100)), '') as ZoFNroId,
        ISNULL(CAST(ProNroCai as NVARCHAR(100)), '') as ProNroCai,
        ISNULL(CAST(ProVtoCai as NVARCHAR(100)), '') as ProVtoCai,
        ISNULL(CAST(ProObser as NVARCHAR(500)), '') as ProObser,
        ISNULL(CAST(ProEstad as NVARCHAR(100)), '') as ProEstad,
        ISNULL(CONVERT(NVARCHAR(100), ProFeEst, 120), '') as ProFeEst,
        ISNULL(RTRIM(ProUslog), '') as ProUslog,
        ISNULL(CONVERT(NVARCHAR(100), ProFeLog, 120), '') as ProFeLog,
        ISNULL(CAST(ProRubConPago as NVARCHAR(100)), '') as ProRubConPago,
        ISNULL(CAST(msrepl_tran_version as NVARCHAR(100)), '') as msrepl_tran_version,
        ISNULL(CAST(ProDocIdeVen as NVARCHAR(100)), '') as ProDocIdeVen,
        ISNULL(CAST(ProConFis as NVARCHAR(100)), '') as ProConFis,
        ISNULL(CAST(ProTipComAfi as NVARCHAR(100)), '') as ProTipComAfi
      FROM PROV_MAEPROV
      ORDER BY ProNroId
    `)
    
    console.log(`[PROVEEDORES] ✅ Consulta exitosa: ${result.recordset.length} registros obtenidos`)
    console.log('[PROVEEDORES] 📋 Primeros registros:', result.recordset.slice(0, 3))
    
    return result.recordset
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[PROVEEDORES] ❌ ERROR CRÍTICO - No se pudo conectar a SQL Server:', errorMessage)
    console.error('[PROVEEDORES] 🔧 Revisa la configuración de conexión en .env.local')
    console.error('[PROVEEDORES] 💡 Opciones: 1) Configurar servidor local, 2) Verificar servidor remoto')
    
    // NO usar datos de prueba - mostrar el error real
    throw new Error(`Conexión SQL fallida para proveedores: ${errorMessage}`)
  }
}

// Interfaces para tablas reales de detalle de factura
// Interfaces para las tablas de detalle de factura
export interface DetalleFacturaDB {
  // Datos de la factura (VEN_FACTUR)
  CliNroId: number
  FaNroF1: number
  FaTipFa: string
  FaNroF2: number
  CVeNroId: number
  FaNombr?: string
  FaDomic?: string
  FaLocal?: string
  FaTipIva?: string
  FaCuit?: string
  FaTotal?: number
  FaNetGr?: number
  FaDesct?: number

  
  // Datos del tipo de factura (VEN_CODVTA)
  CVeDescr?: string
  CVeSigno?: number
  
  // Datos del detalle (VEN_FACTUR1)
  // CVeNroId: number
  // FaTipFa: string
  // FaNroF1: number
  // FaNroF2: number
  DeNroId: number
  ArtNroId: number
  DeCanti: number
  DePreUn: number
  DeNetGr: number
  DeImIva: number
  DeTotal: number
  DeArtDescr?: string
  DePorDes?: number
  
  // Campos calculados
  NetoGravado?: number
  NetoConDto?: number

  
  // Datos del artículo (ART_ARTICU)
  ArtDescr?: string
  ArtCodigo?: string
  ArtBarra?: string
}

// TODO: Implementar función para crear/configurar tablas de detalle de factura

// Función para obtener detalles de una factura específica
export async function obtenerDetalleFactura(facturaKeys: {CVeNroId: number, FaTipFa: string, FaNroF1: number, FaNroF2: number}): Promise<DetalleFacturaDB[]> {
  console.log(`[DETALLE_FACTURA] 🔍 Obteniendo detalle para factura:`, facturaKeys)
  
  try {
    const pool = await getConnection()
    if (!pool) {
      throw new Error('No se pudo establecer conexión con la base de datos')
    }

    console.log('[DETALLE_FACTURA] 📊 Consultando detalles de factura')
    console.log(`[DETALLE_FACTURA] 🔍 Claves de factura:`, facturaKeys)
    
    const query = `
      SELECT 
        -- Datos de la factura (VEN_FACTUR)
        vf.CliNroId,
        vf.FaNroF1,
        vf.FaTipFa,
        vf.FaNroF2,
        vf.CVeNroId,
        vf.FaNombr,
        vf.FaDomic,
        vf.FaLocal,
        vf.FaTipIva,
        vf.FaCuit,
        vf.FaTotal,
        vf.FaNetGr,
        vf.FaDesct,

        
        -- Descripción del tipo de factura (VEN_CODVTA)
        vc.CVeDescr,
        vc.CVeSigno,
        
        -- Datos del detalle (VEN_FACTUR1)
        vf1.DeNroId,
        vf1.ArtNroId,
        vf1.DeCanti,
        vf1.DePreUn,
        vf1.DeNetGr,
        vf1.DeImIva,
        vf1.DeTotal,
        vf1.DeArtDescr,
        vf1.DePorDes,
        
        -- Datos del artículo (ART_ARTICU)
        art.ArtDescr,
        art.ArtCodigo,
        art.ArtBarra,
        
        -- Campos calculados
        (vf.FaNetGr * ISNULL(vc.CVeSigno, 1)) as NetoGravado,
        (vf1.DeNetGr - (ISNULL(vf1.DePorDes, 0) * vf1.DeNetGr / 100)) as NetoConDto
        
      FROM VEN_FACTUR vf
      INNER JOIN VEN_FACTUR1 vf1 ON vf.FaNroF1 = vf1.FaNroF1 AND vf.FaNroF2 = vf1.FaNroF2 AND vf1.FaTipFa = vf.FaTipFa AND vf.CVeNroId = vf1.CVeNroId
      LEFT JOIN VEN_CODVTA vc ON vf.CVeNroId = vc.CVeNroId 
      LEFT JOIN ART_ARTICU art ON vf1.ArtNroId = art.ArtNroId
      WHERE vf.CVeNroId = @cveNroId AND vf.FaTipFa = @faTipFa AND vf.FaNroF1 = @faNroF1 AND vf.FaNroF2 = @faNroF2
      ORDER BY vf1.DeNroId
    `
    
    const result = await pool.request()
      .input('cveNroId', facturaKeys.CVeNroId)
      .input('faTipFa', facturaKeys.FaTipFa)
      .input('faNroF1', facturaKeys.FaNroF1)
      .input('faNroF2', facturaKeys.FaNroF2)
      .query(query)
    
    console.log(`[DETALLE_FACTURA] ✅ ${result.recordset.length} detalles encontrados`)
    return result.recordset as DetalleFacturaDB[]
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[DETALLE_FACTURA] ❌ Error:', errorMessage)
    throw error
  }
}
