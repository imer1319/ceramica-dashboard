import { NextRequest, NextResponse } from 'next/server'
import sql from 'mssql'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { server, user, password, database, port, instance } = body

    // Validar que todos los campos requeridos estén presentes
    if (!server || !user || !password || !database || !port) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Configurar la conexión
    const config: sql.config = {
      user,
      password,
      server,
      port: parseInt(port.toString()),
      database,
      options: {
        encrypt: false, // Para desarrollo local
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 10000,
        requestTimeout: 10000
      }
    }

    // Si se especifica una instancia, agregarla al servidor
    if (instance && instance.trim()) {
      config.server = `${server}\\${instance.trim()}`
    }

    // Intentar conectar
    const pool = new sql.ConnectionPool(config)
    
    try {
      await pool.connect()
      
      // Realizar una consulta simple para verificar la conexión
      const result = await pool.request().query('SELECT 1 as test')
      
      await pool.close()
      
      return NextResponse.json({
        success: true,
        message: 'Conexión exitosa a la base de datos',
        serverInfo: {
          server: config.server,
          database,
          port
        }
      })
      
    } catch (connectionError: any) {
      await pool.close().catch(() => {}) // Cerrar conexión si está abierta
      
      let errorMessage = 'Error de conexión a la base de datos'
      
      if (connectionError.code === 'ELOGIN') {
        errorMessage = 'Usuario o contraseña incorrectos'
      } else if (connectionError.code === 'ECONNREFUSED') {
        errorMessage = 'No se puede conectar al servidor. Verifique la dirección y puerto'
      } else if (connectionError.code === 'ETIMEOUT') {
        errorMessage = 'Tiempo de conexión agotado. Verifique la conectividad de red'
      } else if (connectionError.code === 'ENOTFOUND') {
        errorMessage = 'Servidor no encontrado. Verifique la dirección del servidor'
      } else if (connectionError.message) {
        errorMessage = connectionError.message
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      )
    }
    
  } catch (error: any) {
    console.error('Error en test-connection:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}