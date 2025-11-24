// src/features/categorias/api/categoriasApi.ts
import api from "../../../api/apiClient";

export type TipoCategoria = "INGRESO" | "GASTO" | "AMBOS";

export interface CategoriaResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipoCategoria: TipoCategoria;
  activa: boolean;
}

export interface CrearCategoriaRequest {
  nombre: string;
  descripcion?: string;
  tipoCategoria: TipoCategoria;
}

export interface ActualizarCategoriaRequest {
  nombre?: string;
  descripcion?: string;
  tipoCategoria?: TipoCategoria;
  activa?: boolean; // lo usamos para activar/desactivar
}

export const listarCategorias = async (): Promise<CategoriaResponse[]> => {
  const res = await api.get<CategoriaResponse[]>("/categorias");
  return res.data;
};

export const crearCategoria = async (
  data: CrearCategoriaRequest
): Promise<CategoriaResponse> => {
  const res = await api.post<CategoriaResponse>("/categorias", data);
  return res.data;
};

export const actualizarCategoria = async (
  id: number,
  data: ActualizarCategoriaRequest
): Promise<CategoriaResponse> => {
  const res = await api.put<CategoriaResponse>(`/categorias/${id}`, data);
  return res.data;
};
