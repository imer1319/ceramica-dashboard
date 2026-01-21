import { NextResponse } from 'next/server'
import { getProveedores } from '@/lib/queries'

export async function GET() {
  try {
    const proveedores = await getProveedores()
    return NextResponse.json(proveedores)
  } catch (error) {
    console.error('Error en API de proveedores:', error)
    return NextResponse.json(
      { error: 'Error al obtener proveedores' },
      { status: 500 }
    )
  }
}