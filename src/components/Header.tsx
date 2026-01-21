import React from 'react'
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material'
import { Settings } from '@mui/icons-material'
import Image from 'next/image'

interface HeaderProps {
  title?: string
  onConfigClick?: () => void
  showConfigButton?: boolean
}

export default function Header({ title = 'Dashboard', onConfigClick, showConfigButton = false }: HeaderProps) {
  return (
    <AppBar position="static" sx={{ bgcolor: 'black', boxShadow: 1, height: '150px' }}>
      <Toolbar sx={{ justifyContent: 'space-between', height: '100%', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Image
            src="/syndeo_logo_02.png"
            alt="Syndeo Logo"
            width={160}
            height={48}
            priority
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'medium' }}>
            {title}
          </Typography>
          {showConfigButton && (
            <Tooltip title="Configuración de Base de Datos">
              <IconButton
                onClick={onConfigClick}
                sx={{ color: 'white' }}
              >
                <Settings />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}