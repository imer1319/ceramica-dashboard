'use client'

import React, { useState } from 'react'
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
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material'
import {
  Storage,
  CheckCircle,
  Settings
} from '@mui/icons-material'
import { syndeoColors } from '../theme/colors'
import { DatabaseConfig, defaultConfig } from '../lib/configStorage'

interface InitialSetupProps {
  onConfigSaved: (config: DatabaseConfig) => void
}

const steps = [
  'Bienvenida',
  'Configuración de Base de Datos',
  'Verificación'
]

export default function InitialSetup({ onConfigSaved }: InitialSetupProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [config, setConfig] = useState<DatabaseConfig>(defaultConfig)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (field: keyof DatabaseConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'port' ? parseInt(event.target.value) || 1433 : event.target.value
    setConfig(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const testConnection = async () => {
    setTesting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess('¡Conexión exitosa! La configuración es válida.')
        setTimeout(() => {
          setActiveStep(2)
        }, 1500)
      } else {
        setError(result.error || 'Error al conectar con la base de datos')
      }
    } catch (err) {
      setError('Error de red al probar la conexión')
    } finally {
      setTesting(false)
    }
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simular guardado (en una aplicación real, esto podría ser una llamada a API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      onConfigSaved(config)
    } catch (err) {
      setError('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (activeStep === 1) {
      testConnection()
    } else {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
    setError(null)
    setSuccess(null)
  }

  const isConfigValid = () => {
    return config.server && config.user && config.password && config.database && config.port > 0
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box textAlign="center" py={4}>
            <Storage sx={{ fontSize: 80, color: syndeoColors.primary.main, mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: syndeoColors.primary.main, fontWeight: 'bold' }}>
              ¡Bienvenido a NextSQL!
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Sistema de Gestión de Base de Datos
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto' }}>
              Para comenzar a usar NextSQL, necesitamos configurar la conexión a su servidor SQL Server.
              Este proceso solo tomará unos minutos y le permitirá acceder a todas las funcionalidades del sistema.
            </Typography>
            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>¿Qué necesita tener listo?</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Dirección del servidor SQL Server<br/>
                • Usuario y contraseña de acceso<br/>
                • Nombre de la base de datos<br/>
                • Puerto de conexión (por defecto 1433)
              </Typography>
            </Box>
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: syndeoColors.primary.main, mb: 3 }}>
              Configuración de Base de Datos
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Ingrese los datos de conexión a su servidor SQL Server:
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Servidor"
                  value={config.server}
                  onChange={handleInputChange('server')}
                  placeholder="localhost o IP del servidor"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Puerto"
                  type="number"
                  value={config.port}
                  onChange={handleInputChange('port')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Usuario"
                  value={config.user}
                  onChange={handleInputChange('user')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  value={config.password}
                  onChange={handleInputChange('password')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Base de Datos"
                  value={config.database}
                  onChange={handleInputChange('database')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Instancia (opcional)"
                  value={config.instance}
                  onChange={handleInputChange('instance')}
                  placeholder="SQLEXPRESS"
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {success}
              </Alert>
            )}
          </Box>
        )

      case 2:
        return (
          <Box textAlign="center" py={4}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
              ¡Configuración Completada!
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              La conexión a la base de datos ha sido verificada exitosamente
            </Typography>
            
            <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Resumen de la configuración:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Servidor: {config.server}:{config.port}<br/>
                Usuario: {config.user}<br/>
                Base de Datos: {config.database}
                {config.instance && <><br/>Instancia: {config.instance}</>}
              </Typography>
            </Paper>

            <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
              Haga clic en "Finalizar" para guardar la configuración y comenzar a usar NextSQL.
            </Typography>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="md">
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {renderStepContent()}

            <Divider sx={{ mt: 4, mb: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || loading || testing}
              >
                Atrás
              </Button>

              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSaveConfig}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Settings />}
                    sx={{ bgcolor: syndeoColors.primary.main }}
                  >
                    {loading ? 'Guardando...' : 'Finalizar'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={activeStep === 1 && (!isConfigValid() || testing)}
                    startIcon={testing ? <CircularProgress size={20} /> : null}
                    sx={{ bgcolor: syndeoColors.primary.main }}
                  >
                    {testing ? 'Probando...' : activeStep === 1 ? 'Probar Conexión' : 'Siguiente'}
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}