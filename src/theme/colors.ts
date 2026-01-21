// Paleta de colores basada en el logo de Syndeo
export const syndeoColors = {
  // Colores principales del logo
  primary: {
    main: '#1976d2', // Azul principal
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#ff9800', // Naranja/dorado del logo
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000'
  },
  // Colores de apoyo
  accent: {
    main: '#4caf50', // Verde para estados positivos
    light: '#81c784',
    dark: '#388e3c'
  },
  // Grises corporativos
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },
  // Estados
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3'
};

// Función para obtener colores con transparencia
export const withOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};