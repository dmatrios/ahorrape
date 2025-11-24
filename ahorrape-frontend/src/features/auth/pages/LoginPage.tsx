// src/features/auth/pages/LoginPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const { token, usuario } = await login({ email, password });

      localStorage.setItem("ahorrape-token", token);
      localStorage.setItem("ahorrape-user", JSON.stringify(usuario));

      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 401) {
        setErrorMsg(
          err.response.data?.mensaje || "Correo o contraseña incorrectos."
        );
      } else {
        setErrorMsg("Error de conexión. Inténtalo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Siempre volver a la auth/landing page
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        {/* Botón volver estilo pill, sencillo */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Volver"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </button>

        {/* Card de login */}
        <div className="mt-4 bg-white shadow-lg rounded-3xl border border-slate-200 px-8 py-10">
          {/* Título */}
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">
            Iniciar sesión
          </h1>
          <p className="text-sm text-slate-600 mb-8">
            Ingresa tus credenciales para acceder a tu resumen en AhorraPE.
          </p>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-2.5 flex items-center">
                  <Mail className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-2.5 flex items-center">
                  <Lock className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 flex items-center text-slate-500 hover:text-slate-700 transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <p className="text-xs text-red-600 mt-1 text-center">
                {errorMsg}
              </p>
            )}

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Entrar"}
            </button>
          </form>

          {/* Registro */}
          <p className="mt-6 text-center text-xs text-slate-600">
            ¿No tienes una cuenta?{" "}
            <button
              className="text-emerald-600 font-semibold hover:underline"
              onClick={() => navigate("/registro")}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
