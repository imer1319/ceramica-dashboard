'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert
} from '@mui/material'
import { DatabaseConfig } from '../lib/configStorage'
import { useConfig } from '../hooks/useConfig'
import DatabaseConfigComponent from './DatabaseConfig'

interface ConfigModalProps {
  open: boolean
  onClose: () => void
  onConfigSave: (config: DatabaseConfig) => void
}

export default function ConfigModal({ open, onClose, onConfigSave }: ConfigModalProps) {
  const { config, removeConfig } = useConfig()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleConfigSave = (newConfig: DatabaseConfig) => {
    onConfigSave(newConfig)
    onClose()
  }

  const handleDeleteConfig = () => {
    removeConfig()
    setShowDeleteConfirm(false)
    onClose()
    // Recargar la página para mostrar el setup inicial
    window.location.reload()
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        Configuración de Base de Datos
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {showDeleteConfirm ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              ¿Está seguro que desea eliminar la configuración actual? 
              Esta acción no se puede deshacer y tendrá que configurar nuevamente la conexión.
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDeleteConfig}
              >
                Eliminar Configuración
              </Button>
            </Box>
          </Box>
        ) : (
          <DatabaseConfigComponent 
            onSave={handleConfigSave}
            initialConfig={config || undefined}
            showTitle={false}
          />
        )}
      </DialogContent>
      
      {!showDeleteConfirm && (
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="error"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Eliminar Configuración
          </Button>
          <Button 
            variant="outlined" 
            onClick={onClose}
          >
            Cancelar
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}