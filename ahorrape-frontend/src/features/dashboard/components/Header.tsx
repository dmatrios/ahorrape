// src/features/dashboard/components/Header.tsx
import React from "react";
import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PlanUsuario } from "../../auth/api/authApi";

interface HeaderProps {
  username: string;
  plan?: PlanUsuario;
}

const getPlanCtaLabel = (plan: PlanUsuario | undefined): string => {
  if (!plan || plan === "FREE") return "Vuelvete PRO";
  if (plan === "PRO") return "Vuelvete un Master del ahorro";
  return "¡Qué master del ahorro eres!"; // MASTER_DEL_AHORRO
};

const Header: React.FC<HeaderProps> = ({ username, plan }) => {
  const navigate = useNavigate();
  const ctaLabel = getPlanCtaLabel(plan);

  return (
    <header className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa solo para mobile (para futuro sidebar) */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Hola, {username} 👋
          </h1>
          <p className="text-sm text-slate-500">
            Este es tu resumen del mes.
          </p>
        </div>
      </div>

      {/* Zona derecha: CTA de plan + icono de usuario */}
      <div className="flex items-center gap-2">
        {/* CTA dinámico según el plan */}
        <button
          type="button"
          onClick={() => navigate("/planes")}
          className="hidden sm:inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          {ctaLabel}
        </button>

        {/* Versión compacta para pantallas muy pequeñas */}
        <button
          type="button"
          onClick={() => navigate("/planes")}
          className="sm:hidden inline-flex items-center justify-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Planes
        </button>

        {/* Icono de usuario → pantalla de cuenta */}
        <button
          type="button"
          onClick={() => navigate("/cuenta")}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
