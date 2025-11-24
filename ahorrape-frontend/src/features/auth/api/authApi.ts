// src/features/auth/api/authApi.ts
import api from "../../../api/apiClient";

export interface LoginRequest {
  email: string;
  password: string;
}

// 🔹 NUEVO: tipos fuertes para plan y rol
export type PlanUsuario = "FREE" | "PRO" | "MASTER_DEL_AHORRO";

export type RolUsuario = "USER" | "ADMIN";

// 🔹 Usuario que viene en el login, ahora con plan y rol
export interface UsuarioAuth {
  id: number;
  nombre: string;
  email: string;
  plan: PlanUsuario;
  rol: RolUsuario;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioAuth;
}

// 👇 Export nombrado
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
};
