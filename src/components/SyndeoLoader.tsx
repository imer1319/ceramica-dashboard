'use client'

import React from 'react'
import { Box, Typography, keyframes } from '@mui/material'
import Image from 'next/image'

// Animación de pulso para el logo
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`

// Animación de puntos de carga
const dots = keyframes`
  0%, 20% {
    color: rgba(0, 0, 0, 0);
    text-shadow:
      .25em 0 0 rgba(0, 0, 0, 0),
      .5em 0 0 rgba(0, 0, 0, 0);
  }
  40% {
    color: #1976d2;
    text-shadow:
      .25em 0 0 rgba(0, 0, 0, 0),
      .5em 0 0 rgba(0, 0, 0, 0);
  }
  60% {
    text-shadow:
      .25em 0 0 #1976d2,
      .5em 0 0 rgba(0, 0, 0, 0);
  }
  80%, 100% {
    text-shadow:
      .25em 0 0 #1976d2,
      .5em 0 0 #1976d2;
  }
`

interface SyndeoLoaderProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
}

export default function SyndeoLoader({ 
  message = 'Cargando datos del cliente', 
  size = 'medium' 
}: SyndeoLoaderProps) {
  const logoSize = {
    small: { width: 80, height: 24 },
    medium: { width: 120, height: 36 },
    large: { width: 160, height: 48 }
  }[size]

  const containerHeight = {
    small: '200px',
    medium: '400px', 
    large: '500px'
  }[size]

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: containerHeight,
        gap: 3
      }}
    >
      {/* Logo de Syndeo con animación */}
      <Box
        sx={{
          animation: `${pulse} 2s ease-in-out infinite`,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Image
          src="/syndeo_logo_02.png"
          alt="Syndeo Logo"
          width={logoSize.width}
          height={logoSize.height}
          priority
        />
      </Box>

      {/* Mensaje de carga */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant={size === 'large' ? 'h6' : 'body1'} 
          color="text.primary"
          sx={{ mb: 1, fontWeight: 500 }}
        >
          {message}
        </Typography>
        
        {/* Puntos animados */}
        <Typography 
          variant="h6" 
          sx={{ 
            animation: `${dots} 1.4s ease-in-out infinite`,
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            color: '#1976d2'
          }}
        >
          •••
        </Typography>
      </Box>

      {/* Barra de progreso sutil */}
      <Box 
        sx={{ 
          width: '200px', 
          height: '2px', 
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderRadius: '1px',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: '40%',
            height: '100%',
            backgroundColor: '#1976d2',
            borderRadius: '1px',
            animation: 'loading-bar 2s ease-in-out infinite',
            '@keyframes loading-bar': {
              '0%': {
                transform: 'translateX(-100%)'
              },
              '50%': {
                transform: 'translateX(250%)'
              },
              '100%': {
                transform: 'translateX(-100%)'
              }
            }
          }}
        />
      </Box>
    </Box>
  )
}