'use client'

import React from 'react'
import DatabaseConfig from '../../components/DatabaseConfig'
import Header from '../../components/Header'
import { Box } from '@mui/material'

export default function ConfigPage() {
  const handleConfigSaved = () => {
    // Recargar la página para aplicar la nueva configuración
    window.location.href = '/'
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header title="Configuración de Base de Datos" />
      <DatabaseConfig onConfigSaved={handleConfigSaved} />
    </Box>
  )
}