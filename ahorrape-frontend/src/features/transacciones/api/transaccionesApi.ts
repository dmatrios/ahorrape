// src/features/transacciones/api/transaccionesApi.ts
import api from "../../../api/apiClient";

export type TipoTransaccion = "INGRESO" | "GASTO";

export interface TransaccionResponse {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  tipo: TipoTransaccion;
  monto: number;
  fecha: string; // yyyy-MM-dd
  descripcion: string;
}

export interface CrearTransaccionRequest {
  usuarioId: number;
  categoriaId: number;
  tipo: TipoTransaccion;
  monto: number;
  fecha: string; // yyyy-MM-dd
  descripcion: string;
}

export interface ActualizarTransaccionRequest {
  categoriaId?: number;
  tipo?: TipoTransaccion;
  monto?: number;
  fecha?: string;
  descripcion?: string;
}

export const listarTransaccionesPorUsuario = async (
  usuarioId: number
): Promise<TransaccionResponse[]> => {
  const res = await api.get<TransaccionResponse[]>(
    `/transacciones/usuario/${usuarioId}`
  );
  return res.data;
};

export const crearTransaccion = async (
  data: CrearTransaccionRequest
): Promise<TransaccionResponse> => {
  const res = await api.post<TransaccionResponse>("/transacciones", data);
  return res.data;
};

export const actualizarTransaccion = async (
  id: number,
  data: ActualizarTransaccionRequest
): Promise<TransaccionResponse> => {
  const res = await api.put<TransaccionResponse>(
    `/transacciones/${id}`,
    data
  );
  return res.data;
};

export const eliminarTransaccion = async (id: number): Promise<void> => {
  await api.delete(`/transacciones/${id}`);
};
