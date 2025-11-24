import api  from "../../../api/apiClient";

export interface RegistrarUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
}

export const registrarUsuario = async (
  data: RegistrarUsuarioRequest
): Promise<UsuarioResponse> => {
  const res = await api.post<UsuarioResponse>("/usuarios", data);
  return res.data;
};
