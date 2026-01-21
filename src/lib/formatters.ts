/**
 * Utilidades para formatear números con estándares argentinos
 */

/**
 * Formatea un número como moneda argentina (ARS) con dos decimales
 * @param value - El valor numérico a formatear
 * @returns String formateado como "$1.234,56"
 */
export function formatCurrencyARS(value: number | null | undefined): string {
  const numValue = value || 0;
  return `$${numValue.toLocaleString('es-AR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Formatea un número como cantidad entera (sin decimales)
 * @param value - El valor numérico a formatear
 * @returns String formateado como "1.234" (sin decimales)
 */
export function formatQuantity(value: number | null | undefined): string {
  const numValue = value || 0;
  return numValue.toLocaleString('es-AR', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
}

/**
 * Formatea un porcentaje con un decimal
 * @param value - El valor numérico del porcentaje
 * @returns String formateado como "12,5%"
 */
export function formatPercentage(value: number | null | undefined): string {
  const numValue = value || 0;
  return `${numValue.toLocaleString('es-AR', { 
    minimumFractionDigits: 1, 
    maximumFractionDigits: 1 
  })}%`;
}