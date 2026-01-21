// Tipos para la aplicación

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  razon_social?: string;
  domicilio?: string;
  localidad?: string;
  provincia?: string;
  codigo_postal?: string;
  telefono?: string;
  EntCUIT?: string;
  EntActEc?: string;
  EntUsLog?: string;
  EntFeLog?: string;
  EntSedronar?: string;
  EntTelef2?: string;
  EntCodigo?: string;
}

export interface DatabaseConfig {
  user: string;
  password: string;
  server: string;
  port: number;
  database: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    instanceName?: string;
  };
}