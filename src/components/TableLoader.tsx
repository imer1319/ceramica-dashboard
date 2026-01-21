import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

interface TableLoaderProps {
  message?: string
}

export default function TableLoader({ message = 'Cargando datos...' }: TableLoaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}