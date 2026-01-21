import sql from 'mssql'

// Obtener configuración EXCLUSIVAMENTE desde variables de entorno
function getDbConfig() {
  const server = process.env.DB_SERVER
  const user = process.env.DB_USER
  const password = process.env.DB_PASSWORD
  const database = process.env.DB_DATABASE
  const port = parseInt(process.env.DB_PORT || '1433')
  const instance = process.env.DB_INSTANCE

  if (!server || !user || !password || !database) {
    throw new Error('[DB] Faltan variables de entorno: defina DB_SERVER, DB_USER, DB_PASSWORD, DB_DATABASE y opcionalmente DB_PORT, DB_INSTANCE')
  }

  const config: sql.config = {
    user,
    password,
    server,
    port,
    database,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 15000,
      requestTimeout: 60000
    }
  }

  if (instance && instance.trim()) {
    config.options = { ...config.options, instanceName: instance.trim() }
  }

  // Devolver como arreglo para mantener la lógica existente
  return [config]
}

// Obtener configuraciones dinámicamente
const configs = getDbConfig()

let pool: sql.ConnectionPool | null = null
let isConnecting = false
let connectionPromise: Promise<sql.ConnectionPool> | null = null
let currentConfigIndex = 0

export async function getConnection() {
  // Si ya tenemos una conexión activa, la devolvemos
  if (pool && pool.connected) {
    return pool
  }
  
  // Si ya hay una conexión en progreso, esperamos a que termine
  if (isConnecting && connectionPromise) {
    return connectionPromise
  }

  // Marcar que estamos conectando y crear la promesa
  isConnecting = true
  connectionPromise = connectToDatabase()
  
  try {
    pool = await connectionPromise
    return pool
  } finally {
    isConnecting = false
    connectionPromise = null
  }
}

async function connectToDatabase(): Promise<sql.ConnectionPool> {
  // Única configuración: variables de entorno
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i]
    const configName = 'Variables de entorno'

    try {
      console.log(`[DB] 🔄 Probando configuración ${i + 1}: ${configName}`)
      console.log(`[DB] 📡 Conectando a: ${config.server}${config.options?.instanceName ? '\\' + config.options.instanceName : ''}:${config.port}`)

      const newPool = await sql.connect(config)
      console.log(`[DB] ✅ Conexión exitosa con configuración ${i + 1}: ${configName}`)
      currentConfigIndex = i
      return newPool
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.log(`[DB] ❌ Configuración ${i + 1} falló: ${errorMessage}`)

      // Si es el último intento, lanzar el error
      if (i === configs.length - 1) {
        console.error('[DB] ❌ Todas las configuraciones fallaron')
        throw err
      }
    }
  }

  throw new Error('No se pudo establecer conexión con ninguna configuración')
}