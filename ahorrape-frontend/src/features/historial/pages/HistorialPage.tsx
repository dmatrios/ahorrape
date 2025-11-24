import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, FileText, X } from "lucide-react";
import {
  listarTransaccionesPorUsuario,
  type TransaccionResponse,
} from "../../transacciones/api/transaccionesApi";
import type { UsuarioAuth } from "../../auth/api/authApi";

type FiltroTipo = "TODOS" | "INGRESO" | "GASTO";
type PeriodoFiltro = "DIA" | "MES" | "ANIO";

const HistorialPage: React.FC = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("ahorrape-user");
  const usuario: UsuarioAuth | null = storedUser
    ? (JSON.parse(storedUser) as UsuarioAuth)
    : null;

  const [transacciones, setTransacciones] = useState<TransaccionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("TODOS");
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("MES");

  const hoy = new Date();

  const [fechaDia, setFechaDia] = useState<string>(
    hoy.toISOString().slice(0, 10) // YYYY-MM-DD
  );
  const [fechaMes, setFechaMes] = useState<string>(
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}` // YYYY-MM
  );
  const [fechaAnio, setFechaAnio] = useState<string>(
    String(hoy.getFullYear())
  );

  // Modal PDF
  const [showPdfModal, setShowPdfModal] = useState(false);

  const cargarTransacciones = async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await listarTransaccionesPorUsuario(usuario.id);
      setTransacciones(data);
    } catch (err: any) {
      setErrorMsg(
        "No se pudo cargar el historial de movimientos. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }
    cargarTransacciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!usuario) {
    return null;
  }

  // 🔍 Aplicar filtros (tipo + periodo)
  const transaccionesFiltradas = transacciones.filter((t) => {
    // 1. Tipo
    if (filtroTipo !== "TODOS" && t.tipo !== filtroTipo) {
      return false;
    }

    // t.fecha: "YYYY-MM-DD"
    const [anioStr, mesStr, diaStr] = t.fecha.split("-");
    const anio = Number(anioStr);
    const mes = Number(mesStr);
    const dia = Number(diaStr);

    if (periodo === "DIA") {
      if (!fechaDia) return true;
      const [fAnio, fMes, fDia] = fechaDia.split("-").map(Number);
      return anio === fAnio && mes === fMes && dia === fDia;
    }

    if (periodo === "MES") {
      if (!fechaMes) return true;
      const [fAnio, fMes] = fechaMes.split("-").map(Number);
      return anio === fAnio && mes === fMes;
    }

    if (periodo === "ANIO") {
      if (!fechaAnio) return true;
      const fAnio = Number(fechaAnio);
      return anio === fAnio;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header superior con botón volver */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Historial detallado
            </h1>
            <p className="text-sm text-slate-500">
              Revisa todos tus movimientos con filtros por tipo y periodo.
            </p>
          </div>
        </div>

        {/* Estado rápido (opcional) */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            Usuario: <span className="font-semibold">{usuario.nombre}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
            Total registros:{" "}
            <span className="font-semibold">{transacciones.length}</span>
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-800">
            Filtros del historial
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Filtro por tipo */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">Tipo</p>
            <div className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 p-1 text-xs">
              <button
                type="button"
                onClick={() => setFiltroTipo("TODOS")}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  filtroTipo === "TODOS"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo("INGRESO")}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  filtroTipo === "INGRESO"
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Ingresos
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo("GASTO")}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  filtroTipo === "GASTO"
                    ? "bg-rose-100 text-rose-700"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Gastos
              </button>
            </div>
          </div>

          {/* Tipo de periodo */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">
              Ver por periodo
            </p>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPeriodo("DIA")}
                className={`flex-1 px-3 py-1.5 rounded-full border transition ${
                  periodo === "DIA"
                    ? "bg-white border-emerald-300 text-emerald-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Día
              </button>
              <button
                type="button"
                onClick={() => setPeriodo("MES")}
                className={`flex-1 px-3 py-1.5 rounded-full border transition ${
                  periodo === "MES"
                    ? "bg-white border-emerald-300 text-emerald-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Mes
              </button>
              <button
                type="button"
                onClick={() => setPeriodo("ANIO")}
                className={`flex-1 px-3 py-1.5 rounded-full border transition ${
                  periodo === "ANIO"
                    ? "bg-white border-emerald-300 text-emerald-700 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Año
              </button>
            </div>
          </div>

          {/* Selector de fecha según periodo */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">
              Seleccionar {periodo === "DIA" ? "día" : periodo === "MES" ? "mes" : "año"}
            </p>

            {periodo === "DIA" && (
              <input
                type="date"
                value={fechaDia}
                onChange={(e) => setFechaDia(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            )}

            {periodo === "MES" && (
              <input
                type="month"
                value={fechaMes}
                onChange={(e) => setFechaMes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            )}

            {periodo === "ANIO" && (
              <input
                type="number"
                min="2000"
                max="2100"
                value={fechaAnio}
                onChange={(e) => setFechaAnio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                placeholder="Ej: 2025"
              />
            )}

            <p className="text-[11px] text-slate-400">
              El filtro se aplica automáticamente al listado de abajo.
            </p>
          </div>
        </div>
      </div>

      {/* Listado detallado */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-800">
            Resultados del historial
          </h2>
          <p className="text-xs text-slate-500">
            Mostrando{" "}
            <span className="font-semibold">
              {transaccionesFiltradas.length}
            </span>{" "}
            movimiento(s) según los filtros.
          </p>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Cargando historial...</p>
        )}

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        {!loading &&
          !errorMsg &&
          transacciones.length === 0 && (
            <p className="text-sm text-slate-500">
              Aún no registras movimientos.
            </p>
          )}

        {!loading &&
          !errorMsg &&
          transacciones.length > 0 &&
          transaccionesFiltradas.length === 0 && (
            <p className="text-sm text-slate-500">
              No hay movimientos para los filtros seleccionados.
            </p>
          )}

        {transaccionesFiltradas.length > 0 && (
          <>
            {/* Desktop tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Fecha
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Descripción
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Categoría
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      Tipo
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-600">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transaccionesFiltradas.map((t) => (
                    <tr
                      key={t.id}
                      className="border-t border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="px-3 py-2 text-slate-600">
                        {t.fecha}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {t.descripcion || "Movimiento"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {t.categoriaNombre}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            t.tipo === "INGRESO"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {t.tipo === "INGRESO" ? "Ingreso" : "Gasto"}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-semibold ${
                          t.tipo === "INGRESO"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {t.tipo === "INGRESO" ? "+ " : "- "}
                        {t.monto.toLocaleString("es-PE", {
                          style: "currency",
                          currency: "PEN",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {transaccionesFiltradas.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-800">
                        {t.descripcion || "Movimiento"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {t.categoriaNombre} · {t.fecha}
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            t.tipo === "INGRESO"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}
                        >
                          {t.tipo === "INGRESO" ? "Ingreso" : "Gasto"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        t.tipo === "INGRESO"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {t.tipo === "INGRESO" ? "+ " : "- "}
                      {t.monto.toLocaleString("es-PE", {
                        style: "currency",
                        currency: "PEN",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Botón para generar PDF */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPdfModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1CAC78] text-white text-sm font-semibold hover:bg-[#50C878] transition shadow-sm"
        >
          <FileText className="w-4 h-4" />
          <span>Generar reporte PDF</span>
        </button>
      </div>

      {/* Modal PDF pronto */}
      {showPdfModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 px-6 py-6 relative">
            <button
              type="button"
              onClick={() => setShowPdfModal(false)}
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-[#1CAC78]" />
              <h2 className="text-sm font-semibold text-slate-800">
                Generar reporte PDF
              </h2>
            </div>

            <p className="text-sm text-slate-700 mb-2">
              Esta funcionalidad estará disponible muy pronto.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Podrás descargar un reporte en PDF con tu historial filtrado por
              tipo y periodo para analizar tus finanzas o compartirlo.
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 rounded-full bg-[#1CAC78] text-white text-xs font-semibold hover:bg-[#50C878] transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialPage;
