// src/features/dashboard/pages/DashboardPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerResumenMensual,
  type ResumenMensualResponse,
} from "../api/resumenApi";

import Header from "../components/Header";
import BalanceCard from "../components/BalanceCard";
import SummaryCards from "../components/SummaryCards";
import RecentMovements from "../components/RecentMovements";
import {
  listarCategorias,
  type CategoriaResponse,
} from "../../categorias/api/categoriasApi";
import { crearTransaccion } from "../../transacciones/api/transaccionesApi";
import type { UsuarioAuth } from "../../auth/api/authApi";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [resumen, setResumen] = useState<ResumenMensualResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showAlertModal, setShowAlertModal] = useState(false);

  // 🔔 Modal de upgrade de plan
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Categorías para el modal de registro rápido
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Modal registro rápido
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickTipo, setQuickTipo] = useState<"INGRESO" | "GASTO">("GASTO");
  const [quickCategoriaId, setQuickCategoriaId] = useState<string>("");
  const [quickMonto, setQuickMonto] = useState<string>("");
  const [quickFecha, setQuickFecha] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [quickDescripcion, setQuickDescripcion] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  // 🧍‍♀️ Usuario logueado
  const storedUser = localStorage.getItem("ahorrape-user");
  const usuario: UsuarioAuth | null = storedUser
    ? (JSON.parse(storedUser) as UsuarioAuth)
    : null;

  const cargarResumen = async () => {
    if (!usuario) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const ahora = new Date();
      const mes = ahora.getMonth() + 1; // JS: 0 = enero
      const anio = ahora.getFullYear();

      const data = await obtenerResumenMensual(usuario.id, mes, anio);
      setResumen(data);

      // Alerta si se está gastando más de lo que se ingresa
      if (data.totalGastos > data.totalIngresos) {
        setShowAlertModal(true);
      } else {
        setShowAlertModal(false);
      }
    } catch (err: any) {
      setErrorMsg(
        "No se pudo cargar el resumen mensual. Intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const data = await listarCategorias();
      setCategorias(data);
    } catch (err) {
      // si falla, el modal se encargará de mostrar el mensaje de "sin categorías"
    } finally {
      setLoadingCategorias(false);
    }
  };

  useEffect(() => {
    // Si no hay usuario logueado → al login
    if (!usuario) {
      navigate("/login");
      return;
    }

    // 👇 Modal de upgrade solo una vez por sesión y por usuario
    const upgradeKey = `ahorrape-upgrade-shown-${usuario.id}`;
    const alreadyShown = sessionStorage.getItem(upgradeKey);

    if (usuario.plan === "FREE" && !alreadyShown) {
      setShowUpgradeModal(true);
      sessionStorage.setItem(upgradeKey, "true");
    }

    cargarResumen();
    cargarCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!usuario) {
    // Mientras redirige
    return null;
  }

  // 🔢 Gráfico: cálculo de gastos por categoría
  const gastosPorCategoria =
    resumen?.transaccionesDelMes
      .filter((t) => t.tipo === "GASTO")
      .reduce(
        (acc, t) => {
          const existente = acc.find(
            (item) => item.categoria === t.categoriaNombre
          );
          if (existente) {
            existente.total += t.monto;
          } else {
            acc.push({
              categoria: t.categoriaNombre,
              total: t.monto,
            });
          }
          return acc;
        },
        [] as { categoria: string; total: number }[]
      ) || [];

  const maxGasto = gastosPorCategoria.reduce(
    (max, item) => (item.total > max ? item.total : max),
    0
  );

  const totalGastosPie = gastosPorCategoria.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const pieColors = [
    "#1CAC78",
    "#50C878",
    "#40E0D0",
    "#f97373",
    "#fb923c",
    "#6366f1",
  ];

  let startAngle = 0;
  const pieSegments = gastosPorCategoria
    .map((item, index) => {
      const angle =
        totalGastosPie > 0 ? (item.total / totalGastosPie) * 360 : 0;
      const endAngle = startAngle + angle;
      const color = pieColors[index % pieColors.length];
      const segment = `${color} ${startAngle}deg ${endAngle}deg`;
      startAngle = endAngle;
      return segment;
    })
    .join(", ");

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setQuickError(null);

    if (!quickCategoriaId || !quickMonto) {
      setQuickError("Completa al menos categoría y monto.");
      return;
    }

    const montoNumber = Number(quickMonto);
    if (isNaN(montoNumber) || montoNumber <= 0) {
      setQuickError("Ingresa un monto válido mayor a 0.");
      return;
    }

    setQuickLoading(true);
    try {
      await crearTransaccion({
        usuarioId: usuario.id,
        categoriaId: Number(quickCategoriaId),
        monto: montoNumber,
        tipo: quickTipo,
        fecha: quickFecha,
        descripcion: quickDescripcion,
      });

      setShowQuickModal(false);
      setQuickDescripcion("");
      setQuickMonto("");
      setQuickCategoriaId("");
      setQuickTipo("GASTO");
      setQuickFecha(new Date().toISOString().slice(0, 10));

      await cargarResumen();
    } catch (err) {
      console.error(err);
      setQuickError(
        "No se pudo registrar el movimiento. Intenta nuevamente."
      );
    } finally {
      setQuickLoading(false);
    }
  };

  // Categorías filtradas por el tipo elegido (INGRESO / GASTO)
  const categoriasFiltradas = categorias.filter(
    (c) => c.tipoCategoria === quickTipo
  );

  return (
    <div className="space-y-6">
      {/* Header con el nombre real del usuario + CTA de plan */}
      <Header username={usuario.nombre} plan={usuario.plan} />

      {loading && (
        <p className="text-sm text-slate-500">Cargando resumen del mes...</p>
      )}

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      {resumen && (
        <>
          {/* Tarjeta de saldo */}
          <BalanceCard saldo={resumen.saldo} />

          {/* Tarjetas de ingresos / gastos */}
          <SummaryCards
            totalIngresos={resumen.totalIngresos}
            totalGastos={resumen.totalGastos}
          />

          {/* Botones de navegación */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-2">
            <button
              type="button"
              onClick={() => navigate("/transacciones")}
              className="px-4 py-2 rounded-full bg-[#1CAC78] text-white text-sm font-medium hover:bg-[#50C878] transition w-full sm:w-auto text-center"
            >
              Registrar / historial
            </button>

            <button
              type="button"
              onClick={() => navigate("/categorias")}
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition w-full sm:w-auto text-center"
            >
              Gestionar categorías
            </button>

            <button
              type="button"
              onClick={() => setShowQuickModal(true)}
              className="px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition w-full sm:w-auto text-center"
            >
              Registro rápido
            </button>
          </div>

          {/* Gráficos de gastos por categoría */}
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-2">
              Gastos por categoría (este mes)
            </h2>

            {gastosPorCategoria.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <span className="text-[11px] text-slate-400 px-3">
                    Aún no hay datos
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-xs">
                  Este gráfico se calculará a través de tus gastos. Registra tu
                  primer movimiento para ver cómo se distribuyen por categoría.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/transacciones")}
                  className="mt-1 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Registrar el primero aquí
                </button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Barras */}
                <div className="space-y-3">
                  {gastosPorCategoria.map((item) => {
                    const porcentaje =
                      maxGasto > 0 ? (item.total / maxGasto) * 100 : 0;
                    return (
                      <div key={item.categoria} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-600">
                          <span>{item.categoria}</span>
                          <span>
                            {item.total.toLocaleString("es-PE", {
                              style: "currency",
                              currency: "PEN",
                            })}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#1CAC78] via-[#50C878] to-[#40E0D0]"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pie chart */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <div
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full border border-slate-100"
                    style={{
                      backgroundImage:
                        totalGastosPie > 0
                          ? `conic-gradient(${pieSegments})`
                          : "none",
                    }}
                  >
                    {totalGastosPie === 0 && (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                        Sin datos
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 w-full">
                    {gastosPorCategoria.map((item, index) => (
                      <div
                        key={item.categoria}
                        className="flex items-center justify-between text-[11px] text-slate-600"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                pieColors[index % pieColors.length],
                            }}
                          />
                          <span>{item.categoria}</span>
                        </div>
                        <span>
                          {(
                            (item.total / totalGastosPie) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Movimientos recientes (solo 4 últimos) */}
          <RecentMovements
            movimientos={resumen.transaccionesDelMes
              .slice(0, 4)
              .map((t) => ({
                id: t.id,
                titulo: t.descripcion || "Movimiento",
                categoria: t.categoriaNombre,
                monto: t.tipo === "INGRESO" ? t.monto : -t.monto,
                fecha: t.fecha,
              }))}
          />
        </>
      )}

      {!loading && !resumen && !errorMsg && (
        <p className="text-sm text-slate-500">
          Aún no tienes movimientos este mes. Comienza registrando tu primer
          ingreso o gasto.
        </p>
      )}

      {/* Modal de alerta: estás por debajo del presupuesto */}
      {showAlertModal && resumen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-rose-200 px-6 py-6">
            <h2 className="text-lg font-semibold text-rose-700 mb-2">
              Estás por debajo del presupuesto
            </h2>
            <p className="text-sm text-slate-700 mb-3">
              Tus gastos de este mes (
              {resumen.totalGastos.toLocaleString("es-PE", {
                style: "currency",
                currency: "PEN",
              })}
              ) superan tus ingresos (
              {resumen.totalIngresos.toLocaleString("es-PE", {
                style: "currency",
                currency: "PEN",
              })}
              ).
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Revisa tus categorías de gasto y ajusta tus movimientos para
              volver a un saldo positivo.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate("/transacciones")}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Ver movimientos
              </button>
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de upgrade de plan (plan FREE) */}
      {showUpgradeModal && usuario.plan === "FREE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-emerald-100 px-6 py-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Potencia tu ahorro 🚀
            </h2>
            <p className="text-sm text-slate-600 mb-3">
              Estás usando <span className="font-semibold">AhorraPE FREE</span>.
              Muy pronto podrás desbloquear{" "}
              <span className="font-semibold text-emerald-600">
                funciones PRO
              </span>{" "}
              y del plan{" "}
              <span className="font-semibold text-emerald-700">
                Master del Ahorro
              </span>
              .
            </p>

            <ul className="text-xs text-slate-600 space-y-1 mb-4">
              <li>• Reportes más detallados y comparativos por mes.</li>
              <li>• Más métricas para tomar mejores decisiones.</li>
              <li>• Funcionalidades avanzadas para controlar tus hábitos.</li>
            </ul>

            <p className="text-[11px] text-slate-500 mb-4">
              Esta es una vista previa. La página de pago está en desarrollo. 👨‍💻
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-full border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Seguir con versión FREE
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/planes");
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Ver planes (mock)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de registro rápido */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-slate-800">
                  Registro rápido
                </h2>
                <p className="text-xs text-slate-500">
                  Añade un ingreso o gasto sin salir del tablero.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Filtrado automáticamente por tipo de categoría.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickModal(false)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cerrar
              </button>
            </div>

            {loadingCategorias ? (
              <p className="text-xs text-slate-500">
                Cargando categorías...
              </p>
            ) : categorias.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Todavía no tienes categorías creadas. Para registrar un
                  movimiento rápido necesitas al menos una categoría.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickModal(false);
                    navigate("/categorias");
                  }}
                  className="w-full py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Crear una categoría
                </button>
              </div>
            ) : categoriasFiltradas.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  No tienes categorías de{" "}
                  {quickTipo === "GASTO" ? "gasto" : "ingreso"} creadas aún.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickModal(false);
                    navigate("/categorias");
                  }}
                  className="w-full py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Crear categoría de {quickTipo === "GASTO" ? "gasto" : "ingreso"}
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleQuickSubmit}>
                {/* Tipo */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">
                    Tipo de movimiento
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQuickTipo("INGRESO");
                        setQuickCategoriaId("");
                      }}
                      className={`flex-1 py-1.5 rounded-full text-xs font-semibold border ${
                        quickTipo === "INGRESO"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      Ingreso
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickTipo("GASTO");
                        setQuickCategoriaId("");
                      }}
                      className={`flex-1 py-1.5 rounded-full text-xs font-semibold border ${
                        quickTipo === "GASTO"
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      Gasto
                    </button>
                  </div>
                </div>

                {/* Categoría (filtrada por tipoCategoria) */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Categoría de {quickTipo === "GASTO" ? "gasto" : "ingreso"}
                  </label>
                  <select
                    value={quickCategoriaId}
                    onChange={(e) => setQuickCategoriaId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-white"
                  >
                    <option value="">
                      Selecciona una categoría de{" "}
                      {quickTipo === "GASTO" ? "gasto" : "ingreso"}
                    </option>
                    {categoriasFiltradas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monto y fecha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Monto (S/.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={quickMonto}
                      onChange={(e) => setQuickMonto(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={quickFecha}
                      onChange={(e) => setQuickFecha(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Descripción (opcional)
                  </label>
                  <input
                    type="text"
                    value={quickDescripcion}
                    onChange={(e) => setQuickDescripcion(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    placeholder="Ej: Almuerzo, sueldo, etc."
                  />
                </div>

                {quickError && (
                  <p className="text-[11px] text-red-600 text-center">
                    {quickError}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickModal(false)}
                    className="px-4 py-2 rounded-full border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={quickLoading}
                    className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {quickLoading ? "Guardando..." : "Guardar movimiento"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
