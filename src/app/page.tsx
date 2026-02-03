"use client";

import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
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
  IconButton,
  TextField,
  InputAdornment,
  Skeleton,
} from "@mui/material";
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
  ExpandLess,
  Search,
  FileDownload,
} from "@mui/icons-material";
import Header from "../components/Header";
import { syndeoColors } from "../theme/colors";
import { formatCurrencyARS, formatQuantity } from "../lib/formatters";
import ExcelJS from "exceljs";

interface EstadisticasVentas {
  mes: number;
  anio: number;
  resumenVentas: {
    TotalVentas: number;
    TotalFacturacion: number;
    TotalFacturacionNetoGravado: number;
    PromedioVenta: number;
  };
  articulosMasVendidos: Array<{
    Descripcion: string;
    Codigo: string;
    CantidadVendida: number;
    TotalVentas: number;
    TotalNetoGravadoConDescuento: number;
    PrecioUnitarioPonderado: number;
  }>;
  ventasDiarias: Array<{
    Dia: number;
    CantidadVentas: number;
    TotalDia: number;
  }>;
  clientesRanking: Array<{
    NombreCliente: string;
    ClienteId: number;
    TotalFacturado: number;
    CantidadFacturas: number;
    productos: Array<{
      ProductoDescripcion: string;
      ProductoCodigo: string;
      CantidadTotal: number;
      PrecioUnitario: number;
      PorcentajeDescuento: number;
      PrecioUnitarioNetoConDescuento: number;
      TotalNetoGravado: number;
    }>;
  }>;
}

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function HomePage() {
  const router = useRouter();
  const [estadisticas, setEstadisticas] = useState<EstadisticasVentas | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(
    new Date().getFullYear(),
  );
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteExpandido, setClienteExpandido] = useState<number | null>(null);
  const [periodoInicializado, setPeriodoInicializado] = useState(false);
  const fetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const storedMes =
        typeof window !== "undefined"
          ? localStorage.getItem("dashboardMes")
          : null;
      const storedAnio =
        typeof window !== "undefined"
          ? localStorage.getItem("dashboardAnio")
          : null;
      if (storedMes !== null) {
        const m = parseInt(storedMes, 10);
        if (!Number.isNaN(m)) setMesSeleccionado(m);
      }
      if (storedAnio !== null) {
        const a = parseInt(storedAnio, 10);
        if (!Number.isNaN(a)) setAnioSeleccionado(a);
      }
      if (storedMes === null && typeof window !== "undefined") {
        localStorage.setItem("dashboardMes", String(new Date().getMonth() + 1));
      }
      if (storedAnio === null && typeof window !== "undefined") {
        localStorage.setItem("dashboardAnio", String(new Date().getFullYear()));
      }
      setPeriodoInicializado(true);
    } catch {}
  }, []);

  const cargarEstadisticas = async (
    mes: number,
    anio: number,
    search: string = "",
    signal?: AbortSignal,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const response = await fetch(
        `/api/estadisticas-ventas?mes=${mes}&anio=${anio}${searchParam}`,
        {
          signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Error al cargar estadísticas: ${response.status}`);
      }

      const data = await response.json();
      setEstadisticas(data);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted");
        setError("La solicitud tardó demasiado tiempo");
      } else {
        console.error("Error cargando estadísticas:", error);
        setError(error instanceof Error ? error.message : "Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!periodoInicializado) return;

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    fetchControllerRef.current = new AbortController();
    const signal = fetchControllerRef.current.signal;

    if (isMounted) {
      cargarEstadisticas(
        mesSeleccionado,
        anioSeleccionado,
        clienteSearch,
        signal,
      );
    }

    return () => {
      isMounted = false;
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, [mesSeleccionado, anioSeleccionado, periodoInicializado]);

  const handleSearch = () => {
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    fetchControllerRef.current = new AbortController();
    const signal = fetchControllerRef.current.signal;
    cargarEstadisticas(
      mesSeleccionado,
      anioSeleccionado,
      clienteSearch,
      signal,
    );
  };

  const handleMesChange = (event: SelectChangeEvent<number>) => {
    const nuevoMes = event.target.value as number;
    setMesSeleccionado(nuevoMes);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("dashboardMes", String(nuevoMes));
      }
    } catch {}
  };

  const handleAnioChange = (event: SelectChangeEvent<number>) => {
    const nuevoAnio = event.target.value as number;
    setAnioSeleccionado(nuevoAnio);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("dashboardAnio", String(nuevoAnio));
      }
    } catch {}
  };

  const toggleClienteExpansion = (clienteId: number) => {
    if (clienteExpandido === clienteId) {
      // Si el cliente ya está expandido, lo contraemos
      setClienteExpandido(null);
    } else {
      // Si es un cliente diferente o ninguno está expandido, expandimos este
      setClienteExpandido(clienteId);
    }
  };

  const navegarACliente = (clienteId: number) => {
    router.push(
      `/cliente/${clienteId}?mes=${mesSeleccionado}&anio=${anioSeleccionado}`,
    );
  };

  const periodoTexto = () => {
    return mesSeleccionado === 0
      ? `${anioSeleccionado}`
      : `${meses[mesSeleccionado - 1]}_${anioSeleccionado}`;
  };
  const tituloArticulos = () => {
    return mesSeleccionado === 0
      ? `Artículos Más Vendidos del ${anioSeleccionado}`
      : `Artículos Más Vendidos del Mes de ${meses[mesSeleccionado - 1]}`;
  };
  const tituloClientes = () => {
    return mesSeleccionado === 0
      ? `Top 15 Clientes por Facturación del ${anioSeleccionado}`
      : `Top 15 Clientes por Facturación del Mes de ${meses[mesSeleccionado - 1]}`;
  };
  const suggestWidth = (header: string) => {
    const h = header.toLowerCase();
    if (h.includes("descripción")) return 30;
    if (h.includes("cliente")) return 28;
    if (h.includes("código")) return 12;
    if (h.includes("posición")) return 7;
    if (h.includes("cantidad")) return 14;
    if (h.includes("productos")) return 12;
    if (h.includes("precio") || h.includes("neto") || h.includes("facturado"))
      return 16;
    return 14;
  };
  const computeColWidths = (
    headers: string[],
    rows: Array<Array<string | number>>,
  ) => {
    const maxLens = headers.map((h) => String(h).length);
    rows.forEach((r) => {
      r.forEach((val, i) => {
        const len = String(val ?? "").length;
        maxLens[i] = Math.max(maxLens[i], len);
      });
    });
    return maxLens.map((len, i) => {
      const base = suggestWidth(headers[i]);
      const computed = Math.min(Math.max(len + 2, base), 50);
      return { wch: computed };
    });
  };
  const buildSheetWithTitle = (
    title: string,
    headers: string[],
    rows: Array<Array<string | number>>,
    wb: ExcelJS.Workbook,
    sheetName: string,
  ) => {
    const ws = wb.addWorksheet(sheetName);
    ws.mergeCells(1, 1, 1, headers.length);
    const titleCell = ws.getCell(1, 1);
    titleCell.value = title;
    titleCell.alignment = { horizontal: "center" };
    titleCell.font = { bold: true, size: 14 };
    ws.getRow(1).height = 24;
    const headerRow = ws.addRow(headers);
    headerRow.font = { bold: true };
    rows.forEach((r) => ws.addRow(r));
    const widths = computeColWidths(headers, rows).map((w) => w.wch);
    widths.forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });
    return ws;
  };
  const saveWorkbook = async (filename: string, wb: ExcelJS.Workbook) => {
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportArticulosXLSX = () => {
    if (!estadisticas) return;
    const headers = [
      "Posición",
      "Código",
      "Descripción",
      "Precio Unitario",
      "Cantidad Vendida",
      "Precio Unitario NG c/Descto Ponderado",
      "Neto Gravado c/Dto",
    ];
    const rows = estadisticas.articulosMasVendidos.map((a, idx) => [
      idx + 1,
      a.Codigo || "",
      a.Descripcion || "",
      a.PrecioUnitarioPonderado || 0,
      a.CantidadVendida || 0,
      (a.TotalNetoGravadoConDescuento || 0) / (a.CantidadVendida || 1),
      a.TotalNetoGravadoConDescuento || 0,
    ]);
    const wb = new ExcelJS.Workbook();
    buildSheetWithTitle(tituloArticulos(), headers, rows, wb, "Artículos");
    saveWorkbook(`articulos_${periodoTexto()}.xlsx`, wb);
  };

  const exportClientesXLSX = () => {
    if (!estadisticas) return;
    const headers = [
      "Posición",
      "Cliente",
      "Total Facturado NG",
      "Cantidad Facturas",
      "Productos",
    ];
    const rows = estadisticas.clientesRanking.map((c, idx) => [
      idx + 1,
      c.NombreCliente || "",
      c.TotalFacturado || 0,
      c.CantidadFacturas || 0,
      c.productos?.length || 0,
    ]);
    const wb = new ExcelJS.Workbook();
    buildSheetWithTitle(tituloClientes(), headers, rows, wb, "Clientes");
    saveWorkbook(`clientes_${periodoTexto()}.xlsx`, wb);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>
      <Header title="Dashboard de Ventas" />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: syndeoColors.primary.main,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Assessment
              sx={{ fontSize: 40, color: syndeoColors.secondary.main }}
            />
            Dashboard de Ventas
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
          >
            <CalendarToday sx={{ fontSize: 20 }} />
            {estadisticas
              ? `${estadisticas.mes === 0 ? "Todos los meses" : meses[estadisticas.mes - 1]} ${estadisticas.anio}`
              : "Cargando..."}
          </Typography>

          {/* Selectores de Mes y Año */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Año</InputLabel>
              <Select
                value={anioSeleccionado}
                label="Año"
                onChange={handleAnioChange}
              >
                {Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((anio) => (
                  <MenuItem key={anio} value={anio}>
                    {anio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mes</InputLabel>
              <Select
                value={mesSeleccionado}
                label="Mes"
                onChange={handleMesChange}
              >
                <MenuItem value={0}>
                  <em>Todos</em>
                </MenuItem>
                {meses.map((mes, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {mes}
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
            onClick={() => router.push("/datos")}
            sx={{
              bgcolor: syndeoColors.primary.main,
              "&:hover": { bgcolor: syndeoColors.primary.dark },
            }}
          >
            Ir a Gestión de Clientes
          </Button>
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {/* Skeletons for Cards */}
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} md={3} key={item}>
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                    >
                      <Skeleton variant="circular" width={40} height={40} />
                    </Box>
                    <Skeleton
                      variant="text"
                      sx={{ fontSize: "2rem", mx: "auto", mb: 1 }}
                      width="60%"
                    />
                    <Skeleton
                      variant="text"
                      sx={{ fontSize: "1rem", mx: "auto", mb: 1 }}
                      width="80%"
                    />
                    <Skeleton
                      variant="rounded"
                      width={60}
                      height={24}
                      sx={{ mx: "auto" }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Skeletons for Tables */}
            {[1, 2].map((item) => (
              <Grid item xs={12} key={`table-${item}`}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="text" width={200} height={32} />
                      </Box>
                      {item === 2 && (
                        <Skeleton
                          variant="rectangular"
                          width={250}
                          height={40}
                          sx={{ borderRadius: 1 }}
                        />
                      )}
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={400}
                      sx={{ borderRadius: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error al cargar las estadísticas: {error}
          </Alert>
        ) : (
          estadisticas && (
            <Grid container spacing={3}>
              {/* Tarjetas de resumen */}
              <Grid item xs={12} md={3}>
                <Card
                  sx={{
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <TrendingUp sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        {mesSeleccionado === 0
                          ? "Total Ventas Anuales"
                          : "Total Ventas Mensuales"}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                      {formatQuantity(estadisticas.resumenVentas.TotalVentas)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      {mesSeleccionado === 0
                        ? "Facturas emitidas este año"
                        : "Facturas emitidas este mes"}
                    </Typography>
                    <Chip
                      label="Unidades"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: "medium",
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card
                  sx={{
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <AttachMoney sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        {mesSeleccionado === 0
                          ? "Total Facturación Anual"
                          : "Total Facturación Mensual"}
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                      {formatCurrencyARS(
                        estadisticas.resumenVentas.TotalFacturacion,
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Ingresos totales del mes
                    </Typography>
                    <Chip
                      label="Pesos"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: "medium",
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card
                  sx={{
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    color: "white",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <Receipt sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        Facturación Neto Gravado
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                      {formatCurrencyARS(
                        estadisticas.resumenVentas.TotalFacturacionNetoGravado,
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Total neto gravado mensual
                    </Typography>
                    <Chip
                      label="Pesos"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: "medium",
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card
                  sx={{
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    color: "white",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <BarChart sx={{ fontSize: 24, mr: 1, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        Promedio por Venta
                      </Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                      {formatCurrencyARS(
                        estadisticas.resumenVentas.PromedioVenta,
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                      Valor promedio por factura
                    </Typography>
                    <Chip
                      label="Pesos"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: "medium",
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Artículos más vendidos */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: syndeoColors.primary.main,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Inventory sx={{ mr: 1 }} />
                        {mesSeleccionado === 0
                          ? `Artículos Más Vendidos del ${anioSeleccionado}`
                          : `Artículos Más Vendidos del Mes de ${meses[mesSeleccionado - 1]}`}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<FileDownload />}
                        onClick={exportArticulosXLSX}
                      >
                        Exportar Excel
                      </Button>
                    </Box>
                    {estadisticas.articulosMasVendidos.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "grey.100" }}>
                              <TableCell>
                                <strong>Posición</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Código</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Descripción</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>Precio Unitario</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>Cantidad Vendida</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>
                                  Precio Unitario NG c/Descto Ponderado
                                </strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>Neto Gravado c/Dto</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {estadisticas.articulosMasVendidos.map(
                              (articulo, index) => (
                                <TableRow key={articulo.Codigo || index}>
                                  <TableCell>
                                    <Chip
                                      label={`#${index + 1}`}
                                      color={
                                        index === 0
                                          ? "primary"
                                          : index === 1
                                            ? "secondary"
                                            : "default"
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>{articulo.Codigo || ""}</TableCell>
                                  <TableCell>
                                    {articulo.Descripcion || "Sin descripción"}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={formatCurrencyARS(
                                        articulo.PrecioUnitarioPonderado,
                                      )}
                                      color="primary"
                                      variant="outlined"
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={formatQuantity(
                                        articulo.CantidadVendida,
                                      )}
                                      color="info"
                                      variant="outlined"
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={formatCurrencyARS(
                                        articulo.TotalNetoGravadoConDescuento /
                                          articulo.CantidadVendida,
                                      )}
                                      color="success"
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={formatCurrencyARS(
                                        articulo.TotalNetoGravadoConDescuento,
                                      )}
                                      color="warning"
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">
                        {mesSeleccionado === 0
                          ? "No hay datos de artículos vendidos para este año."
                          : "No hay datos de artículos vendidos para este mes."}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Ranking de clientes por facturación */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: syndeoColors.primary.main,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <People sx={{ mr: 1 }} />
                        {mesSeleccionado === 0
                          ? `Top 15 Clientes por Facturación del ${anioSeleccionado}`
                          : `Top 15 Clientes por Facturación del Mes de ${meses[mesSeleccionado - 1]}`}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <TextField
                          size="small"
                          placeholder="Buscar cliente..."
                          value={clienteSearch}
                          onChange={(e) => setClienteSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearch();
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={handleSearch} edge="end">
                                  <Search />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: { xs: "100%", sm: 250 } }}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<FileDownload />}
                          onClick={exportClientesXLSX}
                        >
                          Exportar Excel
                        </Button>
                      </Box>
                    </Box>
                    {estadisticas.clientesRanking &&
                    estadisticas.clientesRanking.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "grey.100" }}>
                              <TableCell>
                                <strong>Posición</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Cliente</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>Total Facturado NG</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>Cantidad Facturas</strong>
                              </TableCell>
                              <TableCell align="center">
                                <strong>Productos</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {estadisticas.clientesRanking.map(
                              (cliente, index) => (
                                <React.Fragment
                                  key={cliente.ClienteId || index}
                                >
                                  <TableRow
                                    onClick={() =>
                                      navegarACliente(cliente.ClienteId)
                                    }
                                    sx={{
                                      cursor: "pointer",
                                      "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                                      },
                                    }}
                                  >
                                    <TableCell>
                                      <Chip
                                        label={`#${index + 1}`}
                                        color={
                                          index === 0
                                            ? "primary"
                                            : index === 1
                                              ? "secondary"
                                              : index === 2
                                                ? "warning"
                                                : "default"
                                        }
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {cliente.NombreCliente || ""}
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip
                                        label={formatCurrencyARS(
                                          cliente.TotalFacturado,
                                        )}
                                        color="success"
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip
                                        label={formatQuantity(
                                          cliente.CantidadFacturas,
                                        )}
                                        color="info"
                                        variant="outlined"
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation(); // Evitar que se active la navegación al cliente
                                          toggleClienteExpansion(
                                            cliente.ClienteId,
                                          );
                                        }}
                                        size="small"
                                        color="primary"
                                      >
                                        {clienteExpandido ===
                                        cliente.ClienteId ? (
                                          <ExpandLess />
                                        ) : (
                                          <ExpandMore />
                                        )}
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
                                    <TableCell
                                      style={{
                                        paddingBottom: 0,
                                        paddingTop: 0,
                                      }}
                                      colSpan={5}
                                    >
                                      <Collapse
                                        in={
                                          clienteExpandido === cliente.ClienteId
                                        }
                                        timeout="auto"
                                        unmountOnExit
                                      >
                                        <Box sx={{ margin: 1 }}>
                                          <Typography
                                            variant="h6"
                                            gutterBottom
                                            component="div"
                                            sx={{
                                              color: syndeoColors.primary.main,
                                            }}
                                          >
                                            Productos vendidos a{" "}
                                            {cliente.NombreCliente}
                                          </Typography>
                                          {cliente.productos &&
                                          cliente.productos.length > 0 ? (
                                            <Table
                                              size="small"
                                              aria-label="productos"
                                            >
                                              <TableHead>
                                                <TableRow
                                                  sx={{ bgcolor: "grey.50" }}
                                                >
                                                  <TableCell>
                                                    <strong>Código</strong>
                                                  </TableCell>
                                                  <TableCell>
                                                    <strong>Descripción</strong>
                                                  </TableCell>
                                                  <TableCell align="right">
                                                    <strong>Cantidad</strong>
                                                  </TableCell>
                                                  <TableCell align="right">
                                                    <strong>
                                                      Precio Unit.
                                                    </strong>
                                                  </TableCell>
                                                  <TableCell align="right">
                                                    <strong>% Desc.</strong>
                                                  </TableCell>
                                                  <TableCell align="right">
                                                    <strong>Precio Neto</strong>
                                                  </TableCell>
                                                  <TableCell align="right">
                                                    <strong>Total Neto</strong>
                                                  </TableCell>
                                                </TableRow>
                                              </TableHead>
                                              <TableBody>
                                                {cliente.productos.map(
                                                  (producto, prodIndex) => (
                                                    <TableRow
                                                      key={`${cliente.ClienteId}-${producto.ProductoCodigo}-${prodIndex}`}
                                                    >
                                                      <TableCell
                                                        component="th"
                                                        scope="row"
                                                      >
                                                        <Chip
                                                          label={
                                                            producto.ProductoCodigo
                                                          }
                                                          color="default"
                                                          size="small"
                                                          variant="outlined"
                                                        />
                                                      </TableCell>
                                                      <TableCell>
                                                        {
                                                          producto.ProductoDescripcion
                                                        }
                                                      </TableCell>
                                                      <TableCell align="right">
                                                        <Chip
                                                          label={formatQuantity(
                                                            producto.CantidadTotal ||
                                                              0,
                                                          )}
                                                          color="info"
                                                          size="small"
                                                        />
                                                      </TableCell>
                                                      <TableCell align="right">
                                                        {formatCurrencyARS(
                                                          producto.PrecioUnitario ||
                                                            0,
                                                        )}
                                                      </TableCell>
                                                      <TableCell align="right">
                                                        <Chip
                                                          label={`${producto.PorcentajeDescuento?.toFixed(1) || "0.0"}%`}
                                                          color="warning"
                                                          size="small"
                                                          variant="outlined"
                                                        />
                                                      </TableCell>
                                                      <TableCell align="right">
                                                        <Chip
                                                          label={formatCurrencyARS(
                                                            producto.PrecioUnitarioNetoConDescuento ||
                                                              0,
                                                          )}
                                                          color="success"
                                                          size="small"
                                                        />
                                                      </TableCell>
                                                      <TableCell align="right">
                                                        <Chip
                                                          label={formatCurrencyARS(
                                                            producto.TotalNetoGravado ||
                                                              0,
                                                          )}
                                                          color="success"
                                                          size="small"
                                                        />
                                                      </TableCell>
                                                    </TableRow>
                                                  ),
                                                )}
                                              </TableBody>
                                            </Table>
                                          ) : (
                                            <Alert
                                              severity="info"
                                              sx={{ mt: 1 }}
                                            >
                                              No hay productos registrados para
                                              este cliente.
                                            </Alert>
                                          )}
                                        </Box>
                                      </Collapse>
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">
                        {mesSeleccionado === 0
                          ? "No hay datos de clientes para este año."
                          : "No hay datos de clientes para este mes."}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )
        )}
      </Container>
    </Box>
  );
}
