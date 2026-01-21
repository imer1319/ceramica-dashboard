import React from 'react'
import { Box, Typography, SvgIconProps } from '@mui/material'
import { Inbox } from '@mui/icons-material'

interface EmptyStateProps {
  icon?: React.ReactElement<SvgIconProps>
  title?: string
  description?: string
}

export default function EmptyState({ 
  icon = <Inbox />, 
  title = 'Sin datos', 
  description = 'No hay información disponible para mostrar.' 
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
        textAlign: 'center'
      }}
    >
      <Box sx={{ color: 'text.disabled', fontSize: '3rem' }}>
        {React.cloneElement(icon, { fontSize: 'inherit' })}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400 }}>
        {description}
      </Typography>
    </Box>
  )
}