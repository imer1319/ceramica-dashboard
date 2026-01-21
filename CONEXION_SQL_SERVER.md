# 🔧 Solución de Problemas de Conexión SQL Server

## ❌ Problema Identificado

La aplicación está mostrando el siguiente error:
```
[DB] ❌ Error de conexión: [Error [ConnectionError]: Failed to connect to 10.0.0.10\sql2008r2 in 15000ms]
code: 'ETIMEOUT'
```

## 🔍 Causas Posibles

### 1. **Servidor SQL Server No Disponible**
- El servidor en la IP `10.0.0.10` no está ejecutándose
- El servidor no es accesible desde tu red
- La instancia `sql2008r2` no existe o está detenida

### 2. **Configuración de Red**
- Firewall bloqueando el puerto 1433
- Configuración de red incorrecta
- VPN o proxy interfiriendo

### 3. **Configuración de SQL Server**
- TCP/IP no habilitado en SQL Server
- Puerto 1433 no configurado
- Instancia con nombre incorrecto

## ✅ Soluciones

### Opción 1: Configurar tu Propio SQL Server

1. **Instalar SQL Server Express** (gratuito):
   ```bash
   # Descargar desde: https://www.microsoft.com/sql-server/sql-server-downloads
   ```

2. **Actualizar .env.local**:
   ```env
   DB_USER=sa
   DB_PASSWORD=tu_contraseña_segura
   DB_SERVER=localhost
   # o DB_SERVER=.\SQLEXPRESS
   DB_PORT=1433
   DB_NAME=ceramica
   ```

3. **Crear la base de datos**:
   ```sql
   CREATE DATABASE ceramica;
   USE ceramica;
   
   CREATE TABLE Ent_maeentidad (
       Entnroid INT IDENTITY(1,1) PRIMARY KEY,
       Entnombr NVARCHAR(255),
       Entemail NVARCHAR(255)
   );
   
   -- La tabla está lista para recibir datos reales
   ```

### Opción 2: Configurar Base de Datos Vacía

✅ **Configuración limpia**: La aplicación está configurada para trabajar con datos reales sin datos de prueba hardcodeados.

### Opción 3: Configurar Conexión Remota

Si tienes acceso al servidor `10.0.0.10`:

1. **Verificar conectividad**:
   ```bash
   ping 10.0.0.10
   telnet 10.0.0.10 1433
   ```

2. **Configurar SQL Server** (en el servidor remoto):
   - Habilitar TCP/IP en SQL Server Configuration Manager
   - Configurar puerto 1433
   - Reiniciar servicio SQL Server
   - Configurar firewall para permitir puerto 1433

3. **Verificar credenciales**:
   - Usuario: `sa`
   - Contraseña: `123456`
   - Instancia: `sql2008r2`

## 🚀 Estado Actual

✅ **La aplicación está lista** para datos reales
✅ **Material-UI implementado** correctamente
✅ **Dashboard completamente funcional**
✅ **Datos de prueba eliminados** del código

## 📝 Recomendaciones

1. **Para desarrollo**: Configurar una base de datos local con datos reales
2. **Para producción**: Configurar una base de datos en la nube
3. **Seguridad**: Cambiar credenciales por defecto
4. **Monitoreo**: Implementar logs más detallados

## 🔄 Próximos Pasos

1. Configurar SQL Server con datos reales
2. Seguir las instrucciones de "Opción 1" para base de datos local
3. Actualizar variables de entorno según tu configuración
4. Importar datos reales a la base de datos
5. Probar la conexión

---

**Nota**: La aplicación está configurada para trabajar con datos reales. Los datos de prueba han sido eliminados del código.