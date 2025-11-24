// src/features/dashboard/api/resumenApi.ts
import api from "../../../api/apiClient";

export interface TransaccionResumen {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  tipo: "INGRESO" | "GASTO";
  monto: number;
  fecha: string;
  descripcion: string;
}

export interface ResumenMensualResponse {
  totalIngresos: number;
  totalGastos: number;
  saldo: number;
  transaccionesDelMes: TransaccionResumen[];
}

export const obtenerResumenMensual = async (
  usuarioId: number,
  mes: number,
  anio: number
): Promise<ResumenMensualResponse> => {
  const res = await api.get<ResumenMensualResponse>(
    `/resumen/usuario/${usuarioId}`,
    { params: { mes, anio } }
  );
  return res.data;
};
