'use client'

import { useState, useEffect } from 'react'
import { DatabaseConfig, configStorage, defaultConfig } from '../lib/configStorage'

export const useConfig = () => {
  const [config, setConfig] = useState<DatabaseConfig | null>(null)
  const [isConfigured, setIsConfigured] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  // Cargar configuración al inicializar
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = configStorage.load()
        if (savedConfig) {
          setConfig(savedConfig)
          setIsConfigured(true)
        } else {
          setConfig(defaultConfig)
          setIsConfigured(false)
        }
      } catch (error) {
        console.error('Error loading configuration:', error)
        setConfig(defaultConfig)
        setIsConfigured(false)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  // Guardar configuración
  const saveConfig = (newConfig: DatabaseConfig): boolean => {
    try {
      const success = configStorage.save(newConfig)
      if (success) {
        setConfig(newConfig)
        setIsConfigured(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Error saving configuration:', error)
      return false
    }
  }

  // Eliminar configuración
  const removeConfig = (): boolean => {
    try {
      const success = configStorage.remove()
      if (success) {
        setConfig(defaultConfig)
        setIsConfigured(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Error removing configuration:', error)
      return false
    }
  }

  // Verificar si la configuración es válida
  const isValidConfig = (configToCheck?: DatabaseConfig): boolean => {
    const checkConfig = configToCheck || config
    if (!checkConfig) return false
    
    return !!
      checkConfig.server &&
      checkConfig.user &&
      checkConfig.password &&
      checkConfig.database &&
      checkConfig.port > 0
  }

  return {
    config,
    isConfigured,
    loading,
    saveConfig,
    removeConfig,
    isValidConfig
  }
}