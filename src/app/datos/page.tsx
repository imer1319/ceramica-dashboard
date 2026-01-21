'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
// Removed direct database import - now using API route
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  TablePagination,
  InputAdornment,
  CircularProgress,
  Button,
  Collapse,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  TableChart,
  Search,
  People,
  Email,
  Phone,
  LocationOn,
  ExpandMore,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Business,
  PersonAdd,
  AccountBalance,
  Payments,
  Receipt,
  FilterList,
  DateRange,
  Clear,
  PictureAsPdf,
  Print,
  Close
} from '@mui/icons-material'
import Header from '../../components/Header'
import { syndeoColors } from '../../theme/colors'

interface EntidadRaw {
  Entnroid: number
  Entnombr: string
  Entemail: string
  EntRazSoc: string
  EntDomic: string
  EntLocal: string
  EntProvi: string
  EntCodPo: string
  EntTelef: string
  EntCUIT: string
  EntActEc: string
  EntUsLog: string
  EntFeLog: string
  EntSedronar: string
  EntTelef2: string
  EntCodigo: string
  // Nuevos campos para totales
  TotalDeudas?: number
  SaldoTotal?: number
  CantidadDeudas?: number
  TotalMovimientos?: number
  CantidadMovimientos?: number
}

export default function DatosPage() {
  const [datos, setDatos] = useState<EntidadRaw[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage] = useState(50)
  // Estados simplificados - ya no necesitamos expandir filas
  
  const router = useRouter()

  // Accesores tolerantes a mayúsculas/minúsculas y variantes de nombre de columna
  const getId = (row: any) => row?.Entnroid ?? row?.EntNroId ?? row?.ENTNROID
  const getNombre = (row: any) => row?.Entnombr ?? row?.EntNombr ?? row?.ENTNOMBR
  const getEmail = (row: any) => row?.Entemail ?? row?.EntEmail ?? row?.ENTEMAIL
  const getRazSoc = (row: any) => row?.EntRazSoc ?? row?.EntRazsoc ?? row?.ENTRAZSOC
  const getTelef = (row: any) => row?.EntTelef ?? row?.Enttelef ?? row?.ENTTELEF

  // Función para redireccionar al cliente
  const redirectToClient = (clienteId: number) => {
    router.push(`/cliente/${clienteId}`)
  }
  
  // Cargar datos desde la API
  useEffect(() => {
    let isMounted = true
    
    const cargarDatos = async () => {
      try {
        setError(null)
        setLoading(true)
        console.log('[DATOS] 🔍 Obteniendo datos desde API...')
        const response = await fetch('/api/datos')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (!isMounted) return
        
        if (result.success) {
          setDatos(result.data)
          console.log(`[DATOS] ✅ ${result.count} registros obtenidos desde API`)
        } else {
          setError(result.error || 'Error desconocido')
          console.error('[DATOS] ❌ Error desde API:', result.error)
        }
      } catch (error: any) {
        if (!isMounted) return
        
        setError(error.message)
        console.error('[DATOS] ❌ Error al consultar API:', error.message)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    cargarDatos()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Filtrar datos basado en el término de búsqueda
  const filteredDatos = datos.filter((entidad: any) => {
    const nombre = getNombre(entidad)?.toLowerCase() || ''
    const email = getEmail(entidad)?.toLowerCase() || ''
    const razsoc = getRazSoc(entidad)?.toLowerCase() || ''
    const local = (entidad.EntLocal ?? entidad.ENTLOCAL ?? entidad.Entlocal ?? '').toString().toLowerCase()
    const provi = (entidad.EntProvi ?? entidad.ENTPROVI ?? entidad.Entprovi ?? '').toString().toLowerCase()
    const idStr = (getId(entidad) ?? '').toString()
    return (
      nombre.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      razsoc.includes(searchTerm.toLowerCase()) ||
      local.includes(searchTerm.toLowerCase()) ||
      provi.includes(searchTerm.toLowerCase()) ||
      idStr.includes(searchTerm)
    )
  })

  // Datos paginados
  const paginatedDatos = filteredDatos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header title="Gestión de Clientes" />
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, mt: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: syndeoColors.primary.main, display: 'flex', alignItems: 'center', gap: 2 }}>
            <People sx={{ fontSize: 40, color: syndeoColors.secondary.main }} />
            Gestión de Clientes
          </Typography>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">Error al cargar los datos:</Typography>
            <Typography>{error}</Typography>
          </Alert>
        ) : (
          <Grid container spacing={3}>

            {/* Tabla de datos */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Datos completos ({filteredDatos.length.toLocaleString()} de {datos.length.toLocaleString()} registros)
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="Buscar por nombre, email, razón social..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setPage(0) // Reset page when searching
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ minWidth: 300 }}
                    />
                  </Box>
                  <TableContainer component={Paper} sx={{ maxHeight: 600, width: '100%' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: syndeoColors.primary.main, color: 'white', width: '100px', p: 1 }}>Acciones</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: syndeoColors.primary.main, color: 'white', width: '60px', p: 1 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: syndeoColors.primary.main, color: 'white', width: '120px', p: 1 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: syndeoColors.primary.main, color: 'white', width: '150px', p: 1 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: syndeoColors.primary.main, color: 'white', width: '120px', p: 1 }}>Razón Social</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: syndeoColors.primary.main, color: 'white', width: '100px', p: 1 }}>Teléfono</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedDatos.map((entidad: any, index) => (
                          <React.Fragment key={getId(entidad) ?? index}>
                            <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                              <TableCell sx={{ p: 1, width: '80px' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => {
                                    const id = getId(entidad)
                                    if (id !== undefined && id !== null) {
                                      redirectToClient(Number(id))
                                    }
                                  }}
                                  title="Ver detalles del cliente"
                                  sx={{ minWidth: '60px', fontSize: '0.75rem' }}
                                >
                                  Ver
                                </Button>
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '80px' }}>
                                <Chip 
                  label={getId(entidad)} 
                  variant="outlined" 
                  size="small" 
                  sx={{ 
                    borderColor: syndeoColors.primary.main, 
                    color: syndeoColors.primary.main 
                  }} 
                />
                              </TableCell>
                              <TableCell sx={{ p: 1, fontWeight: 'medium', width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {getNombre(entidad)?.trim() || ''}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '180px' }}>
                                {getEmail(entidad)?.trim() ? (
                                  <Chip 
                    label={getEmail(entidad)!.trim()} 
                    variant="outlined" 
                    size="small" 
                    sx={{ 
                      borderColor: syndeoColors.accent.main, 
                      color: syndeoColors.accent.main 
                    }} 
                  />
                                ) : null}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {getRazSoc(entidad)?.trim() || ''}
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {getTelef(entidad)?.trim() || ''}
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredDatos.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[50]}
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    labelRowsPerPage="Filas por página:"
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      '& .MuiTablePagination-toolbar': {
                        justifyContent: 'center'
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  )
}