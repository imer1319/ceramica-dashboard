'use client'

export interface DatabaseConfig {
  server: string
  user: string
  password: string
  database: string
  port: number
  instance?: string
}

const CONFIG_KEY = 'nextsql_db_config'

export const configStorage = {
  // Guardar configuración en localStorage
  save: (config: DatabaseConfig): boolean => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
        return true
      }
      return false
    } catch (error) {
      console.error('Error saving config to localStorage:', error)
      return false
    }
  },

  // Cargar configuración desde localStorage
  load: (): DatabaseConfig | null => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(CONFIG_KEY)
        if (stored) {
          return JSON.parse(stored)
        }
      }
      return null
    } catch (error) {
      console.error('Error loading config from localStorage:', error)
      return null
    }
  },

  // Verificar si existe configuración
  exists: (): boolean => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(CONFIG_KEY) !== null
      }
      return false
    } catch (error) {
      console.error('Error checking config existence:', error)
      return false
    }
  },

  // Eliminar configuración
  remove: (): boolean => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CONFIG_KEY)
        return true
      }
      return false
    } catch (error) {
      console.error('Error removing config from localStorage:', error)
      return false
    }
  }
}

// Configuración por defecto
export const defaultConfig: DatabaseConfig = {
  server: 'localhost',
  user: '',
  password: '',
  database: '',
  port: 1433,
  instance: ''
}