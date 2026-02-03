import { NextRequest, NextResponse } from "next/server";
import { getDatosRelacionados } from "../../../lib/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entidadId = searchParams.get("id");
    const mesParam = searchParams.get("mes");
    const anioParam = searchParams.get("anio");

    if (!entidadId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de entidad requerido",
          data: {},
        },
        { status: 400 },
      );
    }

    const id = parseInt(entidadId);
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de entidad debe ser un número válido",
          data: {},
        },
        { status: 400 },
      );
    }

    const mes = mesParam !== null ? parseInt(mesParam, 10) : undefined;
    const anio = anioParam !== null ? parseInt(anioParam, 10) : undefined;
    if (mes !== undefined && (isNaN(mes) || mes < 0 || mes > 12)) {
      return NextResponse.json(
        {
          success: false,
          error: "El mes debe estar entre 0 y 12 (0 para todo el año)",
          data: {},
        },
        { status: 400 },
      );
    }
    if (anio !== undefined && (isNaN(anio) || anio < 2000 || anio > 2100)) {
      return NextResponse.json(
        {
          success: false,
          error: "El año debe estar entre 2000 y 2100",
          data: {},
        },
        { status: 400 },
      );
    }

    console.log(
      `[API RELACIONADOS] 🔍 Consultando datos relacionados para ID: ${id}...`,
      { mes, anio },
    );
    const datosRelacionados = await getDatosRelacionados(id, { mes, anio });

    // Validar y limpiar datos antes de enviar JSON
    const datosLimpios = JSON.parse(
      JSON.stringify(datosRelacionados, (key, value) => {
        // Reemplazar undefined con null para evitar errores de JSON
        return value === undefined ? null : value;
      }),
    );

    console.log(`[API RELACIONADOS] ✅ Datos obtenidos para ID ${id}:`, {
      tieneCliente: !!datosRelacionados.cliente,
      tieneProveedor: !!datosRelacionados.proveedor,
    });

    return NextResponse.json({
      success: true,
      data: datosLimpios,
      entidadId: id,
    });
  } catch (error: any) {
    console.error("[API RELACIONADOS] ❌ Error completo:", error);
    console.error("[API RELACIONADOS] ❌ Stack trace:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error interno del servidor",
        data: {},
      },
      { status: 500 },
    );
  }
}
