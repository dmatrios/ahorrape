// src/features/transacciones/pages/TransaccionesPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarTransaccionesPorUsuario,
  crearTransaccion,
  actualizarTransaccion,
  eliminarTransaccion,
  type TransaccionResponse,
  type TipoTransaccion,
} from "../api/transaccionesApi";
import {
  listarCategorias,
  type CategoriaResponse,
} from "../../categorias/api/categoriasApi";
import { Edit3, Trash2, X, AlertTriangle, ArrowLeft } from "lucide-react";
import type { UsuarioAuth } from "../../auth/api/authApi";

type FiltroTipo = "TODOS" | "INGRESO" | "GASTO";

const TransaccionesPage: React.FC = () => {
  const storedUser = localStorage.getItem("ahorrape-user");
  const usuario: UsuarioAuth | null = storedUser
    ? (JSON.parse(storedUser) as UsuarioAuth)
    : null;

  const navigate = useNavigate();

  const [transacciones, setTransacciones] = useState<TransaccionResponse[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtro de tipo en el historial (Todos / Ingresos / Gastos)
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("TODOS");

  // Form crear
  const [tipo, setTipo] = useState<TipoTransaccion>("GASTO");
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  });
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Editar (modal)
  const [editingTransaccion, setEditingTransaccion] =
    useState<TransaccionResponse | null>(null);
  const [editTipo, setEditTipo] = useState<TipoTransaccion>("GASTO"); // solo lectura en UI
  const [editCategoriaId, setEditCategoriaId] = useState<number | "">("");
  const [editMonto, setEditMonto] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Eliminar (modal)
  const [deleteTarget, setDeleteTarget] =
    useState<TransaccionResponse | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Modal alerta presupuesto
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const cargarDatos = async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const [trans, cats] = await Promise.all([
        listarTransaccionesPorUsuario(usuario.id),
        listarCategorias(),
      ]);
      setTransacciones(trans);
      setCategorias(cats);
    } catch (err: any) {
      setErrorMsg(
        "No se pudieron cargar las transacciones y categorías."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtro de categorías para crear
  const categoriasFiltradas = categorias.filter((c) => {
    if (tipo === "INGRESO") {
      return c.tipoCategoria === "INGRESO" || c.tipoCategoria === "AMBOS";
    }
    return c.tipoCategoria === "GASTO" || c.tipoCategoria === "AMBOS";
  });

  // Filtro de categorías para editar (según editTipo, pero sin permitir cambiar el tipo)
  const categoriasFiltradasEdit = categorias.filter((c) => {
    if (editTipo === "INGRESO") {
      return c.tipoCategoria === "INGRESO" || c.tipoCategoria === "AMBOS";
    }
    return c.tipoCategoria === "GASTO" || c.tipoCategoria === "AMBOS";
  });

  // Cálculo presupuesto del mes actual
  const ahora = new Date();
  const mesActual = ahora.getMonth() + 1;
  const anioActual = ahora.getFullYear();

  let totalIngresosMes = 0;
  let totalGastosMes = 0;

  transacciones.forEach((t) => {
    const [anioStr, mesStr] = t.fecha.split("-");
    const anio = Number(anioStr);
    const mes = Number(mesStr);
    if (anio === anioActual && mes === mesActual) {
      if (t.tipo === "INGRESO") {
        totalIngresosMes += t.monto;
      } else {
        totalGastosMes += t.monto;
      }
    }
  });

  const estaDebajoPresupuesto = totalGastosMes > totalIngresosMes;

  useEffect(() => {
    if (estaDebajoPresupuesto) {
      setShowBudgetModal(true);
    } else {
      setShowBudgetModal(false);
    }
  }, [estaDebajoPresupuesto]);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!usuario) {
      setFormError("Debes iniciar sesión para registrar movimientos.");
      return;
    }

    // Si no hay ninguna categoría creada
    if (categorias.length === 0) {
      setFormError("Primero crea una categoría para registrar movimientos.");
      return;
    }

    if (!categoriaId) {
      setFormError("Selecciona una categoría.");
      return;
    }

    const montoNumber = Number(monto);
    if (isNaN(montoNumber) || montoNumber <= 0) {
      setFormError("Ingresa un monto válido mayor a 0.");
      return;
    }

    setSaving(true);
    try {
      await crearTransaccion({
        usuarioId: usuario.id,
        categoriaId: Number(categoriaId),
        tipo,
        monto: montoNumber,
        fecha,
        descripcion: descripcion.trim(),
      });

      setMonto("");
      setDescripcion("");
      await cargarDatos();
    } catch (err: any) {
      if (err.response?.data?.mensaje) {
        setFormError(err.response.data.mensaje);
      } else {
        setFormError(
          "No se pudo registrar la transacción. Intenta de nuevo."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const abrirEditar = (t: TransaccionResponse) => {
    setEditingTransaccion(t);
    setEditTipo(t.tipo); // el tipo queda fijado al original
    setEditCategoriaId(t.categoriaId);
    setEditMonto(t.monto.toString());
    setEditFecha(t.fecha);
    setEditDescripcion(t.descripcion || "");
    setEditError(null);
  };

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaccion) return;

    setEditError(null);

    if (!editCategoriaId) {
      setEditError("Selecciona una categoría.");
      return;
    }

    // Validar que la categoría sea compatible con el tipo (INGRESO / GASTO)
    const categoriaValida = categoriasFiltradasEdit.some(
      (c) => c.id === Number(editCategoriaId)
    );

    if (!categoriaValida) {
      setEditError(
        "Selecciona una categoría válida para este tipo de movimiento."
      );
      return;
    }

    const montoNumber = Number(editMonto);
    if (isNaN(montoNumber) || montoNumber <= 0) {
      setEditError("Ingresa un monto válido mayor a 0.");
      return;
    }

    if (!editFecha) {
      setEditError("Selecciona una fecha.");
      return;
    }

    setEditSaving(true);
    try {
      await actualizarTransaccion(editingTransaccion.id, {
        categoriaId: Number(editCategoriaId),
        tipo: editTipo, // se mantiene el tipo original
        monto: montoNumber,
        fecha: editFecha,
        descripcion: editDescripcion.trim(),
      });

      await cargarDatos();
      setEditingTransaccion(null);
    } catch (err: any) {
      if (err.response?.data?.mensaje) {
        setEditError(err.response.data.mensaje);
      } else {
        setEditError(
          "No se pudo actualizar la transacción. Intenta de nuevo."
        );
      }
    } finally {
      setEditSaving(false);
    }
  };

  const abrirEliminar = (t: TransaccionResponse) => {
    setDeleteTarget(t);
    setDeleteError(null);
  };

  const handleEliminar = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    setDeleteSaving(true);
    try {
      await eliminarTransaccion(deleteTarget.id);
      await cargarDatos();
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.mensaje ||
          "No se pudo eliminar la transacción. Intenta de nuevo."
      );
    } finally {
      setDeleteSaving(false);
    }
  };

  if (!usuario) {
    return (
      <p className="text-sm text-red-600">
        No hay usuario en sesión. Vuelve a iniciar sesión.
      </p>
    );
  }

  // 🔍 Aplicar filtro de tipo al listado
  const transaccionesFiltradas = transacciones.filter((t) => {
    if (filtroTipo === "TODOS") return true;
    return t.tipo === filtroTipo;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-700"
          title="Volver al dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Movimientos
          </h1>
          <p className="text-sm text-slate-500">
            Registra nuevos ingresos o gastos y revisa tu historial.
          </p>
        </div>
      </div>

      {/* Resumen rápido del mes actual */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          Ingresos mes:{" "}
          {totalIngresosMes.toLocaleString("es-PE", {
            style: "currency",
            currency: "PEN",
          })}
        </span>
        <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
          Gastos mes:{" "}
          {totalGastosMes.toLocaleString("es-PE", {
            style: "currency",
            currency: "PEN",
          })}
        </span>
      </div>

      {/* Formulario registro + historial */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* FORMULARIO */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Registrar movimiento
          </h2>

          <form className="space-y-3" onSubmit={handleRegistrar}>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-700">
                Tipo
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipo("GASTO")}
                  className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    tipo === "GASTO"
                      ? "bg-rose-100 text-rose-700 border-rose-300"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("INGRESO")}
                  className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    tipo === "INGRESO"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Ingreso
                </button>
              </div>
            </div>

            {/* Categoría – con estado “sin categorías” */}
            {categorias.length === 0 ? (
              <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3">
                <p className="text-xs font-medium text-slate-700">
                  Categorías
                </p>
                <p className="text-[11px] text-slate-600">
                  Todavía no tienes categorías creadas. Crea la primera para
                  poder registrar tus movimientos.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/categorias")}
                  className="mt-1 inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Crear la primera categoría
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">
                  Categoría
                </label>
                <select
                  value={categoriaId}
                  onChange={(e) =>
                    setCategoriaId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                >
                  <option value="">Selecciona una categoría</option>
                  {categoriasFiltradas.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Solo se muestran categorías compatibles con el tipo
                  seleccionado.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">
                Monto
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">
                Descripción
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                placeholder="Opcional (ej: cena, sueldo...)"
              />
            </div>

            {formError && (
              <p className="text-xs text-red-600">{formError}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-1 py-2.5 rounded-full bg-[#1CAC78] text-white text-sm font-semibold hover:bg-[#50C878] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Registrar movimiento"}
            </button>
          </form>
        </div>

        {/* HISTORIAL */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          {/* Header del historial con filtros + botón Ver detallado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Historial de movimientos
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtros por tipo */}
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

              {/* Botón Ver detallado */}
              <button
                type="button"
                onClick={() => navigate("/historial")}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Ver detallado
              </button>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-slate-500">
              Cargando transacciones...
            </p>
          )}

          {errorMsg && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          {!loading && !errorMsg && transacciones.length === 0 && (
            <p className="text-sm text-slate-500">
              Aún no registras movimientos.
            </p>
          )}

          {/* Hay movimientos en general, pero el filtro no tiene resultados */}
          {transacciones.length > 0 &&
            transaccionesFiltradas.length === 0 &&
            !loading &&
            !errorMsg && (
              <p className="text-sm text-slate-500">
                No hay movimientos para este filtro.
              </p>
            )}

          {transaccionesFiltradas.length > 0 && (
            <>
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
                      <th className="px-3 py-2 text-right font-semibold text-slate-600">
                        Monto
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-600">
                        Acciones
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
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => abrirEditar(t)}
                              className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => abrirEliminar(t)}
                              className="p-1.5 rounded-full border border-rose-200 hover:bg-rose-50 text-rose-600"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {transaccionesFiltradas.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {t.descripcion || "Movimiento"}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {t.categoriaNombre} · {t.fecha}
                        </div>
                      </div>

                      <div
                        className={`font-semibold ${
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

                    <div className="mt-3 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => abrirEditar(t)}
                        className="p-1.5 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirEliminar(t)}
                        className="p-1.5 rounded-full border border-rose-200 hover:bg-rose-50 text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de editar */}
      {editingTransaccion && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 px-6 py-6 relative">
            <button
              type="button"
              onClick={() => setEditingTransaccion(null)}
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              Editar movimiento
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Ajusta la categoría, el monto, la fecha o la descripción.
            </p>

            <form className="space-y-3" onSubmit={handleEditar}>
              {/* Tipo solo lectura */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-700">
                  Tipo
                </span>
                <div
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                    editTipo === "INGRESO"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {editTipo === "INGRESO" ? "Ingreso" : "Gasto"}
                </div>
                <p className="text-[10px] text-slate-400">
                  El tipo de movimiento no se puede cambiar. Si necesitas
                  registrar otro tipo, crea un nuevo movimiento.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">
                  Categoría
                </label>
                <select
                  value={editCategoriaId}
                  onChange={(e) =>
                    setEditCategoriaId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                >
                  <option value="">Selecciona una categoría</option>
                  {categoriasFiltradasEdit.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">
                  Monto
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editMonto}
                  onChange={(e) => setEditMonto(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">
                  Fecha
                </label>
                <input
                  type="date"
                  value={editFecha}
                  onChange={(e) => setEditFecha(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">
                  Descripción
                </label>
                <input
                  type="text"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1CAC78]/60 focus:border-[#1CAC78]"
                  placeholder="Opcional"
                />
              </div>

              {editError && (
                <p className="text-xs text-red-600">{editError}</p>
              )}

              <button
                type="submit"
                disabled={editSaving}
                className="w-full mt-1 py-2.5 rounded-full bg-[#1CAC78] text-white text-sm font-semibold hover:bg-[#50C878] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editSaving ? "Guardando cambios..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de eliminar */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-rose-200 px-6 py-6 relative">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h2 className="text-sm font-semibold text-slate-800">
                ¿Eliminar movimiento?
              </h2>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Esta acción marcará el movimiento como eliminado. Podrás
              registrarlo nuevamente más adelante si lo necesitas.
            </p>
            <p className="text-xs text-slate-500 mb-1">
              <span className="font-semibold">
                {deleteTarget.descripcion || "Movimiento"}
              </span>{" "}
              · {deleteTarget.categoriaNombre} ·{" "}
              {deleteTarget.monto.toLocaleString("es-PE", {
                style: "currency",
                currency: "PEN",
              })}
            </p>

            {deleteError && (
              <p className="text-xs text-red-600 mb-2">{deleteError}</p>
            )}

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteSaving}
                onClick={handleEliminar}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteSaving ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal alerta presupuesto (mes actual) */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-rose-200 px-6 py-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h2 className="text-sm font-semibold text-rose-700">
                Estás por debajo del presupuesto
              </h2>
            </div>
            <p className="text-xs text-slate-700 mb-2">
              En lo que va de este mes, tus gastos superan a tus ingresos.
            </p>
            <p className="text-xs text-slate-600 mb-4">
              Ingresos del mes:{" "}
              {totalIngresosMes.toLocaleString("es-PE", {
                style: "currency",
                currency: "PEN",
              })}{" "}
              · Gastos del mes:{" "}
              {totalGastosMes.toLocaleString("es-PE", {
                style: "currency",
                currency: "PEN",
              })}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition"
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

export default TransaccionesPage;
