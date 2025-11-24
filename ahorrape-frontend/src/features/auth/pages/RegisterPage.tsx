// src/features/auth/pages/RegisterPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { registrarUsuario } from "../../usuarios/api/usuariosApi";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombre || !email || !password || !passwordConfirm) {
      setErrorMsg("Completa todos los campos.");
      return;
    }

    // Validar formato básico de correo
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMsg("Ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await registrarUsuario({ nombre, email, password });

      // Limpiar formulario (opcional)
      setNombre("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");

      // Redirigir automáticamente a login
      navigate("/login");
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 409) {
        setErrorMsg(
          err.response.data?.mensaje ||
            "No se pudo registrar el usuario. Verifica los datos."
        );
      } else {
        setErrorMsg(
          "Ocurrió un error al conectar con el servidor. Inténtalo de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Pantalla de auth (login)
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        {/* Botón volver estilo pill, consistente con Login */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Volver"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </button>

        {/* Card de registro */}
        <div className="mt-4 w-full bg-white shadow-lg rounded-3xl border border-slate-200 px-8 py-10">
          <h1 className="text-2xl font-semibold text-slate-800 mb-1 text-left">
            Crear cuenta
          </h1>
          <p className="text-sm text-slate-600 mb-8">
            Registra tus datos para comenzar a usar AhorraPE.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                placeholder="Tu nombre"
              />
            </div>

            {/* Correo */}
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

            {/* Contraseña */}
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
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-2.5 flex items-center text-slate-500 hover:text-slate-700 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Confirmar contraseña
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-2.5 flex items-center">
                  <Lock className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((v) => !v)}
                  className="absolute right-3 top-2.5 flex items-center text-slate-500 hover:text-slate-700 transition"
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
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
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          {/* Link a login */}
          <p className="mt-6 text-xs text-slate-600 text-center">
            ¿Ya tienes una cuenta?{" "}
            <button
              type="button"
              className="text-emerald-600 font-semibold hover:underline"
              onClick={() => navigate("/login")}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
