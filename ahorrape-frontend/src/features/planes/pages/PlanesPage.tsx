// src/features/planes/pages/PlanesPage.tsx
import React from "react";

const PlanesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg border border-slate-200 px-8 py-10 text-center">
        <h1 className="text-2xl font-semibold text-slate-800 mb-3">
          Planes AhorraPE
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Estamos trabajando para ofrecerte{" "}
          <span className="font-semibold text-emerald-600">AhorraPE PRO</span> y{" "}
          <span className="font-semibold text-emerald-700">
            Master del Ahorro
          </span>{" "}
          con más herramientas, reportes avanzados y soporte prioritario.
        </p>

        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl px-4 py-6 mb-6">
          <p className="text-sm text-slate-500">
            💳 Página de pago{" "}
            <span className="font-semibold text-slate-700">
              próximamente implementada
            </span>
            .
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Aquí se integrará la pasarela de pago y la activación automática de
            planes.
          </p>
        </div>

        <p className="text-xs text-slate-500">
          Por ahora puedes seguir usando{" "}
          <span className="font-semibold text-emerald-600">AhorraPE FREE</span>{" "}
          sin problemas.
        </p>
      </div>
    </div>
  );
};

export default PlanesPage;
