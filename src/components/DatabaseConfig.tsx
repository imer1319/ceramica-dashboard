'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar
} from '@mui/material'
import {
  Storage,
  CheckCircle
} from '@mui/icons-material'
import { syndeoColors } from '../theme/colors'
import { DatabaseConfig } from '../lib/configStorage'

interface DatabaseConfigProps {
  onSave?: (config: DatabaseConfig) => void
  onConfigSaved?: () => void
  showAsDialog?: boolean
  open?: boolean
  onClose?: () => void
  initialConfig?: DatabaseConfig
  showTitle?: boolean
}

const defaultConfig: DatabaseConfig = {
  server: 'localhost',
  port: 1433,
  instance: '',
  database: 'ceramica',
  user: 'sa',
  password: ''
}

export default function DatabaseConfig({ 
  onSave,
  onConfigSaved, 
  showAsDialog = false, 
  open = true, 
  onClose,
  initialConfig,
  showTitle = true
}: DatabaseConfigProps) {
  const [config, setConfig] = useState<DatabaseConfig>(initialConfig || defaultConfig)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  // Verificar si estamos en un entorno Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      if (isElectron && window.electronAPI) {
        const savedConfig = await window.electronAPI.loadConfig()
        if (savedConfig) {
          setConfig({ ...defaultConfig, ...savedConfig, password: '' })
        }
      } else {
        // En el navegador, usar localStorage
        const savedConfig = localStorage.getItem('nextsql-config')
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig)
          setConfig({ ...defaultConfig, ...parsed, password: '' })
        }
      }
    } catch (error: unknown) {
      console.error('Error loading config:', error)
    }
  }

  const handleInputChange = (field: keyof DatabaseConfig) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'port' ? parseInt(event.target.value) || 1433 : event.target.value
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const testConnection = async () => {
    setTesting(true)
    setError(null)
    setSuccess(null)

    try {
      if (isElectron && window.electronAPI) {
        const result = await window.electronAPI.testConnection(config)
        if (result.success) {
          setSuccess('✅ Conexión exitosa')
        } else {
          setError('❌ Error de conexión: ' + result.message)
        }
      } else {
        // En el navegador, usar la API route
        const response = await fetch('/api/test-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config)
        })
        
        const result = await response.json()
        
        if (result.success) {
          setSuccess('✅ Conexión exitosa: ' + result.message)
        } else {
          setError('❌ Error de conexión: ' + result.error)
        }
      }
    } catch (error: unknown) {
      setError('❌ Error al probar conexión: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setTesting(false)
    }
  }

  const saveConfig = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (onSave) {
        // Usar la nueva función onSave si está disponible
        onSave(config)
        setSuccess('✅ Configuración guardada exitosamente')
        setSnackbarOpen(true)
      } else if (isElectron && window.electronAPI) {
        const success = await window.electronAPI.saveConfig(config)
        if (success) {
          setSuccess('✅ Configuración guardada exitosamente')
          setSnackbarOpen(true)
          if (onConfigSaved) {
            setTimeout(() => {
              onConfigSaved()
            }, 1500)
          }
        } else {
          setError('❌ Error al guardar la configuración')
        }
      } else {
        // En el navegador, guardar en localStorage
        localStorage.setItem('nextsql-config', JSON.stringify(config))
        setSuccess('✅ Configuración guardada en el navegador')
        setSnackbarOpen(true)
        if (onConfigSaved) {
          setTimeout(() => {
            onConfigSaved()
          }, 1500)
        }
      }
    } catch (error: unknown) {
      setError('❌ Error: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    saveConfig()
  }

  const configForm = (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Servidor SQL Server"
            value={config.server}
            onChange={handleInputChange('server')}
            required
            helperText="Ejemplo: localhost, 192.168.1.100, servidor.empresa.com"
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Puerto"
            type="number"
            value={config.port}
            onChange={handleInputChange('port')}
            required
            inputProps={{ min: 1, max: 65535 }}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Instancia (opcional)"
            value={config.instance}
            onChange={handleInputChange('instance')}
            helperText="Ejemplo: SQLEXPRESS"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Base de Datos"
            value={config.database}
            onChange={handleInputChange('database')}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Usuario"
            value={config.user}
            onChange={handleInputChange('user')}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={config.password}
            onChange={handleInputChange('password')}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="outlined"
              onClick={testConnection}
              disabled={testing || loading}
              startIcon={testing ? <CircularProgress size={20} /> : <CheckCircle />}
              sx={{ flex: 1 }}
            >
              {testing ? 'Probando...' : 'Probar Conexión'}
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading || testing}
              startIcon={loading ? <CircularProgress size={20} /> : <Storage />}
              sx={{ 
                flex: 1,
                background: syndeoColors.primary.main,
                '&:hover': {
                  background: syndeoColors.primary.dark
                }
              }}
            >
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )

  if (showAsDialog) {
    return (
      <>
        <Dialog 
          open={open} 
          onClose={onClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            color: syndeoColors.primary.main,
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            <Storage />
            Configuración de Base de Datos
          </DialogTitle>
          <DialogContent>
            {configForm}
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
            {success}
          </Alert>
        </Snackbar>
      </>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Storage sx={{ fontSize: 60, color: syndeoColors.primary.main, mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold', 
              color: syndeoColors.primary.main 
            }}>
              Configuración de Base de Datos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure la conexión a su servidor SQL Server
            </Typography>
          </Box>

          {configForm}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  )
}

// Declaración de tipos para window.electronAPI
declare global {
  interface Window {
    electronAPI?: {
      loadConfig: () => Promise<any>
      saveConfig: (config: any) => Promise<boolean>
      testConnection: (config: any) => Promise<{ success: boolean; message: string }>
      showErrorDialog: (title: string, content: string) => Promise<void>
      showInfoDialog: (title: string, content: string) => Promise<any>
      platform: string
      versions: any
    }
  }
}