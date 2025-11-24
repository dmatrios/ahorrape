// src/features/account/api/accountApi.ts
import api from "../../../api/apiClient";
import type { UsuarioResponse } from "../../usuarios/api/usuariosApi";

export interface ActualizarUsuarioRequest {
  nombre: string;
  email: string;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNueva: string;
}

// GET /usuarios/{id}
export const obtenerUsuarioPorId = async (
  id: number
): Promise<UsuarioResponse> => {
  const res = await api.get<UsuarioResponse>(`/usuarios/${id}`);
  return res.data;
};

// PUT /usuarios/{id}
export const actualizarUsuario = async (
  id: number,
  data: ActualizarUsuarioRequest
): Promise<UsuarioResponse> => {
  const res = await api.put<UsuarioResponse>(`/usuarios/${id}`, data);
  return res.data;
};

// PUT /usuarios/{id}/password
export const cambiarPassword = async (
  id: number,
  data: CambiarPasswordRequest
): Promise<void> => {
  await api.put<void>(`/usuarios/${id}/password`, data);
};
