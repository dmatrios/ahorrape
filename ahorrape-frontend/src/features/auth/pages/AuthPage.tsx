import React from "react";
import { PiggyBank, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../../assets/auth-hero.png";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex px-4 py-8">
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Columna izquierda: contenido (mobile y desktop) */}
        <section className="space-y-8 text-center md:text-left">
          {/* Logo */}
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-11 h-11 rounded-full bg-[#1CAC78] flex items-center justify-center shadow-md">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#008080]">
                AhorraPe
              </span>
              <span className="text-xs uppercase tracking-wide text-[#1CAC78]">
                Gestor de gastos personales
              </span>
            </div>
          </div>

          {/* Texto principal */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#008080]">
              Tu dinero bajo control.
            </h1>
            <p className="text-sm md:text-base text-[#008080]/80 max-w-lg mx-auto md:mx-0">
              Organiza tus ingresos y gastos, visualiza tu resumen mensual
              y toma mejores decisiones financieras con AhorraPe.
            </p>
          </div>

          {/* Imagen SOLO en mobile entre texto y beneficios */}
          <div className="flex justify-center md:hidden">
            <div className="relative h-56 w-56 sm:h-64 sm:w-64">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#50C878] via-[#40E0D0] to-[#008080] opacity-90 shadow-2xl" />
              <img
                src={heroImage}
                alt="Persona ahorrando con AhorraPe"
                className="relative w-full h-full object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* Beneficios */}
          <div className="space-y-2 text-sm max-w-md mx-auto md:mx-0">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#008080]/85">
              <CheckCircle2 className="w-4 h-4 text-[#1CAC78]" />
              <span>Registra ingresos y gastos en segundos.</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#008080]/85">
              <CheckCircle2 className="w-4 h-4 text-[#1CAC78]" />
              <span>Resumen mensual claro y visual.</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#008080]/85">
              <CheckCircle2 className="w-4 h-4 text-[#1CAC78]" />
              <span>Categorías personalizables para tu día a día.</span>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-4 flex flex-col gap-3 max-w-md mx-auto md:mx-0">
            <button
              className="w-full py-3 rounded-full bg-[#1CAC78] text-white font-semibold text-sm shadow-md hover:bg-[#50C878] transition"
              onClick={() => navigate("/login")}
            >
              Iniciar Sesión
            </button>

            <button
              className="w-full py-3 rounded-full border border-[#1CAC78] text-[#1CAC78] font-semibold text-sm bg-transparent hover:bg-[#50C878]/10 transition"
              onClick={() => navigate("/registro")}
            >
              Registrar
            </button>

            <p className="text-[11px] text-[#008080]/70 mt-1">
              Tu sesión es segura con autenticación por token.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-2 text-[11px] text-[#008080]/70">
            © {new Date().getFullYear()} AhorraPe. Todos los derechos
            reservados.
          </div>
        </section>

        {/* Columna derecha: ilustración SOLO en desktop */}
        <section className="relative hidden md:flex items-center justify-center">
          <div className="absolute h-80 w-80 md:h-96 md:w-96 rounded-full bg-gradient-to-br from-[#50C878] via-[#40E0D0] to-[#008080] opacity-90 shadow-2xl" />
          <img
            src={heroImage}
            alt="Persona ahorrando con AhorraPe"
            className="relative w-3/4 max-w-md drop-shadow-xl"
          />
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
