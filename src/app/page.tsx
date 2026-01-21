'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Collapse,
  IconButton
} from '@mui/material'
import {
  TrendingUp,
  AttachMoney,
  Inventory,
  People,
  Assessment,
  CalendarToday,
  BarChart,
  Receipt,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'
import Header from '../components/Header'
import InitialSetup from '../components/InitialSetup'
import ConfigModal from '../components/ConfigModal'
import { syndeoColors } from '../theme/colors'
import { useConfig } from '../hooks/useConfig'
import { DatabaseConfig } from '../lib/configStorage'
import { formatCurrencyARS, formatQuantity } from '../lib/formatters'

interface EstadisticasVentas {
  mes: number
  anio: number
  resumenVentas: {
    TotalVentas: number
    TotalFacturacion: number
    TotalFacturacionNetoGravado: number
    PromedioVenta: number
  }
  articulosMasVendidos: Array<{
    Descripcion: string
    Codigo: string
    CantidadVendida: number
    TotalVentas: number
    TotalNetoGravadoConDescuento: number
    PrecioUnitarioPonderado: number
  }>
  ventasDiarias: Array<{
    Dia: number
    CantidadVentas: number
    TotalDia: number
  }>
  clientesRanking: Array<{
    NombreCliente: string
    ClienteId: number
    TotalFacturado: number
    CantidadFacturas: number
    productos: Array<{
      ProductoDescripcion: string
      ProductoCodigo: string
      CantidadTotal: number
      PrecioUnitario: number
      PorcentajeDescuento: number
      PrecioUnitarioNetoConDescuento: number
      TotalNetoGravado: number
    }>
  }>
}

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function HomePage() {
  const router = useRouter()
  const [estadisticas, setEstadisticas] = useState<EstadisticasVentas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(new Date().getMonth() + 1)
 const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear())
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [clienteExpandido, setClienteExpandido] = useState<number | null>(null)
  const { config, isConfigured, loading: configLoading, saveConfig } = useConfig()

  const cargarEstadisticas = async (mes: number, anio: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`/api/estadisticas-ventas?mes=${mes}&anio=${anio}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Error al cargar estadísticas: ${response.status}`)
      }
      
      const data = await response.json()
      setEstadisticas(data)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted')
        setError('La solicitud tardó demasiado tiempo')
      } else {
        console.error('Error cargando estadísticas:', error)
        setError(error instanceof Error ? error.message : 'Error desconocido')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (isMounted) {
        await cargarEstadisticas(mesSeleccionado, anioSeleccionado)
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [mesSeleccionado, anioSeleccionado])

  const handleMesChange = (event: SelectChangeEvent<number>) => {
    const nuevoMes = event.target.value as number
    setMesSeleccionado(nuevoMes)
    cargarEstadisticas(nuevoMes, anioSeleccionado)
  }

  const handleAnioChange = (event: SelectChangeEvent<number>) => {
    const nuevoAnio = event.target.value as number
    setAnioSeleccionado(nuevoAnio)
    cargarEstadisticas(mesSeleccionado, nuevoAnio)
  }

  const handleConfigSave = async (newConfig: DatabaseConfig) => {
    try {
      await saveConfig(newConfig)
      // Después de guardar la configuración, cargar las estadísticas
      cargarEstadisticas(mesSeleccionado, anioSeleccionado)
    } catch (error) {
      console.error('Error al guardar la configuración:', error)
    }
  }

  const handleConfigModalSave = async (newConfig: DatabaseConfig) => {
    try {
      await saveConfig(newConfig)
      setConfigModalOpen(false)
      // Recargar las estadísticas con la nueva configuración
      cargarEstadisticas(mesSeleccionado, anioSeleccionado)
    } catch (error) {
      console.error('Error al guardar la configuración:', error)
    }
  }

  const toggleClienteExpansion = (clienteId: number) => {
    if (clienteExpandido === clienteId) {
      // Si el cliente ya está expandido, lo contraemos
      setClienteExpandido(null)
    } else {
      // Si es un cliente diferente o ninguno está expandido, expandimos este
      setClienteExpandido(clienteId)
    }
  }

  const navegarACliente = (clienteId: number) => {
    router.push(`/cliente/${clienteId}`)
  }

  const handleOpenConfigModal = () => {
    setConfigModalOpen(true)
  }

  const handleCloseConfigModal = () => {
    setConfigModalOpen(false)
  }

  // Si está cargando la configuración, mostrar loading
  if (configLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  // Si no hay configuración, mostrar el setup inicial
  if (!isConfigured) {
    return <InitialSetup onConfigSaved={handleConfigSave} />
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
        <Header title="Dashboard de Ventas" />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">
            Error al cargar las estadísticas: {error}
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header 
        title="Dashboard de Ventas" 
        showConfigButton={true}
        onConfigClick={handleOpenConfigModal}
      />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: syndeoColors.primary.main, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assessment sx={{ fontSize: 40, color: syndeoColors.secondary.main }} />
            Dashboard de Ventas
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <CalendarToday sx={{ fontSize: 20 }} />
            {estadisticas ? `${meses[estadisticas.mes - 1]} ${estadisticas.anio}` : 'Cargando...'}
          </Typography>
          
          {/* Selectores de Mes y Año */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mes</InputLabel>
              <Select
                value={mesSeleccionado}
                label="Mes"
                onChange={handleMesChange}
              >
                {meses.map((mes, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {mes}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Año</InputLabel>
              <Select
                value={anioSeleccionado}
                label="Año"
                onChange={handleAnioChange}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((anio) => (
                  <MenuItem key={anio} value={anio}>
                    {anio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary">
              Selecciona el período para ver las estadísticas
            </Typography>
          </Box>
        </Box>

        {/* Botón para ir a gestión de clientes */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<People />}
            onClick={() => router.push('/datos')}
            sx={{ 
              bgcolor: syndeoColors.primary.main,
              '&:hover': { bgcolor: syndeoColors.primary.dark }
            }}
          >
            Ir a Gestión de Clientes
          </Button>
        </Box>

        {estadisticas && (
          <Grid container spacing={3}>
            {/* Tarjetas de resumen */}
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <TrendingUp sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Total Ventas Mensuales
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {formatQuantity(estadisticas.resumenVentas.TotalVentas)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Facturas emitidas este mes
                    </Typography>
                    <Chip 
                      label="Unidades" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'medium'
                      }} 
                    />
                  </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <AttachMoney sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Total Facturación Mensual
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {formatCurrencyARS(estadisticas.resumenVentas.TotalFacturacion)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Ingresos totales del mes
                    </Typography>
                    <Chip 
                      label="Pesos" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'medium'
                      }} 
                    />
                  </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Receipt sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Facturación Neto Gravado
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {formatCurrencyARS(estadisticas.resumenVentas.TotalFacturacionNetoGravado)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Total neto gravado mensual
                    </Typography>
                    <Chip 
                      label="Pesos" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'medium'
                      }} 
                    />
                  </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <BarChart sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Promedio por Venta
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {formatCurrencyARS(estadisticas.resumenVentas.PromedioVenta)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Valor promedio por factura
                    </Typography>
                    <Chip 
                      label="Pesos" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'medium'
                      }} 
                    />
                  </CardContent>
                </Card>
            </Grid>

            {/* Artículos más vendidos */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: syndeoColors.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Inventory sx={{ mr: 1 }} />
                    Artículos Más Vendidos del Mes
                  </Typography>
                  {estadisticas.articulosMasVendidos.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell><strong>Posición</strong></TableCell>
                            <TableCell><strong>Código</strong></TableCell>
                            <TableCell><strong>Descripción</strong></TableCell>
                            <TableCell align="right"><strong>Precio Unitario</strong></TableCell>
                            <TableCell align="right"><strong>Cantidad Vendida</strong></TableCell>
                            <TableCell align="right"><strong>Precio Unitario NG c/Descto Ponderado</strong></TableCell>
                            <TableCell align="right"><strong>Neto Gravado c/Dto</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {estadisticas.articulosMasVendidos.map((articulo, index) => (
                            <TableRow key={articulo.Codigo || index}>
                              <TableCell>
                                <Chip 
                                  label={`#${index + 1}`} 
                                  color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{articulo.Codigo || ''}</TableCell>
                              <TableCell>{articulo.Descripcion || 'Sin descripción'}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={formatCurrencyARS(articulo.PrecioUnitarioPonderado)}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={formatQuantity(articulo.CantidadVendida)}
                                  color="info"
                                  variant="outlined"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={formatCurrencyARS(articulo.TotalNetoGravadoConDescuento / articulo.CantidadVendida)}
                                  color="success"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={formatCurrencyARS(articulo.TotalNetoGravadoConDescuento)}
                                  color="warning"
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No hay datos de artículos vendidos para este mes.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Ranking de clientes por facturación */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: syndeoColors.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ mr: 1 }} />
                    Top 15 Clientes por Facturación del Mes
                  </Typography>
                  {estadisticas.clientesRanking && estadisticas.clientesRanking.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell><strong>Posición</strong></TableCell>
                            <TableCell><strong>Cliente</strong></TableCell>
                            <TableCell align="right"><strong>Total Facturado NG</strong></TableCell>
                            <TableCell align="right"><strong>Cantidad Facturas</strong></TableCell>
                            <TableCell align="center"><strong>Productos</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {estadisticas.clientesRanking.map((cliente, index) => (
                            <React.Fragment key={cliente.ClienteId || index}>
                              <TableRow 
                                onClick={() => navegarACliente(cliente.ClienteId)}
                                sx={{ 
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                  }
                                }}
                              >
                                <TableCell>
                                  <Chip 
                                    label={`#${index + 1}`} 
                                    color={index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'warning' : 'default'}
                                    size="small"
                                  />
                                </TableCell>
                            <TableCell>{cliente.NombreCliente || ''}</TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={formatCurrencyARS(cliente.TotalFacturado)}
                                    color="success"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={formatQuantity(cliente.CantidadFacturas)}
                                    color="info"
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                     onClick={(e) => {
                                       e.stopPropagation() // Evitar que se active la navegación al cliente
                                       toggleClienteExpansion(cliente.ClienteId)
                                     }}
                                     size="small"
                                     color="primary"
                                   >
                                     {clienteExpandido === cliente.ClienteId ? <ExpandLess /> : <ExpandMore />}
                                   </IconButton>
                                  <Chip 
                                    label={`${cliente.productos?.length || 0} productos`}
                                    color="default"
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                                  <Collapse in={clienteExpandido === cliente.ClienteId} timeout="auto" unmountOnExit>
                                    <Box sx={{ margin: 1 }}>
                                      <Typography variant="h6" gutterBottom component="div" sx={{ color: syndeoColors.primary.main }}>
                                        Productos vendidos a {cliente.NombreCliente}
                                      </Typography>
                                      {cliente.productos && cliente.productos.length > 0 ? (
                                        <Table size="small" aria-label="productos">
                                          <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                              <TableCell><strong>Código</strong></TableCell>
                                              <TableCell><strong>Descripción</strong></TableCell>
                                              <TableCell align="right"><strong>Cantidad</strong></TableCell>
                                              <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                                              <TableCell align="right"><strong>% Desc.</strong></TableCell>
                                              <TableCell align="right"><strong>Precio Neto</strong></TableCell>
                                              <TableCell align="right"><strong>Total Neto</strong></TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {cliente.productos.map((producto, prodIndex) => (
                                              <TableRow key={`${cliente.ClienteId}-${producto.ProductoCodigo}-${prodIndex}`}>
                                                <TableCell component="th" scope="row">
                                                  <Chip 
                                                    label={producto.ProductoCodigo}
                                                    color="default"
                                                    size="small"
                                                    variant="outlined"
                                                  />
                                                </TableCell>
                                                <TableCell>{producto.ProductoDescripcion}</TableCell>
                                                <TableCell align="right">
                                                  <Chip 
                                                    label={formatQuantity(producto.CantidadTotal || 0)}
                                                    color="info"
                                                    size="small"
                                                  />
                                                </TableCell>
                                                <TableCell align="right">
                                                  {formatCurrencyARS(producto.PrecioUnitario || 0)}
                                                </TableCell>
                                                <TableCell align="right">
                                                  <Chip 
                                                    label={`${producto.PorcentajeDescuento?.toFixed(1) || '0.0'}%`}
                                                    color="warning"
                                                    size="small"
                                                    variant="outlined"
                                                  />
                                                </TableCell>
                                                <TableCell align="right">
                                                  <Chip 
                                                    label={formatCurrencyARS(producto.PrecioUnitarioNetoConDescuento || 0)}
                                                    color="success"
                                                    size="small"
                                                  />
                                                </TableCell>
                                                <TableCell align="right">
                                                  <Chip 
                                                    label={formatCurrencyARS(producto.TotalNetoGravado || 0)}
                                                    color="success"
                                                    size="small"
                                                  />
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      ) : (
                                        <Alert severity="info" sx={{ mt: 1 }}>
                                          No hay productos registrados para este cliente.
                                        </Alert>
                                      )}
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No hay datos de clientes para este mes.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
      
      {/* Modal de configuración */}
      <ConfigModal
        open={configModalOpen}
        onClose={handleCloseConfigModal}
        onConfigSave={handleConfigModalSave}
      />
    </Box>
  )
}
