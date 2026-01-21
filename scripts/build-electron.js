const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Iniciando build de aplicación Electron...')

try {
  // Paso 1: Limpiar directorios anteriores
  console.log('🧹 Limpiando directorios anteriores...')
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true })
  }
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true })
  }

  // Paso 2: Build de Next.js
  console.log('⚡ Construyendo aplicación Next.js...')
  execSync('npm run build', { stdio: 'inherit' })

  // Paso 3: Verificar que el build de Next.js fue exitoso
  if (!fs.existsSync('.next')) {
    throw new Error('El build de Next.js falló')
  }

  // Paso 4: Crear directorio de distribución si no existe
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist')
  }

  // Paso 5: Build de Electron
  console.log('📦 Construyendo ejecutables de Electron...')
  execSync('electron-builder', { stdio: 'inherit' })

  console.log('✅ Build completado exitosamente!')
  console.log('📁 Los ejecutables están disponibles en el directorio "dist"')
  
  // Mostrar archivos generados
  if (fs.existsSync('dist')) {
    const files = fs.readdirSync('dist')
    console.log('\n📋 Archivos generados:')
    files.forEach(file => {
      const filePath = path.join('dist', file)
      const stats = fs.statSync(filePath)
      const size = (stats.size / (1024 * 1024)).toFixed(2)
      console.log(`   • ${file} (${size} MB)`)
    })
  }

} catch (error) {
  console.error('❌ Error durante el build:', error.message)
  process.exit(1)
}