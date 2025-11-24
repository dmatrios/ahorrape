// src/router/AppRouter.tsx
import React, { type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import UsuariosPage from "../features/usuarios/pages/UsuariosPage";
import CategoriasPage from "../features/categorias/pages/CategoriasPage";
import TransaccionesPage from "../features/transacciones/pages/TransaccionesPage";
import AuthPage from "../features/auth/pages/AuthPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import AccountPage from "../features/account/pages/AccountPage";
import type { UsuarioAuth } from "../features/auth/api/authApi";
import PlanesPage from "../features/planes/pages/PlanesPage";
// 👇 nueva importación
import HistorialPage from "../features/historial/pages/HistorialPage";

// 🔹 Helper para leer usuario del localStorage
const getStoredUser = (): UsuarioAuth | null => {
  const raw = localStorage.getItem("ahorrape-user");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as UsuarioAuth;
    return parsed;
  } catch {
    localStorage.removeItem("ahorrape-user");
    localStorage.removeItem("ahorrape-token");
    return null;
  }
};

interface RequireAuthProps {
  children: JSX.Element;
}

// 🔹 Wrapper de ruta protegida
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const usuario = getStoredUser();
  const token = localStorage.getItem("ahorrape-token");

  const isAuthenticated = !!usuario && !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<AuthPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* Rutas con layout (protegidas) */}
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/usuarios"
            element={
              <RequireAuth>
                <UsuariosPage />
              </RequireAuth>
            }
          />
          <Route
            path="/categorias"
            element={
              <RequireAuth>
                <CategoriasPage />
              </RequireAuth>
            }
          />
          <Route
            path="/transacciones"
            element={
              <RequireAuth>
                <TransaccionesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/cuenta"
            element={
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            }
          />
          <Route
            path="/planes"
            element={
              <RequireAuth>
                <PlanesPage />
              </RequireAuth>
            }
          />
          {/* 👇 nueva ruta protegida para el historial detallado */}
          <Route
            path="/historial"
            element={
              <RequireAuth>
                <HistorialPage />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
