'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  TablePagination,
  CircularProgress,
  Button,
  Collapse,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment
} from '@mui/material'
import {
  PersonAdd,
  AccountBalance,
  Payments,
  Receipt,
  KeyboardArrowDown,
  KeyboardArrowUp,
  ArrowBack,
  Home,
  Person,
  DateRange,
  Clear
} from '@mui/icons-material'
import TableLoader from '../../../components/TableLoader'
import { formatCurrencyARS, formatQuantity } from '../../../lib/formatters'
import EmptyState from '../../../components/EmptyState'
import Header from '../../../components/Header'
import SyndeoLoader from '../../../components/SyndeoLoader'
import { syndeoColors } from '../../../theme/colors'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

export default function ClientePage() {
  const params = useParams()
  const router = useRouter()
  const clienteId = params.id as string
  
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [datosCliente, setDatosCliente] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para facturas
  const [facturas, setFacturas] = useState<any[]>([])
  const [facturasExpandidas, setFacturasExpandidas] = useState<Set<string>>(new Set())
  const [detallesFactura, setDetallesFactura] = useState<{[key: string]: any[]}>({}) 
  const [cargandoDetalles, setCargandoDetalles] = useState<Set<string>>(new Set())
  const [paginaFacturas, setPaginaFacturas] = useState(0)
  const [totalFacturas, setTotalFacturas] = useState(0)
  const [filtroFecha, setFiltroFecha] = useState('')
  const filasPorPagina = 20

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPaginaFacturas(newPage)
  }

  // Función para filtrar facturas por fecha
  const filtrarFacturasPorFecha = (facturas: any[], fechaBusqueda: string) => {
    if (!fechaBusqueda.trim()) return facturas
    
    return facturas.filter(factura => {
      // Usar los mismos campos que en la visualización
      const fechaFactura = factura.FactFecha || factura.fecha
      if (!fechaFactura) return false
      
      try {
        // Convertir la fecha de la factura a formato dd/mm/aaaa
        const fecha = new Date(fechaFactura)
        
        // Formatear manualmente para asegurar formato dd/mm/aaaa
        const dia = fecha.getDate().toString().padStart(2, '0')
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0')
        const año = fecha.getFullYear().toString()
        const fechaFormateada = `${dia}/${mes}/${año}`
        
        // Buscar coincidencia parcial o completa
        return fechaFormateada.includes(fechaBusqueda)
      } catch (error) {
        console.error('Error al formatear fecha:', error)
        return false
      }
    })
  }

  // Manejar cambio de filtro instantáneo
  const handleFiltroFechaChange = (valor: string) => {
    setFiltroFecha(valor)
  }

  // Cargar datos del cliente
  useEffect(() => {
    let isMounted = true
    
    const cargarDatosCliente = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/datos-relacionados?id=${clienteId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (!isMounted) return
        
        if (result.success) {
          setDatosCliente(result.data)
          setFacturas(result.data.facturas || [])
          setTotalFacturas(result.data.facturas?.length || 0)
        } else {
          setError(result.error || 'Error al cargar los datos del cliente')
        }
      } catch (error) {
        if (!isMounted) return
        
        setError('Error de conexión al servidor')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (clienteId) {
      cargarDatosCliente()
    }

    return () => {
      isMounted = false
    }
  }, [clienteId])

  // Cargar automáticamente los detalles de las facturas visibles
  useEffect(() => {
    const cargarDetallesVisibles = async () => {
      if (facturas.length > 0 && tabValue === 3) {
        const facturasFiltradas = filtrarFacturasPorFecha(facturas, filtroFecha)
        const facturasPaginadas = facturasFiltradas.slice(
          paginaFacturas * filasPorPagina,
          paginaFacturas * filasPorPagina + filasPorPagina
        )
        
        for (const factura of facturasPaginadas) {
          const facturaId = `${clienteId}-${factura.FactNroId || factura.id}-${facturasPaginadas.indexOf(factura)}`
          if (!detallesFactura[facturaId] && !cargandoDetalles.has(facturaId)) {
            await cargarDetalleFactura(facturaId, factura)
          }
        }
      }
    }

    cargarDetallesVisibles()
  }, [facturas, tabValue, clienteId, detallesFactura, cargandoDetalles, paginaFacturas, filtroFecha])

  // Resetear página cuando cambie el filtro de fecha
  useEffect(() => {
    setPaginaFacturas(0)
  }, [filtroFecha])

  // Función para cargar detalles de factura
  const cargarDetalleFactura = async (facturaId: string, factura: any) => {
    if (detallesFactura[facturaId]) {
      return // Ya tenemos los detalles
    }

    setCargandoDetalles(prev => new Set([...prev, facturaId]))

    try {
      const params = new URLSearchParams({
        cveNroId: factura.CVeNroId?.toString() || '1',
        faTipFa: factura.FaTipFa || 'A', 
        faNroF1: factura.FaNroF1?.toString() || '0',
        faNroF2: factura.FaNroF2?.toString() || '0'
      })

      const response = await fetch(`/api/factura/${facturaId}?${params}`)
      const result = await response.json()

      if (result.success && result.data) {
        setDetallesFactura(prev => ({
          ...prev,
          [facturaId]: result.data
        }))
      }
    } catch (error) {
      console.error('Error al cargar detalle de factura:', error)
    } finally {
      setCargandoDetalles(prev => {
        const newSet = new Set(prev)
        newSet.delete(facturaId)
        return newSet
      })
    }
  }

  // Función para manejar expansión de facturas
  const toggleFacturaDetalle = async (facturaId: string, factura: any) => {
    const isExpanding = !facturasExpandidas.has(facturaId)
    
    setFacturasExpandidas(prev => {
      const newSet = new Set(prev)
      if (newSet.has(facturaId)) {
        newSet.delete(facturaId)
      } else {
        newSet.add(facturaId)
      }
      return newSet
    })

    if (isExpanding) {
      await cargarDetalleFactura(facturaId, factura)
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Header title="Cargando cliente..." />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              color="inherit"
              onClick={() => router.push('/')}
            >
              <Home sx={{ mr: 0.5 }} fontSize="inherit" />
              Inicio
            </Link>
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              color="inherit"
              onClick={() => router.push('/datos')}
            >
              Datos
            </Link>
            <Typography
              sx={{ display: 'flex', alignItems: 'center' }}
              color="text.primary"
            >
              <Person sx={{ mr: 0.5 }} fontSize="inherit" />
              Cliente {clienteId}
            </Typography>
          </Breadcrumbs>

          {/* Botón de regreso */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/datos')}
            sx={{ mb: 3 }}
          >
            Volver a Datos
          </Button>

          <SyndeoLoader 
            message="Cargando datos del cliente" 
            size="large"
          />
        </Container>
      </Box>
    )
  }

  if (error || !datosCliente) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'No se encontraron datos del cliente'}
        </Alert>
      </Container>
    )
  }

  // Obtener facturas filtradas
  const facturasFiltradas = filtrarFacturasPorFecha(facturas, filtroFecha)
  
  // Obtener facturas paginadas
  const facturasPaginadas = facturasFiltradas.slice(
    paginaFacturas * filasPorPagina,
    paginaFacturas * filasPorPagina + filasPorPagina
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Header title={`Cliente: ${datosCliente.entidad?.Entnombr || clienteId}`} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => router.push('/')}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Inicio
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => router.push('/datos')}
        >
          Datos
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <Person sx={{ mr: 0.5 }} fontSize="inherit" />
          Cliente {clienteId}
        </Typography>
      </Breadcrumbs>

      {/* Botón de regreso */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Volver
      </Button>

      {/* Título */}
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Cliente: {datosCliente.entidad?.Entnombr || `ID ${clienteId}`}
      </Typography>

      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="pestañas del cliente"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: syndeoColors.secondary.main
            },
            '& .MuiTab-root': {
              color: syndeoColors.neutral[600],
              '&.Mui-selected': {
                color: syndeoColors.primary.main
              }
            }
          }}
        >
          <Tab 
            label="Información del Cliente" 
            icon={<PersonAdd />} 
            iconPosition="start"
            {...a11yProps(0)} 
          />
          <Tab 
            label="Deuda" 
            icon={<AccountBalance />} 
            iconPosition="start"
            {...a11yProps(1)} 
          />
          <Tab 
            label="Movimientos" 
            icon={<Payments />} 
            iconPosition="start"
            {...a11yProps(2)} 
          />
          <Tab 
            label="Facturas" 
            icon={<Receipt />} 
            iconPosition="start"
            {...a11yProps(3)} 
          />
        </Tabs>
      </Box>

      {/* Panel de Información del Cliente */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: syndeoColors.primary.main, display: 'flex', alignItems: 'center' }}>
                  <PersonAdd sx={{ mr: 1 }} />
                  Información del Cliente
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Nombre" 
                          secondary={datosCliente.entidad?.Entnombr || ''} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Razón Social" 
                          secondary={datosCliente.entidad?.EntRazSoc || ''} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Email" 
                          secondary={datosCliente.entidad?.Entemail || ''} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="CUIT" 
                          secondary={datosCliente.entidad?.EntCUIT || ''} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Dirección" 
                          secondary={datosCliente.entidad?.EntDomic || ''} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Localidad" 
                          secondary={datosCliente.entidad?.EntLocal || ''} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Provincia" 
                          secondary={datosCliente.entidad?.EntProvi || ''} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Teléfono" 
                          secondary={datosCliente.cliente?.EntTelef || datosCliente.cliente?.EntTelef2 || ''} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Panel de Deuda */}
      <TabPanel value={tabValue} index={1}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: syndeoColors.error, display: 'flex', alignItems: 'center' }}>
              <AccountBalance sx={{ mr: 1 }} />
              Deuda
            </Typography>
            {datosCliente.deuda && datosCliente.deuda.filter((deuda: any) => deuda.DeuSaldo !== 0).length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Sucursal ID</strong></TableCell>
                      <TableCell><strong>Deuda ID</strong></TableCell>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell align="right"><strong>Importe</strong></TableCell>
                      <TableCell align="right"><strong>Saldo</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosCliente.deuda
                      .filter((deuda: any) => deuda.DeuSaldo !== 0)
                      .map((deuda: any, index: number) => (
                      <TableRow key={`${deuda.DeuNroId}-${index}`}>
                        <TableCell>{deuda.SucNroId}</TableCell>
                        <TableCell>
                          <Chip 
                            label={deuda.DeudaNumero || deuda.DeuNroId} 
                            color="info" 
                            variant="outlined" 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>
                          {deuda.DeuFecha ? new Date(deuda.DeuFecha).toLocaleDateString('es-AR') : 'Sin fecha'}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrencyARS(deuda.DeuImporte || 0)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={formatCurrencyARS(deuda.DeuSaldo || 0)}
                            color={deuda.DeuSaldo > 0 ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Fila de Total */}
                    <TableRow sx={{ bgcolor: 'grey.200', fontWeight: 'bold' }}>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="body1" fontWeight="bold">
                          TOTAL DEUDA:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={formatCurrencyARS(datosCliente.deuda
                            .filter((deuda: any) => deuda.DeuSaldo !== 0)
                            .reduce((total: number, deuda: any) => total + (deuda.DeuSaldo || 0), 0))}
                          color={datosCliente.deuda
                            .filter((deuda: any) => deuda.DeuSaldo !== 0)
                            .reduce((total: number, deuda: any) => total + (deuda.DeuSaldo || 0), 0) > 0 ? 'error' : 'success'}
                          size="medium"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState 
                icon={<AccountBalance />}
                title="Sin deudas"
                description="No hay deudas registradas para este cliente."
              />
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Panel de Movimientos */}
      <TabPanel value={tabValue} index={2}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: syndeoColors.secondary.main, display: 'flex', alignItems: 'center' }}>
              <Payments sx={{ mr: 1 }} />
              Movimientos
            </Typography>
            {datosCliente.movimientosCombinados && datosCliente.movimientosCombinados.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Sucursal ID</strong></TableCell>
                      <TableCell><strong>Movimiento ID</strong></TableCell>
                      <TableCell><strong>Cuenta ID</strong></TableCell>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell align="right"><strong>Debe</strong></TableCell>
                      <TableCell align="right"><strong>Haber</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosCliente.movimientosCombinados.slice(0, 50).map((movimiento: any, index: number) => (
                      <TableRow key={`${movimiento.MovNroId}-${index}`}>
                        <TableCell>{movimiento.SucNroId}</TableCell>
                        <TableCell>
                          <Chip 
                  label={movimiento.MovNroId} 
                  variant="outlined" 
                  size="small" 
                  sx={{ 
                    borderColor: syndeoColors.primary.main, 
                    color: syndeoColors.primary.main 
                  }} 
                />
                        </TableCell>
                        <TableCell>{movimiento.CtmNroId}</TableCell>
                        <TableCell>
                          {movimiento.MovFecha ? new Date(movimiento.MovFecha).toLocaleDateString('es-AR') : 'Sin fecha'}
                        </TableCell>
                        <TableCell align="right">
                          {movimiento.Debe ? (
                            <Chip 
                              label={formatCurrencyARS(movimiento.Debe)}
                              color="error" 
                              variant="outlined" 
                              size="small" 
                            />
                          ) : (
                            <Typography variant="body2" color="text.disabled">-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {movimiento.Haber ? (
                            <Chip 
                              label={formatCurrencyARS(movimiento.Haber)}
                              color="success" 
                              variant="outlined" 
                              size="small" 
                            />
                          ) : (
                            <Typography variant="body2" color="text.disabled">-</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <EmptyState 
                icon={<Payments />}
                title="Sin movimientos"
                description="No hay movimientos registrados para este cliente."
              />
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Panel de Facturas */}
      <TabPanel value={tabValue} index={3}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: syndeoColors.accent.main, display: 'flex', alignItems: 'center' }}>
              <Receipt sx={{ mr: 1 }} />
              Facturas ({totalFacturas} total)
            </Typography>
            
            {/* Campo de búsqueda por fecha */}
            <Box sx={{ mb: 2 }}>
              <TextField
                 size="small"
                 placeholder="Buscar por fecha (dd/mm/aaaa)"
                 value={filtroFecha}
                 onChange={(e) => handleFiltroFechaChange(e.target.value)}
                 inputProps={{
                   maxLength: 10
                 }}
                 InputProps={{
                   startAdornment: (
                     <InputAdornment position="start">
                       <DateRange sx={{ color: 'action.active' }} />
                     </InputAdornment>
                   ),
                   endAdornment: filtroFecha && (
                     <InputAdornment position="end">
                       <IconButton
                         size="small"
                         onClick={() => handleFiltroFechaChange('')}
                         edge="end"
                       >
                         <Clear />
                       </IconButton>
                     </InputAdornment>
                   )
                 }}
                 sx={{ minWidth: 250 }}
               />
              {filtroFecha && (
                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  {facturasFiltradas.length} de {totalFacturas} facturas
                </Typography>
              )}
            </Box>
            
            {facturas.length > 0 ? (
              <>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflowX: 'hidden' }}>
                  <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ p: 1, width: '50px' }}><strong>Detalle</strong></TableCell>
                        <TableCell sx={{ p: 1, width: '120px' }}><strong>Número</strong></TableCell>
                        <TableCell sx={{ p: 1, width: '100px' }}><strong>Fecha</strong></TableCell>
                        <TableCell sx={{ p: 1, width: '100px' }}><strong>Tipo</strong></TableCell>
                        <TableCell align="right" sx={{ p: 1, width: '120px' }}><strong>Total</strong></TableCell>
                        <TableCell sx={{ p: 1, width: '100px' }}><strong>Estado</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {facturasPaginadas.map((factura: any, index: number) => {
                        const facturaId = `${clienteId}-${factura.FactNroId || factura.id}-${index}`
                        const isExpanded = facturasExpandidas.has(facturaId)
                        return (
                          <React.Fragment key={facturaId}>
                            <TableRow 
                              hover 
                              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'success.50' } }}
                              onClick={() => toggleFacturaDetalle(facturaId, factura)}
                            >
                              <TableCell sx={{ p: 1, width: '50px' }}>
                                <IconButton size="small">
                                  {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                </IconButton>
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '120px' }}>
                                <Chip 
                                  label={factura.FactNumero || factura.numero || ''} 
                                  color="success" 
                                  variant="outlined" 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '100px' }}>
                                {factura.FactFecha || factura.fecha ? 
                                  new Date(factura.FactFecha || factura.fecha).toLocaleDateString('es-AR') : 
                                  ''
                                }
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '100px' }}>{factura.FactTipo || factura.tipo || ''}</TableCell>
                              <TableCell align="right" sx={{ p: 1, width: '120px' }}>
                                <Chip 
                                  label={formatCurrencyARS(factura.FactTotal || factura.total || 0)}
                                  color="success" 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell sx={{ p: 1, width: '100px' }}>
                                <Chip 
                                  label={factura.FactEstado || factura.estado || ''} 
                                  color="info" 
                                  variant="outlined" 
                                  size="small" 
                                />
                              </TableCell>
                            </TableRow>
                            
                            {/* Segunda línea con detalles de la factura */}
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell colSpan={6} sx={{ py: 1, px: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {/* Información general */}
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      <strong>Cliente:</strong> {detallesFactura[facturaId]?.[0]?.FaNombr || 'Cargando...'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      <strong>CUIT:</strong> {detallesFactura[facturaId]?.[0]?.FaCuit || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      <strong>Neto Gravado:</strong> {formatCurrencyARS((detallesFactura[facturaId]?.[0]?.FaNetGr || 0))}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      <strong>Total Factura:</strong> {formatCurrencyARS(detallesFactura[facturaId]?.[0]?.FaTotal || 0)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      <strong>Total Descuento:</strong> {formatCurrencyARS(detallesFactura[facturaId]?.[0]?.FaDesct || 0)}
                                    </Typography>
                                  </Box>
                                  
                                  {/* Tabla de artículos */}
                                  {cargandoDetalles.has(facturaId) ? (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                      🔄 Cargando detalles de artículos...
                                    </Typography>
                                  ) : detallesFactura[facturaId] && detallesFactura[facturaId].length > 0 ? (
                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
                                        📋 Detalle de Artículos ({detallesFactura[facturaId].length}):
                                      </Typography>
                                      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', maxHeight: '300px' }}>
                                        <Table size="small" sx={{ minWidth: 600 }}>
                                          <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                                              <TableCell sx={{ p: 1, width: '18%' }}><strong>Artículo</strong></TableCell>
                                              <TableCell align="center" sx={{ p: 1, width: '8%' }}><strong>Código</strong></TableCell>
                                              <TableCell align="center" sx={{ p: 1, width: '7%' }}><strong>Cantidad</strong></TableCell>
                                              <TableCell align="right" sx={{ p: 1, width: '10%' }}><strong>Precio Unit.</strong></TableCell>
                                              <TableCell align="right" sx={{ p: 1, width: '10%' }}><strong>Neto</strong></TableCell>
                                              <TableCell align="right" sx={{ p: 1, width: '8%' }}><strong>IVA</strong></TableCell>
                                              <TableCell align="right" sx={{ p: 1, width: '8%' }}><strong>Total</strong></TableCell>
                                              <TableCell align="right" sx={{ p: 1, width: '7%' }}><strong>%Dto</strong></TableCell>
                                              <TableCell align="right" sx={{ p: 1, width: '12%' }}><strong>Precio Unit. Neto c/Dto</strong></TableCell>
                                              <TableCell align="right" sx={{ p: 1, width: '12%' }}><strong>Neto con dto</strong></TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {detallesFactura[facturaId].map((detalle: any, index: number) => (
                                              <TableRow key={index} hover>
                                                <TableCell sx={{ p: 1, width: '18%' }}>
                                                  <Typography variant="body2" fontWeight="medium">
                                                    {detalle.DeArtDescr || 'Sin descripción'}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell align="center" sx={{ p: 1, width: '8%' }}>
                                                  {detalle.ArtCodigo || 'N/A'}
                                                </TableCell>
                                                <TableCell align="center" sx={{ p: 1, width: '7%' }}>
                                                  <Chip 
                                                    label={formatQuantity(detalle.DeCanti || 0)} 
                                                    color="info" 
                                                    variant="outlined" 
                                                    size="small" 
                                                  />
                                                </TableCell>
                                                <TableCell align="right" sx={{ p: 1, width: '10%' }}>
                                                  {formatCurrencyARS(detalle.DePreUn || 0)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ p: 1, width: '10%' }}>
                                                  {formatCurrencyARS(detalle.DeNetGr || 0)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ p: 1, width: '8%' }}>
                                                  {formatCurrencyARS(detalle.DeImIva || 0)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ p: 1, width: '8%' }}>
                                                  <Typography variant="body2" fontWeight="bold" color="success.main">
                                                    {formatCurrencyARS(detalle.DeTotal || 0)}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ p: 1, width: '7%' }}>
                                                  {detalle.DePorDes || 0}%
                                                </TableCell>
                                                <TableCell align="right" sx={{ p: 1, width: '12%' }}>
                                                  <Typography variant="body2" fontWeight="medium" color="primary.main">
                                                    {formatCurrencyARS((detalle.NetoConDto || 0) / (detalle.DeCanti || 1))}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ p: 1, width: '12%' }}>
                                                  <Typography variant="body2" fontWeight="medium" color="success.main">
                                                    {formatCurrencyARS(detalle.NetoConDto || 0)}
                                                  </Typography>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </Box>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                      ⚠️ Sin detalles de artículos
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                            
                            {/* Detalle expandible de la factura */}
                            {isExpanded && (
                              <TableRow>
                                <TableCell colSpan={6} sx={{ py: 0 }}>
                                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ margin: 2 }}>
                                      <Typography variant="h6" gutterBottom component="div" sx={{ color: 'success.main' }}>
                                        📋 Detalle de Factura
                                      </Typography>
                                      
                                      {/* Información general de la factura */}
                                      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                        <Grid container spacing={2}>
                                          <Grid item xs={12} md={6}>
                                            <Typography variant="body2" color="text.secondary">
                                              <strong>Cliente:</strong> {detallesFactura[facturaId]?.[0]?.FaNombr || 'No especificado'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              <strong>Domicilio:</strong> {detallesFactura[facturaId]?.[0]?.FaDomic || 'No especificado'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              <strong>Localidad:</strong> {detallesFactura[facturaId]?.[0]?.FaLocal || 'No especificado'}
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={12} md={6}>
                                            <Typography variant="body2" color="text.secondary">
                                              <strong>CUIT:</strong> {detallesFactura[facturaId]?.[0]?.FaCuit || 'No especificado'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              <strong>Tipo IVA:</strong> {detallesFactura[facturaId]?.[0]?.FaTipIva || 'No especificado'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              <strong>Neto Gravado:</strong> <strong>{formatCurrencyARS((detallesFactura[facturaId]?.[0]?.DeNetGr || 0) - ((detallesFactura[facturaId]?.[0]?.DePorDes || 0) * (detallesFactura[facturaId]?.[0]?.DeNetGr || 0) / 100))}</strong>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              <strong>Total Factura:</strong> <strong>{formatCurrencyARS(detallesFactura[facturaId]?.[0]?.FaTotal || 0)}</strong>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                              <strong>Total Descuento:</strong> <strong>{formatCurrencyARS(detallesFactura[facturaId]?.[0]?.FaDesct || 0)}</strong>
                            </Typography>
                                          </Grid>
                                        </Grid>
                                      </Box>
                                      
                                      {/* Detalle de artículos */}
                                      <Box sx={{ mt: 3 }}>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                                          📋 Detalle de Artículos
                                        </Typography>
                                        
                                        {cargandoDetalles.has(facturaId) ? (
                                          <TableLoader message="Cargando detalle de artículos..." />
                                        ) : detallesFactura[facturaId] && detallesFactura[facturaId].length > 0 ? (
                                          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                                            <Table size="small" sx={{ minWidth: 600 }}>
                                              <TableHead>
                                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                                  <TableCell sx={{ p: 1, width: '20%' }}><strong>Artículo</strong></TableCell>
                                                  <TableCell align="center" sx={{ p: 1, width: '10%' }}><strong>Código</strong></TableCell>
                                                  <TableCell align="center" sx={{ p: 1, width: '8%' }}><strong>Cantidad</strong></TableCell>
                                                  <TableCell align="right" sx={{ p: 1, width: '12%' }}><strong>Precio Unit.</strong></TableCell>
                                                  <TableCell align="right" sx={{ p: 1, width: '12%' }}><strong>Neto</strong></TableCell>
                                                  <TableCell align="right" sx={{ p: 1, width: '10%' }}><strong>IVA</strong></TableCell>
                                                  <TableCell align="right" sx={{ p: 1, width: '8%' }}><strong>Total</strong></TableCell>
                                                  <TableCell align="right" sx={{ p: 1, width: '8%' }}><strong>%Dto</strong></TableCell>
                                                  <TableCell align="right" sx={{ p: 1, width: '12%' }}><strong>Neto con dto</strong></TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {detallesFactura[facturaId].map((detalle: any, index: number) => (
                                                  <TableRow key={index} hover>
                                                    <TableCell sx={{ p: 1, width: '20%' }}>
                                                      <Typography variant="body2" fontWeight="medium">
                                                        {detalle.DeArtDescr || 'Sin descripción'}
                                                      </Typography>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ p: 1, width: '10%' }}>
                                                      {detalle.ArtCodigo || 'N/A'}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ p: 1, width: '8%' }}>
                                                      <Chip 
                                                        label={formatQuantity(detalle.DeCanti || 0)} 
                                                        color="info" 
                                                        variant="outlined" 
                                                        size="small" 
                                                      />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ p: 1, width: '12%' }}>
                                                      {formatCurrencyARS(detalle.DePreUn || 0)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ p: 1, width: '12%' }}>
                                                      {formatCurrencyARS(detalle.DeNetGr || 0)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ p: 1, width: '10%' }}>
                                                      {formatCurrencyARS(detalle.DeImIva || 0)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ p: 1, width: '8%' }}>
                                                      <Typography variant="body2" fontWeight="bold" color="success.main">
                                                        {formatCurrencyARS(detalle.DeTotal || 0)}
                                                      </Typography>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ p: 1, width: '8%' }}>
                                                      {detalle.DePorDes || 0}%
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ p: 1, width: '12%' }}>
                                                      <Typography variant="body2" fontWeight="medium" color="success.main">
                                                        {formatCurrencyARS(detalle.NetoConDto || 0)}
                                                      </Typography>
                                                    </TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </TableContainer>
                                        ) : (
                                          <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                              ⚠️ <strong>Sin detalles:</strong> No se encontraron líneas de detalle para esta factura.
                                            </Typography>
                                          </Box>
                                        )}
                                      </Box>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Paginación */}
                <TablePagination
                  component="div"
                  count={facturasFiltradas.length}
                  page={paginaFacturas}
                  onPageChange={handleChangePage}
                  rowsPerPage={filasPorPagina}
                  rowsPerPageOptions={[20]}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                  labelRowsPerPage="Filas por página:"
                />
              </>
            ) : (
              <EmptyState 
                icon={<Receipt />}
                title="Sin facturas"
                description="No hay facturas registradas para este cliente."
              />
            )}
          </CardContent>
        </Card>
      </TabPanel>
      </Container>
    </Box>
  )
}